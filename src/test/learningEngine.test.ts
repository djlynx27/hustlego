import type { TripWithZone } from '@/hooks/useTrips';
import {
  deriveLearningInsights,
  derivePostShiftSummary,
} from '@/lib/learningEngine';
import { DEFAULT_WEIGHTS } from '@/lib/scoringEngine';
import { describe, expect, it } from 'vitest';

const trips: TripWithZone[] = [
  {
    id: '1',
    created_at: '2026-03-15T22:00:00.000Z',
    distance_km: 12,
    earnings: 42,
    ended_at: '2026-03-15T22:45:00.000Z',
    experiment: false,
    notes: null,
    started_at: '2026-03-15T22:00:00.000Z',
    tips: 6,
    zone_id: 'mtl-cb',
    zone_score: 62,
    zones: { name: 'Centre Bell', current_score: 60 },
  },
  {
    id: '2',
    created_at: '2026-03-16T07:00:00.000Z',
    distance_km: 10,
    earnings: 24,
    ended_at: '2026-03-16T07:40:00.000Z',
    experiment: false,
    notes: null,
    started_at: '2026-03-16T07:00:00.000Z',
    tips: 2,
    zone_id: 'mtl-bq',
    zone_score: 55,
    zones: { name: 'Station Berri-UQAM', current_score: 53 },
  },
  {
    id: '3',
    created_at: '2026-03-17T22:00:00.000Z',
    distance_km: 13,
    earnings: 39,
    ended_at: '2026-03-17T22:35:00.000Z',
    experiment: false,
    notes: null,
    started_at: '2026-03-17T22:00:00.000Z',
    tips: 4,
    zone_id: 'mtl-cb',
    zone_score: 64,
    zones: { name: 'Centre Bell', current_score: 60 },
  },
];

describe('learning engine', () => {
  it('derives EMA patterns and predictions from trips', () => {
    const insights = deriveLearningInsights(trips, DEFAULT_WEIGHTS);

    expect(insights.emaPatterns.length).toBeGreaterThan(0);
    expect(insights.predictions).toHaveLength(3);
    expect(insights.topLearnedZones[0]?.zoneName).toBe('Centre Bell');
  });

  it('produces normalized suggested weights', () => {
    const insights = deriveLearningInsights(trips, DEFAULT_WEIGHTS);
    const total = Object.values(insights.suggestedWeights).reduce(
      (sum, value) => sum + value,
      0
    );

    expect(total).toBeCloseTo(1, 5);
  });

  it('uses threshold-based prediction accuracy', () => {
    const insights = deriveLearningInsights(trips, DEFAULT_WEIGHTS);

    expect(insights.meanAbsoluteError).toBe(28);
    expect(insights.accuracyPercent).toBe(33.33);
  });

  it('builds a post-shift summary for a time window', () => {
    const summary = derivePostShiftSummary(
      trips,
      '2026-03-15T00:00:00.000Z',
      '2026-03-16T23:59:59.000Z',
      DEFAULT_WEIGHTS
    );

    expect(summary.tripCount).toBe(2);
    expect(summary.revenue).toBe(74);
    expect(summary.accuracyPercent).toBeGreaterThan(0);
  });

  it('ignores incomplete trips in learning predictions', () => {
    const insights = deriveLearningInsights(
      [
        ...trips,
        {
          ...trips[0],
          id: '4',
          started_at: '2026-03-18T10:00:00.000Z',
          ended_at: null,
          earnings: 90,
          tips: 10,
        },
      ],
      DEFAULT_WEIGHTS
    );

    expect(insights.predictions).toHaveLength(3);
    expect(
      insights.predictions.find((prediction) => prediction.tripId === '4')
    ).toBeUndefined();
  });

  it('skips predictions when no zone score baseline exists', () => {
    const insights = deriveLearningInsights(
      [
        ...trips,
        {
          ...trips[0],
          id: '5',
          zone_score: null,
          zones: { name: 'Centre Bell', current_score: null },
        },
      ],
      DEFAULT_WEIGHTS
    );

    expect(
      insights.predictions.find((prediction) => prediction.tripId === '5')
    ).toBeUndefined();
    expect(insights.emaPatterns.length).toBeGreaterThan(0);
  });
});
