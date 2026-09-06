// Haversine nearest-zone matching, partagé par les scripts d'ingestion
// (mapTaxiStands.ts, processMtlTrajet.ts) qui mappent des points GPS bruts
// aux 66 zones Delivroom.
/// <reference types="node" />

export type ZoneRow = {
  id: string;
  city_id: string;
  latitude: number;
  longitude: number;
};

export function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function nearestZone(lat: number, lng: number, zones: readonly ZoneRow[]) {
  let best: { zone: ZoneRow; distanceM: number } | null = null;
  for (const zone of zones) {
    const distanceM = haversineMeters(lat, lng, zone.latitude, zone.longitude);
    if (!best || distanceM < best.distanceM) best = { zone, distanceM };
  }
  return best;
}
