// Mirrors a client-detected shift start/end into the shared shift-tracker
// session — the same one MacroDroid's START/STOP calls drive. This is what
// makes useShift() aware of a shift the instant the auto-GPS-start
// (useAutoShift.ts) or the manual "Démarrer un shift" button fires, so it's
// recoverable via visibilitychange even if this same tab later gets
// backgrounded/killed for the rest of the drive.
//
// Goes through the shift-tracker Edge Function (supabase.functions.invoke,
// which attaches this tab's own Supabase session token automatically)
// rather than writing public.sessions directly: that table's RLS is a
// strict per-owner policy specifically so the public anon key can't
// read/write the shared MacroDroid-driven row directly — see shift-tracker/
// index.ts's SECURITY NOTE. A prior version of this file did an unscoped
// `.update(...).is('ended_at', null)` directly against the table with no
// owner filter at all, which combined with a since-reverted RLS policy was
// a real IDOR (flagged by security review) — fixed by removing direct
// table access entirely rather than trying to scope the old query.
//
// Best-effort by design: a failed call must never block the existing
// local-first UX (localStorage write, timer, toast) that already works
// fine while the tab stays alive — it only degrades the "recoverable after
// being killed" guarantee, not the immediate in-session experience.

import { supabase } from '@/integrations/supabase/client';

async function invokeShiftTracker(body: Record<string, unknown>): Promise<void> {
  const { data, error } = await supabase.functions.invoke<{ ok: boolean; error?: string }>(
    'shift-tracker',
    { body }
  );
  if (error) throw error;
  if (!data?.ok) throw new Error(data?.error ?? 'shift-tracker call failed');
}

export async function startServerSession(startedAt: string): Promise<void> {
  try {
    await invokeShiftTracker({ action: 'START' });
  } catch (err) {
    console.warn('[shiftSession] startServerSession failed (local state still applies):', startedAt, err);
  }
}

export async function endServerSession(): Promise<void> {
  try {
    await invokeShiftTracker({ action: 'STOP' });
  } catch (err) {
    console.warn('[shiftSession] endServerSession failed:', err);
  }
}
