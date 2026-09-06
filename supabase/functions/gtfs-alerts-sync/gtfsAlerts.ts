// Pure GTFS-Realtime mapping logic for gtfs-alerts-sync, split out of index.ts
// so it's testable with `deno test` without hitting the network, decoding
// protobuf, or touching Supabase. Same split as event-sync/eventSync.ts.
//
// index.ts is the only file that imports the real `gtfs-realtime-bindings`
// decoder — everything here operates on plain structural types that match
// the decoded output's shape (protobufjs emits camelCase JS objects), so
// tests can hand-build fixtures with no protobuf involved at all.

// Haversine nearest-zone matching — same formula as
// src/scripts/lib/geo.ts, duplicated rather than imported across the
// Node/Deno boundary (Edge Functions are bundled and deployed independently
// of the Vite/Node project; nothing else in supabase/functions reaches into
// src/, and this keeps it that way).
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

function nearestZone(lat: number, lng: number, zones: readonly ZoneRow[]) {
  let best: { zone: ZoneRow; distanceM: number } | null = null;
  for (const zone of zones) {
    const distanceM = haversineMeters(lat, lng, zone.latitude, zone.longitude);
    if (!best || distanceM < best.distanceM) best = { zone, distanceM };
  }
  return best;
}

// ── Structural subset of transit_realtime's decoded shape (only what we read) ──
export interface GtfsTranslation {
  text: string;
  language?: string | null;
}
export interface GtfsTranslatedString {
  translation?: GtfsTranslation[] | null;
}
export interface GtfsEntitySelector {
  agencyId?: string | null;
  routeId?: string | null;
  stopId?: string | null;
}
export interface GtfsTimeRange {
  start?: number | null; // POSIX seconds
  end?: number | null; // POSIX seconds
}
export interface GtfsAlert {
  activePeriod?: GtfsTimeRange[] | null;
  informedEntity?: GtfsEntitySelector[] | null;
  effect?: number | null;
  headerText?: GtfsTranslatedString | null;
  descriptionText?: GtfsTranslatedString | null;
}
export interface GtfsStopTimeEvent {
  delay?: number | null; // seconds, +late/-early
}
export interface GtfsStopTimeUpdate {
  stopId?: string | null;
  arrival?: GtfsStopTimeEvent | null;
  departure?: GtfsStopTimeEvent | null;
}
export interface GtfsTripUpdate {
  trip: { tripId?: string | null; routeId?: string | null };
  stopTimeUpdate?: GtfsStopTimeUpdate[] | null;
}
export interface GtfsFeedEntity {
  id: string;
  alert?: GtfsAlert | null;
  tripUpdate?: GtfsTripUpdate | null;
}
export interface GtfsFeedMessage {
  entity?: GtfsFeedEntity[] | null;
}

export type Agency = 'TRAINS' | 'RTL' | 'CITLA';

// ── Terminus allowlist ──────────────────────────────────────────────────────
// Coordinates + boost tuning follow the same convention as event-sync's
// VENUE_ALLOWLIST. Two ways to attribute an alert/tripUpdate to one of these
// termini, tried in order (see stopIdMatchedTerminus / alertToEventRows):
//   1. informedEntity.stopId matches a real GTFS stop_id in
//      TERMINUS_STOP_IDS below — positive confirmation, bypasses text
//      matching and the single-stop-scope rejection entirely.
//   2. Free-text terminus-name matching via matchTerminiInText, gated by
//      isStopScopedOnly() to reject the false-positive pattern documented
//      there (a route detour that merely passes near/toward the terminus).
export interface TerminusConfig {
  label: string;
  latitude: number;
  longitude: number;
  /** Rough daily ridership used to auto-tier boost_multiplier via the same
   *  compute_event_boost_multiplier() trigger events already has. */
  capacity: number;
  boostRadiusKm: number;
  boostZoneTypes: string[];
}

export const TERMINUS_ALLOWLIST: Record<string, TerminusConfig> = {
  longueuil: {
    label: 'Terminus Longueuil',
    latitude: 45.5243,
    longitude: -73.5215,
    capacity: 12000,
    boostRadiusKm: 1.5,
    boostZoneTypes: ['transport', 'commercial'],
  },
  'sainte-therese': {
    label: 'Gare Sainte-Thérèse',
    latitude: 45.635984,
    longitude: -73.834121,
    capacity: 4000,
    boostRadiusKm: 1.5,
    boostZoneTypes: ['transport'],
  },
  // Coordonnées vérifiées via src/scripts/processGtfsStatic.ts (GTFS
  // statique exo TRAINS, stop_id SJM1C) — remplace l'estimation approximative
  // d'origine. Toujours à ~12km de la zone la plus proche (sth-gs/blv-*) :
  // alertToEventRows() détecte quand même l'alerte mais ne produira aucun
  // boost tant que le territoire ne s'étend pas jusque-là — comportement
  // voulu, pas un bug.
  'saint-jerome': {
    label: 'Gare Saint-Jérôme',
    latitude: 45.773171,
    longitude: -73.999138,
    capacity: 3000,
    boostRadiusKm: 1.5,
    boostZoneTypes: ['transport'],
  },
};

// Real GTFS stop_ids per tracked terminus — extracted 2026-09-06 via
// `tsx src/scripts/processGtfsStatic.ts` from the exo GTFS static bundle
// (D:/Documents/Transport Dataset). Keyed "<agencyId>:<stopId>" because
// stop_id is only unique within its own agency's namespace, and a shared
// physical terminus can carry a different stop_id per agency (e.g. Gare
// Sainte-Thérèse is TRAINS:STR4D/STR4B *and* CITLA:8372x *and*
// MRCLM:83724/83726 — all the same platform, three GTFS feeds). agencyId
// here is Chrono SAEIV's real-time feed key (matches Agency below) except
// for MRCLM, which has no real-time feed of its own but whose static
// stop_ids are kept in case CITLA's real-time feed ever attributes a stop
// to it directly (regional GTFS-RT aggregators sometimes do).
//
// RTL's static GTFS was not present in the dataset (see
// processGtfsStatic.ts's own run log) — Terminus Longueuil is only covered
// via LRRS/CITCRC's few pass-through stop_ids below, not RTL's own (much
// larger) set of platform stop_ids. Re-run the script and extend this list
// once RTL's static GTFS is available.
const TERMINUS_STOP_IDS: Record<string, keyof typeof TERMINUS_ALLOWLIST> = {
  'LRRS:75030': 'longueuil',
  'CITCRC:76066': 'longueuil',
  'CITLA:83720': 'sainte-therese',
  'CITLA:83721': 'sainte-therese',
  'CITLA:83722': 'sainte-therese',
  'CITLA:83723': 'sainte-therese',
  'CITLA:83724': 'sainte-therese',
  'CITLA:83725': 'sainte-therese',
  'CITLA:83726': 'sainte-therese',
  'CITLA:83727': 'sainte-therese',
  'CITLA:83728': 'sainte-therese',
  'CITLA:83729': 'sainte-therese',
  'CITLA:83730': 'sainte-therese',
  'CITLA:84718': 'sainte-therese',
  'MRCLM:83724': 'sainte-therese',
  'MRCLM:83726': 'sainte-therese',
  'TRAINS:STR4D': 'sainte-therese',
  'TRAINS:STR4B': 'sainte-therese',
  'CITLA:80310': 'saint-jerome',
  'CITLA:80311': 'saint-jerome',
  'CITLA:80312': 'saint-jerome',
  'CITLA:80313': 'saint-jerome',
  'CITLA:80314': 'saint-jerome',
  'CITLA:80315': 'saint-jerome',
  'CITLA:80316': 'saint-jerome',
  'CITLA:80317': 'saint-jerome',
  'CITLA:81828': 'saint-jerome',
  'CITLA:86075': 'saint-jerome',
  'CITLA:86111': 'saint-jerome',
  'CITLA:86112': 'saint-jerome',
  'CITLA:86113': 'saint-jerome',
  'TRAINS:SJM1C': 'saint-jerome',
  'TRAINS:SJM1A': 'saint-jerome',
};

/** Positive stop_id match: an informedEntity entry whose (agencyId, stopId)
 * pair is a real platform of a tracked terminus. Falls back to the polled
 * feed's own agency when an entry omits agencyId. Authoritative when it
 * hits — the caller should skip text matching and isStopScopedOnly()
 * entirely in that case. */
function stopIdMatchedTerminus(alert: GtfsAlert, feedAgency: Agency): TerminusConfig | null {
  for (const entity of alert.informedEntity ?? []) {
    if (!entity.stopId) continue;
    const key = `${entity.agencyId ?? feedAgency}:${entity.stopId}`;
    const terminusKey = TERMINUS_STOP_IDS[key];
    if (terminusKey) return TERMINUS_ALLOWLIST[terminusKey];
  }
  return null;
}

export const MAX_ZONE_DISTANCE_M = 3000;
export const MAJOR_DELAY_THRESHOLD_SECONDS = 600; // 10 min

// GTFS's Alert.Effect enum (see gtfs-realtime.proto) is the real severity
// signal — NOT terminus-name text matching alone. Verified against live
// Chrono SAEIV data: RTL/CITLA route descriptions routinely read "détour
// ligne 71, en direction du Terminus Longueuil" for a single moved bus stop
// (effect = MODIFIED_SERVICE/DETOUR) — matching text without this filter
// flagged every routine stop-move notice as a major terminus outage.
// Only these three actually mean "riders are stranded / badly delayed",
// which is the "hausse subite de la demande taxi" signal we want:
//   NO_SERVICE = 1, REDUCED_SERVICE = 2, SIGNIFICANT_DELAYS = 3
// DETOUR(4), ADDITIONAL_SERVICE(5), MODIFIED_SERVICE(6), OTHER/UNKNOWN(7,8),
// STOP_MOVED(9), NO_EFFECT(10), ACCESSIBILITY_ISSUE(11) are all excluded.
// An alert with no `effect` at all is treated conservatively as NOT major —
// a missed real disruption is far cheaper than boosting a zone's score on
// every day's routine detour notices.
export const MAJOR_ALERT_EFFECTS = new Set([1, 2, 3]);

// `effect` alone isn't reliable either — verified against live CITLA data:
// a single moved bus stop on a route that happens to terminate at Gare
// Sainte-Thérèse comes back tagged effect=NO_SERVICE (true for that ONE
// stop, not for the terminus) with informedEntity scoped to that stop's own
// stopId. This gate only runs when stopIdMatchedTerminus() (below) found no
// positive match — i.e. every stop_id on the alert is confirmed NOT one of
// our tracked termini's real platforms — so any alert whose informedEntity
// entries are *all* stop-scoped is too localized to attribute via text
// alone. An alert with no informedEntity, or at least one
// route/agency/trip-scoped entry (no stopId), is allowed through to text
// matching.
function isStopScopedOnly(alert: GtfsAlert): boolean {
  const entities = alert.informedEntity ?? [];
  return entities.length > 0 && entities.every((e) => e.stopId != null);
}
// GTFS alerts frequently omit activePeriod.end (open-ended "until further
// notice"). Cap every disruption's boost window so a missed "resolved"
// transition on the next poll can't leave a zone permanently boosted.
export const MAX_DISRUPTION_WINDOW_MS = 3 * 60 * 60 * 1000; // 3h

function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function extractText(t?: GtfsTranslatedString | null): string {
  return (t?.translation ?? []).map((tr) => tr.text).join(' ');
}

/** Scans free text for any terminus name in TERMINUS_ALLOWLIST (accent- and
 * case-insensitive), returning every match — an alert can span more than
 * one terminus (e.g. a whole line down between two stations). */
export function matchTerminiInText(text: string): TerminusConfig[] {
  const haystack = stripAccents(text).toLowerCase();
  return Object.entries(TERMINUS_ALLOWLIST)
    .filter(([key]) => haystack.includes(stripAccents(key)))
    .map(([, config]) => config);
}

export interface EventRow {
  external_id: string;
  name: string;
  venue: string;
  city_id: string;
  latitude: number;
  longitude: number;
  start_at: string;
  end_at: string;
  capacity: number;
  category: string;
  boost_radius_km: number;
  boost_zone_types: string[];
}

function terminusToEventRow(
  terminus: TerminusConfig,
  externalId: string,
  name: string,
  startMs: number,
  endMs: number,
  zones: readonly ZoneRow[]
): EventRow | null {
  const match = nearestZone(terminus.latitude, terminus.longitude, zones);
  if (!match || match.distanceM > MAX_ZONE_DISTANCE_M) return null; // out of territory — see saint-jerome note above

  return {
    external_id: externalId,
    name,
    venue: terminus.label,
    city_id: match.zone.city_id,
    latitude: terminus.latitude,
    longitude: terminus.longitude,
    start_at: new Date(startMs).toISOString(),
    end_at: new Date(endMs).toISOString(),
    capacity: terminus.capacity,
    category: 'transit_disruption',
    boost_radius_km: terminus.boostRadiusKm,
    boost_zone_types: terminus.boostZoneTypes,
  };
}

/** Maps one `alert` FeedEntity to zero or more events rows (one per matched
 * terminus). Returns [] when the alert's effect isn't major (see
 * MAJOR_ALERT_EFFECTS), doesn't mention a tracked terminus, or mentions one
 * outside our zone coverage. */
export function alertToEventRows(
  entity: GtfsFeedEntity,
  agency: Agency,
  nowMs: number,
  zones: readonly ZoneRow[]
): EventRow[] {
  const alert = entity.alert;
  if (!alert) return [];
  if (alert.effect == null || !MAJOR_ALERT_EFFECTS.has(alert.effect)) return [];

  const stopMatch = stopIdMatchedTerminus(alert, agency);
  let termini: TerminusConfig[];
  if (stopMatch) {
    termini = [stopMatch]; // confirmed by real stop_id — bypasses the localized-scope guard and text matching
  } else {
    if (isStopScopedOnly(alert)) return [];
    const text = `${extractText(alert.headerText)} ${extractText(alert.descriptionText)}`;
    termini = matchTerminiInText(text);
    if (termini.length === 0) return [];
  }

  const period = alert.activePeriod?.[0];
  const startMs = period?.start ? period.start * 1000 : nowMs;
  const rawEndMs = period?.end ? period.end * 1000 : nowMs + MAX_DISRUPTION_WINDOW_MS;
  const endMs = Math.min(rawEndMs, nowMs + MAX_DISRUPTION_WINDOW_MS);

  const headerText = extractText(alert.headerText) || 'Perturbation service';

  const rows: EventRow[] = [];
  for (const terminus of termini) {
    const row = terminusToEventRow(
      terminus,
      `gtfs:${agency}:alert:${entity.id}:${terminus.label}`,
      headerText,
      startMs,
      endMs,
      zones
    );
    if (row) rows.push(row);
  }
  return rows;
}

// Route → terminus mapping for tripUpdate-based delay detection, used only
// as a fallback when no individual stop_id in the update matches
// TERMINUS_STOP_IDS. Empty by default: Exo/RTL/CITLA route_ids for the
// tracked termini haven't been pulled from static GTFS (routes.txt) yet.
// [À VÉRIFIER] fill this in per agency once that reference data is
// available.
export const ROUTE_TERMINUS_MAP: Record<string, TerminusConfig> = {};

/** Maps one `tripUpdate` FeedEntity to zero or more events rows when any
 * stop's arrival/departure delay exceeds MAJOR_DELAY_THRESHOLD_SECONDS.
 * Prefers a real stop_id match (TERMINUS_STOP_IDS) over ROUTE_TERMINUS_MAP. */
export function tripUpdateToEventRows(
  entity: GtfsFeedEntity,
  agency: Agency,
  nowMs: number,
  zones: readonly ZoneRow[]
): EventRow[] {
  const tripUpdate = entity.tripUpdate;
  if (!tripUpdate) return [];

  const stopTimeUpdates = tripUpdate.stopTimeUpdate ?? [];
  const maxDelay = Math.max(
    0,
    ...stopTimeUpdates.flatMap((s) => [s.arrival?.delay ?? 0, s.departure?.delay ?? 0])
  );
  if (maxDelay < MAJOR_DELAY_THRESHOLD_SECONDS) return [];

  const stopMatch = stopTimeUpdates
    .map((s) => (s.stopId ? TERMINUS_STOP_IDS[`${agency}:${s.stopId}`] : undefined))
    .find((key): key is keyof typeof TERMINUS_ALLOWLIST => key != null);
  const routeId = tripUpdate.trip.routeId;
  const terminus = (stopMatch ? TERMINUS_ALLOWLIST[stopMatch] : undefined) ?? (routeId ? ROUTE_TERMINUS_MAP[routeId] : undefined);
  if (!terminus) return [];

  const row = terminusToEventRow(
    terminus,
    `gtfs:${agency}:tripUpdate:${entity.id}`,
    `Retard majeur — ${terminus.label} (+${Math.round(maxDelay / 60)} min)`,
    nowMs,
    nowMs + MAX_DISRUPTION_WINDOW_MS,
    zones
  );
  return row ? [row] : [];
}

/** Maps a full decoded feed to deduped events rows. */
export function feedToEventRows(
  feed: GtfsFeedMessage,
  agency: Agency,
  nowMs: number,
  zones: readonly ZoneRow[]
): EventRow[] {
  const byExternalId = new Map<string, EventRow>();
  for (const entity of feed.entity ?? []) {
    for (const row of [
      ...alertToEventRows(entity, agency, nowMs, zones),
      ...tripUpdateToEventRows(entity, agency, nowMs, zones),
    ]) {
      byExternalId.set(row.external_id, row);
    }
  }
  return Array.from(byExternalId.values());
}
