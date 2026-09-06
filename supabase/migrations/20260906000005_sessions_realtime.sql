-- ============================================================
-- Migration: sessions_realtime
-- Delivroom (hibzhsjgipybfihhzpxr)
--
-- Adds public.sessions to the supabase_realtime publication so useShift.ts
-- can subscribe to postgres_changes and reflect a MacroDroid-driven
-- HEARTBEAT/STOP the instant it lands, while the PWA is foregrounded --
-- on top of (not instead of) the visibilitychange-triggered refetch that
-- covers the "app was backgrounded/killed the whole time" case. No table
-- was in this publication before this migration (checked: empty).
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
