-- ============================================================
-- Migration: fix_sessions_rls_idor
-- Delivroom (hibzhsjgipybfihhzpxr)
--
-- SECURITY FIX for 20260906000004_shift_tracker.sql. That migration made
-- `user_id IS NULL` a shared "public bucket" in sessions_user_isolation /
-- session_zones_user_isolation to work around this project's anonymous-auth
-- identity being unstable across browser-data resets. That reasoning was
-- wrong: the Supabase anon key ships in the client bundle by design, so
-- "any row with user_id IS NULL is visible/writable" really did mean any
-- holder of the public anon key could read or mutate the shared shift
-- session directly via PostgREST -- a real IDOR / RLS-bypass, not a
-- theoretical one (flagged by automated security review, verified here).
-- src/lib/shiftSession.ts's unscoped `.update(...).is('ended_at', null)`
-- (no owner filter at all) was the other half of the same bug.
--
-- Fix: RLS reverts to strict auth.uid() = user_id, full stop -- no shared
-- bucket in policy at all. The single-tenant "shared shift" behavior this
-- app still needs moves entirely into shift-tracker's Edge Function (which
-- already runs on the service_role key, bypassing RLS by design, and is
-- gated by its own API-key-or-valid-JWT check) -- see the accompanying
-- index.ts changes. The client (ShiftTracker.tsx, useShift.ts,
-- shiftSession.ts) no longer talks to public.sessions directly at all.
-- ============================================================

DROP POLICY IF EXISTS sessions_user_isolation ON public.sessions;
CREATE POLICY sessions_user_isolation ON public.sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS session_zones_user_isolation ON public.session_zones;
CREATE POLICY session_zones_user_isolation ON public.session_zones
  FOR ALL
  USING (
    session_id IN (SELECT id FROM public.sessions WHERE auth.uid() = user_id)
  );
