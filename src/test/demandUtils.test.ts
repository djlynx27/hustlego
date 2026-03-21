import {
  formatTime24h,
  generate96TimeLabels,
  getCurrentSlotTime,
  getDemandClass,
  getDemandLevel,
  getSlotOrderMinutes,
  getUpcomingSlotTimes,
  normalize24hTime,
} from '@/lib/demandUtils';
import { describe, expect, it } from 'vitest';

describe('normalize24hTime', () => {
  it('pads single-digit hours and minutes', () => {
    expect(normalize24hTime('8:5')).toBe('08:05');
  });

  it('leaves well-formed time untouched', () => {
    expect(normalize24hTime('14:30')).toBe('14:30');
  });

  it('handles edge midnight value', () => {
    expect(normalize24hTime('00:00')).toBe('00:00');
  });

  it('handles NaN gracefully with default zero', () => {
    expect(normalize24hTime('xx:yy')).toBe('00:00');
  });
});

describe('formatTime24h', () => {
  it('formats date hours and minutes with padding', () => {
    const date = new Date(2026, 2, 21, 8, 5, 0);
    expect(formatTime24h(date)).toBe('08:05');
  });

  it('formats afternoon times correctly', () => {
    const date = new Date(2026, 2, 21, 17, 45, 0);
    expect(formatTime24h(date)).toBe('17:45');
  });
});

describe('getSlotOrderMinutes', () => {
  it('returns offset-from-6am for a morning time', () => {
    // 06:00 → 0 minutes after base
    expect(getSlotOrderMinutes('06:00')).toBe(0);
  });

  it('wraps pre-6am times to end of 24h cycle', () => {
    // 05:45 → 23*60+45 - 360+60 = somewhere after midnight
    const result = getSlotOrderMinutes('05:45');
    expect(result).toBeGreaterThan(60 * 18); // after 18h of day
  });

  it('gives 15-minute delta between consecutive slots', () => {
    const a = getSlotOrderMinutes('10:00');
    const b = getSlotOrderMinutes('10:15');
    expect(b - a).toBe(15);
  });
});

describe('generate96TimeLabels', () => {
  it('generates exactly 96 labels', () => {
    const labels = generate96TimeLabels();
    expect(labels).toHaveLength(96);
  });

  it('starts at 06:00', () => {
    const labels = generate96TimeLabels();
    expect(labels[0]).toBe('06:00');
  });

  it('has 15-minute intervals', () => {
    const labels = generate96TimeLabels();
    expect(labels[1]).toBe('06:15');
    expect(labels[2]).toBe('06:30');
  });

  it('ends at 05:45 (wraps through midnight)', () => {
    const labels = generate96TimeLabels();
    expect(labels[95]).toBe('05:45');
  });
});

describe('getDemandLevel', () => {
  it('returns high for score >= 70', () => {
    expect(getDemandLevel(70)).toBe('high');
    expect(getDemandLevel(100)).toBe('high');
  });

  it('returns medium for 40 <= score < 70', () => {
    expect(getDemandLevel(40)).toBe('medium');
    expect(getDemandLevel(69)).toBe('medium');
  });

  it('returns low for score < 40', () => {
    expect(getDemandLevel(0)).toBe('low');
    expect(getDemandLevel(39)).toBe('low');
  });
});

describe('getDemandClass', () => {
  it('returns demand-high css classes for high scores', () => {
    const cls = getDemandClass(80);
    expect(cls.bg).toBe('demand-high');
    expect(cls.text).toBe('demand-high-text');
    expect(cls.border).toBe('demand-high-border');
  });

  it('returns demand-medium css classes for medium scores', () => {
    const cls = getDemandClass(55);
    expect(cls.bg).toBe('demand-medium');
  });

  it('returns demand-low css classes for low scores', () => {
    const cls = getDemandClass(20);
    expect(cls.bg).toBe('demand-low');
  });
});

describe('getUpcomingSlotTimes', () => {
  it('returns the requested number of slot times', () => {
    const now = new Date(2026, 2, 21, 10, 7, 0); // 10:07
    const slots = getUpcomingSlotTimes(now, 4);
    expect(slots).toHaveLength(4);
  });

  it('first slot rounds up to next 15-min boundary', () => {
    const now = new Date(2026, 2, 21, 10, 7, 0); // 10:07 → next slot 10:15
    const slots = getUpcomingSlotTimes(now, 1);
    expect(slots[0]).toBe('10:15');
  });

  it('consecutive slots are 15 min apart', () => {
    const now = new Date(2026, 2, 21, 9, 0, 0); // 09:00 → next slot 09:15
    const slots = getUpcomingSlotTimes(now, 3);
    expect(slots[0]).toBe('09:15');
    expect(slots[1]).toBe('09:30');
    expect(slots[2]).toBe('09:45');
  });
});

describe('getCurrentSlotTime', () => {
  it('returns a start time rounded down to 15-min boundary', () => {
    const now = new Date(2026, 2, 21, 14, 22, 0); // 14:22 → slot 14:15
    const { start } = getCurrentSlotTime(now);
    expect(start).toBe('14:15');
  });

  it('returns end time 15 minutes after start', () => {
    const now = new Date(2026, 2, 21, 14, 22, 0);
    const { start, end } = getCurrentSlotTime(now);
    expect(start).toBe('14:15');
    expect(end).toBe('14:30');
  });

  it('returns a date string in YYYY-MM-DD format', () => {
    const now = new Date(2026, 2, 21, 10, 0, 0);
    const { date } = getCurrentSlotTime(now);
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('handles exact 15-min boundaries without shifting', () => {
    const now = new Date(2026, 2, 21, 9, 30, 0); // exactly on boundary
    const { start } = getCurrentSlotTime(now);
    expect(start).toBe('09:30');
  });
});
