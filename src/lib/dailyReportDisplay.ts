export interface DailyReportDisplaySource {
  total_trips: number | null;
  total_earnings: number | null;
  hours_worked: number | null;
}

export interface TrackedDailyMetrics {
  hours: number;
  revenue: number;
  rides: number;
  shifts: number;
}

export interface DailyReportDisplayMetrics {
  trips: number;
  earnings: number;
  hours: number;
}

export function getDailyReportDisplayMetrics(
  report: DailyReportDisplaySource,
  tracked: TrackedDailyMetrics | null
): DailyReportDisplayMetrics {
  if (tracked) {
    return {
      trips: tracked.rides,
      earnings: tracked.revenue,
      hours: tracked.hours,
    };
  }

  return {
    trips: Number(report.total_trips ?? 0),
    earnings: Number(report.total_earnings ?? 0),
    hours: Number(report.hours_worked ?? 0),
  };
}
