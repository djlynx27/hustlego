import { useCallback, useState } from 'react';

const STORAGE_KEY = 'geohustle_city_id';

export function useCityId(defaultId = 'mtl') {
  const [cityId, setCityIdState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || defaultId;
    } catch {
      return defaultId;
    }
  });

  const setCityId = useCallback((id: string) => {
    setCityIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // localStorage unavailable; selected city remains in memory.
    }
  }, []);

  return [cityId, setCityId] as const;
}
