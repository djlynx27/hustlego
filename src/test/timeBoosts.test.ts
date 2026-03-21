import { computeTimeBoost, getActiveTimeBoosts } from '@/lib/timeBoosts';
import { describe, expect, it } from 'vitest';

/** Creates a Date for a given day-of-week + hour. Sunday=0. */
function makeDate(dayOfWeek: number, hour: number): Date {
  const d = new Date(2026, 2, 22, hour, 0, 0); // arbitrary week base
  // Adjust to the correct day of the week
  const current = d.getDay();
  const diff = dayOfWeek - current;
  d.setDate(d.getDate() + diff);
  d.setHours(hour, 0, 0, 0);
  return d;
}

describe('getActiveTimeBoosts', () => {
  it('includes weekday morning rush for a Monday at 7h', () => {
    const monday7am = makeDate(1, 7);
    const boosts = getActiveTimeBoosts(monday7am);
    const keys = boosts.map((b) => b.bannerKey);
    expect(keys).toContain('boostWeekdayMorningRush');
  });

  it('excludes weekday morning rush on Saturday', () => {
    const saturday7am = makeDate(6, 7);
    const boosts = getActiveTimeBoosts(saturday7am);
    const keys = boosts.map((b) => b.bannerKey);
    expect(keys).not.toContain('boostWeekdayMorningRush');
  });

  it('includes weekday evening rush for a Wednesday at 17h', () => {
    const wed17 = makeDate(3, 17);
    const boosts = getActiveTimeBoosts(wed17);
    const keys = boosts.map((b) => b.bannerKey);
    expect(keys).toContain('boostWeekdayEveningRush');
  });

  it('includes weekend night boost on Saturday at 23h', () => {
    const sat23 = makeDate(6, 23);
    const boosts = getActiveTimeBoosts(sat23);
    const keys = boosts.map((b) => b.bannerKey);
    expect(keys).toContain('boostWeekendNight');
  });

  it('includes FriSat night boost on Friday at 23h', () => {
    const fri23 = makeDate(5, 23);
    const boosts = getActiveTimeBoosts(fri23);
    const keys = boosts.map((b) => b.bannerKey);
    expect(keys).toContain('boostFriSatNight');
  });

  it('includes Sunday commercial boost at 12h', () => {
    const sun12 = makeDate(0, 12);
    const boosts = getActiveTimeBoosts(sun12);
    const keys = boosts.map((b) => b.bannerKey);
    expect(keys).toContain('boostSunday');
  });

  it('includes lunch boost on any weekday at 12h', () => {
    const tue12 = makeDate(2, 12);
    const boosts = getActiveTimeBoosts(tue12);
    const keys = boosts.map((b) => b.bannerKey);
    expect(keys).toContain('boostLunch');
  });

  it('returns no boosts on a Tuesday at 3h', () => {
    const tue3 = makeDate(2, 3);
    const boosts = getActiveTimeBoosts(tue3);
    expect(boosts).toHaveLength(0);
  });

  it('boost objects have positive boost values', () => {
    const mon8 = makeDate(1, 8);
    const boosts = getActiveTimeBoosts(mon8);
    for (const b of boosts) {
      expect(b.boost).toBeGreaterThan(0);
    }
  });
});

describe('computeTimeBoost', () => {
  it('sums boosts for matching zone type', () => {
    const boosts = [
      {
        zoneTypes: ['métro', 'transport'],
        boost: 20,
        bannerKey: 'a',
        bannerFr: '',
        bannerEn: '',
        icon: '',
      },
      {
        zoneTypes: ['métro'],
        boost: 10,
        bannerKey: 'b',
        bannerFr: '',
        bannerEn: '',
        icon: '',
      },
    ];
    expect(computeTimeBoost('métro', boosts)).toBe(30);
  });

  it('returns 0 when zone type does not match any active boost', () => {
    const boosts = [
      {
        zoneTypes: ['nightlife'],
        boost: 25,
        bannerKey: 'c',
        bannerFr: '',
        bannerEn: '',
        icon: '',
      },
    ];
    expect(computeTimeBoost('commercial', boosts)).toBe(0);
  });

  it('returns 0 for empty boost list', () => {
    expect(computeTimeBoost('métro', [])).toBe(0);
  });
});
