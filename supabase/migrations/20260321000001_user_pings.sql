create extension if not exists vector;

create table if not exists public.user_pings (
  id uuid primary key default gen_random_uuid(),
  driver_fingerprint text not null,
  zone_id text not null references public.zones(id) on delete cascade,
  platform text not null default 'lyft'
    check (platform in ('lyft', 'uber', 'taxi', 'other')),
  context_vector vector(16) not null,
  success_score numeric(4,3) not null default 1.0
    check (success_score >= 0 and success_score <= 1),
  metadata jsonb,
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists user_pings_driver_zone_idx
  on public.user_pings (driver_fingerprint, zone_id, captured_at desc);

create index if not exists user_pings_platform_idx
  on public.user_pings (platform, captured_at desc);

create index if not exists user_pings_context_idx
  on public.user_pings using hnsw (context_vector vector_cosine_ops);

alter table public.user_pings enable row level security;

drop policy if exists "user_pings_public_read" on public.user_pings;
create policy "user_pings_public_read"
  on public.user_pings for select using (true);

drop policy if exists "user_pings_public_insert" on public.user_pings;
create policy "user_pings_public_insert"
  on public.user_pings for insert with check (true);

create or replace function public.match_user_pings(
  query_vector vector(16),
  query_driver_fingerprint text,
  query_zone_id text default null,
  query_platform text default 'lyft',
  match_count integer default 5
)
returns table (
  id uuid,
  zone_id text,
  success_score numeric,
  similarity double precision,
  created_at timestamptz
)
language sql
stable
as $$
  select
    user_pings.id,
    user_pings.zone_id,
    user_pings.success_score,
    1 - (user_pings.context_vector <=> query_vector) as similarity,
    user_pings.created_at
  from public.user_pings
  where user_pings.driver_fingerprint = query_driver_fingerprint
    and user_pings.platform = query_platform
    and (query_zone_id is null or user_pings.zone_id = query_zone_id)
    and user_pings.success_score > 0
  order by user_pings.context_vector <=> query_vector
  limit greatest(match_count, 1);
$$;
