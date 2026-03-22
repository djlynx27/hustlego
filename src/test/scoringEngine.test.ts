import type { ZoneHistory } from '@/lib/aiAgents';
import {
  calculateDemandFactors,
  calculateWeightedDemandScore,
  computeDemandScore,
  DEFAULT_WEIGHTS,
  getWeatherMultiplier,
  scoreAllZones,
  type ActiveEventBoost,
  type WeatherCondition,
} from '@/lib/scoringEngine';
import { makeLocalDate } from '@/test/dateTestUtils';
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
      makeLocalDate(2026, 2, 20, 22),
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

describe('getWeatherMultiplier', () => {
  it('returns 1.0 for null weather', () => {
    expect(getWeatherMultiplier(null)).toBe(1.0);
  });

  it('returns 1.4 for heavy rain (weatherId 502-531)', () => {
    const weather: WeatherCondition = {
      weatherId: 502,
      temp: 5,
      precipMm: 15,
      windKph: 20,
      condition: 'rain',
    };
    expect(getWeatherMultiplier(weather)).toBe(1.4);
  });

  it('returns 1.4 for snow (weatherId 600-622)', () => {
    const weather: WeatherCondition = {
      weatherId: 601,
      temp: -5,
      precipMm: 5,
      windKph: 10,
      condition: 'snow',
    };
    expect(getWeatherMultiplier(weather)).toBe(1.4);
  });

  it('returns 1.4 for thunderstorm (weatherId 200-232)', () => {
    const weather: WeatherCondition = {
      weatherId: 210,
      temp: 15,
      precipMm: 20,
      windKph: 30,
      condition: 'storm',
    };
    expect(getWeatherMultiplier(weather)).toBe(1.4);
  });

  it('returns 1.15 for light rain (weatherId 300-501)', () => {
    const weather: WeatherCondition = {
      weatherId: 300,
      temp: 8,
      precipMm: 3,
      windKph: 5,
      condition: 'drizzle',
    };
    expect(getWeatherMultiplier(weather)).toBe(1.15);
  });

  it('returns 1.25 for extreme cold (temp < -15)', () => {
    const weather: WeatherCondition = {
      weatherId: 800,
      temp: -20,
      precipMm: 0,
      windKph: 0,
      condition: 'clear',
    };
    expect(getWeatherMultiplier(weather)).toBe(1.25);
  });

  it('returns 1.0 for clear mild weather', () => {
    const weather: WeatherCondition = {
      weatherId: 800,
      temp: 15,
      precipMm: 0,
      windKph: 5,
      condition: 'clear',
    };
    expect(getWeatherMultiplier(weather)).toBe(1.0);
  });
});

describe('scoreAllZones', () => {
  const zones = [
    {
      id: 'z1',
      name: 'Plateau',
      type: 'résidentiel',
      latitude: 45.52,
      longitude: -73.58,
      city_id: 'mtl',
      created_at: '',
      demand_weight: 1,
      display_order: 1,
      is_active: true,
      radius_km: 2,
    },
    {
      id: 'z2',
      name: 'Aéroport YUL',
      type: 'aéroport',
      latitude: 45.47,
      longitude: -73.74,
      city_id: 'mtl',
      created_at: '',
      demand_weight: 1,
      display_order: 2,
      is_active: true,
      radius_km: 5,
    },
  ];

  it('scores all provided zones returning a Map per zone id', () => {
    const { scores } = scoreAllZones(
      zones,
      new Date('2026-03-21T14:00:00'),
      null,
      []
    );
    expect(scores.size).toBe(2);
    expect(scores.has('z1')).toBe(true);
    expect(scores.has('z2')).toBe(true);
  });

  it('every score is between 0 and 100', () => {
    const { scores } = scoreAllZones(
      zones,
      new Date('2026-03-21T14:00:00'),
      null,
      []
    );
    for (const score of scores.values()) {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });

  it('returns a factors Map with an entry per zone', () => {
    const { factors } = scoreAllZones(
      zones,
      new Date('2026-03-21T14:00:00'),
      null,
      []
    );
    expect(factors.size).toBe(2);
  });
});
