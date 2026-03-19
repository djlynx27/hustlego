-- HustleGo Base Schema Migration
-- Creates core tables that other migrations depend on.
-- Must run before 20260318_learning_foundation.sql (b < l alphabetically).

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'zone_type') THEN
    CREATE TYPE zone_type AS ENUM (
      'métro', 'commercial', 'résidentiel', 'nightlife',
      'aéroport', 'transport', 'médical', 'université',
      'événements', 'tourisme'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.cities (
  id         text PRIMARY KEY,
  name       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.zones (
  id            text PRIMARY KEY,
  city_id       text NOT NULL REFERENCES public.cities(id),
  name          text NOT NULL,
  type          zone_type NOT NULL DEFAULT 'commercial',
  latitude      double precision NOT NULL,
  longitude     double precision NOT NULL,
  base_score    int,
  current_score int,
  address       text,
  category      text,
  territory     text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.daily_reports (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date       date NOT NULL UNIQUE,
  total_trips       int,
  total_distance_km numeric,
  hours_worked      numeric,
  total_earnings    numeric,
  dead_time_pct     int,
  best_zone_name    text,
  worst_zone_name   text,
  best_time_slot    text,
  ai_recommendation text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  venue            text NOT NULL,
  city_id          text NOT NULL REFERENCES public.cities(id),
  latitude         double precision NOT NULL,
  longitude        double precision NOT NULL,
  start_at         timestamptz NOT NULL,
  end_at           timestamptz NOT NULL,
  capacity         int NOT NULL DEFAULT 0,
  demand_impact    int NOT NULL DEFAULT 1,
  boost_multiplier numeric NOT NULL DEFAULT 1.0,
  boost_radius_km  numeric NOT NULL DEFAULT 1.0,
  boost_zone_types text[] NOT NULL DEFAULT '{}',
  category         text NOT NULL DEFAULT 'event',
  is_holiday       boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cities        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events        ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read" ON public.cities;
CREATE POLICY "public read" ON public.cities FOR SELECT USING (true);

DROP POLICY IF EXISTS "public read" ON public.zones;
CREATE POLICY "public read" ON public.zones FOR SELECT USING (true);

DROP POLICY IF EXISTS "public read" ON public.daily_reports;
CREATE POLICY "public read" ON public.daily_reports FOR SELECT USING (true);

DROP POLICY IF EXISTS "public read" ON public.events;
CREATE POLICY "public read" ON public.events FOR SELECT USING (true);
