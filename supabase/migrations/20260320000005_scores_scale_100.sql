-- Migration: align scores table constraints with the 0-100 demand scale
--
-- Some remote environments still have an older scores_score_check constraint
-- built for a 0-10 scale. The current frontend, scoring engine, and Edge
-- Functions all operate on 0-100 demand points.
--
-- This migration makes the table backward-compatible by:
--   1. Dropping legacy check constraints if they exist
--   2. Re-adding 0-100 check constraints for score/final_score
--   3. Normalizing any existing legacy rows that were persisted on 0-10 scale

ALTER TABLE public.scores
  ALTER COLUMN score TYPE NUMERIC(6,2),
  ALTER COLUMN final_score TYPE NUMERIC(6,2),
  ALTER COLUMN weather_boost TYPE NUMERIC(6,2),
  ALTER COLUMN event_boost TYPE NUMERIC(6,2);

ALTER TABLE public.scores
  DROP CONSTRAINT IF EXISTS scores_score_check,
  DROP CONSTRAINT IF EXISTS scores_final_score_check;

ALTER TABLE public.scores
  ADD CONSTRAINT scores_score_check CHECK (score BETWEEN 0 AND 100),
  ADD CONSTRAINT scores_final_score_check CHECK (final_score BETWEEN 0 AND 100);

-- Best-effort normalization for legacy rows accidentally stored on a 0-10 scale.
-- If both score and final_score look like 0-10 values while there are no >10 rows,
-- scale them up to the current 0-100 convention.
DO $scores_scale_fix$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.scores
    WHERE (score IS NOT NULL AND score > 0 AND score <= 10)
       OR (final_score IS NOT NULL AND final_score > 0 AND final_score <= 10)
  )
  AND NOT EXISTS (
    SELECT 1
    FROM public.scores
    WHERE (score IS NOT NULL AND score > 10)
       OR (final_score IS NOT NULL AND final_score > 10)
  ) THEN
    UPDATE public.scores
    SET score = CASE WHEN score IS NULL THEN NULL ELSE ROUND(score * 10, 2) END,
        final_score = CASE WHEN final_score IS NULL THEN NULL ELSE ROUND(final_score * 10, 2) END,
        weather_boost = CASE WHEN weather_boost IS NULL THEN NULL ELSE ROUND(weather_boost * 10, 2) END,
        event_boost = CASE WHEN event_boost IS NULL THEN NULL ELSE ROUND(event_boost * 10, 2) END;
  END IF;
END $scores_scale_fix$;
