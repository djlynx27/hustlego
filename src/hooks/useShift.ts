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
// is server-recomputed from `trips` on every heartbeat). This hook reads
// that row directly (RLS-safe, no Edge Function call needed for reads) and
// refreshes on visibilitychange/focus (recovering from a fully backgrounded/
// killed tab) plus a live Realtime subscription (catching a MacroDroid
// heartbeat that lands while the tab is open).

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export type ActiveSession = Database['public']['Tables']['sessions']['Row'];

const ACTIVE_SESSION_QUERY_KEY = ['shift-tracker', 'active-session'] as const;

async function fetchActiveSession(): Promise<ActiveSession | null> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** The current active session (or null), kept fresh across backgrounding. */
export function useShift() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ACTIVE_SESSION_QUERY_KEY,
    queryFn: fetchActiveSession,
    staleTime: 15_000,
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

  // Live updates while foregrounded — a MacroDroid heartbeat/STOP lands in
  // public.sessions independently of any PWA action.
  useEffect(() => {
    const channel = supabase
      .channel('shift-tracker-sessions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sessions' },
        () => {
          void queryClient.invalidateQueries({ queryKey: ACTIVE_SESSION_QUERY_KEY });
        }
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
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
