import type { ZoneHistory } from '@/lib/aiAgents';
import {
  calculateDemandFactors,
  calculateWeightedDemandScore,
  computeDemandScore,
  DEFAULT_WEIGHTS,
  type ActiveEventBoost,
  type WeatherCondition,
} from '@/lib/scoringEngine';
import { describe, expect, it } from 'vitest';

const downtownZone = {
  id: 'mtl-cb',
  name: 'Centre Bell',
  type: 'événements',
  latitude: 45.496,
  longitude: -73.5694,
  current_score: 60,
};

describe('scoring engine', () => {
  it('normalizes weighted factors', () => {
    const value = calculateWeightedDemandScore(
      {
        timeOfDay: 1,
        dayOfWeek: 1,
        weather: 1,
        events: 1,
        historicalEarnings: 1,
        transitDisruption: 1,
        trafficCongestion: 1,
        winterConditions: 1,
      },
      DEFAULT_WEIGHTS
    );

    expect(value).toBe(1);
  });

  it('boosts demand when weather and events align', () => {
    const weather: WeatherCondition = {
      weatherId: 601,
      temp: -18,
      demandBoostPoints: 30,
    };
    const eventBoosts: ActiveEventBoost[] = [
      {
        latitude: 45.4957,
        longitude: -73.5693,
        boost_multiplier: 2.5,
        boost_radius_km: 3,
        boost_zone_types: ['événements'],
      },
    ];

    const result = computeDemandScore(
      downtownZone,
      new Date('2026-03-20T22:00:00-04:00'),
      weather,
      eventBoosts
    );

    expect(result.score).toBeGreaterThan(75);
    expect(result.factors.hasWeatherBoost).toBe(true);
    expect(result.factors.hasEventBoost).toBe(true);
  });

  it('uses history as a scoring factor', () => {
    const history: ZoneHistory[] = [
      {
        zoneId: 'mtl-cb',
        observedScore: 92,
        expectedScore: 62,
        timestamp: '2026-03-15T22:00:00.000Z',
      },
      {
        zoneId: 'mtl-cb',
        observedScore: 88,
        expectedScore: 60,
        timestamp: '2026-03-13T22:00:00.000Z',
      },
    ];

    const factors = calculateDemandFactors(
      downtownZone,
      new Date('2026-03-20T22:00:00.000Z'),
      null,
      [],
      { history }
    );

    expect(factors.demandFactors.historicalEarnings).toBeGreaterThan(0.8);
  });
});
