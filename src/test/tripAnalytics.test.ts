import type { TripWithZone } from '@/hooks/useTrips';
import {
  aggregateTripAnalytics,
  buildShiftSnapshot,
  getTripHours,
  summarizeTrips,
} from '@/lib/tripAnalytics';
import { describe, expect, it } from 'vitest';

const trips: TripWithZone[] = [
  {
    id: '1',
    created_at: '2026-03-15T08:00:00.000Z',
    distance_km: 12,
    earnings: 30,
    ended_at: '2026-03-15T09:00:00.000Z',
    experiment: false,
    notes: null,
    started_at: '2026-03-15T08:00:00.000Z',
    tips: 5,
    zone_id: 'downtown',
    platform: 'lyft',
    zones: { name: 'Downtown' },
  },
  {
    id: '2',
    created_at: '2026-03-16T18:00:00.000Z',
    distance_km: 9,
    earnings: 25,
    ended_at: '2026-03-16T18:30:00.000Z',
    experiment: false,
    notes: null,
    started_at: '2026-03-16T18:00:00.000Z',
    tips: 0,
    zone_id: 'plateau',
    platform: 'uber',
    zones: { name: 'Plateau' },
  },
  {
    id: '3',
    created_at: '2026-03-16T22:00:00.000Z',
    distance_km: 6,
    earnings: 18,
    ended_at: '2026-03-16T22:20:00.000Z',
    experiment: false,
    notes: null,
    started_at: '2026-03-16T22:00:00.000Z',
    tips: 2,
    zone_id: 'plateau',
    platform: 'uber',
    zones: { name: 'Plateau' },
  },
];

describe('trip analytics', () => {
  it('summarizes a date window', () => {
    const summary = summarizeTrips(
      trips,
      new Date('2026-03-15T00:00:00.000Z'),
      new Date('2026-03-16T23:59:59.000Z')
    );

    expect(summary.rides).toBe(3);
    expect(summary.revenue).toBe(80);
    expect(summary.distanceKm).toBe(27);
    expect(summary.revenuePerHour).toBeGreaterThan(40);
  });

  it('builds ranked analytics', () => {
    const analytics = aggregateTripAnalytics(
      trips,
      new Date('2026-03-17T12:00:00.000Z')
    );

    expect(analytics.bestZone).toBe('Plateau');
    expect(analytics.bestPlatform).toBe('uber');
    expect(analytics.zoneSeries[0].revenue).toBe(45);
  });

  it('tracks an active shift snapshot', () => {
    const snapshot = buildShiftSnapshot(
      trips,
      '2026-03-16T00:00:00.000Z',
      new Date('2026-03-17T00:00:00.000Z')
    );

    expect(snapshot.metrics.rides).toBe(2);
    expect(snapshot.metrics.revenue).toBe(45);
    expect(snapshot.topZone).toBe('Plateau');
  });

  it('does not treat missing ended_at as an hours-long active trip', () => {
    const incompleteTrip: TripWithZone = {
      ...trips[0],
      id: '4',
      started_at: '2026-03-16T10:00:00.000Z',
      ended_at: null,
      earnings: 40,
      tips: 5,
    };

    expect(getTripHours(incompleteTrip)).toBe(0);

    const summary = summarizeTrips(
      [incompleteTrip],
      new Date('2026-03-16T00:00:00.000Z'),
      new Date('2026-03-20T00:00:00.000Z')
    );

    expect(summary.rides).toBe(1);
    expect(summary.hours).toBe(0);
    expect(summary.revenuePerHour).toBe(0);
  });
});
