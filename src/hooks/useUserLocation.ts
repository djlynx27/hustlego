import { useCallback, useEffect, useRef, useState } from 'react';

interface UserLocation {
  latitude: number;
  longitude: number;
  heading?: number | null;
  speed?: number | null;
  accuracy?: number | null;
  timestamp?: number;
}

export type UserLocationStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UserLocationResult {
  location: UserLocation | null;
  status: UserLocationStatus;
  error: string | null;
  refresh: () => Promise<UserLocation | null>;
}

function getGeolocationErrorMessage(error: GeolocationPositionError) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Permission de localisation refusée. Sur Android, ferme les bulles ou overlays puis réessaie.';
    case error.POSITION_UNAVAILABLE:
      return 'Signal GPS indisponible. Active la localisation haute précision ou déplace-toi vers une zone dégagée.';
    case error.TIMEOUT:
      return 'Le GPS met trop de temps à répondre. Réessaie dans un endroit plus dégagé.';
    default:
      return error.message || 'Impossible de récupérer la position actuelle';
  }
}

function normalizePosition(pos: GeolocationPosition): UserLocation {
  return {
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
    heading: typeof pos.coords.heading === 'number' ? pos.coords.heading : null,
    speed: typeof pos.coords.speed === 'number' ? pos.coords.speed : null,
    accuracy:
      typeof pos.coords.accuracy === 'number' ? pos.coords.accuracy : null,
    timestamp: pos.timestamp,
  };
}

export function requestCurrentPreciseLocation(
  options?: PositionOptions
): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined') {
      reject(new Error('Navigator is not available in this environment'));
      return;
    }

    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported on this device'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(normalizePosition(pos)),
      (error) => reject(new Error(getGeolocationErrorMessage(error))),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
        ...options,
      }
    );
  });
}

export function useUserLocation(intervalMs = 30000): UserLocationResult {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [status, setStatus] = useState<UserLocationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const latestLocationRef = useRef<UserLocation | null>(null);

  const applyLocation = useCallback((nextLocation: UserLocation) => {
    const now = Date.now();
    const previousLocation = latestLocationRef.current;

    if (now - lastUpdateRef.current < 1500 && lastUpdateRef.current !== 0) {
      return;
    }

    if (
      previousLocation?.timestamp != null &&
      nextLocation.timestamp != null &&
      nextLocation.timestamp < previousLocation.timestamp
    ) {
      return;
    }

    lastUpdateRef.current = now;
    latestLocationRef.current = nextLocation;
    setLocation(nextLocation);
    setStatus('success');
    setError(null);
  }, []);

  const update = useCallback(async () => {
    if (typeof navigator === 'undefined') {
      setStatus('error');
      setError('Navigator is not available in this environment');
      return null;
    }

    if (!navigator.geolocation) {
      setStatus('error');
      setError('Geolocation is not supported on this device');
      return null;
    }

    setStatus((prev) => (prev === 'success' ? prev : 'loading'));

    try {
      const nextLocation = await requestCurrentPreciseLocation();
      applyLocation(nextLocation);
      return nextLocation;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to get current location';
      if (!latestLocationRef.current) {
        setStatus('error');
      }
      setError(message);
      return null;
    }
  }, [applyLocation]);

  useEffect(() => {
    void update();
    const id = setInterval(update, intervalMs);
    const watchId =
      typeof navigator !== 'undefined' && navigator.geolocation
        ? navigator.geolocation.watchPosition(
            (pos) => applyLocation(normalizePosition(pos)),
            (watchError) => {
              if (!latestLocationRef.current) {
                setStatus('error');
              }
              setError(getGeolocationErrorMessage(watchError));
            },
            {
              enableHighAccuracy: true,
              maximumAge: 5000,
              timeout: 15000,
            }
          )
        : null;

    return () => {
      clearInterval(id);
      if (
        watchId != null &&
        typeof navigator !== 'undefined' &&
        navigator.geolocation
      ) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [applyLocation, update, intervalMs]);

  return { location, status, error, refresh: update };
}

/** Haversine distance in km */
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
