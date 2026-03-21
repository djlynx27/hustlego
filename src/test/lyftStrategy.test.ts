import {
  applyHabitBoost,
  computeProximityFactor,
  computeSuccessProbabilityScore,
  estimateDriverSupply,
} from '@/lib/lyftStrategy';
import { describe, expect, it } from 'vitest';

describe('lyftStrategy', () => {
  it('reduces success probability as distance grows', () => {
    const near = computeSuccessProbabilityScore({
      demandContextScore: 70,
      demandLevel: 7,
      distanceKm: 0.5,
      estimatedWaitMin: 2,
      surgeActive: true,
    });
    const far = computeSuccessProbabilityScore({
      demandContextScore: 70,
      demandLevel: 7,
      distanceKm: 10,
      estimatedWaitMin: 2,
      surgeActive: true,
    });

    expect(near.score).toBeGreaterThan(far.score);
    expect(computeProximityFactor(0.5)).toBe(1);
  });

  it('penalizes saturated low-demand markets with higher driver supply', () => {
    const saturated = estimateDriverSupply({
      demandContextScore: 55,
      demandLevel: 2,
      estimatedWaitMin: 10,
      surgeActive: false,
    });
    const healthy = estimateDriverSupply({
      demandContextScore: 55,
      demandLevel: 8,
      estimatedWaitMin: 2,
      surgeActive: true,
    });

    expect(saturated).toBeGreaterThan(healthy);
  });

  it('applies a 30 percent habit boost only for cold zones with strong similarity', () => {
    const boosted = applyHabitBoost({
      score: 42,
      similarity: 0.82,
      successfulMatches: 2,
    });
    const ignored = applyHabitBoost({
      score: 72,
      similarity: 0.95,
      successfulMatches: 3,
    });

    expect(boosted.applied).toBe(true);
    expect(boosted.score).toBe(55);
    expect(ignored.applied).toBe(false);
    expect(ignored.score).toBe(72);
  });
});
