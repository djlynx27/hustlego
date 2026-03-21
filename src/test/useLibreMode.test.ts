import { pickBest, type LibreModeZone } from '@/hooks/useLibreMode';
import { describe, expect, it } from 'vitest';

function makeZone(overrides: Partial<LibreModeZone> = {}): LibreModeZone {
  return {
    id: 'z1',
    name: 'Plateau',
    type: 'résidentiel',
    score: 70,
    latitude: 45.52,
    longitude: -73.58,
    distKm: 3,
    arrivalScore: 72,
    ...overrides,
  };
}

describe('pickBest', () => {
  it('returns null for empty zone list', () => {
    expect(pickBest([])).toBeNull();
  });

  it('returns null when all zones are airports', () => {
    const airport = makeZone({ type: 'aéroport' });
    expect(pickBest([airport])).toBeNull();
  });

  it('returns the single non-airport zone', () => {
    const zone = makeZone({ type: 'commercial' });
    const result = pickBest([zone]);
    expect(result).not.toBeNull();
    expect(result?.zone.id).toBe('z1');
  });

  it('prefers closest when scores are similar', () => {
    // arrivalScore gap < 20 → pick closest
    const close = makeZone({ id: 'close', distKm: 1, arrivalScore: 68 });
    const farHigher = makeZone({ id: 'far', distKm: 8, arrivalScore: 80 });
    // gap = 80 - 68 = 12 < 20 → should pick close, reason='proche'
    const result = pickBest([farHigher, close]); // farHigher first (sorted by arrivalScore desc)
    expect(result?.zone.id).toBe('close');
    expect(result?.reason).toBe('proche');
  });

  it('prefers higher-score zone when gap >= 20 and close zone is weak', () => {
    const weak = makeZone({ id: 'close', distKm: 1, arrivalScore: 55 });
    const strong = makeZone({ id: 'strong', distKm: 10, arrivalScore: 85 });
    // gap = 85 - 55 = 30 >= 20, weak < 62 → pick strong, reason='score'
    const result = pickBest([strong, weak]);
    expect(result?.zone.id).toBe('strong');
    expect(result?.reason).toBe('score');
  });

  it('picks close zone when gap >= 20 but close zone is NOT weak (>= 62)', () => {
    const decent = makeZone({ id: 'close', distKm: 1, arrivalScore: 65 });
    const great = makeZone({ id: 'strong', distKm: 10, arrivalScore: 90 });
    // gap = 90 - 65 = 25 >= 20 BUT closest.arrivalScore = 65 >= 62 → pick close
    const result = pickBest([great, decent]);
    expect(result?.zone.id).toBe('close');
    expect(result?.reason).toBe('proche');
  });

  it('ignores airport zones even when they would score highest', () => {
    const airport = makeZone({
      id: 'yul',
      type: 'aéroport',
      distKm: 5,
      arrivalScore: 99,
    });
    const regular = makeZone({
      id: 'reg',
      type: 'commercial',
      distKm: 3,
      arrivalScore: 60,
    });
    const result = pickBest([airport, regular]);
    expect(result?.zone.id).toBe('reg');
  });

  it('picks earliest when best and closest are the same zone', () => {
    const only = makeZone({ id: 'only', distKm: 2, arrivalScore: 75 });
    const result = pickBest([only]);
    expect(result?.zone.id).toBe('only');
    // When closest === best score, reason = 'proche'
    expect(result?.reason).toBe('proche');
  });
});
