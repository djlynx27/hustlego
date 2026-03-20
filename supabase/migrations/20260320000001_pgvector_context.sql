-- Migration: pgvector context embeddings for HustleGo surge detection
-- Phase 2.2 — "Analyse Avancée des Écosystèmes de Transport à la Demande"
--
-- Stores 8-dimensional context vectors per zone per scoring event.
-- Enables: similarity search → "find past situations like right now"
--          → predict surge outcome before platform shows it

-- Enable pgvector (natively supported on Supabase)
create extension if not exists vector;

-- ── Main table ────────────────────────────────────────────────────────────────
create table if not exists public.zone_context_vectors (
  id                       uuid primary key default gen_random_uuid(),
  zone_id                  uuid not null references public.zones(id) on delete cascade,

  -- 8D embedding: [hour_norm, dow_norm, weather, events, traffic,
  --                surge_ratio, deadhead_inv, seasonal]
  -- All dimensions normalized to [0, 1].
  context_vector           vector(8) not null,

  -- Surge metadata captured at time of embedding
  surge_multiplier         numeric not null default 1.0
                             check (surge_multiplier >= 1.0 and surge_multiplier <= 3.0),
  surge_class              text not null default 'normal'
                             check (surge_class in ('normal', 'elevated', 'high', 'peak')),

  -- Outcome data (filled after trip completed via feedback loop)
  actual_earnings_per_hour numeric,
  trip_count               int not null default 0,

  captured_at              timestamptz not null default now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

-- IVFFlat approximate nearest-neighbor for cosine similarity (<=> operator).
-- lists = 50 sized for ~50K rows (rule: sqrt(N) but ≥ 20).
-- Rebuild with: REINDEX INDEX CONCURRENTLY zone_context_vectors_ivfflat_idx;
create index if not exists zone_context_vectors_ivfflat_idx
  on public.zone_context_vectors
  using ivfflat (context_vector vector_cosine_ops)
  with (lists = 50);

-- For zone-scoped queries and time-based cleanup
create index if not exists zone_context_vectors_zone_captured_idx
  on public.zone_context_vectors (zone_id, captured_at desc);

-- For surge class filtering
create index if not exists zone_context_vectors_class_idx
  on public.zone_context_vectors (surge_class);

-- ── Row Level Security ────────────────────────────────────────────────────────
alter table public.zone_context_vectors enable row level security;

create policy "context vectors public read"
  on public.zone_context_vectors
  for select
  using (true);

-- Edge Functions use service role key → bypass RLS for write
create policy "context vectors service insert"
  on public.zone_context_vectors
  for insert
  with check (true);

create policy "context vectors service update"
  on public.zone_context_vectors
  for update
  using (true);

-- ── SQL Functions ─────────────────────────────────────────────────────────────

/**
 * find_similar_contexts(zone_id, vector, limit, min_trips)
 *
 * Returns the K historical contexts for a given zone whose embedding is most
 * similar to the query vector (cosine similarity via <=> operator).
 *
 * Usage from Edge Function:
 *   supabase.rpc('find_similar_contexts', {
 *     p_zone_id : 'uuid...',
 *     p_vector  : '[0.5,0.7,0.2,0.1,0.3,0.8,0.9,0.6]',
 *     p_limit   : 10,
 *     p_min_trips: 1,
 *   })
 */
create or replace function public.find_similar_contexts(
  p_zone_id     uuid,
  p_vector      vector(8),
  p_limit       int    default 10,
  p_min_trips   int    default 1
)
returns table (
  id                       uuid,
  zone_id                  uuid,
  surge_multiplier         numeric,
  surge_class              text,
  actual_earnings_per_hour numeric,
  trip_count               int,
  captured_at              timestamptz,
  similarity               float
)
language sql
stable
as $$
  select
    zcv.id,
    zcv.zone_id,
    zcv.surge_multiplier,
    zcv.surge_class,
    zcv.actual_earnings_per_hour,
    zcv.trip_count,
    zcv.captured_at,
    -- cosine similarity: 1 - cosine_distance
    (1 - (zcv.context_vector <=> p_vector))::float as similarity
  from public.zone_context_vectors zcv
  where zcv.zone_id = p_zone_id
    and zcv.trip_count >= p_min_trips
  order by zcv.context_vector <=> p_vector   -- ascending distance = descending similarity
  limit p_limit;
$$;

/**
 * get_surge_baseline(zone_id, p_hour_slot, p_dow)
 *
 * Returns the rolling 4-week average surgery multiplier for a given
 * zone + hour slot (0–23) + day-of-week combination.
 * Used by surgeEngine to compute the normalized ratio.
 */
create or replace function public.get_surge_baseline(
  p_zone_id   uuid,
  p_hour_slot int,   -- 0–23
  p_dow       int    -- 0=Sun…6=Sat
)
returns numeric
language sql
stable
as $$
  select coalesce(
    avg(zcv.surge_multiplier),
    1.0
  )
  from public.zone_context_vectors zcv
  where zcv.zone_id = p_zone_id
    -- same hour ±1 and same day-of-week
    and extract(hour from zcv.captured_at)::int between p_hour_slot - 1 and p_hour_slot + 1
    and extract(dow  from zcv.captured_at)::int = p_dow
    -- rolling 4 weeks
    and zcv.captured_at >= now() - interval '28 days';
$$;

/**
 * cleanup_old_context_vectors()
 *
 * Purge vectors older than 90 days (keeps BDD size manageable).
 * Scheduled via pg_cron: '0 3 * * *' (3h00 chaque nuit).
 */
create or replace function public.cleanup_old_context_vectors()
returns void
language sql
as $$
  delete from public.zone_context_vectors
  where captured_at < now() - interval '90 days';
$$;

-- Schedule nightly cleanup (pg_cron, gracefully skipped if extension absent)
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'cleanup-context-vectors',
      '0 3 * * *',
      'select public.cleanup_context_vectors()'
    );
  end if;
exception when others then
  raise notice 'pg_cron not available, cleanup must be triggered manually';
end;
$$;
