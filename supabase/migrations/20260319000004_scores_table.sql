-- ============================================================
-- Migration: Create scores table
-- Purpose: Store computed zone demand scores for fast reads
--          by the frontend (primary source for useZoneScores).
-- Zone IDs are TEXT (matches zones.id primary key type).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.scores (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id       TEXT        NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  score         NUMERIC(6,2) CHECK (score BETWEEN 0 AND 100),
  weather_boost NUMERIC(6,2) DEFAULT 0,
  event_boost   NUMERIC(6,2) DEFAULT 0,
  final_score   NUMERIC(6,2) CHECK (final_score BETWEEN 0 AND 100),
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for the query pattern used by useZoneScores:
-- SELECT * FROM scores ORDER BY calculated_at DESC LIMIT 200
CREATE INDEX IF NOT EXISTS idx_scores_zone_id
  ON public.scores(zone_id);

CREATE INDEX IF NOT EXISTS idx_scores_calculated_at
  ON public.scores(calculated_at DESC);

-- Compound index for deduplicated latest-per-zone queries
CREATE INDEX IF NOT EXISTS idx_scores_zone_time
  ON public.scores(zone_id, calculated_at DESC);

-- RLS: public read (heatmap is public), insert/update via service role
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scores_public_read"
  ON public.scores FOR SELECT USING (true);

-- Service role (edge function) can write scores
CREATE POLICY "scores_service_write"
  ON public.scores FOR INSERT WITH CHECK (true);

CREATE POLICY "scores_service_update"
  ON public.scores FOR UPDATE USING (true);

CREATE POLICY "scores_service_delete"
  ON public.scores FOR DELETE USING (true);
