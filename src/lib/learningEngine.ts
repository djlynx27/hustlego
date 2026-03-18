import type { TripWithZone } from '@/hooks/useTrips';
import { DEFAULT_WEIGHTS, type WeightConfig } from '@/lib/scoringEngine';
import { getTripHours, getTripRevenue } from '@/lib/tripAnalytics';

export interface EmaPattern {
  zoneId: string;
  zoneName: string;
  dayOfWeek: number;
  slotIndex: number;
  emaEarningsPerHour: number;
  emaRideCount: number;
  observationCount: number;
}

export interface ZoneBelief {
  zoneId: string;
  zoneName: string;
  dayOfWeek: number;
  slotIndex: number;
  posteriorMean: number;
  posteriorVariance: number;
  observationCount: number;
}

export interface PredictionRecord {
  tripId: string;
  zoneId: string;
  zoneName: string;
  predictedScore: number;
  actualScore: number;
  actualEarningsPerHour: number;
  error: number;
  startedAt: string;
}

export interface WeightAdjustmentSuggestion {
  key: keyof WeightConfig;
  currentWeight: number;
  suggestedWeight: number;
  delta: number;
  reason: string;
}

export interface LearningInsights {
  emaPatterns: EmaPattern[];
  beliefs: ZoneBelief[];
  predictions: PredictionRecord[];
  meanAbsoluteError: number;
  accuracyPercent: number;
  suggestedWeights: WeightConfig;
  suggestions: WeightAdjustmentSuggestion[];
  topLearnedZones: Array<{
    zoneId: string;
    zoneName: string;
    emaEarningsPerHour: number;
    observationCount: number;
  }>;
}

export interface PostShiftSummary {
  tripCount: number;
  revenue: number;
  revenuePerHour: number;
  accuracyPercent: number;
  meanAbsoluteError: number;
  bestZone: string | null;
  suggestedFocus: string;
}

const MAX_EXPECTED_EARNINGS_PER_HOUR = 60;
const DEFAULT_PRIOR_MEAN = 25;
const DEFAULT_PRIOR_VARIANCE = 100;
const OBSERVATION_VARIANCE = 36;

function round(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getSlotIndex(date: Date) {
  return date.getHours() * 4 + Math.floor(date.getMinutes() / 15);
}

function normalizeScoreFromEarnings(earningsPerHour: number) {
  return clamp(
    Math.round((earningsPerHour / MAX_EXPECTED_EARNINGS_PER_HOUR) * 100),
    0,
    100
  );
}

function updateEma(current: number, observation: number, alpha = 0.3) {
  return alpha * observation + (1 - alpha) * current;
}

function updateBayesianBelief(
  priorMean: number,
  priorVariance: number,
  observation: number,
  observationVariance = OBSERVATION_VARIANCE
) {
  const posteriorVariance = 1 / (1 / priorVariance + 1 / observationVariance);
  const posteriorMean =
    posteriorVariance *
    (priorMean / priorVariance + observation / observationVariance);

  return {
    posteriorMean,
    posteriorVariance,
  };
}

function normalizeWeights(weights: WeightConfig): WeightConfig {
  const entries = Object.entries(weights) as Array<
    [keyof WeightConfig, number]
  >;
  const sum = entries.reduce((total, [, value]) => total + Math.abs(value), 0);
  if (sum <= 0) return DEFAULT_WEIGHTS;

  return entries.reduce((acc, [key, value]) => {
    acc[key] = Math.abs(value) / sum;
    return acc;
  }, {} as WeightConfig);
}

export function deriveLearningInsights(
  trips: TripWithZone[],
  weights: WeightConfig = DEFAULT_WEIGHTS
): LearningInsights {
  const sortedTrips = [...trips]
    .filter((trip) => trip.started_at)
    .sort(
      (left, right) =>
        new Date(left.started_at).getTime() -
        new Date(right.started_at).getTime()
    );

  const emaMap = new Map<string, EmaPattern>();
  const beliefMap = new Map<string, ZoneBelief>();
  const predictions: PredictionRecord[] = [];

  for (const trip of sortedTrips) {
    const startedAt = new Date(trip.started_at);
    const hours = Math.max(getTripHours(trip), 1 / 12);
    const earningsPerHour = getTripRevenue(trip) / hours;
    const actualScore = normalizeScoreFromEarnings(earningsPerHour);
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
    const zoneId = trip.zone_id ?? 'unknown';
    const zoneName = trip.zones?.name ?? 'Zone inconnue';
    const dayOfWeek = startedAt.getDay();
    const slotIndex = getSlotIndex(startedAt);
    const key = `${zoneId}:${dayOfWeek}:${slotIndex}`;

    const previousEma = emaMap.get(key);
    const nextEmaValue = updateEma(
      previousEma?.emaEarningsPerHour ?? earningsPerHour,
      earningsPerHour
    );
    emaMap.set(key, {
      zoneId,
      zoneName,
      dayOfWeek,
      slotIndex,
      emaEarningsPerHour: round(nextEmaValue),
      emaRideCount: round(updateEma(previousEma?.emaRideCount ?? 1, 1), 2),
      observationCount: (previousEma?.observationCount ?? 0) + 1,
    });

    const previousBelief = beliefMap.get(key);
    const nextBelief = updateBayesianBelief(
      previousBelief?.posteriorMean ?? DEFAULT_PRIOR_MEAN,
      previousBelief?.posteriorVariance ?? DEFAULT_PRIOR_VARIANCE,
      earningsPerHour
    );
    beliefMap.set(key, {
      zoneId,
      zoneName,
      dayOfWeek,
      slotIndex,
      posteriorMean: round(nextBelief.posteriorMean),
      posteriorVariance: round(nextBelief.posteriorVariance, 4),
      observationCount: (previousBelief?.observationCount ?? 0) + 1,
    });

    predictions.push({
      tripId: trip.id,
      zoneId,
      zoneName,
      predictedScore,
      actualScore,
      actualEarningsPerHour: round(earningsPerHour),
      error: round(actualScore - predictedScore),
      startedAt: trip.started_at,
    });
  }

  const meanAbsoluteError =
    predictions.length > 0
      ? round(
          predictions.reduce(
            (sum, prediction) => sum + Math.abs(prediction.error),
            0
          ) / predictions.length
        )
      : 0;
  const accuracyPercent = clamp(round(100 - meanAbsoluteError), 0, 100);

  const baseSuggestions: WeightConfig = { ...weights };
  const sampleCount = predictions.length;
  const bias = predictions.reduce(
    (sum, prediction) => sum + prediction.error,
    0
  );
  const recentPredictions = predictions.slice(-20);
  const recentBias = recentPredictions.reduce(
    (sum, prediction) => sum + prediction.error,
    0
  );

  if (sampleCount >= 8) {
    baseSuggestions.historicalEarnings += 0.04;
    baseSuggestions.timeOfDay -= 0.02;
    baseSuggestions.dayOfWeek -= 0.02;
  }

  if (bias > 25 || recentBias > 12) {
    baseSuggestions.events += 0.02;
    baseSuggestions.weather += 0.01;
    baseSuggestions.timeOfDay -= 0.015;
    baseSuggestions.dayOfWeek -= 0.015;
  }

  if (bias < -25 || recentBias < -12) {
    baseSuggestions.historicalEarnings += 0.02;
    baseSuggestions.events -= 0.01;
    baseSuggestions.weather -= 0.01;
  }

  const suggestedWeights = normalizeWeights(baseSuggestions);
  const suggestions: WeightAdjustmentSuggestion[] = (
    Object.keys(suggestedWeights) as Array<keyof WeightConfig>
  )
    .map((key) => {
      const currentWeight = round(weights[key], 3);
      const suggestedWeight = round(suggestedWeights[key], 3);
      const delta = round(suggestedWeight - currentWeight, 3);

      let reason = 'Ajustement neutre basé sur l’erreur moyenne récente.';
      if (key === 'historicalEarnings' && sampleCount >= 8) {
        reason = 'L’historique réel devient fiable et mérite plus de poids.';
      } else if ((key === 'events' || key === 'weather') && bias > 25) {
        reason =
          'Les prédictions sous-estiment des contextes dynamiques récents.';
      } else if (
        (key === 'timeOfDay' || key === 'dayOfWeek') &&
        sampleCount >= 8
      ) {
        reason = 'Le moteur peut moins dépendre des heuristiques fixes.';
      }

      return {
        key,
        currentWeight,
        suggestedWeight,
        delta,
        reason,
      };
    })
    .filter((suggestion) => Math.abs(suggestion.delta) >= 0.005)
    .sort((left, right) => Math.abs(right.delta) - Math.abs(left.delta));

  const topLearnedZones = [...emaMap.values()]
    .sort((left, right) => right.emaEarningsPerHour - left.emaEarningsPerHour)
    .slice(0, 5)
    .map((entry) => ({
      zoneId: entry.zoneId,
      zoneName: entry.zoneName,
      emaEarningsPerHour: entry.emaEarningsPerHour,
      observationCount: entry.observationCount,
    }));

  return {
    emaPatterns: [...emaMap.values()],
    beliefs: [...beliefMap.values()],
    predictions: predictions.sort(
      (left, right) =>
        new Date(right.startedAt).getTime() - new Date(left.startedAt).getTime()
    ),
    meanAbsoluteError,
    accuracyPercent,
    suggestedWeights,
    suggestions,
    topLearnedZones,
  };
}

export function derivePostShiftSummary(
  trips: TripWithZone[],
  startedAtIso: string,
  endedAtIso: string,
  weights: WeightConfig = DEFAULT_WEIGHTS
): PostShiftSummary {
  const startedAt = new Date(startedAtIso);
  const endedAt = new Date(endedAtIso);
  const shiftTrips = trips.filter((trip) => {
    const tripDate = new Date(trip.started_at);
    return tripDate >= startedAt && tripDate <= endedAt;
  });

  const insights = deriveLearningInsights(shiftTrips, weights);
  const revenue = round(
    shiftTrips.reduce((sum, trip) => sum + getTripRevenue(trip), 0)
  );
  const hours = shiftTrips.reduce((sum, trip) => sum + getTripHours(trip), 0);
  const bestZone = insights.topLearnedZones[0]?.zoneName ?? null;
  const primarySuggestion = insights.suggestions[0];

  return {
    tripCount: shiftTrips.length,
    revenue,
    revenuePerHour: hours > 0 ? round(revenue / hours) : 0,
    accuracyPercent: insights.accuracyPercent,
    meanAbsoluteError: insights.meanAbsoluteError,
    bestZone,
    suggestedFocus: primarySuggestion
      ? `${primarySuggestion.key}: ${primarySuggestion.reason}`
      : 'Continuer à accumuler des courses pour raffiner les poids.',
  };
}
