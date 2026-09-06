-- ============================================================
-- Migration: schedule_gtfs_alerts_sync
-- Delivroom (hibzhsjgipybfihhzpxr)
--
-- Schedules gtfs-alerts-sync (Chrono SAEIV GTFS-Realtime -> public.events,
-- see supabase/functions/gtfs-alerts-sync/) every 2 minutes. The Edge
-- Function itself makes 6 sequential requests per run (3 agencies x
-- {alert, TripUpdate}) spaced 5s apart to respect Chrono SAEIV's rate
-- limit — a 2 min cron cadence keeps consecutive runs from ever overlapping
-- (worst case ~30s of requests) while still satisfying the >=60s-per-agency
-- polling floor with room to spare.
--
-- No new column needed: public.events already has external_id (unique,
-- partial index from 20260905131542_events_external_id_and_sync_cron.sql)
-- for idempotent upserts, and `category` is a free-text column (no CHECK
-- constraint) so 'transit_disruption' needs no schema change.
--
-- The service_role key is read from Vault exactly like surge-detector and
-- event-sync's cron jobs (see 20260829000004_schedule_surge_detector.sql
-- for the one-time `vault.create_secret` setup note) — not duplicated here.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$
BEGIN
  BEGIN
    PERFORM cron.unschedule('gtfs-alerts-sync');
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  PERFORM cron.schedule(
    'gtfs-alerts-sync',
    '*/2 * * * *',
    $cron$
      SELECT net.http_post(
        url     := 'https://hibzhsjgipybfihhzpxr.supabase.co/functions/v1/gtfs-alerts-sync',
        body    := '{}'::jsonb,
        headers := jsonb_build_object(
          'Authorization', 'Bearer ' || (
            SELECT decrypted_secret FROM vault.decrypted_secrets
            WHERE name = 'SUPABASE_SERVICE_ROLE_KEY'
          ),
          'Content-Type', 'application/json'
        ),
        timeout_milliseconds := 45000
      )
    $cron$
  );

  RAISE NOTICE 'pg_cron job "gtfs-alerts-sync" scheduled every 2 min';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'pg_cron not available — gtfs-alerts-sync stays unscheduled. Error: %', SQLERRM;
END;
$$;
