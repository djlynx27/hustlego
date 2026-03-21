import { getObservedZoneScore } from '@/lib/observedScore';
import { describe, expect, it } from 'vitest';

describe('getObservedZoneScore', () => {
  it('uses hourly revenue instead of raw earnings', () => {
    const score = getObservedZoneScore({
      earnings: 50,
      tips: 10,
      started_at: '2026-03-21T10:00:00',
      ended_at: '2026-03-21T12:00:00',
    });

    expect(score).toBe(50);
  });

  it('returns 0 when trip duration is missing or invalid', () => {
    const score = getObservedZoneScore({
      earnings: 50,
      tips: 10,
      started_at: '2026-03-21T10:00:00',
      ended_at: null,
    });

    expect(score).toBe(0);
  });

  it('caps very high hourly revenue at 100', () => {
    const score = getObservedZoneScore({
      earnings: 120,
      tips: 0,
      started_at: '2026-03-21T10:00:00',
      ended_at: '2026-03-21T11:00:00',
    });

    expect(score).toBe(100);
  });
});
