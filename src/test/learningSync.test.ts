import type { TripWithZone } from '@/hooks/useTrips';
import {
  buildLearningPersistencePayload,
  buildShiftPersistencePayload,
  buildSimilarContextRpcArgs,
  buildUserPingCacheKey,
  buildUserPingMatchRpcArgs,
  buildZoneSimilarContextRpcArgs,
  encodeContextVector,
  encodeUserPingContextVector,
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

describe('encodeUserPingContextVector', () => {
  const baseInput = {
    zoneId: 'mtl-cb',
    zoneType: 'événements',
    currentScore: 70,
    now: new Date('2026-03-22T21:00:00.000Z'),
    trafficCongestion: 0.5,
    weatherDemandBoostPoints: 10,
  };

  it('encodes a 16-dimensional vector', () => {
    const vector = encodeUserPingContextVector(baseInput);
    expect(vector).toHaveLength(16);
  });

  it('sets conservative presence flag at index 11', () => {
    const withPresence = encodeUserPingContextVector({
      ...baseInput,
      conservativePresence: true,
    });
    const withoutPresence = encodeUserPingContextVector({
      ...baseInput,
      conservativePresence: false,
    });
    expect(withPresence[11]).toBe(1);
    expect(withoutPresence[11]).toBe(0);
  });

  it('normalizes distance, lyft demand and wait time', () => {
    const vector = encodeUserPingContextVector({
      ...baseInput,
      distanceKm: 20,
      lyftDemandLevel: 10,
      estimatedWaitMin: 20,
    });
    // normalizedDistance = 20/20 = 1.0 → index 7
    // normalizedLyftDemand = 10/10 = 1.0 → index 8
    // normalizedWait = 20/20 = 1.0 → index 9
    expect(vector[7]).toBe(1);
    expect(vector[8]).toBe(1);
    expect(vector[9]).toBe(1);
  });

  it('clamps oversized inputs to 1', () => {
    const vector = encodeUserPingContextVector({
      ...baseInput,
      distanceKm: 999,
      lyftDemandLevel: 999,
      estimatedWaitMin: 999,
    });
    expect(vector[7]).toBe(1);
    expect(vector[8]).toBe(1);
    expect(vector[9]).toBe(1);
  });

  it('uses zero defaults for optional fields', () => {
    const vector = encodeUserPingContextVector(baseInput);
    // distanceKm, lyftDemandLevel, estimatedWaitMin default to 0
    expect(vector[7]).toBe(0);
    expect(vector[8]).toBe(0);
    expect(vector[9]).toBe(0);
  });
});

describe('buildUserPingMatchRpcArgs', () => {
  const input = {
    zoneId: 'mtl-cb',
    zoneType: 'événements',
    currentScore: 70,
    now: new Date('2026-03-22T21:00:00.000Z'),
  };

  it('builds valid rpc args for a known driver', () => {
    const args = buildUserPingMatchRpcArgs('fp-123', input, 5);
    expect(args).toMatchObject({
      query_driver_fingerprint: 'fp-123',
      query_platform: 'lyft',
      query_zone_id: 'mtl-cb',
      match_count: 5,
    });
    expect(args!.query_vector).toMatch(/^\[[^\]]+\]$/);
  });

  it('returns null when driver fingerprint is empty', () => {
    expect(buildUserPingMatchRpcArgs('', input)).toBeNull();
  });

  it('returns null when zone id is empty', () => {
    expect(
      buildUserPingMatchRpcArgs('fp-123', { ...input, zoneId: '' })
    ).toBeNull();
  });

  it('clamps matchCount to at least 1', () => {
    const args = buildUserPingMatchRpcArgs('fp-123', input, 0);
    expect(args!.match_count).toBe(1);
  });
});

describe('encodeContextVector — platform and zone type branches', () => {
  const makeTrip = (overrides: Partial<TripWithZone>): TripWithZone => ({
    id: 't1',
    created_at: '2026-03-15T22:00:00.000Z',
    distance_km: 10,
    earnings: 30,
    ended_at: '2026-03-15T22:45:00.000Z',
    experiment: false,
    notes: null,
    started_at: '2026-03-15T22:00:00.000Z',
    tips: 0,
    zone_id: 'mtl-cb',
    zone_score: 60,
    platform: 'lyft',
    zones: { name: 'Centre Bell', current_score: 60, type: 'événements' },
    ...overrides,
  });

  it('sets uber one-hot at index 8', () => {
    const vector = encodeContextVector(makeTrip({ platform: 'uber' }));
    expect(vector[8]).toBe(1);
    expect(vector[9]).toBe(0);
    expect(vector[10]).toBe(0);
  });

  it('sets lyft one-hot at index 9', () => {
    const vector = encodeContextVector(makeTrip({ platform: 'lyft' }));
    expect(vector[8]).toBe(0);
    expect(vector[9]).toBe(1);
    expect(vector[10]).toBe(0);
  });

  it('sets taxi one-hot at index 10', () => {
    const vector = encodeContextVector(makeTrip({ platform: 'taxi' }));
    expect(vector[8]).toBe(0);
    expect(vector[9]).toBe(0);
    expect(vector[10]).toBe(1);
  });

  it('sets nightlife flag at index 14 for nightlife zone', () => {
    const vector = encodeContextVector(
      makeTrip({
        zones: { name: 'Crescent', current_score: 70, type: 'nightlife' },
      })
    );
    expect(vector[14]).toBe(1);
  });

  it('clears nightlife flag for non-event zone', () => {
    const vector = encodeContextVector(
      makeTrip({
        zones: { name: 'NDG', current_score: 55, type: 'résidentiel' },
      })
    );
    expect(vector[14]).toBe(0);
  });

  it('sets winter flag at index 13 for winter month (January)', () => {
    const vector = encodeContextVector(
      makeTrip({
        started_at: '2026-01-10T22:00:00.000Z',
        ended_at: '2026-01-10T23:00:00.000Z',
      })
    );
    expect(vector[13]).toBe(1); // isWinter = 1
  });

  it('clears winter flag for summer month (July)', () => {
    const vector = encodeContextVector(
      makeTrip({
        started_at: '2026-07-10T22:00:00.000Z',
        ended_at: '2026-07-10T23:00:00.000Z',
      })
    );
    expect(vector[13]).toBe(0); // isWinter = 0
  });
});

describe('buildShiftPersistencePayload — date filtering', () => {
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
      created_at: '2026-03-18T07:00:00.000Z',
      distance_km: 8,
      earnings: 20,
      ended_at: '2026-03-18T07:35:00.000Z',
      experiment: false,
      notes: null,
      started_at: '2026-03-18T07:00:00.000Z',
      tips: 2,
      zone_id: 'mtl-bq',
      zone_score: 50,
      platform: 'uber',
      zones: { name: 'Berri-UQAM', current_score: 50, type: 'métro' },
    },
  ];

  it('only includes trips within the shift period', () => {
    // Only trip 1 falls within this narrow window
    const payload = buildShiftPersistencePayload(
      trips,
      '2026-03-15T00:00:00.000Z',
      '2026-03-16T00:00:00.000Z',
      DEFAULT_WEIGHTS
    );
    expect(payload.session.total_rides).toBe(1);
    expect(payload.sessionZones).toHaveLength(1);
  });

  it('handles an empty trip list gracefully', () => {
    const payload = buildShiftPersistencePayload(
      [],
      '2026-03-15T00:00:00.000Z',
      '2026-03-16T00:00:00.000Z',
      DEFAULT_WEIGHTS
    );
    expect(payload.session.total_rides).toBe(0);
    expect(payload.sessionZones).toHaveLength(0);
    expect(payload.predictions).toHaveLength(0);
  });
});
