// Mirrors a client-detected shift start/end into public.sessions — the same
// NULL-user_id bucket shift-tracker's MacroDroid path writes to (see that
// Edge Function's header comment for why NULL rather than a hardcoded
// driver uuid). This is what makes useShift() aware of a shift the instant
// the auto-GPS-start (useAutoShift.ts) or the manual "Démarrer un shift"
// button fires, so it's recoverable via visibilitychange/Realtime even if
// this same tab later gets backgrounded/killed for the rest of the drive.
//
// Best-effort by design: a failed mirror must never block the existing
// local-first UX (localStorage write, timer, toast) that already works
// fine while the tab stays alive — it only degrades the "recoverable after
// being killed" guarantee, not the immediate in-session experience.

import { supabase } from '@/integrations/supabase/client';

export async function startServerSession(startedAt: string): Promise<void> {
  try {
    const { data: existing } = await supabase
      .from('sessions')
      .select('id')
      .is('ended_at', null)
      .maybeSingle();
    if (existing) return; // already active server-side (e.g. MacroDroid beat us to it)

    const { error } = await supabase
      .from('sessions')
      .insert({ user_id: null, started_at: startedAt });
    if (error) throw error;
  } catch (err) {
    console.warn('[shiftSession] startServerSession failed (local state still applies):', err);
  }
}

export async function endServerSession(): Promise<void> {
  try {
    const { error } = await supabase
      .from('sessions')
      .update({ ended_at: new Date().toISOString() })
      .is('ended_at', null);
    if (error) throw error;
  } catch (err) {
    console.warn('[shiftSession] endServerSession failed:', err);
  }
}
