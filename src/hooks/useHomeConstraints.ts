import { haversineKm } from '@/hooks/useUserLocation';
import {
  getHomeConstraintsSettings,
  setHomeConstraintsSettings,
  type HomeConstraintsSettings,
} from '@/lib/driverPreferences';
import { useCallback, useMemo, useState } from 'react';

/**
 * Average driving speed in km/h.
 * Drops to ~18 km/h during rush-hour periods (Montréal conditions).
 */
function getAvgSpeedKmh(at: Date): number {
  const totalMin = at.getHours() * 60 + at.getMinutes();
  if (totalMin >= 420 && totalMin < 540) return 18; // Morning rush 7h–9h
  if (totalMin >= 960 && totalMin < 1110) return 18; // Evening rush 16h–18h30
  return 30;
}

/** Straight-line → road-distance correction factor for urban Montréal/Laval. */
const ROAD_FACTOR = 1.35;

/**
 * Compute expected travel time (minutes) from a given position to a destination,
 * using the speed appropriate for the estimated departure time.
 */
function travelMinutes(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  departAt: Date
): number {
  const km = haversineKm(fromLat, fromLng, toLat, toLng) * ROAD_FACTOR;
  return Math.ceil((km / getAvgSpeedKmh(departAt)) * 60);
}

function parseTimeMin(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function formatMinAsTime(totalMin: number): string {
  const clamped = Math.max(0, totalMin);
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export type ConstraintUrgency = 'info' | 'warning' | 'critical';

export interface HomeConstraintAlert {
  type: 'return_home' | 'pickup_mom';
  urgency: ConstraintUrgency;
  message: string;
  minutesUntilDeparture: number;
  /** Formatted HH:MM */
  recommendedDepartureTime: string;
  targetName: string;
  targetLat: number;
  targetLng: number;
}

export interface HomeConstraintsResult {
  settings: HomeConstraintsSettings;
  updateSettings: (patch: Partial<HomeConstraintsSettings>) => void;
  /** Non-null when an active scheduling constraint requires the driver's attention. */
  alert: HomeConstraintAlert | null;
  isWeekday: boolean;
}

/**
 * Manages the family-schedule constraints feature.
 *
 * Weekday-only logic:
 *  • Morning  — alert driver to leave in time to be home between
 *               returnHomeWindowStart and returnHomeWindowEnd.
 *  • Afternoon — alert driver to leave in time to reach mom's workplace
 *               before pickupTime, accounting for rush-hour speed.
 *
 * `currentLat/Lng` must be the driver's live GPS position.
 * `now` should update every 15 s (matches the existing TodayScreen timer).
 */
export function useHomeConstraints(
  currentLat: number | null,
  currentLng: number | null,
  now: Date
): HomeConstraintsResult {
  const [settings, setSettingsState] = useState<HomeConstraintsSettings>(() =>
    getHomeConstraintsSettings()
  );

  const updateSettings = useCallback(
    (patch: Partial<HomeConstraintsSettings>) => {
      setSettingsState((prev) => {
        const next = { ...prev, ...patch };
        setHomeConstraintsSettings(next);
        return next;
      });
    },
    []
  );

  const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;

  const alert = useMemo((): HomeConstraintAlert | null => {
    if (!settings.enabled || !isWeekday) return null;
    if (currentLat === null || currentLng === null) return null;

    const nowMin = now.getHours() * 60 + now.getMinutes();

    // ── Morning: must be home between returnHomeWindowStart and returnHomeWindowEnd ──
    const homeStartMin = parseTimeMin(settings.returnHomeWindowStart);
    const homeEndMin = parseTimeMin(settings.returnHomeWindowEnd);

    // Show morning alert between 8h00 and end of home window
    if (nowMin >= 480 && nowMin < homeEndMin) {
      const travel = travelMinutes(
        currentLat,
        currentLng,
        settings.homeLat,
        settings.homeLng,
        now
      );
      // Driver should leave by: homeWindowStart - travel
      const departMin = homeStartMin - travel;
      const minutesUntilDeparture = departMin - nowMin;

      // Alert only when within 90 min of recommended departure
      if (minutesUntilDeparture <= 90) {
        const urgency: ConstraintUrgency =
          minutesUntilDeparture <= 5
            ? 'critical'
            : minutesUntilDeparture <= 20
              ? 'warning'
              : 'info';

        const departTimeStr = formatMinAsTime(departMin);
        const message =
          minutesUntilDeparture <= 0
            ? `🏠 Rentre maintenant ! Il te faut ${travel} min pour arriver avant ${settings.returnHomeWindowEnd}.`
            : minutesUntilDeparture <= 5
              ? `🏠 Pars maintenant pour rentrer à la maison ! (${travel} min de route)`
              : `🏠 Départ maison à ${departTimeStr} (dans ${minutesUntilDeparture} min · trajet ${travel} min)`;

        return {
          type: 'return_home',
          urgency,
          message,
          minutesUntilDeparture,
          recommendedDepartureTime: departTimeStr,
          targetName: 'Maison',
          targetLat: settings.homeLat,
          targetLng: settings.homeLng,
        };
      }
    }

    // ── Afternoon: pick up mom at pickupTime ─────────────────────────────────
    const pickupMin = parseTimeMin(settings.pickupTime);

    // Show afternoon alert between 14h00 and pickup time + 30 min
    if (nowMin >= 840 && nowMin < pickupMin + 30) {
      // First pass: estimate depart using current speed
      const travelNormal = travelMinutes(
        currentLat,
        currentLng,
        settings.momWorkLat,
        settings.momWorkLng,
        now
      );
      // Re-compute using the rush-hour speed expected at departure
      const prelimDepartMin = pickupMin - travelNormal;
      const departDate = new Date(now);
      departDate.setHours(
        Math.floor(Math.max(0, prelimDepartMin) / 60),
        Math.max(0, prelimDepartMin) % 60,
        0,
        0
      );
      const travel = travelMinutes(
        currentLat,
        currentLng,
        settings.momWorkLat,
        settings.momWorkLng,
        departDate
      );
      const departMin = pickupMin - travel;
      const minutesUntilDeparture = departMin - nowMin;

      if (minutesUntilDeparture <= 90) {
        const urgency: ConstraintUrgency =
          minutesUntilDeparture <= 5
            ? 'critical'
            : minutesUntilDeparture <= 20
              ? 'warning'
              : 'info';

        const departTimeStr = formatMinAsTime(departMin);
        const message =
          minutesUntilDeparture <= 0
            ? `🎒 Dépêche-toi ! Pars chercher ta mère à ${settings.momWorkName} maintenant !`
            : minutesUntilDeparture <= 5
              ? `🎒 Pars immédiatement chercher ta mère ! (${travel} min en heure de pointe)`
              : `🎒 Départ pour ${settings.momWorkName} à ${departTimeStr} (dans ${minutesUntilDeparture} min · ${travel} min en heure de pointe)`;

        return {
          type: 'pickup_mom',
          urgency,
          message,
          minutesUntilDeparture,
          recommendedDepartureTime: departTimeStr,
          targetName: settings.momWorkName,
          targetLat: settings.momWorkLat,
          targetLng: settings.momWorkLng,
        };
      }
    }

    return null;
  }, [settings, isWeekday, currentLat, currentLng, now]);

  return { settings, updateSettings, alert, isWeekday };
}
