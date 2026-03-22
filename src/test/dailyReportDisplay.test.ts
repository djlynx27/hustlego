import { getDailyReportDisplayMetrics } from '@/lib/dailyReportDisplay';
import { describe, expect, it } from 'vitest';

describe('daily report display metrics', () => {
  it('prefers tracked values even when they are zero', () => {
    const displayMetrics = getDailyReportDisplayMetrics(
      {
        total_trips: 7,
        total_earnings: 120,
        hours_worked: 5,
      },
      {
        rides: 0,
        revenue: 0,
        hours: 0,
        shifts: 1,
      }
    );

    expect(displayMetrics).toEqual({
      trips: 0,
      earnings: 0,
      hours: 0,
    });
  });

  it('falls back to report values when no tracked metrics exist', () => {
    const displayMetrics = getDailyReportDisplayMetrics(
      {
        total_trips: 7,
        total_earnings: 120,
        hours_worked: 5,
      },
      null
    );

    expect(displayMetrics).toEqual({
      trips: 7,
      earnings: 120,
      hours: 5,
    });
  });

  it('normalizes null report values to zero without tracked metrics', () => {
    const displayMetrics = getDailyReportDisplayMetrics(
      {
        total_trips: null,
        total_earnings: null,
        hours_worked: null,
      },
      null
    );

    expect(displayMetrics).toEqual({
      trips: 0,
      earnings: 0,
      hours: 0,
    });
  });
});