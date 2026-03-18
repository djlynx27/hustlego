-- HustleGo Learning Foundation Migration
-- Tested via GitHub Actions on 2026-03-18
create extension if not exists vector;

create table if not exists public.sessions (
  id bigint primary key generated always as identity,
  started_at timestamptz not null,
  ended_at timestamptz,
  total_earnings numeric(8,2),
  total_rides integer default 0,
  total_hours numeric(6,2),
  weather_snapshot jsonb,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.session_zones (
  id bigint primary key generated always as identity,
  session_id bigint not null references public.sessions(id) on delete cascade,
  zone_id text not null references public.zones(id) on delete cascade,
  entered_at timestamptz not null,
  exited_at timestamptz,
  rides_count integer not null default 0,
  earnings numeric(8,2) not null default 0,
  predicted_score numeric(5,2),
  factors_snapshot jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ema_patterns (
  zone_id text not null references public.zones(id) on delete cascade,
  day_of_week smallint not null,
  hour_block smallint not null,
  ema_earnings_per_hour numeric(8,2) not null default 0,
  ema_ride_count numeric(6,2) not null default 0,
  observation_count integer not null default 0,
  last_updated timestamptz not null default now(),
  primary key (zone_id, day_of_week, hour_block)
);

create table if not exists public.zone_beliefs (
  zone_id text not null references public.zones(id) on delete cascade,
  day_of_week smallint not null,
  hour_block smallint not null,
  prior_mean numeric(8,2) not null default 25,
  prior_variance numeric(8,4) not null default 100,
  observation_count integer not null default 0,
  last_updated timestamptz not null default now(),
  primary key (zone_id, day_of_week, hour_block)
);

create table if not exists public.predictions (
  id bigint primary key generated always as identity,
  zone_id text not null references public.zones(id) on delete cascade,
  predicted_at timestamptz not null,
  predicted_score numeric(5,2) not null,
  factors_snapshot jsonb,
  actual_earnings_per_hour numeric(8,2),
  prediction_error numeric(8,4),
  created_at timestamptz not null default now()
);

create table if not exists public.weight_history (
  id bigint primary key generated always as identity,
  weights jsonb not null,
  prediction_mae numeric(8,4),
  triggered_by text not null default 'post_shift',
  created_at timestamptz not null default now()
);

create table if not exists public.demand_patterns (
  id bigint primary key generated always as identity,
  zone_id text not null references public.zones(id) on delete cascade,
  context_vector vector(16) not null,
  actual_earnings_per_hour numeric(8,2),
  created_at timestamptz not null default now()
);

create index if not exists demand_patterns_context_vector_idx
  on public.demand_patterns using hnsw (context_vector vector_cosine_ops);

create or replace function public.match_similar_contexts(
  query_vector vector(16),
  query_zone_id text,
  match_count integer default 10
)
returns table (
  id bigint,
  zone_id text,
  actual_earnings_per_hour numeric,
  similarity double precision,
  created_at timestamptz
)
language sql
stable
as $$
  select
    demand_patterns.id,
    demand_patterns.zone_id,
    demand_patterns.actual_earnings_per_hour,
    1 - (demand_patterns.context_vector <=> query_vector) as similarity,
    demand_patterns.created_at
  from public.demand_patterns
  where demand_patterns.zone_id = query_zone_id
  order by demand_patterns.context_vector <=> query_vector
  limit greatest(match_count, 1);
$$;

alter table public.sessions enable row level security;
alter table public.session_zones enable row level security;
alter table public.ema_patterns enable row level security;
alter table public.zone_beliefs enable row level security;
alter table public.predictions enable row level security;
alter table public.weight_history enable row level security;
alter table public.demand_patterns enable row level security;

drop policy if exists "authenticated read sessions" on public.sessions;
create policy "authenticated read sessions"
  on public.sessions for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "authenticated read session_zones" on public.session_zones;
create policy "authenticated read session_zones"
  on public.session_zones for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "authenticated read ema_patterns" on public.ema_patterns;
create policy "authenticated read ema_patterns"
  on public.ema_patterns for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "authenticated read zone_beliefs" on public.zone_beliefs;
create policy "authenticated read zone_beliefs"
  on public.zone_beliefs for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "authenticated read predictions" on public.predictions;
create policy "authenticated read predictions"
  on public.predictions for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "authenticated read weight_history" on public.weight_history;
create policy "authenticated read weight_history"
  on public.weight_history for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "authenticated read demand_patterns" on public.demand_patterns;
create policy "authenticated read demand_patterns"
  on public.demand_patterns for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);
