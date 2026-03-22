import type { TripWithZone } from '@/hooks/useTrips';
import {
  aggregateTripAnalytics,
  buildShiftSnapshot,
  getTripHours,
  summarizeTrackedSessions,
  summarizeTrips,
} from '@/lib/tripAnalytics';
import { describe, expect, it } from 'vitest';

const sessions = [
  {
    id: 1,
    created_at: '2026-03-15T12:10:00',
    started_at: '2026-03-15T08:00:00',
    ended_at: '2026-03-15T12:00:00',
    total_earnings: 140,
    total_hours: 4,
    total_rides: 6,
    notes: null,
    weather_snapshot: null,
  },
  {
    id: 2,
    created_at: '2026-03-16T16:10:00',
    started_at: '2026-03-16T12:00:00',
    ended_at: '2026-03-16T16:00:00',
    total_earnings: 100,
    total_hours: 4,
    total_rides: 5,
    notes: null,
    weather_snapshot: null,
  },
];

const trips: TripWithZone[] = [
  {
    id: '1',
    created_at: '2026-03-15T08:00:00',
    distance_km: 12,
    earnings: 30,
    ended_at: '2026-03-15T09:00:00',
    experiment: false,
    notes: null,
    started_at: '2026-03-15T08:00:00',
    tips: 5,
    zone_id: 'downtown',
    platform: 'lyft',
    zones: { name: 'Downtown' },
  },
  {
    id: '2',
    created_at: '2026-03-16T18:00:00',
    distance_km: 9,
    earnings: 25,
    ended_at: '2026-03-16T18:30:00',
    experiment: false,
    notes: null,
    started_at: '2026-03-16T18:00:00',
    tips: 0,
    zone_id: 'plateau',
    platform: 'uber',
    zones: { name: 'Plateau' },
  },
  {
    id: '3',
    created_at: '2026-03-16T22:00:00',
    distance_km: 6,
    earnings: 18,
    ended_at: '2026-03-16T22:20:00',
    experiment: false,
    notes: null,
    started_at: '2026-03-16T22:00:00',
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
      new Date('2026-03-15T00:00:00'),
      new Date('2026-03-16T23:59:59')
    );

    expect(summary.rides).toBe(3);
    expect(summary.revenue).toBe(80);
    expect(summary.distanceKm).toBe(27);
    expect(summary.revenuePerHour).toBeGreaterThan(40);
  });

  it('builds ranked analytics', () => {
    const analytics = aggregateTripAnalytics(
      trips,
      new Date('2026-03-17T12:00:00')
    );

    expect(analytics.bestZone).toBe('Plateau');
    expect(analytics.bestPlatform).toBe('uber');
    expect(analytics.zoneSeries[0].revenue).toBe(45);
  });

  it('keeps all dayparts in analytics, including those with zero rides', () => {
    const analytics = aggregateTripAnalytics(
      trips,
      new Date('2026-03-17T12:00:00')
    );

    expect(analytics.daypartSeries.map((entry) => entry.label)).toEqual([
      'Nuit',
      'Matin',
      'Après-midi',
      'Soir',
    ]);
    expect(
      analytics.daypartSeries.find((entry) => entry.label === 'Après-midi')
    ).toEqual({
      label: 'Après-midi',
      revenue: 0,
      rides: 0,
      hours: 0,
    });
  });

  it('tracks an active shift snapshot', () => {
    const snapshot = buildShiftSnapshot(
      trips,
      '2026-03-16T00:00:00',
      new Date('2026-03-17T00:00:00')
    );

    expect(snapshot.metrics.rides).toBe(2);
    expect(snapshot.metrics.revenue).toBe(45);
    expect(snapshot.topZone).toBe('Plateau');
  });

  it('does not treat missing ended_at as an hours-long active trip', () => {
    const incompleteTrip: TripWithZone = {
      ...trips[0],
      id: '4',
      started_at: '2026-03-16T10:00:00',
      ended_at: null,
      earnings: 40,
      tips: 5,
    };

    expect(getTripHours(incompleteTrip)).toBe(0);

    const summary = summarizeTrips(
      [incompleteTrip],
      new Date('2026-03-16T00:00:00'),
      new Date('2026-03-20T00:00:00')
    );

    expect(summary.rides).toBe(1);
    expect(summary.hours).toBe(0);
    expect(summary.revenuePerHour).toBe(0);
  });

  it('summarizes tracked shift sessions separately from trip durations', () => {
    const summary = summarizeTrackedSessions(
      sessions,
      new Date('2026-03-15T00:00:00'),
      new Date('2026-03-16T23:59:59')
    );

    expect(summary.shiftCount).toBe(2);
    expect(summary.hours).toBe(8);
    expect(summary.revenue).toBe(240);
    expect(summary.revenuePerHour).toBe(30);
  });

  it('merges zone buckets with inconsistent casing into single bucket', () => {
    const mixedCaseTrips: TripWithZone[] = [
      {
        ...trips[0],
        id: '10',
        started_at: '2026-03-01T10:00:00',
        ended_at: '2026-03-01T10:30:00',
        earnings: 20,
        tips: 0,
        zones: { name: 'downtown' },
      },
      {
        ...trips[0],
        id: '11',
        started_at: '2026-03-01T12:00:00',
        ended_at: '2026-03-01T12:30:00',
        earnings: 30,
        tips: 0,
        zones: { name: 'Downtown' },
      },
      {
        ...trips[0],
        id: '12',
        started_at: '2026-03-01T14:00:00',
        ended_at: '2026-03-01T14:30:00',
        earnings: 10,
        tips: 0,
        zones: { name: 'DOWNTOWN' },
      },
    ];

    const analytics = aggregateTripAnalytics(
      mixedCaseTrips,
      new Date('2026-03-30T12:00:00')
    );
    // All 3 trips should merge into one zone bucket — revenue = 60
    expect(analytics.zoneSeries).toHaveLength(1);
    expect(analytics.zoneSeries[0].revenue).toBe(60);
    expect(analytics.zoneSeries[0].rides).toBe(3);
  });
});
