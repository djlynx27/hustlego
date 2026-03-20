import type { TripWithZone } from '@/hooks/useTrips';

export interface MetricSummary {
  revenue: number;
  rides: number;
  hours: number;
  revenuePerHour: number;
  averageRide: number;
  distanceKm: number;
}

export interface ChartPoint {
  label: string;
  revenue: number;
  rides: number;
  hours: number;
}

export interface RankedBucket {
  label: string;
  revenue: number;
  rides: number;
  hours: number;
}

export interface ShiftSnapshot {
  startedAt: string;
  elapsedHours: number;
  metrics: MetricSummary;
  topZone: string | null;
  topPlatform: string | null;
}

export interface TripAnalytics {
  last7Days: MetricSummary;
  last30Days: MetricSummary;
  dailySeries: ChartPoint[];
  zoneSeries: RankedBucket[];
  daypartSeries: RankedBucket[];
  platformSeries: RankedBucket[];
  bestZone: string | null;
  bestPlatform: string | null;
}

const DAYPART_LABELS = ['Nuit', 'Matin', 'Après-midi', 'Soir'];

function round(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function toDate(value: string | null | undefined) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getTripRevenue(trip: Pick<TripWithZone, 'earnings' | 'tips'>) {
  return Number(trip.earnings ?? 0) + Number(trip.tips ?? 0);
}

export function getTripHours(
  trip: Pick<TripWithZone, 'started_at' | 'ended_at'>,
  fallbackEnd = new Date()
) {
  const startedAt = toDate(trip.started_at);
  if (!startedAt) return 0;

  const endedAt = toDate(trip.ended_at) ?? fallbackEnd;
  return Math.max(0, (endedAt.getTime() - startedAt.getTime()) / 3_600_000);
}

export function summarizeTrips(
  trips: TripWithZone[],
  start: Date,
  end = new Date()
): MetricSummary {
  const windowTrips = trips.filter((trip) => {
    const startedAt = toDate(trip.started_at);
    return startedAt && startedAt >= start && startedAt <= end;
  });

  const revenue = windowTrips.reduce(
    (sum, trip) => sum + getTripRevenue(trip),
    0
  );
  const rides = windowTrips.length;
  const hours = windowTrips.reduce(
    (sum, trip) => sum + getTripHours(trip, end),
    0
  );
  const distanceKm = windowTrips.reduce(
    (sum, trip) => sum + Number(trip.distance_km ?? 0),
    0
  );

  return {
    revenue: round(revenue, 2),
    rides,
    hours: round(hours, 1),
    revenuePerHour: hours > 0 ? round(revenue / hours, 2) : 0,
    averageRide: rides > 0 ? round(revenue / rides, 2) : 0,
    distanceKm: round(distanceKm, 1),
  };
}

function getDaypartLabel(date: Date) {
  const hour = date.getHours();
  if (hour < 6) return DAYPART_LABELS[0];
  if (hour < 12) return DAYPART_LABELS[1];
  if (hour < 18) return DAYPART_LABELS[2];
  return DAYPART_LABELS[3];
}

function buildRankedSeries(
  trips: TripWithZone[],
  bucket: (trip: TripWithZone) => string,
  limit: number
) {
  const map = new Map<string, RankedBucket>();

  for (const trip of trips) {
    const label = bucket(trip);
    const current = map.get(label) ?? {
      label,
      revenue: 0,
      rides: 0,
      hours: 0,
    };
    current.revenue += getTripRevenue(trip);
    current.rides += 1;
    current.hours += getTripHours(trip);
    map.set(label, current);
  }

  return [...map.values()]
    .map((entry) => ({
      ...entry,
      revenue: round(entry.revenue, 2),
      hours: round(entry.hours, 1),
    }))
    .sort((left, right) => right.revenue - left.revenue)
    .slice(0, limit);
}

export function aggregateTripAnalytics(
  trips: TripWithZone[],
  now = new Date()
): TripAnalytics {
  const start7Days = new Date(now);
  start7Days.setDate(start7Days.getDate() - 6);
  start7Days.setHours(0, 0, 0, 0);

  const start30Days = new Date(now);
  start30Days.setDate(start30Days.getDate() - 29);
  start30Days.setHours(0, 0, 0, 0);

  const trips30Days = trips.filter((trip) => {
    const startedAt = toDate(trip.started_at);
    return startedAt && startedAt >= start30Days && startedAt <= now;
  });

  const dailySeries: ChartPoint[] = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start7Days);
    day.setDate(start7Days.getDate() + index);
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);

    const metrics = summarizeTrips(trips, day, nextDay);
    return {
      label: new Intl.DateTimeFormat('fr-CA', {
        weekday: 'short',
        day: 'numeric',
      }).format(day),
      revenue: metrics.revenue,
      rides: metrics.rides,
      hours: metrics.hours,
    };
  });

  const zoneSeries = buildRankedSeries(
    trips30Days,
    (trip) => trip.zones?.name || 'Zone inconnue',
    8
  );
  const daypartSeries = DAYPART_LABELS.map((label) => {
    const daypartTrips = trips30Days.filter((trip) => {
      const startedAt = toDate(trip.started_at);
      return startedAt && getDaypartLabel(startedAt) === label;
    });
    const metrics = summarizeTrips(daypartTrips, new Date(0), now);
    return {
      label,
      revenue: metrics.revenue,
      rides: metrics.rides,
      hours: metrics.hours,
    };
  }).filter((entry) => entry.revenue > 0);
  const platformSeries = buildRankedSeries(
    trips30Days,
    (trip) => trip.platform || 'Non précisé',
    6
  );

  return {
    last7Days: summarizeTrips(trips, start7Days, now),
    last30Days: summarizeTrips(trips, start30Days, now),
    dailySeries,
    zoneSeries,
    daypartSeries,
    platformSeries,
    bestZone: zoneSeries[0]?.label ?? null,
    bestPlatform: platformSeries[0]?.label ?? null,
  };
}

export function buildShiftSnapshot(
  trips: TripWithZone[],
  startedAtIso: string,
  now = new Date()
): ShiftSnapshot {
  const startedAt = toDate(startedAtIso) ?? now;
  const metrics = summarizeTrips(trips, startedAt, now);
  const zoneSeries = buildRankedSeries(
    trips.filter((trip) => {
      const tripDate = toDate(trip.started_at);
      return tripDate && tripDate >= startedAt && tripDate <= now;
    }),
    (trip) => trip.zones?.name || 'Zone inconnue',
    1
  );
  const platformSeries = buildRankedSeries(
    trips.filter((trip) => {
      const tripDate = toDate(trip.started_at);
      return tripDate && tripDate >= startedAt && tripDate <= now;
    }),
    (trip) => trip.platform || 'Non précisé',
    1
  );

  return {
    startedAt: startedAt.toISOString(),
    elapsedHours: round((now.getTime() - startedAt.getTime()) / 3_600_000, 1),
    metrics,
    topZone: zoneSeries[0]?.label ?? null,
    topPlatform: platformSeries[0]?.label ?? null,
  };
}
