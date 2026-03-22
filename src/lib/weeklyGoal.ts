export interface WeekRange {
  from: string;
  to: string;
  dayOfWeek: number;
}

export function getWeekRange(now = new Date()): WeekRange {
  const day = now.getDay(); // 0=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    from: monday.toISOString(),
    to: sunday.toISOString(),
    dayOfWeek: day === 0 ? 7 : day, // 1=Mon..7=Sun
  };
}
