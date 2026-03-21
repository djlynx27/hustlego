export interface DailyReportSessionInput {
  total_hours: number | string | null;
  started_at: string | null;
  ended_at: string | null;
}

export function getTrackedSessionHours(session: DailyReportSessionInput) {
  const explicitHours = Number(session.total_hours ?? 0);

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
  return sessions.reduce((sum, session) => sum + getTrackedSessionHours(session), 0);
}