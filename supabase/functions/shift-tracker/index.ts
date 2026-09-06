// supabase/functions/shift-tracker/index.ts
// ──────────────────────────────────────────────────────────────────────────────
// Edge Function: server-side shift (public.sessions) tracking so an active
// shift survives Android suspending/killing the PWA's JS in the background —
// a setInterval + localStorage timer alone can't recover from that, and
// worse, the GPS-based auto-shift-start (useAutoShift.ts) needs the PWA's JS
// running at all to even notice the driver started moving. MacroDroid runs as
// a real Android automation service (not a suspendable web page) and can fire
// this endpoint the instant Lyft Driver flips Online/Offline, independent of
// whether Delivroom's tab is even open.
//
// POST body: { action: 'START'|'STOP'|'HEARTBEAT'|'ADD_EARNINGS',
//               lat?, lng?, amount?, platform? }
//
// Auth (either one):
//   1. Header  Authorization: Bearer <SHIFT_TRACKER_API_KEY>  — the
//      MacroDroid path. Writes/reads sessions with user_id = NULL.
//   2. Header  Authorization: Bearer <supabase-session-access-token>  — a
//      real (anon or real) Supabase session, e.g. the PWA calling this
//      itself. Writes/reads sessions scoped to that auth.uid().
//
// Why NULL user_id for the API-key path instead of a fixed driver uuid: this
// project's anonymous-auth model has already produced 5+ distinct anon uids
// in user_profiles over time (a fresh signInAnonymously() per browser-data
// reset) and public.trips has no per-user isolation in practice (every real
// trip's user_id is NULL already) — hardcoding "the driver's" current anon
// uid here would silently break the day that uid rotates. NULL is the
// single-tenant bucket that can't go stale; see the migration for the
// relaxed RLS that makes this safe (session_zones_user_isolation etc. also
// treat NULL as its own visible bucket).
//
// Deploy with: supabase functions deploy shift-tracker --no-verify-jwt
// Secrets required (supabase secrets set ...):
//   SHIFT_TRACKER_API_KEY — random token, given only to MacroDroid
// Auto-injected by Supabase runtime:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// ──────────────────────────────────────────────────────────────────────────────

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { captureEdgeException } from '../_shared/sentry.ts';
import { isRateLimited } from '../_shared/rateLimit.ts';
import {
  elapsedSeconds,
  isShiftAction,
  nearestZoneId,
  parseAmount,
  parseCoordinates,
  resolveZoneTransition,
  type ZoneRow,
} from './shiftLogic.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

interface RequestBody {
  action?: string;
  lat?: unknown;
  lng?: unknown;
  amount?: unknown;
  platform?: unknown;
}

interface SessionRow {
  id: number;
  user_id: string | null;
  started_at: string;
  ended_at: string | null;
  total_earnings: number | null;
  total_rides: number | null;
  total_hours: number | null;
  last_heartbeat_at: string | null;
  last_lat: number | null;
  last_lng: number | null;
  active_zone_id: string | null;
}

/** Resolves which "bucket" (NULL for the API-key/MacroDroid path, or a real
 * auth.uid()) this request is allowed to read/write. Returns null when
 * neither credential checks out. */
async function resolveUserId(
  req: Request,
  supabaseAdmin: SupabaseClient
): Promise<{ userId: string | null } | null> {
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  const apiKey = Deno.env.get('SHIFT_TRACKER_API_KEY');
  if (apiKey && token === apiKey) return { userId: null };

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return { userId: data.user.id };
}

async function findActiveSession(
  client: SupabaseClient,
  userId: string | null
): Promise<SessionRow | null> {
  let query = client.from('sessions').select('*').is('ended_at', null);
  query = userId === null ? query.is('user_id', null) : query.eq('user_id', userId);
  const { data, error } = await query.order('started_at', { ascending: false }).limit(1).maybeSingle();
  if (error) throw new Error(`findActiveSession failed: ${error.message}`);
  return (data as SessionRow | null) ?? null;
}

/** Sums public.trips within [startedAt, now] — the same window
 * ShiftTracker.tsx's buildShiftSnapshot already uses client-side, computed
 * here too so the sessions row itself is a self-updating source of truth
 * even if the PWA never gets to run that client-side math (backgrounded/
 * killed the whole shift). */
async function computeEarningsSince(
  client: SupabaseClient,
  startedAt: string,
  nowIso: string
): Promise<{ totalEarnings: number; totalRides: number }> {
  const { data, error } = await client
    .from('trips')
    .select('earnings, tips')
    .eq('source', 'real')
    .gte('started_at', startedAt)
    .lte('started_at', nowIso);
  if (error) throw new Error(`computeEarningsSince failed: ${error.message}`);
  const rows = (data ?? []) as { earnings: number | null; tips: number | null }[];
  const totalEarnings = rows.reduce((sum, r) => sum + (r.earnings ?? 0) + (r.tips ?? 0), 0);
  return { totalEarnings, totalRides: rows.length };
}

/** Applies a resolved lat/lng to a session: updates last_lat/last_lng and,
 * on an actual zone change, closes the previous session_zones entry and
 * opens a new one. No-ops when coordinates are absent or unchanged. */
async function applyPosition(
  client: SupabaseClient,
  session: SessionRow,
  lat: number,
  lng: number,
  zones: readonly ZoneRow[],
  nowIso: string
): Promise<string | null> {
  const resolvedZoneId = nearestZoneId(lat, lng, zones);
  const { changed, newZoneId } = resolveZoneTransition(session.active_zone_id, resolvedZoneId);

  if (changed) {
    if (session.active_zone_id) {
      await client
        .from('session_zones')
        .update({ exited_at: nowIso })
        .eq('session_id', session.id)
        .is('exited_at', null);
    }
    if (newZoneId) {
      await client.from('session_zones').insert({
        session_id: session.id,
        zone_id: newZoneId,
        entered_at: nowIso,
      });
    }
  }
  return newZoneId;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ error: 'POST requis' }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) {
      return json({ error: 'Serveur mal configuré (secrets manquants)' }, 500);
    }
    const client = createClient(supabaseUrl, serviceKey);

    const auth = await resolveUserId(req, client);
    if (!auth) return json({ error: 'Non autorisé' }, 401);

    if (await isRateLimited(client, 'shift-tracker', 60)) {
      return json({ error: 'Trop de requêtes, réessaie dans une minute' }, 429);
    }

    const body: RequestBody = await req.json().catch(() => ({}));
    if (!isShiftAction(body.action)) {
      return json({ error: 'action requis: START | STOP | HEARTBEAT | ADD_EARNINGS' }, 400);
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const coords = parseCoordinates(body);

    if (body.action === 'START') {
      const existing = await findActiveSession(client, auth.userId);
      if (existing) {
        return json({ ok: true, alreadyActive: true, session: existing, elapsedSeconds: elapsedSeconds(existing.started_at, now.getTime()) });
      }
      const { data, error } = await client
        .from('sessions')
        .insert({
          user_id: auth.userId,
          started_at: nowIso,
          last_heartbeat_at: nowIso,
          last_lat: coords?.lat ?? null,
          last_lng: coords?.lng ?? null,
        })
        .select('*')
        .single();
      if (error) throw new Error(`session insert failed: ${error.message}`);
      return json({ ok: true, session: data, elapsedSeconds: 0 });
    }

    // Every other action requires an active session — HEARTBEAT auto-starts
    // one defensively (a MacroDroid automation added mid-drive, or one that
    // only wires the heartbeat trigger, shouldn't just silently no-op).
    let session = await findActiveSession(client, auth.userId);
    if (!session && body.action === 'HEARTBEAT') {
      const { data, error } = await client
        .from('sessions')
        .insert({ user_id: auth.userId, started_at: nowIso, last_heartbeat_at: nowIso })
        .select('*')
        .single();
      if (error) throw new Error(`session insert failed: ${error.message}`);
      session = data as SessionRow;
    }

    if (body.action === 'ADD_EARNINGS') {
      const amount = parseAmount(body.amount);
      if (amount === null) return json({ error: 'amount requis (nombre positif)' }, 400);
      const platform =
        typeof body.platform === 'string' ? body.platform.toLowerCase().slice(0, 40) : null;

      const { data: trip, error: tripError } = await client
        .from('trips')
        .insert({
          user_id: auth.userId,
          earnings: amount,
          tips: 0,
          platform,
          started_at: nowIso,
          ended_at: nowIso,
          source: 'real',
          notes: 'Shift tracker (MacroDroid/API)',
        })
        .select('id')
        .single();
      if (tripError) throw new Error(`trip insert failed: ${tripError.message}`);

      if (session) {
        const { data: updated, error: updateErr } = await client
          .from('sessions')
          .update({
            total_earnings: (session.total_earnings ?? 0) + amount,
            total_rides: (session.total_rides ?? 0) + 1,
            last_heartbeat_at: nowIso,
          })
          .eq('id', session.id)
          .select('*')
          .single();
        if (updateErr) throw new Error(`session update failed: ${updateErr.message}`);
        session = updated as SessionRow;
      }
      return json({ ok: true, tripId: trip.id, session });
    }

    if (!session) {
      return json({ ok: true, message: 'Aucun shift actif' });
    }

    if (body.action === 'HEARTBEAT') {
      const { data: zones, error: zonesErr } = await client
        .from('zones')
        .select('id, city_id, latitude, longitude');
      if (zonesErr) throw new Error(`zones fetch failed: ${zonesErr.message}`);

      let activeZoneId = session.active_zone_id;
      if (coords) {
        activeZoneId = await applyPosition(client, session, coords.lat, coords.lng, zones as ZoneRow[], nowIso);
      }

      const { totalEarnings, totalRides } = await computeEarningsSince(client, session.started_at, nowIso);

      const { data: updated, error: updateErr } = await client
        .from('sessions')
        .update({
          last_heartbeat_at: nowIso,
          last_lat: coords?.lat ?? session.last_lat,
          last_lng: coords?.lng ?? session.last_lng,
          active_zone_id: activeZoneId,
          total_earnings: totalEarnings,
          total_rides: totalRides,
        })
        .eq('id', session.id)
        .select('*')
        .single();
      if (updateErr) throw new Error(`session update failed: ${updateErr.message}`);

      return json({ ok: true, session: updated, elapsedSeconds: elapsedSeconds(session.started_at, now.getTime()) });
    }

    // STOP
    const { totalEarnings, totalRides } = await computeEarningsSince(client, session.started_at, nowIso);
    const totalHours = elapsedSeconds(session.started_at, now.getTime()) / 3600;

    if (session.active_zone_id) {
      await client
        .from('session_zones')
        .update({ exited_at: nowIso })
        .eq('session_id', session.id)
        .is('exited_at', null);
    }

    const { data: ended, error: endErr } = await client
      .from('sessions')
      .update({
        ended_at: nowIso,
        total_hours: totalHours,
        total_earnings: totalEarnings,
        total_rides: totalRides,
      })
      .eq('id', session.id)
      .select('*')
      .single();
    if (endErr) throw new Error(`session end failed: ${endErr.message}`);

    return json({ ok: true, session: ended, elapsedSeconds: elapsedSeconds(session.started_at, now.getTime()) });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[shift-tracker]', message);
    captureEdgeException(err, 'shift-tracker', { url: req.url, method: req.method });
    return json({ ok: false, error: message }, 500);
  }
});
