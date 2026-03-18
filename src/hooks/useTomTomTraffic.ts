import type { Zone } from '@/hooks/useSupabase';
import { useQuery } from '@tanstack/react-query';

const TOMTOM_KEY = import.meta.env.VITE_TOMTOM_KEY ?? '';

export interface ZoneTrafficSnapshot {
  zoneId: string;
  congestion: number; // 0..1
  currentSpeed: number;
  freeFlowSpeed: number;
  roadClosure: boolean;
  confidence: number;
  updatedAt: string;
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function computeTrafficCongestion(
  currentSpeed: number,
  freeFlowSpeed: number
) {
  if (!Number.isFinite(currentSpeed) || !Number.isFinite(freeFlowSpeed)) {
    return 0;
  }
  if (freeFlowSpeed <= 0) return 0;
  return clamp01(1 - currentSpeed / freeFlowSpeed);
}

async function fetchZoneTraffic(
  zone: Pick<Zone, 'id' | 'latitude' | 'longitude'>
): Promise<ZoneTrafficSnapshot> {
  const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${TOMTOM_KEY}&point=${zone.latitude},${zone.longitude}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TomTom flow fetch failed (${response.status})`);
  }

  const payload = await response.json();
  const segment = payload?.flowSegmentData;
  const currentSpeed = Number(segment?.currentSpeed ?? 0);
  const freeFlowSpeed = Number(segment?.freeFlowSpeed ?? 0);
  const confidence = Number(segment?.confidence ?? 0);

  return {
    zoneId: zone.id,
    congestion: computeTrafficCongestion(currentSpeed, freeFlowSpeed),
    currentSpeed,
    freeFlowSpeed,
    roadClosure: Boolean(segment?.roadClosure),
    confidence,
    updatedAt: new Date().toISOString(),
  };
}

export function useTomTomTraffic(cityId: string, zones: Zone[]) {
  return useQuery<ZoneTrafficSnapshot[]>({
    queryKey: [
      'tomtom-traffic',
      cityId,
      zones.map((zone) => zone.id).join('|'),
    ],
    queryFn: async () => {
      if (!TOMTOM_KEY || zones.length === 0) {
        return zones.map((zone) => ({
          zoneId: zone.id,
          congestion: 0,
          currentSpeed: 0,
          freeFlowSpeed: 0,
          roadClosure: false,
          confidence: 0,
          updatedAt: new Date().toISOString(),
        }));
      }

      const snapshots = await Promise.all(
        zones.map(async (zone) => {
          try {
            return await fetchZoneTraffic(zone);
          } catch {
            return {
              zoneId: zone.id,
              congestion: 0,
              currentSpeed: 0,
              freeFlowSpeed: 0,
              roadClosure: false,
              confidence: 0,
              updatedAt: new Date().toISOString(),
            } satisfies ZoneTrafficSnapshot;
          }
        })
      );

      return snapshots;
    },
    enabled: !!cityId,
    staleTime: 10 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });
}

export function getAverageTrafficCongestion(snapshots: ZoneTrafficSnapshot[]) {
  if (snapshots.length === 0) return 0;
  return clamp01(
    snapshots.reduce((sum, snapshot) => sum + snapshot.congestion, 0) /
      snapshots.length
  );
}
