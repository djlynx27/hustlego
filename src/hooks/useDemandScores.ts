import {
  getActiveEvents,
  getEndingSoonEvents,
  getStartingSoonEvents,
  useEvents,
} from '@/hooks/useEvents';
import { useStmTransit } from '@/hooks/useStmTransit';
import { useZones } from '@/hooks/useSupabase';
import {
  getRelevantTmEvents,
  useTicketmasterEvents,
} from '@/hooks/useTicketmaster';
import {
  getAverageTrafficCongestion,
  useTomTomTraffic,
} from '@/hooks/useTomTomTraffic';
import type { TripWithZone } from '@/hooks/useTrips';
import { useWeather } from '@/hooks/useWeather';
import { useZoneScores } from '@/hooks/useZoneScores';
import { supabase } from '@/integrations/supabase/client';
import { type ZoneHistory } from '@/lib/aiAgents';
import { findSimilarContextsForZoneContext } from '@/lib/learningSync';
import {
  scoreAllZonesWithLearning,
  type ActiveEventBoost,
  type WeatherCondition,
} from '@/lib/scoringEngine';
import {
  buildSurgeContext,
  computeSurge,
  type SurgeResult,
} from '@/lib/surgeEngine';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface ScoreFactors {
  hasWeatherBoost: boolean;
  hasEventBoost: boolean;
  weatherBoostPoints: number;
  eventBoostPoints: number;
  learningBoostPoints?: number;
  learningSimilarity?: number;
  learningAvgEarningsPerHour?: number;
}

/**
 * Hook that provides demand scores for all zones in a city.
 * Primary source: DB scores (calculated by edge function every 30min).
 * Fallback: client-side calculation using weather + events.
 */
export function useDemandScores(cityId: string) {
  const queryClient = useQueryClient();
  const { data: zones = [] } = useZones(cityId);
  const { data: weather } = useWeather(cityId);
  const { data: events = [] } = useEvents(cityId);
  const { data: tmEvents = [] } = useTicketmasterEvents(cityId);
  const { data: dbScores = [] } = useZoneScores(cityId);
  const { data: trafficSnapshots = [] } = useTomTomTraffic(cityId, zones);
  const { data: stmStatus } = useStmTransit();
  const { data: tripLogs = [] } = useQuery({
    queryKey: ['trip-history', cityId],
    queryFn: async (): Promise<TripWithZone[]> => {
      const { data, error } = await supabase
        .from('trips')
        .select('*, zones(*)')
        .order('started_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as TripWithZone[];
    },
    staleTime: 5 * 60 * 1000,
  });
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  // Trigger Edge Function when DB scores are absent or older than 35 minutes.
  // The SQL cron refreshes every 30 min; the Edge Function adds weather + AI.
  const refreshedRef = useRef(false);
  useEffect(() => {
    if (refreshedRef.current) return;
    if (!cityId) return;

    const scoresAreStale =
      dbScores.length === 0 ||
      dbScores.some((s) => {
        const ageMs = Date.now() - new Date(s.calculated_at).getTime();
        return ageMs > 35 * 60 * 1000;
      });

    if (!scoresAreStale) return;

    refreshedRef.current = true;
    supabase.functions
      .invoke('score-calculator')
      .then(({ error }) => {
        if (error) {
          console.warn('score-calculator edge function error:', error);
          return;
        }
        // Invalidate zone-scores cache so the map re-renders with fresh data
        queryClient.invalidateQueries({ queryKey: ['zone-scores', cityId] });
        queryClient.invalidateQueries({ queryKey: ['zones', cityId] });
      })
      .catch((err) => {
        console.warn('score-calculator invocation failed:', err);
      });
  }, [cityId, dbScores, queryClient]);

  const weatherCondition: WeatherCondition | null = useMemo(() => {
    if (!weather) return null;
    return {
      weatherId: weather.weatherId,
      temp: weather.temp,
      demandBoostPoints: weather.demandBoostPoints,
    };
  }, [weather]);

  const tripHistory: ZoneHistory[] = useMemo(() => {
    if (!tripLogs || tripLogs.length === 0 || zones.length === 0) return [];
    return tripLogs
      .map((trip) => {
        const zone = zones.find((z) => z.id === trip.zone_id);
        if (!zone) return null;
        const started = new Date(trip.started_at);
        const avgHourly =
          (Number(trip.earnings || 0) + Number(trip.tips || 0)) /
          Math.max(
            1,
            (new Date(trip.ended_at).getTime() - started.getTime()) / 3600000
          );
        const observedScore = Math.min(
          100,
          Math.max(0, Math.round((avgHourly / 60) * 100))
        );
        const expectedScore = Number(
          trip.zone_score ?? (zone.current_score || 50)
        );
        return {
          zoneId: zone.id,
          observedScore,
          expectedScore,
          timestamp: trip.started_at,
        };
      })
      .filter((entry): entry is ZoneHistory => entry !== null);
  }, [tripLogs, zones]);

  const activeEvents = useMemo(
    () => getActiveEvents(events, now),
    [events, now]
  );
  const endingSoon = useMemo(
    () => getEndingSoonEvents(events, now, 60),
    [events, now]
  );
  const startingSoon = useMemo(
    () => getStartingSoonEvents(events, now, 90),
    [events, now]
  );
  const relevantTmEvents = useMemo(
    () => getRelevantTmEvents(tmEvents, now, 3),
    [tmEvents, now]
  );

  const eventBoosts: ActiveEventBoost[] = useMemo(() => {
    const dbBoosts: ActiveEventBoost[] = activeEvents.map((e) => ({
      latitude: e.latitude,
      longitude: e.longitude,
      boost_multiplier: e.boost_multiplier,
      boost_radius_km: e.boost_radius_km,
      boost_zone_types: e.boost_zone_types,
    }));

    const tmBoosts: ActiveEventBoost[] = relevantTmEvents.map((e) => ({
      latitude: e.latitude,
      longitude: e.longitude,
      boost_multiplier: 1 + e.boostPoints / 50,
      boost_radius_km: 2,
      boost_zone_types: [],
    }));

    return [...dbBoosts, ...tmBoosts];
  }, [activeEvents, relevantTmEvents]);

  const trafficByZone = useMemo(() => {
    return new Map(
      trafficSnapshots.map((snapshot) => [snapshot.zoneId, snapshot.congestion])
    );
  }, [trafficSnapshots]);

  const averageTrafficCongestion = useMemo(
    () => getAverageTrafficCongestion(trafficSnapshots),
    [trafficSnapshots]
  );

  const candidateZonesForSimilarity = useMemo(() => {
    return [...zones]
      .sort(
        (left, right) =>
          Number(right.current_score ?? 0) - Number(left.current_score ?? 0)
      )
      .slice(0, 12);
  }, [zones]);

  const { data: similarContextSignals = [] } = useQuery({
    queryKey: [
      'similar-context-signals',
      cityId,
      now.getDay(),
      now.getHours(),
      now.getMinutes() < 30 ? 0 : 1,
      candidateZonesForSimilarity.map((zone) => zone.id).join('|'),
      weatherCondition?.demandBoostPoints ?? 0,
    ],
    queryFn: async () => {
      if (candidateZonesForSimilarity.length === 0) return [];

      const results = await Promise.all(
        candidateZonesForSimilarity.map(async (zone) => {
          const result = await findSimilarContextsForZoneContext(
            {
              zoneId: zone.id,
              zoneType: zone.type,
              currentScore: Number(zone.current_score ?? 50),
              now,
              trafficCongestion:
                trafficByZone.get(zone.id) ?? averageTrafficCongestion,
              weatherDemandBoostPoints: weatherCondition?.demandBoostPoints,
            },
            5
          );

          return {
            zoneId: zone.id,
            result,
          };
        })
      );

      return results;
    },
    enabled:
      !!cityId &&
      candidateZonesForSimilarity.length > 0 &&
      dbScores.length === 0,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const learningSignalByZone = useMemo(() => {
    const byZone = new Map<
      string,
      {
        boostPoints: number;
        similarity: number;
        avgEarningsPerHour: number;
      }
    >();

    for (const signal of similarContextSignals) {
      if (!signal.result.ok || signal.result.matches.length === 0) continue;

      const normalizedEarnings = Math.max(
        0,
        Math.min(1, (signal.result.averageEarningsPerHour - 18) / 42)
      );
      const confidence = Math.max(
        0,
        Math.min(
          1,
          signal.result.averageSimilarity *
            Math.min(1, signal.result.matches.length / 5)
        )
      );
      const boostPoints = Math.round(normalizedEarnings * confidence * 8);

      if (boostPoints > 0) {
        byZone.set(signal.zoneId, {
          boostPoints,
          similarity: signal.result.averageSimilarity,
          avgEarningsPerHour: signal.result.averageEarningsPerHour,
        });
      }
    }

    return byZone;
  }, [similarContextSignals]);

  // Build score maps: prefer DB scores, fallback to client-side
  const { scores, factors } = useMemo(() => {
    // DB scores indexed by zone_id
    const dbScoreMap = new Map(dbScores.map((s) => [s.zone_id, s]));

    if (dbScoreMap.size > 0) {
      // Use DB scores as primary
      const scores = new Map<string, number>();
      const factors = new Map<string, ScoreFactors>();

      for (const zone of zones) {
        const dbRow = dbScoreMap.get(zone.id);
        if (dbRow) {
          const finalScore = dbRow.final_score ?? zone.current_score ?? 50;
          const weatherBoost = dbRow.weather_boost ?? 0;
          const eventBoost = dbRow.event_boost ?? 0;
          scores.set(zone.id, finalScore);
          factors.set(zone.id, {
            hasWeatherBoost: weatherBoost > 0,
            hasEventBoost: eventBoost > 0,
            weatherBoostPoints: weatherBoost,
            eventBoostPoints: eventBoost,
          });
        } else {
          // Zone has no DB score yet, use current_score from zone
          scores.set(zone.id, zone.current_score ?? 50);
          factors.set(zone.id, {
            hasWeatherBoost: false,
            hasEventBoost: false,
            weatherBoostPoints: 0,
            eventBoostPoints: 0,
          });
        }
      }

      return { scores, factors };
    }

    // Fallback: client-side calculated with learning agents from trip history
    const fallback = scoreAllZonesWithLearning(
      zones,
      now,
      weatherCondition,
      eventBoosts,
      tripHistory,
      (zone) => ({
        trafficCongestion:
          trafficByZone.get(zone.id) ?? averageTrafficCongestion,
        transitDisruption: stmStatus?.disruptionScore ?? 0,
      })
    );

    if (learningSignalByZone.size === 0) {
      return fallback;
    }

    const boostedScores = new Map(fallback.scores);
    const boostedFactors = new Map(fallback.factors);

    for (const [zoneId, signal] of learningSignalByZone) {
      const currentScore = boostedScores.get(zoneId);
      if (currentScore == null) continue;

      boostedScores.set(
        zoneId,
        Math.min(100, currentScore + signal.boostPoints)
      );

      const currentFactors = boostedFactors.get(zoneId);
      if (currentFactors) {
        boostedFactors.set(zoneId, {
          ...currentFactors,
          learningBoostPoints: signal.boostPoints,
          learningSimilarity: signal.similarity,
          learningAvgEarningsPerHour: signal.avgEarningsPerHour,
        });
      }
    }

    return { scores: boostedScores, factors: boostedFactors };
  }, [
    zones,
    dbScores,
    now,
    weatherCondition,
    eventBoosts,
    tripHistory,
    trafficByZone,
    averageTrafficCongestion,
    learningSignalByZone,
    stmStatus,
  ]);

  // ── Surge computation per zone ──────────────────────────────────────────
  // Computed client-side from surgeEngine; baseline = current_score from DB
  // (a 4-week baseline via get_surge_baseline() is available from context-embeddings EF)
  const surgeMap = useMemo(() => {
    const map = new Map<string, SurgeResult>();
    for (const zone of zones) {
      const currentScore =
        scores.get(zone.id) ??
        ((zone as Record<string, unknown>).current_score as number) ??
        50;
      const baselineScore =
        ((zone as Record<string, unknown>).base_score as number) ??
        currentScore * 0.85;
      const ctx = buildSurgeContext({
        now,
        currentScore,
        baselineScore: baselineScore > 0 ? baselineScore : 50,
        weatherScore: weatherCondition?.demandBoostPoints ?? 0,
        eventProximity: factors.get(zone.id)?.eventBoostPoints ?? 0,
        trafficIndex: trafficByZone.get(zone.id) ?? 0,
        deadheadKm: 5, // conservative default; TodayScreen overrides with GPS
      });
      map.set(zone.id, computeSurge(ctx));
    }
    return map;
  }, [zones, scores, now, weatherCondition, factors, trafficByZone]);

  // Store surge vectors after each recalculation (fire-and-forget)
  const storeSurgeVectors = useCallback(() => {
    for (const zone of zones) {
      const surge = surgeMap.get(zone.id);
      if (!surge) continue;
      // Skip normal-class with no trips to avoid cluttering the DB
      if (surge.surgeClass === 'normal') continue;
      supabase.functions
        .invoke('context-embeddings', {
          body: {
            zone_id: zone.id,
            context_vector: Array.from(surge.contextVector),
            surge_multiplier: surge.surgeMultiplier,
            surge_class: surge.surgeClass,
          },
        })
        .catch(() => {
          // non-blocking — vector storage is best-effort
        });
    }
  }, [zones, surgeMap]);

  // Trigger vector storage once per score refresh
  const lastStoreRef = useRef<number>(0);
  useEffect(() => {
    if (surgeMap.size === 0) return;
    const now = Date.now();
    if (now - lastStoreRef.current < 30 * 60 * 1000) return; // max once per 30 min
    lastStoreRef.current = now;
    storeSurgeVectors();
  }, [surgeMap, storeSurgeVectors]);

  return {
    scores,
    factors,
    zones,
    weather,
    now,
    activeEvents,
    endingSoon,
    startingSoon,
    relevantTmEvents,
    trafficSnapshots,
    averageTrafficCongestion,
    similarContextSignals,
    stmStatus,
    surgeMap,
  };
}
