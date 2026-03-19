-- ============================================================
-- Migration 06: trips + time_slots tables
-- Purpose: These tables are queried by TripLogger, AdminScreen,
--          useDemandScores (trip history → ML feedback loop),
--          and the Shift Planner. They existed only in types.ts
--          but had no migration — every query was failing silently.
-- ============================================================

-- ── trips ─────────────────────────────────────────────────────────────────────
-- Records every completed trip/delivery for earnings tracking + ML feedback.
-- platform: 'lyft' | 'doordash' | 'skipthedishes' | 'hypra' | 'uber' | etc.
-- zone_score: snapshot of the zone's demand score at trip start (for ML).
-- experiment: true = this trip was an AI-suggested "test" positioning.
CREATE TABLE IF NOT EXISTS public.trips (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id      TEXT        REFERENCES public.zones(id) ON DELETE SET NULL,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at     TIMESTAMPTZ,
  earnings     NUMERIC(8,2),
  tips         NUMERIC(8,2),
  distance_km  NUMERIC(8,2),
  notes        TEXT,
  platform     TEXT,
  experiment   BOOLEAN     NOT NULL DEFAULT false,
  zone_score   NUMERIC(6,2),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trips_zone_id ON public.trips(zone_id);
CREATE INDEX IF NOT EXISTS idx_trips_started_at ON public.trips(started_at DESC);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Public read so the score engine can access trip history for ML
CREATE POLICY "trips_public_read"
  ON public.trips FOR SELECT USING (true);

CREATE POLICY "trips_insert"
  ON public.trips FOR INSERT WITH CHECK (true);

CREATE POLICY "trips_update"
  ON public.trips FOR UPDATE USING (true);

CREATE POLICY "trips_delete"
  ON public.trips FOR DELETE USING (true);

-- ── time_slots ─────────────────────────────────────────────────────────────────
-- AI-generated or manually-planned driving time slots.
-- Used by the Shift Planner and the AdminScreen slot generator.
CREATE TABLE IF NOT EXISTS public.time_slots (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  city_id      TEXT        NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  zone_id      TEXT        NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  date         DATE        NOT NULL,
  start_time   TEXT        NOT NULL,  -- 'HH:MM' format
  end_time     TEXT        NOT NULL,  -- 'HH:MM' format
  demand_score NUMERIC(6,2) NOT NULL DEFAULT 50,
  comment      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_time_slots_date ON public.time_slots(date DESC);
CREATE INDEX IF NOT EXISTS idx_time_slots_city ON public.time_slots(city_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_time_slots_zone ON public.time_slots(zone_id);

ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "time_slots_public_read"
  ON public.time_slots FOR SELECT USING (true);

CREATE POLICY "time_slots_insert"
  ON public.time_slots FOR INSERT WITH CHECK (true);

CREATE POLICY "time_slots_update"
  ON public.time_slots FOR UPDATE USING (true);

CREATE POLICY "time_slots_delete"
  ON public.time_slots FOR DELETE USING (true);
