import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type FirewallStatus = 'healthy' | 'warning' | 'critical';

export interface CalibrationEvent {
  mae: number;
  triggeredBy: string;
  createdAt: string;
  weights: Record<string, number>;
}

export interface ObservabilityMetrics {
  /** Average absolute deviation between Gemini final_score and computed baseline (last 24h) */
  avgScoreDrift: number;
  /** Average absolute prediction error (last 7 days) */
  avgPredictionMAE: number;
  /** Number of zones scored in the last 24h */
  totalScoredZones: number;
  /** Most recent weight calibration event */
  lastCalibration: CalibrationEvent | null;
  /** Last 10 calibration events for timeline */
  calibrationHistory: CalibrationEvent[];
  /** Health classification derived from avgScoreDrift */
  firewallStatus: FirewallStatus;
}

function classifyFirewallStatus(avgDrift: number): FirewallStatus {
  if (avgDrift < 10) return 'healthy';
  if (avgDrift < 20) return 'warning';
  return 'critical';
}

async function fetchObservabilityMetrics(): Promise<ObservabilityMetrics> {
  const since24h = new Date(Date.now() - 86400 * 1000).toISOString();
  const since7d = new Date(Date.now() - 7 * 86400 * 1000).toISOString();

  const [scoresResult, predictionsResult, weightHistoryResult] =
    await Promise.all([
      supabase
        .from('scores')
        .select('score, final_score')
        .gte('calculated_at', since24h),
      supabase
        .from('predictions')
        .select('prediction_error')
        .gte('predicted_at', since7d)
        .not('prediction_error', 'is', null),
      supabase
        .from('weight_history')
        .select('mae, triggered_by, created_at, weights')
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

  // Score drift: avg |final_score - score| from last 24h
  const scoreRows = scoresResult.data ?? [];
  const drifts = scoreRows
    .map((r) =>
      typeof r.final_score === 'number' && typeof r.score === 'number'
        ? Math.abs(r.final_score - r.score)
        : null
    )
    .filter((d): d is number => d !== null);
  const avgScoreDrift =
    drifts.length > 0
      ? Math.round((drifts.reduce((s, d) => s + d, 0) / drifts.length) * 10) /
        10
      : 0;

  // Prediction MAE: avg |prediction_error| from last 7 days
  const predRows = predictionsResult.data ?? [];
  const maes = predRows
    .map((r) =>
      typeof r.prediction_error === 'number'
        ? Math.abs(r.prediction_error)
        : null
    )
    .filter((m): m is number => m !== null);
  const avgPredictionMAE =
    maes.length > 0
      ? Math.round((maes.reduce((s, m) => s + m, 0) / maes.length) * 100) / 100
      : 0;

  // Calibration history
  const calibrationHistory: CalibrationEvent[] = (
    weightHistoryResult.data ?? []
  ).map((row) => ({
    mae: typeof row.mae === 'number' ? Math.round(row.mae * 100) / 100 : 0,
    triggeredBy: String(row.triggered_by ?? 'auto'),
    createdAt: String(row.created_at ?? ''),
    weights:
      row.weights !== null &&
      typeof row.weights === 'object' &&
      !Array.isArray(row.weights)
        ? (row.weights as Record<string, number>)
        : {},
  }));

  return {
    avgScoreDrift,
    avgPredictionMAE,
    totalScoredZones: scoreRows.length,
    lastCalibration: calibrationHistory[0] ?? null,
    calibrationHistory,
    firewallStatus: classifyFirewallStatus(avgScoreDrift),
  };
}

export function useAgentObservability() {
  return useQuery<ObservabilityMetrics>({
    queryKey: ['agent-observability'],
    queryFn: fetchObservabilityMetrics,
    staleTime: 5 * 60 * 1000, // refresh every 5 minutes
    refetchInterval: 5 * 60 * 1000,
  });
}
