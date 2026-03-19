-- ============================================================
-- Migration: Zone demand scoring function + pg_cron job
-- Purpose: Recalculate zone demand scores every 30 minutes
--          using time-of-day, day-of-week, and active events.
--          Weather boost is set to 0 here; the Edge Function
--          score-calculator adds it when called with weather data.
-- ============================================================

-- ------------------------------------------------------------
-- Core scoring function — pure SQL, no external APIs
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.recalculate_zone_scores()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_hour        INT;
  v_dow         INT;       -- 0 = Sunday, 6 = Saturday
  v_time_factor NUMERIC;
  v_day_factor  NUMERIC;
  zone_rec      RECORD;
  event_boost   NUMERIC;
  raw_score     NUMERIC;
  final_val     NUMERIC;
BEGIN
  -- Current local time in Montreal
  v_hour := EXTRACT(HOUR FROM (NOW() AT TIME ZONE 'America/Toronto'))::INT;
  v_dow  := EXTRACT(DOW  FROM (NOW() AT TIME ZONE 'America/Toronto'))::INT;

  -- ── Time-of-day demand multiplier ───────────────────────────
  -- Dead hours (03-05) = 0.6; peak rush (17-19) = 1.3
  v_time_factor := CASE
    WHEN v_hour BETWEEN  0 AND  2 THEN 1.20   -- bars closing
    WHEN v_hour BETWEEN  3 AND  5 THEN 0.60   -- dead hours
    WHEN v_hour BETWEEN  6 AND  8 THEN 1.10   -- morning rush
    WHEN v_hour BETWEEN  9 AND 10 THEN 0.90   -- mid-morning lull
    WHEN v_hour BETWEEN 11 AND 13 THEN 1.00   -- lunch
    WHEN v_hour BETWEEN 14 AND 16 THEN 0.85   -- afternoon lull
    WHEN v_hour BETWEEN 17 AND 19 THEN 1.30   -- evening peak
    WHEN v_hour BETWEEN 20 AND 23 THEN 1.15   -- dining / nightlife
    ELSE 1.00
  END;

  -- ── Day-of-week multiplier ───────────────────────────────────
  v_day_factor := CASE v_dow
    WHEN 0 THEN 0.85   -- Sunday
    WHEN 1 THEN 0.90   -- Monday
    WHEN 2 THEN 0.90   -- Tuesday
    WHEN 3 THEN 0.95   -- Wednesday
    WHEN 4 THEN 1.00   -- Thursday
    WHEN 5 THEN 1.30   -- Friday  (peak)
    WHEN 6 THEN 1.25   -- Saturday (peak)
    ELSE 1.00
  END;

  -- ── Score every zone ─────────────────────────────────────────
  FOR zone_rec IN
    SELECT id, base_score, latitude, longitude
    FROM   public.zones
  LOOP
    -- Event boost: sum contributions from active events within their
    -- boost radius of this zone (haversine in km).
    SELECT COALESCE(
      SUM(
        CASE
          WHEN (
            6371.0 * 2.0 * ASIN(SQRT(
              POWER(SIN((RADIANS(e.latitude)  - RADIANS(zone_rec.latitude))  / 2.0), 2) +
              COS(RADIANS(zone_rec.latitude)) * COS(RADIANS(e.latitude)) *
              POWER(SIN((RADIANS(e.longitude) - RADIANS(zone_rec.longitude)) / 2.0), 2)
            ))
          ) <= COALESCE(e.boost_radius_km, 3.0)
          THEN LEAST((e.boost_multiplier - 1.0) * 15.0, 20.0)
          ELSE 0.0
        END
      ),
      0.0
    )
    INTO event_boost
    FROM public.events e
    WHERE e.start_at <= NOW()
      AND e.end_at   >= NOW();

    -- Cap total event boost at 25 pts
    event_boost := LEAST(event_boost, 25.0);

    -- base_score × time × day + event boost, clamped to [0, 100]
    raw_score := COALESCE(zone_rec.base_score, 50)::NUMERIC
                 * v_time_factor
                 * v_day_factor;
    final_val := LEAST(100.0, GREATEST(0.0, ROUND(raw_score + event_boost)));

    -- Insert historical score row
    INSERT INTO public.scores
      (zone_id, score, weather_boost, event_boost, final_score, calculated_at)
    VALUES
      (zone_rec.id,
       ROUND(raw_score, 2),
       0.0,
       ROUND(event_boost, 2),
       final_val,
       NOW());

    -- Keep zone.current_score fresh for fast queries
    UPDATE public.zones
    SET    current_score = final_val::INT,
           updated_at    = NOW()
    WHERE  id = zone_rec.id;
  END LOOP;

  -- Purge score history older than 24 hours to keep the table lean
  DELETE FROM public.scores
  WHERE calculated_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- Grant execute to the authenticator role (needed by edge functions)
GRANT EXECUTE ON FUNCTION public.recalculate_zone_scores() TO service_role;

-- ------------------------------------------------------------
-- Seed initial scores right now (so the app has data immediately)
-- ------------------------------------------------------------
SELECT public.recalculate_zone_scores();

-- ------------------------------------------------------------
-- Schedule via pg_cron (every 30 minutes)
-- Gracefully skipped if pg_cron is not enabled on this plan.
-- To enable: Supabase Dashboard → Database → Extensions → pg_cron
-- ------------------------------------------------------------
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_cron;

  -- Remove stale job if it already exists from a previous migration run
  BEGIN
    PERFORM cron.unschedule('recalculate-zone-scores');
  EXCEPTION WHEN OTHERS THEN
    NULL;  -- job didn't exist yet
  END;

  PERFORM cron.schedule(
    'recalculate-zone-scores',
    '*/30 * * * *',
    $cron$SELECT public.recalculate_zone_scores()$cron$
  );

  RAISE NOTICE 'pg_cron job "recalculate-zone-scores" scheduled every 30 min.';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'pg_cron not available (plan limitation). Scores will be updated by Edge Function only. Error: %', SQLERRM;
END;
$$;
