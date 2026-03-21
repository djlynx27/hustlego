export const DRIVER_MODE_KEY = 'geohustle_driver_mode';
export const CONSERVATIVE_PRESENCE_KEY = 'hustlego_conservative_presence';
export const DRIVER_FINGERPRINT_KEY = 'hustlego_driver_fingerprint';

function safeGetItem(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // localStorage unavailable; keep ephemeral state in memory only.
  }
}

export function getStoredDriverMode() {
  const saved = safeGetItem(DRIVER_MODE_KEY);
  return saved === 'rideshare' || saved === 'delivery' || saved === 'all'
    ? saved
    : 'all';
}

export function setStoredDriverMode(mode: 'rideshare' | 'delivery' | 'all') {
  safeSetItem(DRIVER_MODE_KEY, mode);
}

export function getConservativePresencePreference() {
  const saved = safeGetItem(CONSERVATIVE_PRESENCE_KEY);
  if (saved == null) return true;
  return saved !== 'false';
}

export function setConservativePresencePreference(value: boolean) {
  safeSetItem(CONSERVATIVE_PRESENCE_KEY, value ? 'true' : 'false');
}

export function getDriverFingerprint() {
  const existing = safeGetItem(DRIVER_FINGERPRINT_KEY);
  if (existing) return existing;

  const generated =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `driver-${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;

  safeSetItem(DRIVER_FINGERPRINT_KEY, generated);
  return generated;
}
