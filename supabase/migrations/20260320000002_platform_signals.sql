-- ============================================================
-- Migration 08: platform_signals + notifications + pg_cron surge-detector
-- Purpose:
--   platform_signals  — demand level per platform/zone/slot (arbitrage engine)
--   notifications     — server-side push events (surge_peak, event_alert, etc.)
--   pg_cron           — schedule surge-detector every 5 min
-- ============================================================

-- ── platform_signals ──────────────────────────────────────────────────────────
-- Stores demand signal per platform per zone per 15-min slot.
-- Collected by platform-signal-collector EF from screenshots + Gemini Vision.
-- Used by PlatformArbitrage to recommend the best platform per zone/moment.
--
-- platform: 'lyft' | 'doordash' | 'skipthedishes' | 'hypra' | 'uber'
-- demand_level: 0.0 (dead) → 10.0 (surge peak)
-- surge_active: true = platform currently showing surge pricing
-- estimated_wait_min: wait time visible in app (null = not captured)
-- source: 'screenshot' | 'manual' | 'inferred'
CREATE TABLE IF NOT EXISTS public.platform_signals (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id             TEXT        NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  platform            TEXT        NOT NULL,
  demand_level        NUMERIC(4,2) NOT NULL DEFAULT 0 CHECK (demand_level BETWEEN 0 AND 10),
  surge_active        BOOLEAN     NOT NULL DEFAULT false,
  surge_multiplier    NUMERIC(5,3),
  estimated_wait_min  INTEGER,
  source              TEXT        NOT NULL DEFAULT 'inferred',
  captured_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_platform CHECK (
    platform IN ('lyft', 'doordash', 'skipthedishes', 'hypra', 'uber', 'other')
  ),
  CONSTRAINT chk_source CHECK (source IN ('screenshot', 'manual', 'inferred'))
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_platform_signals_zone_platform
  ON public.platform_signals(zone_id, platform, captured_at DESC);

CREATE INDEX IF NOT EXISTS idx_platform_signals_captured_at
  ON public.platform_signals(captured_at DESC);

CREATE INDEX IF NOT EXISTS idx_platform_signals_surge
  ON public.platform_signals(surge_active, captured_at DESC) WHERE surge_active = true;

ALTER TABLE public.platform_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "platform_signals_public_read"
  ON public.platform_signals FOR SELECT USING (true);

CREATE POLICY "platform_signals_insert"
  ON public.platform_signals FOR INSERT WITH CHECK (true);

CREATE POLICY "platform_signals_update"
  ON public.platform_signals FOR UPDATE USING (true);

-- ── Function: get_best_platform_for_zone ──────────────────────────────────────
-- Returns the platform with the highest demand_level for a zone in the last N minutes.
-- Used by PlatformArbitrage component.
CREATE OR REPLACE FUNCTION public.get_best_platform_for_zone(
  p_zone_id    TEXT,
  p_lookback   INTERVAL DEFAULT '30 minutes'
)
RETURNS TABLE (
  platform         TEXT,
  avg_demand       NUMERIC,
  latest_surge     BOOLEAN,
  latest_multiplier NUMERIC,
  signal_count     BIGINT
)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT
    ps.platform,
    ROUND(AVG(ps.demand_level)::NUMERIC, 2)                              AS avg_demand,
    bool_or(ps.surge_active)                                             AS latest_surge,
    MAX(ps.surge_multiplier)                                             AS latest_multiplier,
    COUNT(*)                                                             AS signal_count
  FROM public.platform_signals ps
  WHERE ps.zone_id = p_zone_id
    AND ps.captured_at >= (now() - p_lookback)
  GROUP BY ps.platform
  ORDER BY avg_demand DESC;
$$;

-- ── Function: get_platform_signals_by_zone ────────────────────────────────────
-- Returns latest signal per platform for all zones (used by the map layer).
CREATE OR REPLACE FUNCTION public.get_platform_signals_by_zone(
  p_city_id   TEXT,
  p_lookback  INTERVAL DEFAULT '30 minutes'
)
RETURNS TABLE (
  zone_id     TEXT,
  platform    TEXT,
  demand_level NUMERIC,
  surge_active BOOLEAN,
  captured_at TIMESTAMPTZ
)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT DISTINCT ON (ps.zone_id, ps.platform)
    ps.zone_id,
    ps.platform,
    ps.demand_level,
    ps.surge_active,
    ps.captured_at
  FROM public.platform_signals ps
  JOIN public.zones z ON z.id = ps.zone_id
  WHERE z.city_id = p_city_id
    AND ps.captured_at >= (now() - p_lookback)
  ORDER BY ps.zone_id, ps.platform, ps.captured_at DESC;
$$;

-- ── Cleanup function for old signals ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.cleanup_old_platform_signals()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.platform_signals
  WHERE captured_at < now() - INTERVAL '7 days';
END;
$$;

-- ── notifications ─────────────────────────────────────────────────────────────
-- Server-side notification events created by Edge Functions (surge-detector, etc.).
-- Client reads via Realtime subscription and triggers service worker push.
--
-- type: 'surge_peak' | 'event_alert' | 'platform_switch' | 'shift_reminder'
-- metadata: JSONB — flexible payload (zone list, platform name, etc.)
-- read_at: null = unread
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  type        TEXT        NOT NULL,
  title       TEXT        NOT NULL,
  message     TEXT        NOT NULL,
  metadata    JSONB,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_notif_type CHECK (
    type IN ('surge_peak', 'event_alert', 'platform_switch', 'shift_reminder', 'other')
  )
);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at
  ON public.notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON public.notifications(created_at DESC) WHERE read_at IS NULL;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_public_read"
  ON public.notifications FOR SELECT USING (true);

CREATE POLICY "notifications_insert"
  ON public.notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "notifications_update"
  ON public.notifications FOR UPDATE USING (true);

-- ── pg_cron: surge-detector every 5 min ──────────────────────────────────────
-- Requires pg_cron + pg_net + http_header extensions enabled in your Supabase project.
-- Replace <PROJECT_REF> with your actual project ref (e.g. "abcdefgh").
-- The service role key is read from vault.secrets — never hard-coded.
--
-- To enable: run in Supabase SQL editor after setting up vault secret SUPABASE_SERVICE_ROLE_KEY:
--
--   SELECT cron.schedule(
--     'surge-detector',
--     '*/5 * * * *',
--     $$
--       SELECT net.http_post(
--         url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/surge-detector',
--         body    := '{}'::jsonb,
--         headers := jsonb_build_object(
--           'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY'),
--           'Content-Type', 'application/json'
--         )
--       )
--     $$
--   );

-- ── pg_cron: cleanup old platform_signals weekly ──────────────────────────────
-- Requires pg_cron extension (enabled by default in Supabase pro tier).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Remove any existing schedule before adding
    PERFORM cron.unschedule('cleanup-platform-signals')
      WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-platform-signals');

    PERFORM cron.schedule(
      'cleanup-platform-signals',
      '0 3 * * 0',  -- Every Sunday at 03:00
      $$SELECT public.cleanup_old_platform_signals()$$
    );
  END IF;
END $$;
