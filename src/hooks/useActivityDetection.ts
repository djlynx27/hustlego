import { useEffect, useRef, useState } from 'react';

export type ActivityState = 'unknown' | 'stationary' | 'walking' | 'in_vehicle';

export interface ActivityDetectionResult {
  /** Derived activity from GPS speed */
  activity: ActivityState;
  /** Speed in km/h, or null when GPS doesn't report speed */
  speedKmh: number | null;
  /** True when GPS speed confidently exceeds walking threshold */
  isInVehicle: boolean;
  /** True when speed > 30 km/h — definitely in a vehicle */
  isDrivingFast: boolean;
}

// Thresholds (km/h)
const SPEED_STATIONARY = 3;
const SPEED_VEHICLE = 15;

/**
 * GPS-speed-based activity detector.
 *
 * Uses `navigator.geolocation.watchPosition` with `enableHighAccuracy: true`
 * to derive the driver's current activity state. Falls back to 'unknown' when:
 * - Geolocation is unavailable
 * - The browser doesn't report `coords.speed` (most desktop browsers)
 *
 * Stationary confirmation is debounced by 10 s to avoid false positives at
 * red lights.
 */
export function useActivityDetection(): ActivityDetectionResult {
  const [speedKmh, setSpeedKmh] = useState<number | null>(null);
  const [activity, setActivity] = useState<ActivityState>('unknown');
  const stationaryDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    if (!('geolocation' in navigator)) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const rawSpeed = pos.coords.speed; // m/s — null on many browsers
        if (rawSpeed === null || rawSpeed === undefined || rawSpeed < 0) return;

        const kmh = parseFloat((rawSpeed * 3.6).toFixed(1));
        setSpeedKmh(kmh);

        // Clear any pending stationary debounce
        if (stationaryDebounceRef.current) {
          clearTimeout(stationaryDebounceRef.current);
          stationaryDebounceRef.current = null;
        }

        if (kmh < SPEED_STATIONARY) {
          // Debounce: only mark stationary after 10 s of slow movement
          stationaryDebounceRef.current = setTimeout(
            () => setActivity('stationary'),
            10_000
          );
        } else if (kmh < SPEED_VEHICLE) {
          setActivity('walking');
        } else {
          setActivity('in_vehicle');
        }
      },
      () => {
        // Permission denied or hardware error — leave as 'unknown'
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5_000,
        timeout: 15_000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      if (stationaryDebounceRef.current) {
        clearTimeout(stationaryDebounceRef.current);
      }
    };
  }, []);

  return {
    activity,
    speedKmh,
    isInVehicle: activity === 'in_vehicle',
    isDrivingFast: speedKmh !== null && speedKmh > 30,
  };
}
