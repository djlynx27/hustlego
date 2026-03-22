/**
 * Auto-detects the nearest city (mtl / lvl / lng) from the user's GPS position
 * and updates cityId when the detected city materially changes.
 *
 * Approximate city centroids (WGS-84):
 *   Montréal  45.508, -73.587
 *   Laval     45.608, -73.747
 *   Longueuil 45.531, -73.518
 */
import { haversineKm } from '@/hooks/useUserLocation';
import { useEffect, useRef } from 'react';

const CITY_CENTROIDS: { id: string; lat: number; lng: number }[] = [
  { id: 'mtl', lat: 45.508, lng: -73.587 },
  { id: 'lvl', lat: 45.608, lng: -73.747 },
  { id: 'lng', lat: 45.531, lng: -73.518 },
  { id: 'bsb', lat: 45.62, lng: -73.843 },
  { id: 'sth', lat: 45.642, lng: -73.829 },
  { id: 'blv', lat: 45.675, lng: -73.878 },
  { id: 'rsm', lat: 45.638, lng: -73.799 },
  { id: 'bdf', lat: 45.667, lng: -73.76 },
  { id: 'trb', lat: 45.702, lng: -73.645 },
];

export function nearestCityId(lat: number, lng: number): string {
  let best = CITY_CENTROIDS[0];
  let bestDist = haversineKm(lat, lng, best.lat, best.lng);
  for (const city of CITY_CENTROIDS.slice(1)) {
    const d = haversineKm(lat, lng, city.lat, city.lng);
    if (d < bestDist) {
      bestDist = d;
      best = city;
    }
  }
  return best.id;
}

/**
 * Keeps cityId aligned with the detected city, while avoiding repeated writes for
 * the same detection so a manual override can still stick until GPS resolves to
 * a different city.
 */
export function useAutoCity(
  currentCityId: string,
  setCityId: (id: string) => void,
  userLat: number | null | undefined,
  userLng: number | null | undefined
) {
  const lastAutoCityRef = useRef<string | null>(null);

  useEffect(() => {
    if (userLat == null || userLng == null) return;

    const detectedCityId = nearestCityId(userLat, userLng);

    if (detectedCityId === currentCityId) {
      lastAutoCityRef.current = detectedCityId;
      return;
    }

    if (detectedCityId === lastAutoCityRef.current) {
      return;
    }

    lastAutoCityRef.current = detectedCityId;
    setCityId(detectedCityId);
  }, [currentCityId, userLat, userLng, setCityId]);
}
