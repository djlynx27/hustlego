import { haversineKm } from '@/hooks/useUserLocation';
import { useMemo } from 'react';

export interface AntiDeadheadZone {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  score: number;
}

export interface AntiDeadheadSuggestion {
  zone: AntiDeadheadZone & { distKm: number };
  currentScore: number;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
  strategy: 'reposition' | 'destination_filter';
}

interface AntiDeadheadInput {
  currentLat: number | null;
  currentLng: number | null;
  /** The zone the driver is currently in (by zone id), or null if unknown */
  currentZoneId: string | null;
  zones: AntiDeadheadZone[];
  scores: Map<string, number>;
  driverMode: 'rideshare' | 'delivery' | 'all';
  conservativePresence?: boolean;
}

const LOW_SCORE_THRESHOLD = 40; // below this → suggest repositioning
const HIGH_SCORE_THRESHOLD = 60; // target zones must be above this
const MAX_DISTANCE_KM = 8; // only suggest zones within 8 km

/**
 * Anti-deadhead routing hook.
 *
 * When the driver's current zone has a demand score below the low threshold,
 * finds the nearest high-demand zone within MAX_DISTANCE_KM and returns a
 * suggestion with an urgency level.
 *
 * Returns null when:
 * - Location is unavailable
 * - Current zone demand is already adequate
 * - No suitable zone is found nearby
 */
export function useAntiDeadhead({
  currentLat,
  currentLng,
  currentZoneId,
  zones,
  scores,
  driverMode,
  conservativePresence = false,
}: AntiDeadheadInput): AntiDeadheadSuggestion | null {
  const currentScore = currentZoneId ? (scores.get(currentZoneId) ?? 0) : null;

  return useMemo<AntiDeadheadSuggestion | null>(() => {
    if (!currentLat || !currentLng) return null;
    if (currentScore === null || currentScore >= LOW_SCORE_THRESHOLD)
      return null;

    const candidates = zones
      .filter(
        (z) =>
          z.id !== currentZoneId &&
          (scores.get(z.id) ?? z.score) >= HIGH_SCORE_THRESHOLD
      )
      .map((z) => ({
        ...z,
        score: scores.get(z.id) ?? z.score,
        distKm: haversineKm(currentLat, currentLng, z.latitude, z.longitude),
      }))
      .filter((z) => z.distKm <= MAX_DISTANCE_KM)
      .sort((a, b) => {
        // Optimise score-per-km to balance quality vs distance
        const ratioA = a.score / Math.max(a.distKm, 0.1);
        const ratioB = b.score / Math.max(b.distKm, 0.1);
        return ratioB - ratioA;
      });

    const best = candidates[0];
    if (!best) return null;

    const urgency: AntiDeadheadSuggestion['urgency'] =
      currentScore < 20 ? 'high' : currentScore < 30 ? 'medium' : 'low';

    const modeLabel =
      driverMode === 'rideshare'
        ? 'courses'
        : driverMode === 'delivery'
          ? 'livraisons'
          : 'activité';

    const strategy = conservativePresence ? 'destination_filter' : 'reposition';

    const reason = conservativePresence
      ? `Zone faible (${currentScore}/100). Reste connecté sur Lyft et prépare un filtre destination vers ${best.name} à ${best.distKm.toFixed(1)} km (${best.score}/100) pour ${modeLabel}.`
      : `Zone faible (${currentScore}/100). ${best.name} est à ${best.distKm.toFixed(1)} km avec ${best.score}/100 pour ${modeLabel}.`;

    return {
      zone: best,
      currentScore,
      reason,
      urgency,
      strategy,
    };
  }, [
    currentLat,
    currentLng,
    currentZoneId,
    zones,
    scores,
    currentScore,
    driverMode,
    conservativePresence,
  ]);
}
