-- ============================================================
-- Migration: shift_tracker
-- Delivroom (hibzhsjgipybfihhzpxr)
--
-- public.sessions already had the right shape for a "shift" (started_at,
-- ended_at, total_earnings, total_hours, user_id) but was never actually
-- wired into the live app -- ShiftTracker.tsx tracks the active shift
-- purely in localStorage + derives revenue by filtering public.trips
-- client-side, and the 3 pre-existing sessions rows all have user_id NULL
-- (invisible under the old strict `auth.uid() = user_id` RLS policy, since
-- NULL never equals anything). This migration finally gives it a job: the
-- new shift-tracker Edge Function (MacroDroid webhook, fires on Lyft
-- Online/Offline) persists shift state here so it survives the PWA's JS
-- being suspended/killed in the background -- something localStorage +
-- setInterval alone cannot recover from if the shift was never marked
-- "started" in the first place (auto-detection needs the JS running to
-- see it).
--
-- NULL user_id is used deliberately by the MacroDroid/API-key path rather
-- than a hardcoded auth.users.id: this project's anonymous-auth model has
-- already produced 5+ distinct anon uids in user_profiles over time (a
-- fresh signInAnonymously() per browser-data reset), and public.trips has
-- no user_id isolation at all in practice (every real trip's user_id is
-- NULL) -- hardcoding "the driver's" current anon uid here would silently
-- break the day that uid rotates, with no visible error. Treating NULL as
-- the single-tenant bucket matches how trips already behaves and needs no
-- ID to go stale.
-- ============================================================

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS last_heartbeat_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_lat double precision,
  ADD COLUMN IF NOT EXISTS last_lng double precision,
  ADD COLUMN IF NOT EXISTS active_zone_id text REFERENCES public.zones(id);

-- At most one active (ended_at IS NULL) session per user bucket -- also
-- makes repeated START calls from a flaky MacroDroid trigger idempotent
-- at the database level, not just in the Edge Function's own logic.
CREATE UNIQUE INDEX IF NOT EXISTS sessions_one_active_per_user
  ON public.sessions ((coalesce(user_id::text, 'anon')))
  WHERE ended_at IS NULL;

-- Relax both isolation policies to also allow the shared NULL-user bucket
-- (see rationale above) alongside the normal auth.uid()-scoped case, so a
-- future real per-account user_id still isolates correctly if ever used.
DROP POLICY IF EXISTS sessions_user_isolation ON public.sessions;
CREATE POLICY sessions_user_isolation ON public.sessions
  FOR ALL
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS session_zones_user_isolation ON public.session_zones;
CREATE POLICY session_zones_user_isolation ON public.session_zones
  FOR ALL
  USING (
    session_id IN (
      SELECT id FROM public.sessions WHERE auth.uid() = user_id OR user_id IS NULL
    )
  );
