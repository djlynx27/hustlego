// Pure logic for shift-tracker, split out of index.ts so it's testable with
// `deno test` without touching Supabase. Same split as event-sync/
// gtfs-alerts-sync's eventSync.ts/gtfsAlerts.ts.

// Haversine nearest-zone matching — duplicated rather than imported across
// the Node/Deno boundary, same rationale as gtfs-alerts-sync/gtfsAlerts.ts.
export type ZoneRow = { id: string; city_id: string; latitude: number; longitude: number };

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const MAX_ZONE_DISTANCE_M = 3000;

export function nearestZoneId(lat: number, lng: number, zones: readonly ZoneRow[]): string | null {
  let best: { id: string; distanceM: number } | null = null;
  for (const zone of zones) {
    const distanceM = haversineMeters(lat, lng, zone.latitude, zone.longitude);
    if (!best || distanceM < best.distanceM) best = { id: zone.id, distanceM };
  }
  return best && best.distanceM <= MAX_ZONE_DISTANCE_M ? best.id : null;
}

export const ACTIONS = ['START', 'STOP', 'HEARTBEAT', 'ADD_EARNINGS'] as const;
export type ShiftAction = (typeof ACTIONS)[number];

export function isShiftAction(value: unknown): value is ShiftAction {
  return typeof value === 'string' && (ACTIONS as readonly string[]).includes(value);
}

export function elapsedSeconds(startedAt: string, nowMs: number): number {
  const startedMs = new Date(startedAt).getTime();
  if (!Number.isFinite(startedMs)) return 0;
  return Math.max(0, Math.round((nowMs - startedMs) / 1000));
}

/** Decides whether a heartbeat's resolved zone should open a new
 * session_zones entry (and close the previous one). Pure so the "only
 * transition on an actual zone change" rule is testable without a DB. */
export function resolveZoneTransition(
  currentZoneId: string | null,
  resolvedZoneId: string | null
): { changed: boolean; newZoneId: string | null } {
  if (resolvedZoneId === currentZoneId) return { changed: false, newZoneId: currentZoneId };
  return { changed: true, newZoneId: resolvedZoneId };
}

export interface HeartbeatPayload {
  lat?: number;
  lng?: number;
}

export function parseCoordinates(body: {
  lat?: unknown;
  lng?: unknown;
}): { lat: number; lng: number } | null {
  const lat = Number(body.lat);
  const lng = Number(body.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

export function parseAmount(value: unknown): number | null {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}
