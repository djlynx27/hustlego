import type { TripWithZone } from '@/hooks/useTrips';
import { supabase } from '@/integrations/supabase/client';
import type { Database, TablesInsert } from '@/integrations/supabase/types';
import {
  deriveLearningInsights,
  derivePostShiftSummary,
} from '@/lib/learningEngine';
import { DEFAULT_WEIGHTS, type WeightConfig } from '@/lib/scoringEngine';
import { getTripHours, getTripRevenue } from '@/lib/tripAnalytics';

export interface LearningSyncResult {
  ok: boolean;
  sessionId?: number;
  syncedCounts: {
    emaPatterns: number;
    beliefs: number;
    predictions: number;
    demandPatterns: number;
    sessionZones: number;
  };
  message: string;
}

type EmaPatternInsert = TablesInsert<'ema_patterns'>;
type ZoneBeliefInsert = TablesInsert<'zone_beliefs'>;
type WeightHistoryInsert = TablesInsert<'weight_history'>;
type SessionInsert = TablesInsert<'sessions'>;
type SessionZoneInsert = TablesInsert<'session_zones'>;
type PredictionInsert = TablesInsert<'predictions'>;
type DemandPatternInsert = TablesInsert<'demand_patterns'>;
type SimilarContextRpcArgs =
  Database['public']['Functions']['match_similar_contexts']['Args'];

type SimilarContextRpcRow = {
  id: number | string;
  zone_id: string;
  actual_earnings_per_hour: number | string | null;
  similarity: number | string | null;
  created_at: string;
};

export interface SimilarContextMatch {
  id: number;
  zoneId: string;
  actualEarningsPerHour: number;
  similarity: number;
  createdAt: string;
}

export interface SimilarContextsResult {
  ok: boolean;
  matches: SimilarContextMatch[];
  averageEarningsPerHour: number;
  averageSimilarity: number;
  message: string;
}

export interface ZoneContextInput {
  zoneId: string;
  zoneType?: string | null;
  currentScore?: number | null;
  now: Date;
  trafficCongestion?: number;
  weatherDemandBoostPoints?: number;
}

function round(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalizeScoreFromEarnings(earningsPerHour: number) {
  return clamp(Math.round((earningsPerHour / 60) * 100), 0, 100);
}

function clamp01(value: number) {
  return clamp(value, 0, 1);
}

function serializeContextVector(vector: number[]) {
  return `[${vector.map((value) => round(value, 6).toString()).join(',')}]`;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function buildSimilarContextRpcArgs(
  trip: TripWithZone,
  matchCount = 5
): SimilarContextRpcArgs | null {
  if (!trip.zone_id) return null;

  return {
    query_vector: serializeContextVector(encodeContextVector(trip)),
    query_zone_id: trip.zone_id,
    match_count: Math.max(1, Math.round(matchCount)),
  };
}

export function encodeZoneContextVector(input: ZoneContextInput): number[] {
  const hour = input.now.getHours();
  const dayOfWeek = input.now.getDay();
  const month = input.now.getMonth() + 1;
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0;
  const isWinter = month <= 3 || month === 12 ? 1 : 0;
  const normalizedTraffic = clamp01(input.trafficCongestion ?? 0);
  const normalizedWeather = clamp01((input.weatherDemandBoostPoints ?? 0) / 30);
  const normalizedScore = clamp01(Number(input.currentScore ?? 50) / 100);
  const nightlifeLike =
    input.zoneType === 'nightlife' || input.zoneType === 'événements' ? 1 : 0;

  return [
    round(Math.sin((2 * Math.PI * hour) / 24), 6),
    round(Math.cos((2 * Math.PI * hour) / 24), 6),
    round(Math.sin((2 * Math.PI * dayOfWeek) / 7), 6),
    round(Math.cos((2 * Math.PI * dayOfWeek) / 7), 6),
    round(normalizedScore, 6),
    round(normalizedWeather, 6),
    round(normalizedTraffic, 6),
    0,
    0,
    0,
    0,
    isWeekend,
    month / 12,
    isWinter,
    nightlifeLike,
    round(normalizedScore, 6),
  ];
}

export function buildZoneSimilarContextRpcArgs(
  input: ZoneContextInput,
  matchCount = 5
): SimilarContextRpcArgs | null {
  if (!input.zoneId) return null;
  return {
    query_zone_id: input.zoneId,
    query_vector: serializeContextVector(encodeZoneContextVector(input)),
    match_count: Math.max(1, Math.round(matchCount)),
  };
}

export function encodeContextVector(trip: TripWithZone): number[] {
  const startedAt = new Date(trip.started_at);
  const hour = startedAt.getHours();
  const dayOfWeek = startedAt.getDay();
  const month = startedAt.getMonth() + 1;
  const revenue = getTripRevenue(trip);
  const hours = getTripHours(trip);
  const earningsPerHour = hours > 0 ? revenue / hours : 0;
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0;
  const isWinter = month <= 3 || month === 12 ? 1 : 0;

  return [
    round(Math.sin((2 * Math.PI * hour) / 24), 6),
    round(Math.cos((2 * Math.PI * hour) / 24), 6),
    round(Math.sin((2 * Math.PI * dayOfWeek) / 7), 6),
    round(Math.cos((2 * Math.PI * dayOfWeek) / 7), 6),
    round(clamp(earningsPerHour / 60, 0, 1), 6),
    round(clamp(revenue / 100, 0, 1), 6),
    round(clamp(Number(trip.distance_km ?? 0) / 40, 0, 1), 6),
    round(clamp(Number(trip.tips ?? 0) / 30, 0, 1), 6),
    trip.platform === 'uber' ? 1 : 0,
    trip.platform === 'lyft' ? 1 : 0,
    trip.platform === 'taxi' ? 1 : 0,
    isWeekend,
    month / 12,
    isWinter,
    trip.zones?.type === 'nightlife' || trip.zones?.type === 'événements'
      ? 1
      : 0,
    normalizeScoreFromEarnings(earningsPerHour) / 100,
  ];
}

export function buildLearningPersistencePayload(
  trips: TripWithZone[],
  weights: WeightConfig = DEFAULT_WEIGHTS
) {
  const insights = deriveLearningInsights(trips, weights);
  const lastUpdated = new Date().toISOString();

  return {
    emaPatterns: insights.emaPatterns.map<EmaPatternInsert>((pattern) => ({
      zone_id: pattern.zoneId,
      day_of_week: pattern.dayOfWeek,
      hour_block: pattern.slotIndex,
      ema_earnings_per_hour: pattern.emaEarningsPerHour,
      ema_ride_count: pattern.emaRideCount,
      observation_count: pattern.observationCount,
      last_updated: lastUpdated,
    })),
    beliefs: insights.beliefs.map<ZoneBeliefInsert>((belief) => ({
      zone_id: belief.zoneId,
      day_of_week: belief.dayOfWeek,
      hour_block: belief.slotIndex,
      prior_mean: belief.posteriorMean,
      prior_variance: belief.posteriorVariance,
      observation_count: belief.observationCount,
      last_updated: lastUpdated,
    })),
    weightHistory: {
      weights: insights.suggestedWeights,
      prediction_mae: insights.meanAbsoluteError,
      triggered_by: 'manual_sync',
    } satisfies WeightHistoryInsert,
  };
}

export function buildShiftPersistencePayload(
  trips: TripWithZone[],
  startedAtIso: string,
  endedAtIso: string,
  weights: WeightConfig = DEFAULT_WEIGHTS
) {
  const startedAt = new Date(startedAtIso);
  const endedAt = new Date(endedAtIso);
  const shiftTrips = trips.filter((trip) => {
    const started = new Date(trip.started_at);
    return started >= startedAt && started <= endedAt;
  });

  const summary = derivePostShiftSummary(
    shiftTrips,
    startedAtIso,
    endedAtIso,
    weights
  );

  const groupedByZone = new Map<
    string,
    {
      zoneId: string;
      zoneName: string;
      enteredAt: string;
      exitedAt: string;
      ridesCount: number;
      earnings: number;
      predictedScore: number;
      factorsSnapshot: Record<string, unknown>;
    }
  >();

  for (const trip of shiftTrips) {
    if (!trip.zone_id) continue;
    const zoneId = trip.zone_id;
    const current = groupedByZone.get(zoneId) ?? {
      zoneId,
      zoneName: trip.zones?.name ?? 'Zone inconnue',
      enteredAt: trip.started_at,
      exitedAt: trip.ended_at ?? trip.started_at,
      ridesCount: 0,
      earnings: 0,
      predictedScore: 0,
      factorsSnapshot: {
        source: 'trip_sync',
        zone_type: trip.zones?.type ?? null,
      },
    };

    current.enteredAt =
      new Date(trip.started_at) < new Date(current.enteredAt)
        ? trip.started_at
        : current.enteredAt;
    current.exitedAt =
      new Date(trip.ended_at ?? trip.started_at) > new Date(current.exitedAt)
        ? (trip.ended_at ?? trip.started_at)
        : current.exitedAt;
    current.ridesCount += 1;
    current.earnings += getTripRevenue(trip);
    current.predictedScore += Number(
      (trip as { zone_score?: number | null }).zone_score ??
        trip.zones?.current_score ??
        50
    );
    groupedByZone.set(zoneId, current);
  }

  const tripsWithZone = shiftTrips.filter(
    (trip): trip is TripWithZone & { zone_id: string } => Boolean(trip.zone_id)
  );

  const predictions = tripsWithZone.flatMap<PredictionInsert>((trip) => {
    const hours = getTripHours(trip);
    if (hours <= 0) return [];
    const earningsPerHour = getTripRevenue(trip) / hours;
    const predictedScore = clamp(
      Math.round(
        Number(
          (trip as { zone_score?: number | null }).zone_score ??
            trip.zones?.current_score ??
            50
        )
      ),
      0,
      100
    );
    const actualScore = normalizeScoreFromEarnings(earningsPerHour);

    return [
      {
        zone_id: trip.zone_id,
        predicted_at: trip.started_at,
        predicted_score: predictedScore,
        factors_snapshot: {
          source_trip_id: trip.id,
          platform: trip.platform ?? null,
        },
        actual_earnings_per_hour: round(earningsPerHour),
        prediction_error: round(actualScore - predictedScore, 4),
      },
    ];
  });

  const demandPatterns = tripsWithZone.flatMap<DemandPatternInsert>((trip) => {
    const hours = getTripHours(trip);
    if (hours <= 0) return [];

    return [
      {
        zone_id: trip.zone_id,
        context_vector: serializeContextVector(encodeContextVector(trip)),
        actual_earnings_per_hour: round(getTripRevenue(trip) / hours),
      },
    ];
  });

  return {
    session: {
      started_at: startedAtIso,
      ended_at: endedAtIso,
      total_earnings: summary.revenue,
      total_rides: summary.tripCount,
      total_hours: round(
        Math.max((endedAt.getTime() - startedAt.getTime()) / 3_600_000, 0)
      ),
      notes: summary.suggestedFocus,
      weather_snapshot: {
        accuracy_percent: summary.accuracyPercent,
        mean_absolute_error: summary.meanAbsoluteError,
      },
    } satisfies SessionInsert,
    sessionZones: [...groupedByZone.values()].map<
      Omit<SessionZoneInsert, 'session_id'>
    >((zone) => ({
      zone_id: zone.zoneId,
      entered_at: zone.enteredAt,
      exited_at: zone.exitedAt,
      rides_count: zone.ridesCount,
      earnings: round(zone.earnings),
      predicted_score: round(
        zone.predictedScore / Math.max(zone.ridesCount, 1)
      ),
      factors_snapshot: zone.factorsSnapshot,
    })),
    predictions,
    demandPatterns,
  };
}

export async function syncLearningAggregates(
  trips: TripWithZone[],
  weights: WeightConfig = DEFAULT_WEIGHTS
): Promise<LearningSyncResult> {
  const payload = buildLearningPersistencePayload(trips, weights);

  try {
    const { error: emaError } = await supabase
      .from('ema_patterns')
      .upsert(payload.emaPatterns, {
        onConflict: 'zone_id,day_of_week,hour_block',
      });
    if (emaError) throw emaError;

    const { error: beliefError } = await supabase
      .from('zone_beliefs')
      .upsert(payload.beliefs, {
        onConflict: 'zone_id,day_of_week,hour_block',
      });
    if (beliefError) throw beliefError;

    const { error: weightError } = await supabase
      .from('weight_history')
      .insert(payload.weightHistory);
    if (weightError) throw weightError;

    return {
      ok: true,
      syncedCounts: {
        emaPatterns: payload.emaPatterns.length,
        beliefs: payload.beliefs.length,
        predictions: 0,
        demandPatterns: 0,
        sessionZones: 0,
      },
      message: 'Patterns EMA, croyances et poids synchronisés.',
    };
  } catch (error: unknown) {
    return {
      ok: false,
      syncedCounts: {
        emaPatterns: 0,
        beliefs: 0,
        predictions: 0,
        demandPatterns: 0,
        sessionZones: 0,
      },
      message: getErrorMessage(error, 'Sync Supabase impossible.'),
    };
  }
}

export async function syncShiftLearning(
  trips: TripWithZone[],
  startedAtIso: string,
  endedAtIso: string,
  weights: WeightConfig = DEFAULT_WEIGHTS
): Promise<LearningSyncResult> {
  const aggregateResult = await syncLearningAggregates(trips, weights);
  if (!aggregateResult.ok) {
    return aggregateResult;
  }

  const payload = buildShiftPersistencePayload(
    trips,
    startedAtIso,
    endedAtIso,
    weights
  );
  let sessionId: number | null = null;

  try {
    const { data: sessionRow, error: sessionError } = await supabase
      .from('sessions')
      .insert(payload.session)
      .select('id')
      .single();
    if (sessionError) throw sessionError;

    sessionId = Number(sessionRow?.id);
    const sessionZones = payload.sessionZones.map((zone) => ({
      ...zone,
      session_id: sessionId,
    })) satisfies SessionZoneInsert[];

    if (sessionZones.length > 0) {
      const { error: zoneError } = await supabase
        .from('session_zones')
        .insert(sessionZones);
      if (zoneError) throw zoneError;
    }

    if (payload.predictions.length > 0) {
      const { error: predictionsError } = await supabase
        .from('predictions')
        .insert(payload.predictions);
      if (predictionsError) throw predictionsError;
    }

    if (payload.demandPatterns.length > 0) {
      const { error: patternError } = await supabase
        .from('demand_patterns')
        .insert(payload.demandPatterns);
      if (patternError) throw patternError;
    }

    return {
      ok: true,
      sessionId,
      syncedCounts: {
        emaPatterns: aggregateResult.syncedCounts.emaPatterns,
        beliefs: aggregateResult.syncedCounts.beliefs,
        predictions: payload.predictions.length,
        demandPatterns: payload.demandPatterns.length,
        sessionZones: sessionZones.length,
      },
      message: 'Shift, prédictions et patterns synchronisés vers Supabase.',
    };
  } catch (error: unknown) {
    if (sessionId !== null) {
      const { error: cleanupZonesError } = await supabase
        .from('session_zones')
        .delete()
        .eq('session_id', sessionId);

      if (cleanupZonesError) {
        console.warn(
          '[syncShiftLearning] Failed to cleanup session_zones after error:',
          cleanupZonesError
        );
      }

      const { error: cleanupSessionError } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);

      if (cleanupSessionError) {
        console.warn(
          '[syncShiftLearning] Failed to cleanup session after error:',
          cleanupSessionError
        );
      }
    }

    return {
      ok: false,
      syncedCounts: aggregateResult.syncedCounts,
      message: getErrorMessage(error, 'Sync du shift impossible.'),
    };
  }
}

export async function findSimilarContextsForTrip(
  trip: TripWithZone,
  matchCount = 5
): Promise<SimilarContextsResult> {
  const args = buildSimilarContextRpcArgs(trip, matchCount);
  if (!args) {
    return {
      ok: false,
      matches: [],
      averageEarningsPerHour: 0,
      averageSimilarity: 0,
      message: 'Cette course n’est liée à aucune zone exploitable.',
    };
  }

  try {
    const { data, error } = await supabase.rpc('match_similar_contexts', args);
    if (error) throw error;

    const matches: SimilarContextMatch[] = (
      (data ?? []) as SimilarContextRpcRow[]
    ).map((row) => ({
      id: Number(row.id),
      zoneId: row.zone_id,
      actualEarningsPerHour: round(Number(row.actual_earnings_per_hour ?? 0)),
      similarity: round(Number(row.similarity ?? 0), 4),
      createdAt: row.created_at,
    }));

    const averageEarningsPerHour =
      matches.length > 0
        ? round(
            matches.reduce(
              (sum, match) => sum + match.actualEarningsPerHour,
              0
            ) / matches.length
          )
        : 0;
    const averageSimilarity =
      matches.length > 0
        ? round(
            matches.reduce((sum, match) => sum + match.similarity, 0) /
              matches.length,
            4
          )
        : 0;

    return {
      ok: true,
      matches,
      averageEarningsPerHour,
      averageSimilarity,
      message:
        matches.length > 0
          ? 'Contextes similaires récupérés.'
          : 'Aucun contexte similaire trouvé pour cette zone.',
    };
  } catch (error: unknown) {
    const message = getErrorMessage(
      error,
      'Recherche de contextes similaires impossible.'
    );
    const rawMessage = message.toLowerCase();
    const migrationMissing =
      rawMessage.includes('match_similar_contexts') ||
      rawMessage.includes('function') ||
      rawMessage.includes('schema cache') ||
      rawMessage.includes('demand_patterns');

    return {
      ok: false,
      matches: [],
      averageEarningsPerHour: 0,
      averageSimilarity: 0,
      message: migrationMissing
        ? 'La recherche de contextes similaires sera disponible après application de la migration Supabase.'
        : message,
    };
  }
}

export async function findSimilarContextsForZoneContext(
  input: ZoneContextInput,
  matchCount = 5
): Promise<SimilarContextsResult> {
  const args = buildZoneSimilarContextRpcArgs(input, matchCount);
  if (!args) {
    return {
      ok: false,
      matches: [],
      averageEarningsPerHour: 0,
      averageSimilarity: 0,
      message: 'Contexte de zone invalide.',
    };
  }

  try {
    const { data, error } = await supabase.rpc('match_similar_contexts', args);
    if (error) throw error;

    const matches: SimilarContextMatch[] = (
      (data ?? []) as SimilarContextRpcRow[]
    ).map((row) => ({
      id: Number(row.id),
      zoneId: row.zone_id,
      actualEarningsPerHour: round(Number(row.actual_earnings_per_hour ?? 0)),
      similarity: round(Number(row.similarity ?? 0), 4),
      createdAt: row.created_at,
    }));

    const averageEarningsPerHour =
      matches.length > 0
        ? round(
            matches.reduce(
              (sum, match) => sum + match.actualEarningsPerHour,
              0
            ) / matches.length
          )
        : 0;
    const averageSimilarity =
      matches.length > 0
        ? round(
            matches.reduce((sum, match) => sum + match.similarity, 0) /
              matches.length,
            4
          )
        : 0;

    return {
      ok: true,
      matches,
      averageEarningsPerHour,
      averageSimilarity,
      message:
        matches.length > 0
          ? 'Contextes similaires récupérés.'
          : 'Aucun contexte similaire trouvé pour cette zone.',
    };
  } catch (error: unknown) {
    const message = getErrorMessage(
      error,
      'Recherche de contextes similaires impossible.'
    );
    const rawMessage = message.toLowerCase();
    const migrationMissing =
      rawMessage.includes('match_similar_contexts') ||
      rawMessage.includes('function') ||
      rawMessage.includes('schema cache') ||
      rawMessage.includes('demand_patterns');

    return {
      ok: false,
      matches: [],
      averageEarningsPerHour: 0,
      averageSimilarity: 0,
      message: migrationMissing
        ? 'La recherche de contextes similaires sera disponible après application de la migration Supabase.'
        : message,
    };
  }
}
