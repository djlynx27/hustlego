import { getWeekRange } from '@/lib/weeklyGoal';
import { describe, expect, it } from 'vitest';

describe('WeeklyGoal', () => {
  it('returns exact ISO week boundaries instead of date-only strings', () => {
    const now = new Date(2026, 2, 22, 12, 34, 56, 789);
    const expectedMonday = new Date(now);
    expectedMonday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    expectedMonday.setHours(0, 0, 0, 0);

    const expectedSunday = new Date(expectedMonday);
    expectedSunday.setDate(expectedMonday.getDate() + 6);
    expectedSunday.setHours(23, 59, 59, 999);

    expect(getWeekRange(now)).toEqual({
      from: expectedMonday.toISOString(),
      to: expectedSunday.toISOString(),
      dayOfWeek: 7,
    });
  });

  it('keeps monday as day 1 for progress expectations', () => {
    const mondayMorning = new Date(2026, 2, 16, 8, 0, 0, 0);

    expect(getWeekRange(mondayMorning).dayOfWeek).toBe(1);
  });
});
