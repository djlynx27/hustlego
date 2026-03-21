export interface ExistingDailyReportMetrics {
  total_earnings?: number | null;
  total_trips?: number | null;
  total_distance_km?: number | null;
  hours_worked?: number | null;
}

interface ParsedProfitMetrics {
  earnings: number;
  tripsCount: number;
  distanceKm: number;
  hoursWorked: number;
}

export type ProfitReportExtractionResult =
  | { ok: true; values: ParsedProfitMetrics }
  | { ok: false; message: string };

function parseOptionalMetric(value: unknown) {
  if (value === null || value === undefined || value === '') return 0;

  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseRequiredMetric(value: unknown) {
  if (value === null || value === undefined || value === '') return null;

  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function extractProfitReportMetrics(
  extractedData: Record<string, unknown>
): ProfitReportExtractionResult {
  const earnings = parseRequiredMetric(extractedData.earnings);
  if (earnings === null) {
    return {
      ok: false,
      message: 'Aucune donnée de gains/profit détectée pour le rapport',
    };
  }

  const tripsCount = parseOptionalMetric(extractedData.trips_count);
  if (tripsCount === null) {
    return { ok: false, message: 'Nombre de trajets invalide dans l’analyse' };
  }

  const distanceKm = parseOptionalMetric(extractedData.distance_km);
  if (distanceKm === null) {
    return { ok: false, message: 'Distance invalide dans l’analyse' };
  }

  const hoursWorked = parseOptionalMetric(extractedData.hours_worked);
  if (hoursWorked === null) {
    return { ok: false, message: 'Heures invalides dans l’analyse' };
  }

  return {
    ok: true,
    values: {
      earnings,
      tripsCount,
      distanceKm,
      hoursWorked,
    },
  };
}

export function buildProfitReportUpdate(
  existingReport: ExistingDailyReportMetrics | null | undefined,
  extractedData: Record<string, unknown>
) {
  const parsed = extractProfitReportMetrics(extractedData);
  if (!parsed.ok) return parsed;

  return {
    ok: true as const,
    values: {
      total_earnings:
        Number(existingReport?.total_earnings ?? 0) + parsed.values.earnings,
      total_trips:
        Number(existingReport?.total_trips ?? 0) + parsed.values.tripsCount,
      total_distance_km:
        Number(existingReport?.total_distance_km ?? 0) +
        parsed.values.distanceKm,
      hours_worked:
        Number(existingReport?.hours_worked ?? 0) + parsed.values.hoursWorked,
    },
  };
}
