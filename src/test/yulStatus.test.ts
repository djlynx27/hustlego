import { buildFallbackYulStatus, getWaveStatus } from '@/lib/yulStatus';
import { describe, expect, it } from 'vitest';

// YUL_WAVES:
//   6h–10h  (high)
//  11h–14h  (medium)
//  17h–21h  (high)

function makeDate(hour: number): Date {
  const d = new Date('2026-03-21T00:00:00');
  d.setHours(hour, 0, 0, 0);
  return d;
}

describe('getWaveStatus', () => {
  it('detects the 6h–10h transatlantic wave at 07:00', () => {
    const { current, next } = getWaveStatus(makeDate(7));
    expect(current).not.toBeNull();
    expect(current?.intensity).toBe('high');
    expect(current?.startHour).toBe(6);
    // next wave is 11h
    expect(next?.startHour).toBe(11);
  });

  it('detects the 11h–14h domestic wave at 12:30', () => {
    const { current } = getWaveStatus(makeDate(12));
    expect(current).not.toBeNull();
    expect(current?.intensity).toBe('medium');
    expect(current?.startHour).toBe(11);
  });

  it('detects the 17h–21h evening wave at 19:00', () => {
    const { current } = getWaveStatus(makeDate(19));
    expect(current).not.toBeNull();
    expect(current?.intensity).toBe('high');
    expect(current?.startHour).toBe(17);
  });

  it('returns null current wave between waves (14h–17h)', () => {
    const { current, next, minutesToNext } = getWaveStatus(makeDate(15));
    expect(current).toBeNull();
    expect(next?.startHour).toBe(17);
    // 15:00 → next wave at 17:00 = 120 min
    expect(minutesToNext).toBe(120);
  });

  it('returns null current wave in the late night (22h)', () => {
    const { current, next } = getWaveStatus(makeDate(22));
    expect(current).toBeNull();
    // wraps to first wave of next day (6h)
    expect(next?.startHour).toBe(6);
  });
});

describe('buildFallbackYulStatus', () => {
  it('marks isActivePeriod true when inside a wave', () => {
    const status = buildFallbackYulStatus(makeDate(8));
    expect(status.isActivePeriod).toBe(true);
    expect(status.currentWave).not.toBeNull();
    expect(status.liveArrivalsCount).toBeNull();
  });

  it('marks isActivePeriod false between waves', () => {
    const status = buildFallbackYulStatus(makeDate(16));
    expect(status.isActivePeriod).toBe(false);
    expect(status.currentWave).toBeNull();
    expect(status.minutesToNextWave).toBe(60);
  });

  it('stores an optional live arrivals count', () => {
    const status = buildFallbackYulStatus(makeDate(18), 7);
    expect(status.liveArrivalsCount).toBe(7);
  });

  it('includes a fetchedAt ISO timestamp', () => {
    const now = makeDate(10);
    const status = buildFallbackYulStatus(now);
    expect(status.fetchedAt).toBe(now.toISOString());
  });
});
