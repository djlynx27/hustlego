import { computeTrafficCongestion } from '@/hooks/useTomTomTraffic';
import { describe, expect, it } from 'vitest';

describe('TomTom traffic helpers', () => {
  it('computes congestion ratio from speed delta', () => {
    expect(computeTrafficCongestion(20, 40)).toBe(0.5);
    expect(computeTrafficCongestion(40, 40)).toBe(0);
  });

  it('guards invalid speeds', () => {
    expect(computeTrafficCongestion(0, 0)).toBe(0);
    expect(computeTrafficCongestion(Number.NaN, 50)).toBe(0);
  });
});
