// useShift — server-truth active shift, replacing localStorage/setInterval
// as the source of elapsed time and revenue.
//
// Why: ShiftTracker.tsx's old model kept the active shift purely in
// localStorage and re-derived revenue from `trips` on a 30s setInterval.
// That works fine while the PWA stays foregrounded, but on Android two
// things break it the instant the tab backgrounds or gets killed for
// memory: (1) the setInterval freezes, so elapsed time visibly stalls, and
// (2) worse, useAutoShift's GPS-based auto-start needs the PWA's JS running
// at all to notice the driver started moving — if the tab was never open
// when the shift began, nothing ever wrote ACTIVE_SHIFT_KEY, and re-opening
// Delivroom mid-drive shows "0 $ / 0h00" because there's no local record a
// shift exists.
//
// shift-tracker (Edge Function) lets MacroDroid mark a shift
// started/stopped/heartbeated the instant Lyft Driver flips Online/Offline,
// independent of whether the PWA tab is even open, and keeps public.sessions
// self-updating (elapsed time is just `now - started_at`, no drift; revenue
// is server-recomputed from `trips` on every heartbeat).
//
// This hook calls the Edge Function's STATUS action rather than querying
// public.sessions directly — that table's RLS is strict per-owner
// (auth.uid() = user_id) precisely so the public anon key can't read/write
// the shared MacroDroid-driven session directly (see shift-tracker/
// index.ts's SECURITY NOTE); only that service-role-backed function can
// reach it. Refreshes on visibilitychange/focus (recovering from a fully
// backgrounded/killed tab) plus a light poll while visible (catching a
// MacroDroid heartbeat that lands while the tab is open — no Realtime
// subscription, since that would need the same direct-table RLS access
// this design deliberately avoids).

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export type ActiveSession = Database['public']['Tables']['sessions']['Row'];

const ACTIVE_SESSION_QUERY_KEY = ['shift-tracker', 'active-session'] as const;
const POLL_INTERVAL_MS = 45_000;

async function fetchActiveSession(): Promise<ActiveSession | null> {
  const { data, error } = await supabase.functions.invoke<{
    ok: boolean;
    session: ActiveSession | null;
    error?: string;
  }>('shift-tracker', { body: { action: 'STATUS' } });
  if (error) throw error;
  if (!data?.ok) throw new Error(data?.error ?? 'shift-tracker STATUS failed');
  return data.session;
}

/** The current active session (or null), kept fresh across backgrounding. */
export function useShift() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ACTIVE_SESSION_QUERY_KEY,
    queryFn: fetchActiveSession,
    staleTime: 15_000,
    refetchInterval: () => (document.visibilityState === 'visible' ? POLL_INTERVAL_MS : false),
  });

  // Recovers from a fully backgrounded/killed tab: whatever shift-tracker
  // recorded via MacroDroid while this PWA instance was frozen/dead is
  // fetched fresh the moment the driver looks at the screen again.
  useEffect(() => {
    const refetch = () => {
      if (document.visibilityState === 'visible') {
        void queryClient.invalidateQueries({ queryKey: ACTIVE_SESSION_QUERY_KEY });
      }
    };
    document.addEventListener('visibilitychange', refetch);
    window.addEventListener('focus', refetch);
    return () => {
      document.removeEventListener('visibilitychange', refetch);
      window.removeEventListener('focus', refetch);
    };
  }, [queryClient]);

  return {
    session: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Elapsed seconds since session.started_at, ticking every second from the
 * server timestamp — Date.now() - startedAtMs, so a background/foreground
 * cycle can never desync it the way an accumulated setInterval counter can. */
export function useShiftElapsedSeconds(
  session: Pick<ActiveSession, 'started_at'> | null
): number {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!session) {
      setElapsed(0);
      return;
    }
    const startedMs = new Date(session.started_at).getTime();
    const tick = () => setElapsed(Math.max(0, Math.round((Date.now() - startedMs) / 1000)));
    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [session]);

  return elapsed;
}
