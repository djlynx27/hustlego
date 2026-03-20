-- ============================================================
-- Migration 09: weight_history — feedback loop ML
-- Purpose:
--   Persiste les ajustements de poids du modèle de scoring dérivés de
--   learningEngine.deriveLearningInsights() après chaque analyse post-shift.
--   Permet de tracer l'évolution des poids dans le temps et de les
--   appliquer au prochain calcul de score.
--
--   weight_history  — snapshots des poids suggérés + contexte
--   trip_predictions — comparaison prédiction vs réel par trip
-- ============================================================

-- ── weight_history ────────────────────────────────────────────────────────────
-- Snapshot des poids de scoring après analyse d'un shift.
-- source: 'auto' = généré par weight-calibrator EF | 'manual' = admin override
CREATE TABLE IF NOT EXISTS public.weight_history (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Weights (must sum to 1.0; stored individually for easy querying/plotting)
  w_time          NUMERIC(6,4) NOT NULL,  -- time-of-day weight
  w_day           NUMERIC(6,4) NOT NULL,  -- day-of-week weight
  w_weather       NUMERIC(6,4) NOT NULL,  -- weather weight
  w_events        NUMERIC(6,4) NOT NULL,  -- events weight
  w_historical    NUMERIC(6,4) NOT NULL,  -- historical EMA weight
  -- Context at calibration time
  trip_count      INTEGER     NOT NULL DEFAULT 0,
  mae             NUMERIC(6,3),           -- mean absolute error before this calibration
  accuracy_pct    NUMERIC(5,2),           -- accuracy % (predictions within 15 pts)
  source          TEXT        NOT NULL DEFAULT 'auto',
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_weight_source CHECK (source IN ('auto', 'manual')),
  CONSTRAINT chk_weights_positive CHECK (
    w_time >= 0 AND w_day >= 0 AND w_weather >= 0 AND
    w_events >= 0 AND w_historical >= 0
  )
);

ALTER TABLE public.weight_history
  ADD COLUMN IF NOT EXISTS w_time NUMERIC(6,4) NOT NULL DEFAULT 0.25,
  ADD COLUMN IF NOT EXISTS w_day NUMERIC(6,4) NOT NULL DEFAULT 0.15,
  ADD COLUMN IF NOT EXISTS w_weather NUMERIC(6,4) NOT NULL DEFAULT 0.15,
  ADD COLUMN IF NOT EXISTS w_events NUMERIC(6,4) NOT NULL DEFAULT 0.15,
  ADD COLUMN IF NOT EXISTS w_historical NUMERIC(6,4) NOT NULL DEFAULT 0.10,
  ADD COLUMN IF NOT EXISTS trip_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mae NUMERIC(6,3),
  ADD COLUMN IF NOT EXISTS accuracy_pct NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS note TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_weight_history_created_at
  ON public.weight_history(created_at DESC);

ALTER TABLE public.weight_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "weight_history_public_read"
  ON public.weight_history FOR SELECT USING (true);

CREATE POLICY "weight_history_insert"
  ON public.weight_history FOR INSERT WITH CHECK (true);

-- ── trip_predictions ──────────────────────────────────────────────────────────
-- Records each prediction-vs-actual comparison for ML tracking.
-- Linked back to the trip. zone_score_at_start = DB score when trip began.
-- actual_earnings_per_hour = computed from (earnings+tips)/hours.
CREATE TABLE IF NOT EXISTS public.trip_predictions (
  id                        UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id                   UUID        REFERENCES public.trips(id) ON DELETE CASCADE,
  zone_id                   TEXT        REFERENCES public.zones(id) ON DELETE SET NULL,
  zone_score_at_start       NUMERIC(6,2),
  predicted_earnings_per_h  NUMERIC(8,2),
  actual_earnings_per_h     NUMERIC(8,2),
  error                     NUMERIC(8,3), -- actual - predicted
  abs_error                 NUMERIC(8,3), -- |error|
  context_vector_id         UUID,         -- FK to zone_context_vectors (optional)
  shift_date                DATE,
  hour_of_day               SMALLINT,
  day_of_week               SMALLINT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_predictions
  ADD COLUMN IF NOT EXISTS trip_id UUID,
  ADD COLUMN IF NOT EXISTS zone_id TEXT,
  ADD COLUMN IF NOT EXISTS zone_score_at_start NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS predicted_earnings_per_h NUMERIC(8,2),
  ADD COLUMN IF NOT EXISTS actual_earnings_per_h NUMERIC(8,2),
  ADD COLUMN IF NOT EXISTS error NUMERIC(8,3),
  ADD COLUMN IF NOT EXISTS abs_error NUMERIC(8,3),
  ADD COLUMN IF NOT EXISTS context_vector_id UUID,
  ADD COLUMN IF NOT EXISTS shift_date DATE,
  ADD COLUMN IF NOT EXISTS hour_of_day SMALLINT,
  ADD COLUMN IF NOT EXISTS day_of_week SMALLINT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_trip_predictions_trip_id
  ON public.trip_predictions(trip_id);

CREATE INDEX IF NOT EXISTS idx_trip_predictions_zone_id
  ON public.trip_predictions(zone_id, shift_date DESC);

CREATE INDEX IF NOT EXISTS idx_trip_predictions_created_at
  ON public.trip_predictions(created_at DESC);

ALTER TABLE public.trip_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trip_predictions_public_read"
  ON public.trip_predictions FOR SELECT USING (true);

CREATE POLICY "trip_predictions_insert"
  ON public.trip_predictions FOR INSERT WITH CHECK (true);

CREATE POLICY "trip_predictions_update"
  ON public.trip_predictions FOR UPDATE USING (true);

-- ── Function: get_weight_calibration_summary ──────────────────────────────────
-- Returns MAE + accuracy trend over the last N calibrations.
CREATE OR REPLACE FUNCTION public.get_weight_calibration_summary(p_limit INT DEFAULT 10)
RETURNS TABLE (
  created_at    TIMESTAMPTZ,
  mae           NUMERIC,
  accuracy_pct  NUMERIC,
  trip_count    INT,
  w_time        NUMERIC,
  w_day         NUMERIC,
  w_weather     NUMERIC,
  w_events      NUMERIC,
  w_historical  NUMERIC
)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT
    wh.created_at,
    wh.mae,
    wh.accuracy_pct,
    wh.trip_count,
    wh.w_time,
    wh.w_day,
    wh.w_weather,
    wh.w_events,
    wh.w_historical
  FROM public.weight_history wh
  ORDER BY wh.created_at DESC
  LIMIT p_limit;
$$;

-- ── Function: get_latest_weights ──────────────────────────────────────────────
-- Returns the most recently calibrated weights for use in score-calculator.
CREATE OR REPLACE FUNCTION public.get_latest_weights()
RETURNS TABLE (
  w_time        NUMERIC,
  w_day         NUMERIC,
  w_weather     NUMERIC,
  w_events      NUMERIC,
  w_historical  NUMERIC,
  calibrated_at TIMESTAMPTZ,
  mae           NUMERIC
)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT
    wh.w_time,
    wh.w_day,
    wh.w_weather,
    wh.w_events,
    wh.w_historical,
    wh.created_at AS calibrated_at,
    wh.mae
  FROM public.weight_history wh
  ORDER BY wh.created_at DESC
  LIMIT 1;
$$;

-- ── Cleanup: keep only last 90 weight history rows ────────────────────────────
CREATE OR REPLACE FUNCTION public.cleanup_old_weight_history()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.weight_history
  WHERE id NOT IN (
    SELECT id FROM public.weight_history
    ORDER BY created_at DESC
    LIMIT 90
  );
END;
$$;
