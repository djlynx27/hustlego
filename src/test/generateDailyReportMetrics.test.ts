import { describe, expect, it } from 'vitest';
import {
  getTrackedSessionHours,
  sumTrackedSessionEarnings,
  sumTrackedSessionHours,
  sumTrackedSessionRides,
} from '../../supabase/functions/generate-daily-report/reportMetrics';

describe('generate daily report tracked session hours', () => {
  it('keeps the derived duration when it exceeds the explicit session hours', () => {
    const hours = getTrackedSessionHours({
      total_hours: 6,
      started_at: '2026-03-21T08:00:00Z',
      ended_at: '2026-03-21T16:00:00Z',
    });

    expect(hours).toBe(8);
  });

  it('keeps explicit session hours when they exceed the derived duration', () => {
    const hours = getTrackedSessionHours({
      total_hours: 9,
      started_at: '2026-03-21T08:00:00Z',
      ended_at: '2026-03-21T16:00:00Z',
    });

    expect(hours).toBe(9);
  });

  it('falls back to zero when explicit and derived durations are invalid', () => {
    const hours = getTrackedSessionHours({
      total_hours: 'abc',
      started_at: 'invalid-date',
      ended_at: null,
    });

    expect(hours).toBe(0);
  });

  it('sums tracked session hours across sessions', () => {
    const hours = sumTrackedSessionHours([
      {
        total_hours: 2,
        started_at: '2026-03-21T08:00:00Z',
        ended_at: '2026-03-21T11:00:00Z',
      },
      {
        total_hours: 4,
        started_at: '2026-03-21T12:00:00Z',
        ended_at: '2026-03-21T17:00:00Z',
      },
    ]);

    expect(hours).toBe(8);
  });

  it('skips malformed earnings instead of propagating NaN', () => {
    const earnings = sumTrackedSessionEarnings([
      {
        total_earnings: 50,
        started_at: '2026-03-21T08:00:00Z',
        ended_at: '2026-03-21T11:00:00Z',
        total_hours: 3,
      },
      {
        total_earnings: 'abc',
        started_at: '2026-03-21T12:00:00Z',
        ended_at: '2026-03-21T13:00:00Z',
        total_hours: 1,
      },
      {
        total_earnings: 30,
        started_at: '2026-03-21T14:00:00Z',
        ended_at: '2026-03-21T16:00:00Z',
        total_hours: 2,
      },
    ]);

    expect(earnings).toBe(80);
  });

  it('skips malformed ride counts instead of propagating NaN', () => {
    const rides = sumTrackedSessionRides([
      {
        total_rides: 4,
        started_at: '2026-03-21T08:00:00Z',
        ended_at: '2026-03-21T11:00:00Z',
        total_hours: 3,
      },
      {
        total_rides: 'oops',
        started_at: '2026-03-21T12:00:00Z',
        ended_at: '2026-03-21T13:00:00Z',
        total_hours: 1,
      },
      {
        total_rides: 3,
        started_at: '2026-03-21T14:00:00Z',
        ended_at: '2026-03-21T16:00:00Z',
        total_hours: 2,
      },
    ]);

    expect(rides).toBe(7);
  });
});
