import { haversineKm } from '@/hooks/useUserLocation';
import { HOTSPOTS } from '@/lib/hotspots';
import { describe, expect, it } from 'vitest';

// Authoritative, OSM/Nominatim-verified coordinates from
// supabase/migrations/20260731130000_fix_zone_coordinates.sql. That migration
// fixed the `zones` table but not this curated hub list — and since
// matchLocalHubs (geocoding.ts) ranks HOTSPOTS ABOVE Mapbox results, a stale
// entry here silently wins the search box. These guard that drift.
const VERIFIED: Record<string, { lat: number; lng: number }> = {
  'station-montmorency': { lat: 45.558353, lng: -73.721518 }, // zone lvl-mm
  centropolis: { lat: 45.562258, lng: -73.744674 }, // zone lvl-cp
  'casino-montreal': { lat: 45.50551, lng: -73.525828 }, // zone mtl-ca
};

// A hub is a venue, not a point: some spread between a curated centroid and
// the zone's own anchor is legitimate. 600 m is tight enough to catch a
// genuinely wrong place (the Montmorency bug was 1.71 km off, landing 0.48 km
// from Centropolis) while tolerating a different-but-valid corner of the
// same site.
const MAX_DRIFT_KM = 0.6;

describe('HOTSPOTS coordinates stay in sync with the verified zone catalog', () => {
  for (const [id, expected] of Object.entries(VERIFIED)) {
    it(`${id} is within ${MAX_DRIFT_KM * 1000} m of its verified location`, () => {
      const hub = HOTSPOTS.find((h) => h.id === id);
      expect(hub, `hotspot "${id}" not found`).toBeDefined();
      const drift = haversineKm(hub!.lat, hub!.lng, expected.lat, expected.lng);
      expect(drift).toBeLessThanOrEqual(MAX_DRIFT_KM);
    });
  }

  it('Station Montmorency resolves to the metro terminus, not Centropolis', () => {
    const mm = HOTSPOTS.find((h) => h.id === 'station-montmorency')!;
    const centro = HOTSPOTS.find((h) => h.id === 'centropolis')!;
    const toCentropolis = haversineKm(mm.lat, mm.lng, centro.lat, centro.lng);
    // The reported bug: the two hubs had collapsed to ~0.48 km apart, so
    // searching one landed on the other. They are ~2.2 km apart in reality.
    expect(toCentropolis).toBeGreaterThan(1.5);
  });
});
