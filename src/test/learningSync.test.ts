import type { TripWithZone } from '@/hooks/useTrips';
import {
  buildLearningPersistencePayload,
  buildShiftPersistencePayload,
  buildSimilarContextRpcArgs,
  buildUserPingCacheKey,
  buildZoneSimilarContextRpcArgs,
  encodeContextVector,
  encodeZoneContextVector,
  shouldThrottleUserPing,
} from '@/lib/learningSync';
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
    platform: 'lyft',
    zones: { name: 'Centre Bell', current_score: 60, type: 'événements' },
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
    platform: 'uber',
    zones: { name: 'Station Berri-UQAM', current_score: 53, type: 'métro' },
  },
];

describe('learning sync payloads', () => {
  it('encodes a 16d context vector', () => {
    const vector = encodeContextVector(trips[0]);
    expect(vector).toHaveLength(16);
  });

  it('builds typed rpc args for similar context lookup', () => {
    const args = buildSimilarContextRpcArgs(trips[0], 7);

    expect(args).toEqual({
      query_zone_id: 'mtl-cb',
      match_count: 7,
      query_vector: expect.stringMatching(/^\[[^\]]+\]$/),
    });
  });

  it('encodes a zone context vector in 16 dimensions', () => {
    const vector = encodeZoneContextVector({
      zoneId: 'mtl-cb',
      zoneType: 'événements',
      currentScore: 67,
      now: new Date('2026-03-16T21:30:00.000Z'),
      trafficCongestion: 0.4,
      weatherDemandBoostPoints: 12,
    });

    expect(vector).toHaveLength(16);
    expect(vector[14]).toBe(1);
  });

  it('builds zone rpc args for live similarity lookup', () => {
    const args = buildZoneSimilarContextRpcArgs(
      {
        zoneId: 'mtl-bq',
        zoneType: 'métro',
        currentScore: 54,
        now: new Date('2026-03-16T08:00:00.000Z'),
      },
      4
    );

    expect(args).toEqual({
      query_zone_id: 'mtl-bq',
      match_count: 4,
      query_vector: expect.stringMatching(/^\[[^\]]+\]$/),
    });
  });

  it('returns null rpc args for trips without zone id', () => {
    const args = buildSimilarContextRpcArgs(
      {
        ...trips[0],
        zone_id: null,
      },
      5
    );

    expect(args).toBeNull();
  });

  it('returns null zone rpc args for invalid zone id', () => {
    const args = buildZoneSimilarContextRpcArgs(
      {
        zoneId: '',
        now: new Date('2026-03-16T08:00:00.000Z'),
      },
      3
    );

    expect(args).toBeNull();
  });

  it('builds a deterministic cache key for user pings', () => {
    expect(buildUserPingCacheKey('driver-1', 'zone-1', 'libre-auto-pick')).toBe(
      'driver-1:zone-1:libre-auto-pick'
    );
  });

  it('throttles duplicate user pings during cooldown', () => {
    expect(shouldThrottleUserPing(1_000, 1_500, 1_000)).toBe(true);
    expect(shouldThrottleUserPing(1_000, 2_500, 1_000)).toBe(false);
    expect(shouldThrottleUserPing(null, 2_500, 1_000)).toBe(false);
  });

  it('builds aggregate payloads for EMA and beliefs', () => {
    const payload = buildLearningPersistencePayload(trips, DEFAULT_WEIGHTS);
    expect(payload.emaPatterns.length).toBeGreaterThan(0);
    expect(payload.beliefs.length).toBeGreaterThan(0);
    expect(payload.weightHistory.prediction_mae).toBeGreaterThanOrEqual(0);
  });

  it('builds shift payloads for sessions and predictions', () => {
    const payload = buildShiftPersistencePayload(
      trips,
      '2026-03-15T00:00:00.000Z',
      '2026-03-16T23:59:59.000Z',
      DEFAULT_WEIGHTS
    );
    expect(payload.session.total_rides).toBe(2);
    expect(payload.sessionZones).toHaveLength(2);
    expect(payload.predictions).toHaveLength(2);
    expect(payload.demandPatterns).toHaveLength(2);
    expect(payload.demandPatterns[0]?.context_vector).toMatch(/^\[[^\]]+\]$/);
  });

  it('skips zone-scoped rows when a trip has no zone id', () => {
    const payload = buildShiftPersistencePayload(
      [
        ...trips,
        {
          ...trips[0],
          id: '3',
          zone_id: null,
          zones: null,
        },
      ],
      '2026-03-15T00:00:00.000Z',
      '2026-03-16T23:59:59.000Z',
      DEFAULT_WEIGHTS
    );

    expect(payload.session.total_rides).toBe(3);
    expect(payload.sessionZones).toHaveLength(2);
    expect(payload.predictions).toHaveLength(2);
    expect(payload.demandPatterns).toHaveLength(2);
  });

  it('skips incomplete trips when building prediction payloads', () => {
    const payload = buildShiftPersistencePayload(
      [
        ...trips,
        {
          ...trips[0],
          id: '3',
          ended_at: null,
          earnings: 80,
          tips: 20,
        },
      ],
      '2026-03-15T00:00:00.000Z',
      '2026-03-16T23:59:59.000Z',
      DEFAULT_WEIGHTS
    );

    expect(payload.session.total_rides).toBe(3);
    expect(payload.predictions).toHaveLength(2);
    expect(payload.demandPatterns).toHaveLength(2);
  });
});
