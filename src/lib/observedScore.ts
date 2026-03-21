import type { TripWithZone } from '@/hooks/useTrips';
import { getTripHours, getTripRevenue } from '@/lib/tripAnalytics';

export function getObservedZoneScore(
  trip: Pick<TripWithZone, 'earnings' | 'tips' | 'started_at' | 'ended_at'>
) {
  const durationHours = getTripHours(trip);
  if (durationHours <= 0) return 0;

  const avgHourly = getTripRevenue(trip) / durationHours;
  return Math.min(100, Math.max(0, Math.round((avgHourly / 60) * 100)));
}
