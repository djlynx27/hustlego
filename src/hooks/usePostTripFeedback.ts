/**
 * usePostTripFeedback
 *
 * After a trip is completed, computes prediction vs actual and writes to:
 *   1. `trip_predictions` table — MAE tracking for weight-calibrator
 *   2. `zone_context_vectors` — update_outcome via context-embeddings EF
 *      so the k-NN similarity model incorporates real earnings data
 *
 * Usage:
 *   const { submitFeedback, isSubmitting } = usePostTripFeedback();
 *   await submitFeedback(trip, { zoneScore: 72, predictedEarningsPerH: 38 });
 */

import type { TripWithZone } from '@/hooks/useTrips';
import { supabase } from '@/integrations/supabase/client';
import { getTripHours, getTripRevenue } from '@/lib/tripAnalytics';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

// trip_predictions and weight_history are new tables not yet in generated types.
// Cast supabase.from to accept any table name until `supabase gen types` is re-run.
type AnyFrom = {
  from(table: string): {
    insert(
      rows: Record<string, unknown> | Record<string, unknown>[]
    ): PromiseLike<{ error: { message: string } | null }>;
    select(columns?: string): {
      then(
        resolve: (result: {
          data: Record<string, unknown>[] | null;
          error: { message: string } | null;
        }) => void
      ): void;
    };
  };
};
const anySupabase = supabase as unknown as AnyFrom;

export interface FeedbackContext {
  /** Score the zone had when the trip started (0–100) */
  zoneScore: number;
  /** Model's earningss/h prediction at trip start ($/h) */
  predictedEarningsPerH: number;
  /** UUID of the context_vector row that generated this prediction (optional) */
  contextVectorId?: string;
}

export interface FeedbackResult {
  actualEarningsPerH: number;
  error: number; // actual - predicted
  absError: number;
  tripId: string;
}

export function usePostTripFeedback() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const submitFeedback = useCallback(
    async (
      trip: TripWithZone,
      ctx: FeedbackContext
    ): Promise<FeedbackResult | null> => {
      if (!trip.id || !trip.zone_id) return null;

      const hours = getTripHours(trip);
      if (hours <= 0) return null;
      const revenue = getTripRevenue(trip);
      const actualEarningsPerH = revenue / hours;
      const error = actualEarningsPerH - ctx.predictedEarningsPerH;
      const absError = Math.abs(error);

      const startedAt = trip.started_at
        ? new Date(trip.started_at)
        : new Date();

      setIsSubmitting(true);
      try {
        // ── 1. Write to trip_predictions ────────────────────────────────────
        const { error: predictionInsertError } = await anySupabase
          .from('trip_predictions')
          .insert({
            trip_id: trip.id,
            zone_id: trip.zone_id,
            zone_score_at_start: ctx.zoneScore,
            predicted_earnings_per_h: ctx.predictedEarningsPerH,
            actual_earnings_per_h: actualEarningsPerH,
            error: Math.round(error * 1000) / 1000,
            abs_error: Math.round(absError * 1000) / 1000,
            context_vector_id: ctx.contextVectorId ?? null,
            shift_date: startedAt.toISOString().split('T')[0],
            hour_of_day: startedAt.getHours(),
            day_of_week: startedAt.getDay(),
          });

        if (predictionInsertError) {
          throw new Error(
            `trip_predictions insert failed: ${predictionInsertError.message}`
          );
        }

        // ── 2. Update context_embeddings outcome (fire-and-forget) ──────────
        if (ctx.contextVectorId) {
          supabase.functions
            .invoke('context-embeddings', {
              body: {
                action: 'update_outcome',
                id: ctx.contextVectorId,
                actual_earnings_per_hour: actualEarningsPerH,
                trip_count: 1,
              },
            })
            .catch(() => {
              // non-blocking — vector update is best-effort
            });
        }

        // ── 3. Invalidate related queries ───────────────────────────────────
        queryClient.invalidateQueries({ queryKey: ['trips-feed'] });
        queryClient.invalidateQueries({ queryKey: ['platform-signals'] });

        return {
          actualEarningsPerH: Math.round(actualEarningsPerH * 100) / 100,
          error: Math.round(error * 100) / 100,
          absError: Math.round(absError * 100) / 100,
          tripId: trip.id,
        };
      } catch (err) {
        console.error('[usePostTripFeedback]', err);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [queryClient]
  );

  return { submitFeedback, isSubmitting };
}

// ── Standalone utility: batch-backfill trip_predictions from trips table ──────
// Run once after migration to backfill existing trips that have zone_score.
// Call via: await backfillTripPredictions(supabase, estimatedEarningsPerH)
export async function backfillTripPredictions(
  supabaseClient: typeof supabase,
  defaultPredictedEarningsPerH = 35
): Promise<{ inserted: number; skipped: number }> {
  // Fetch trips with a zone_score that don't yet have a prediction
  const { data: trips, error } = await supabaseClient
    .from('trips')
    .select('id, zone_id, started_at, ended_at, earnings, tips, zone_score')
    .not('zone_score', 'is', null)
    .not('earnings', 'is', null)
    .order('started_at', { ascending: false })
    .limit(500);

  if (error || !trips) return { inserted: 0, skipped: 0 };

  // Check which ones already have predictions
  type ExistingRow = { trip_id: string };
  const anySc = supabaseClient as unknown as AnyFrom;
  let existingResult: ExistingRow[];

  try {
    existingResult = await new Promise<ExistingRow[]>((resolve, reject) => {
      anySc
        .from('trip_predictions')
        .select('trip_id')
        .then((result) => {
          if (result.error) {
            reject(result.error);
            return;
          }

          resolve((result.data ?? []) as ExistingRow[]);
        });
    });
  } catch {
    return { inserted: 0, skipped: 0 };
  }

  const existingIds = new Set(existingResult.map((r) => r.trip_id));

  const rows = [];
  for (const trip of trips) {
    if (!trip.id || existingIds.has(trip.id)) continue;

    const startedAt = trip.started_at ? new Date(trip.started_at) : null;
    if (!startedAt) continue;

    const hours = getTripHours(trip);
    if (hours <= 0) continue;
    const revenue = Number(trip.earnings ?? 0) + Number(trip.tips ?? 0);
    const actualEarningsPerH = revenue / hours;
    const error = actualEarningsPerH - defaultPredictedEarningsPerH;

    rows.push({
      trip_id: trip.id,
      zone_id: trip.zone_id,
      zone_score_at_start: trip.zone_score,
      predicted_earnings_per_h: defaultPredictedEarningsPerH,
      actual_earnings_per_h: actualEarningsPerH,
      error: Math.round(error * 1000) / 1000,
      abs_error: Math.round(Math.abs(error) * 1000) / 1000,
      shift_date: startedAt.toISOString().split('T')[0],
      hour_of_day: startedAt.getHours(),
      day_of_week: startedAt.getDay(),
    });
  }

  if (rows.length === 0) return { inserted: 0, skipped: existingIds.size };

  const { error: insertErr } = await anySc
    .from('trip_predictions')
    .insert(rows);

  return {
    inserted: insertErr ? 0 : rows.length,
    skipped: existingIds.size,
  };
}
