export interface DailyReportSessionInput {
  total_hours: number | string | null;
  total_earnings?: number | string | null;
  total_rides?: number | string | null;
  started_at: string | null;
  ended_at: string | null;
}

function toFiniteNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getTrackedSessionHours(session: DailyReportSessionInput) {
  const explicitHours = toFiniteNumber(session.total_hours);

  let derivedDurationHours = 0;
  if (session.started_at && session.ended_at) {
    const startedAt = new Date(session.started_at).getTime();
    const endedAt = new Date(session.ended_at).getTime();

    if (
      Number.isFinite(startedAt) &&
      Number.isFinite(endedAt) &&
      endedAt > startedAt
    ) {
      derivedDurationHours = (endedAt - startedAt) / 3_600_000;
    }
  }

  if (Number.isFinite(explicitHours) && explicitHours > 0) {
    return Math.max(explicitHours, derivedDurationHours);
  }

  return derivedDurationHours;
}

export function sumTrackedSessionHours(sessions: DailyReportSessionInput[]) {
  return sessions.reduce(
    (sum, session) => sum + getTrackedSessionHours(session),
    0
  );
}

export function sumTrackedSessionEarnings(sessions: DailyReportSessionInput[]) {
  return sessions.reduce(
    (sum, session) => sum + toFiniteNumber(session.total_earnings),
    0
  );
}

export function sumTrackedSessionRides(sessions: DailyReportSessionInput[]) {
  return sessions.reduce(
    (sum, session) => sum + toFiniteNumber(session.total_rides),
    0
  );
}
