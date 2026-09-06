// Deno-native tests for gtfs-alerts-sync's pure GTFS-mapping logic.
// Run with: deno test supabase/functions/gtfs-alerts-sync/

import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts';
import {
  alertToEventRows,
  feedToEventRows,
  matchTerminiInText,
  tripUpdateToEventRows,
  ROUTE_TERMINUS_MAP,
  type GtfsAlert,
  type GtfsFeedEntity,
  type ZoneRow,
} from './gtfsAlerts.ts';

const ZONES: ZoneRow[] = [
  { id: 'lng-tl', city_id: 'lng', latitude: 45.5243, longitude: -73.5215 }, // Terminus Longueuil, exact
  { id: 'sth-gs', city_id: 'sth', latitude: 45.635984, longitude: -73.834121 }, // Gare Ste-Thérèse, exact
];

function alertEntity(overrides: Partial<GtfsAlert> = {}): GtfsFeedEntity {
  return {
    id: 'alert-1',
    alert: {
      effect: 1, // NO_SERVICE
      headerText: { translation: [{ text: 'Service interrompu' }] },
      descriptionText: { translation: [{ text: 'Panne majeure à Terminus Longueuil' }] },
      ...overrides,
    },
  };
}

Deno.test('matchTerminiInText: accent-insensitive match', () => {
  const matches = matchTerminiInText('Interruption a Sainte-Therese ce matin');
  assertEquals(matches.length, 1);
  assertEquals(matches[0].label, 'Gare Sainte-Thérèse');
});

Deno.test('matchTerminiInText: no match returns empty array', () => {
  assertEquals(matchTerminiInText('Retard mineur ligne verte'), []);
});

Deno.test('alertToEventRows: maps a tracked terminus to an events row', () => {
  const rows = alertToEventRows(alertEntity(), 'RTL', Date.parse('2026-09-06T12:00:00Z'), ZONES);
  assertEquals(rows.length, 1);
  assertEquals(rows[0].city_id, 'lng');
  assertEquals(rows[0].category, 'transit_disruption');
  assertEquals(rows[0].external_id, 'gtfs:RTL:alert:alert-1:Terminus Longueuil');
});

Deno.test('alertToEventRows: routine detour mentioning a tracked terminus is skipped (MODIFIED_SERVICE/DETOUR are not major)', () => {
  // Regression: RTL/CITLA route descriptions read "vers Terminus Longueuil"
  // for a single moved bus stop — this must NOT be treated as a terminus
  // outage just because the name appears in the text.
  const rows = alertToEventRows(
    alertEntity({
      effect: 6, // MODIFIED_SERVICE
      headerText: null,
      descriptionText: {
        translation: [{ text: "Detour sur la ligne 71, en direction du Terminus Longueuil, en raison d'un chantier." }],
      },
    }),
    'RTL',
    Date.now(),
    ZONES
  );
  assertEquals(rows, []);
});

Deno.test('alertToEventRows: single-stop-scoped alert is skipped even with effect=NO_SERVICE (real CITLA false-positive pattern)', () => {
  // Regression: CITLA tags a single moved bus stop as effect=NO_SERVICE
  // (true for that ONE stop, not the terminus) with informedEntity scoped
  // to that stop's own stopId — verified against live data 2026-09-06.
  const rows = alertToEventRows(
    alertEntity({
      effect: 1, // NO_SERVICE
      headerText: null,
      descriptionText: {
        translation: [{
          text: "L'arret de Gaulle ne peut etre desservi en raison d'un detour sur la ligne 249 direction Terminus Sainte-Therese.",
        }],
      },
      informedEntity: [{ agencyId: 'CITLA', routeId: '249', stopId: '83583' }],
    }),
    'CITLA',
    Date.now(),
    ZONES
  );
  assertEquals(rows, []);
});

Deno.test('alertToEventRows: route-wide alert (no stopId) with major effect still matches', () => {
  const rows = alertToEventRows(
    alertEntity({
      effect: 3, // SIGNIFICANT_DELAYS
      informedEntity: [{ agencyId: 'RTL', routeId: '901' }],
    }),
    'RTL',
    Date.now(),
    ZONES
  );
  assertEquals(rows.length, 1);
});

Deno.test('alertToEventRows: missing effect is treated conservatively as not major', () => {
  const rows = alertToEventRows(alertEntity({ effect: undefined }), 'RTL', Date.now(), ZONES);
  assertEquals(rows, []);
});

Deno.test('alertToEventRows: untracked terminus text produces no rows', () => {
  const rows = alertToEventRows(
    alertEntity({
      headerText: { translation: [{ text: 'Retard' }] },
      descriptionText: { translation: [{ text: 'Ligne bleue seulement' }] },
    }),
    'RTL',
    Date.now(),
    ZONES
  );
  assertEquals(rows, []);
});

Deno.test('alertToEventRows: open-ended activePeriod is capped at MAX_DISRUPTION_WINDOW_MS', () => {
  const nowMs = Date.parse('2026-09-06T12:00:00Z');
  const rows = alertToEventRows(
    { ...alertEntity(), alert: { ...alertEntity().alert!, activePeriod: [{ start: nowMs / 1000 }] } },
    'RTL',
    nowMs,
    ZONES
  );
  assertEquals(rows[0].end_at, new Date(nowMs + 3 * 60 * 60 * 1000).toISOString());
});

Deno.test('alertToEventRows: terminus outside zone coverage is skipped, not crashed', () => {
  const rows = alertToEventRows(
    {
      id: 'alert-2',
      alert: {
        headerText: { translation: [{ text: 'Panne à Saint-Jérôme' }] },
      },
    },
    'TRAINS',
    Date.now(),
    ZONES // no zone within MAX_ZONE_DISTANCE_M of Saint-Jérôme's coordinates
  );
  assertEquals(rows, []);
});

Deno.test('tripUpdateToEventRows: below threshold produces no rows', () => {
  const rows = tripUpdateToEventRows(
    {
      id: 'tu-1',
      tripUpdate: {
        trip: { routeId: 'route-1' },
        stopTimeUpdate: [{ arrival: { delay: 120 } }],
      },
    },
    'TRAINS',
    Date.now(),
    ZONES
  );
  assertEquals(rows, []);
});

Deno.test('tripUpdateToEventRows: major delay on an unmapped route produces no rows (ROUTE_TERMINUS_MAP empty by default)', () => {
  assertEquals(ROUTE_TERMINUS_MAP['route-1'], undefined);
  const rows = tripUpdateToEventRows(
    {
      id: 'tu-2',
      tripUpdate: {
        trip: { routeId: 'route-1' },
        stopTimeUpdate: [{ arrival: { delay: 900 } }],
      },
    },
    'TRAINS',
    Date.now(),
    ZONES
  );
  assertEquals(rows, []);
});

Deno.test('feedToEventRows: dedupes when alert and tripUpdate would collide (same external_id shape stays distinct by kind)', () => {
  const rows = feedToEventRows(
    { entity: [alertEntity(), alertEntity()] }, // same id twice
    'RTL',
    Date.now(),
    ZONES
  );
  assertEquals(rows.length, 1); // Map keyed by external_id collapses the duplicate
});
