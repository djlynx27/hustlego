import {
  CONSERVATIVE_PRESENCE_KEY,
  DRIVER_FINGERPRINT_KEY,
  DRIVER_MODE_KEY,
  getConservativePresencePreference,
  getDriverFingerprint,
  getHomeConstraintsSettings,
  getStoredDriverMode,
  HOME_CONSTRAINTS_KEY,
  setConservativePresencePreference,
  setHomeConstraintsSettings,
  setStoredDriverMode,
} from '@/lib/driverPreferences';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// jsdom provides localStorage in this test environment

describe('getStoredDriverMode', () => {
  beforeEach(() => localStorage.clear());

  it("returns 'all' when nothing is stored", () => {
    expect(getStoredDriverMode()).toBe('all');
  });

  it("returns 'rideshare' when stored as rideshare", () => {
    localStorage.setItem(DRIVER_MODE_KEY, 'rideshare');
    expect(getStoredDriverMode()).toBe('rideshare');
  });

  it("returns 'delivery' when stored as delivery", () => {
    localStorage.setItem(DRIVER_MODE_KEY, 'delivery');
    expect(getStoredDriverMode()).toBe('delivery');
  });

  it("returns 'all' for unknown stored value", () => {
    localStorage.setItem(DRIVER_MODE_KEY, 'invalid-value');
    expect(getStoredDriverMode()).toBe('all');
  });
});

describe('setStoredDriverMode', () => {
  beforeEach(() => localStorage.clear());

  it('persists the mode to localStorage', () => {
    setStoredDriverMode('delivery');
    expect(localStorage.getItem(DRIVER_MODE_KEY)).toBe('delivery');
  });

  it('round-trips all valid modes', () => {
    for (const mode of ['rideshare', 'delivery', 'all'] as const) {
      setStoredDriverMode(mode);
      expect(getStoredDriverMode()).toBe(mode);
    }
  });
});

describe('getConservativePresencePreference', () => {
  beforeEach(() => localStorage.clear());

  it('returns true when nothing is stored (safe default)', () => {
    expect(getConservativePresencePreference()).toBe(true);
  });

  it("returns false when stored as 'false'", () => {
    localStorage.setItem(CONSERVATIVE_PRESENCE_KEY, 'false');
    expect(getConservativePresencePreference()).toBe(false);
  });

  it("returns true for any value other than 'false'", () => {
    localStorage.setItem(CONSERVATIVE_PRESENCE_KEY, 'true');
    expect(getConservativePresencePreference()).toBe(true);
    localStorage.setItem(CONSERVATIVE_PRESENCE_KEY, '1');
    expect(getConservativePresencePreference()).toBe(true);
  });
});

describe('setConservativePresencePreference', () => {
  beforeEach(() => localStorage.clear());

  it('persists true as string "true"', () => {
    setConservativePresencePreference(true);
    expect(localStorage.getItem(CONSERVATIVE_PRESENCE_KEY)).toBe('true');
  });

  it('persists false as string "false"', () => {
    setConservativePresencePreference(false);
    expect(localStorage.getItem(CONSERVATIVE_PRESENCE_KEY)).toBe('false');
  });
});

describe('getDriverFingerprint', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('generates a fingerprint when none exists', () => {
    const fp = getDriverFingerprint();
    expect(fp).toBeTruthy();
    expect(typeof fp).toBe('string');
  });

  it('returns the same fingerprint on repeated calls', () => {
    const first = getDriverFingerprint();
    const second = getDriverFingerprint();
    expect(first).toBe(second);
  });

  it('persists the fingerprint to localStorage', () => {
    const fp = getDriverFingerprint();
    expect(localStorage.getItem(DRIVER_FINGERPRINT_KEY)).toBe(fp);
  });
});

describe('getHomeConstraintsSettings', () => {
  beforeEach(() => localStorage.clear());

  it('returns defaults when nothing is stored', () => {
    const settings = getHomeConstraintsSettings();
    expect(settings.enabled).toBe(false);
    expect(settings.returnHomeWindowStart).toBe('10:00');
    expect(settings.pickupTime).toBe('17:00');
  });

  it('merges stored values over defaults', () => {
    setHomeConstraintsSettings({
      enabled: true,
      homeLat: 45.6,
      homeLng: -73.8,
      homeAddress: 'Test Address',
      momWorkLat: 45.5,
      momWorkLng: -73.6,
      momWorkAddress: 'Mom Work',
      momWorkName: 'Test School',
      returnHomeWindowStart: '09:30',
      returnHomeWindowEnd: '10:00',
      pickupTime: '16:30',
    });
    const settings = getHomeConstraintsSettings();
    expect(settings.enabled).toBe(true);
    expect(settings.returnHomeWindowStart).toBe('09:30');
    expect(settings.pickupTime).toBe('16:30');
  });

  it('returns defaults when stored JSON is malformed', () => {
    localStorage.setItem(HOME_CONSTRAINTS_KEY, 'not-valid-json{');
    const settings = getHomeConstraintsSettings();
    expect(settings.enabled).toBe(false);
  });
});
