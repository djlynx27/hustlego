import { summarizeTaxiEntries } from '@/lib/taxiAnalytics';
import { describe, expect, it } from 'vitest';

describe('taxi analytics', () => {
  it('uses recorded durations to compute active hourly earnings', () => {
    const summary = summarizeTaxiEntries([
      { amount: 50, km: 20, duration_min: 120 },
      { amount: 30, km: 10, duration_min: 30 },
    ]);

    expect(summary.amount).toBe(80);
    expect(summary.km).toBe(30);
    expect(summary.durationMin).toBe(150);
    expect(summary.perHour).toBe(32);
  });

  it('ignores invalid durations instead of poisoning the totals', () => {
    const summary = summarizeTaxiEntries([
      { amount: 50, km: 20, duration_min: -10 },
      { amount: 20, km: 5, duration_min: Number.NaN },
    ]);

    expect(summary.durationMin).toBe(0);
    expect(summary.perHour).toBe(0);
    expect(summary.perKm).toBe(70 / 25);
  });
});
