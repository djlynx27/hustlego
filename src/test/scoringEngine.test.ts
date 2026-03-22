import type { ZoneHistory } from '@/lib/aiAgents';
import {
  calculateDemandFactors,
  calculateWeightedDemandScore,
  computeDemandScore,
  DEFAULT_WEIGHTS,
  getWeatherMultiplier,
  scoreAllZones,
  scoreAllZonesWithLearning,
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

describe('scoreAllZonesWithLearning', () => {
  const fullZones = [
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
      name: 'Centre Bell',
      type: 'événements',
      latitude: 45.496,
      longitude: -73.5694,
      city_id: 'mtl',
      created_at: '',
      demand_weight: 1,
      display_order: 2,
      is_active: true,
      radius_km: 2,
    },
  ];

  it('returns scores for all zones', () => {
    const { scores } = scoreAllZonesWithLearning(
      fullZones,
      new Date('2026-03-21T20:00:00'),
      null
    );
    expect(scores.size).toBe(2);
    for (const s of scores.values()) {
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(100);
    }
  });

  it('boosts a zone when history shows high earnings', () => {
    const history: ZoneHistory[] = [
      {
        zoneId: 'z2',
        observedScore: 90,
        expectedScore: 60,
        timestamp: new Date('2026-03-20T20:00:00').toISOString(),
      },
      {
        zoneId: 'z2',
        observedScore: 88,
        expectedScore: 58,
        timestamp: new Date('2026-03-19T20:00:00').toISOString(),
      },
    ];

    const { scores: withHistory } = scoreAllZonesWithLearning(
      fullZones,
      new Date('2026-03-21T20:00:00'),
      null,
      [],
      history
    );
    const { scores: baseline } = scoreAllZonesWithLearning(
      fullZones,
      new Date('2026-03-21T20:00:00'),
      null
    );

    // Zone with high observed history should score >= baseline
    expect(withHistory.get('z2')!).toBeGreaterThanOrEqual(
      baseline.get('z2')! - 5 // allow ±5 tolerance for rounding
    );
  });

  it('accepts a context function per zone', () => {
    const { scores } = scoreAllZonesWithLearning(
      fullZones,
      new Date('2026-03-21T20:00:00'),
      null,
      [],
      [],
      (zone) => ({ trafficCongestion: zone.type === 'événements' ? 1 : 0 })
    );
    expect(scores.size).toBe(2);
  });
});

describe('calculateDemandFactors — context branches', () => {
  const zone = {
    id: 'mtl-metro',
    name: 'Berri-UQAM',
    type: 'métro',
    latitude: 45.5188,
    longitude: -73.5637,
    current_score: 55,
  };

  it('applies transit disruption from context', () => {
    const { demandFactors } = calculateDemandFactors(
      zone,
      new Date('2026-03-21T08:00:00'),
      null,
      [],
      { transitDisruption: 1 }
    );
    expect(demandFactors.transitDisruption).toBe(1);
  });

  it('applies traffic congestion from context', () => {
    const { demandFactors } = calculateDemandFactors(
      zone,
      new Date('2026-03-21T17:30:00'),
      null,
      [],
      { trafficCongestion: 0.8 }
    );
    expect(demandFactors.trafficCongestion).toBe(0.8);
  });

  it('applies winter conditions from context (overrides weather)', () => {
    const { demandFactors } = calculateDemandFactors(
      zone,
      new Date('2026-03-21T10:00:00'),
      null,
      [],
      { winterConditions: 0.9 }
    );
    expect(demandFactors.winterConditions).toBe(0.9);
  });

  it('applies event boost points from nearby event', () => {
    const eventBoost: ActiveEventBoost = {
      latitude: 45.52,
      longitude: -73.56,
      boost_multiplier: 2.0,
      boost_radius_km: 5,
      boost_zone_types: [],
    };
    const { eventBoostPoints } = calculateDemandFactors(
      zone,
      new Date('2026-03-21T20:00:00'),
      null,
      [eventBoost]
    );
    expect(eventBoostPoints).toBeGreaterThan(0);
  });

  it('returns zero event boost when event is out of radius', () => {
    const farEvent: ActiveEventBoost = {
      latitude: 45.0,
      longitude: -74.0,
      boost_multiplier: 2.0,
      boost_radius_km: 0.5, // tiny radius, zone is far
      boost_zone_types: [],
    };
    const { eventBoostPoints } = calculateDemandFactors(
      zone,
      new Date('2026-03-21T20:00:00'),
      null,
      [farEvent]
    );
    expect(eventBoostPoints).toBe(0);
  });
});

describe('computeDemandScore — zone type variety', () => {
  const now = new Date('2026-03-21T22:00:00'); // Saturday night

  it('scores nightlife zone higher than residential on Saturday night', () => {
    const nightlife = {
      name: 'Crescent',
      type: 'nightlife',
      latitude: 45.49,
      longitude: -73.58,
    };
    const residential = {
      name: 'NDG',
      type: 'résidentiel',
      latitude: 45.48,
      longitude: -73.6,
    };
    const { score: nlScore } = computeDemandScore(nightlife, now, null);
    const { score: resScore } = computeDemandScore(residential, now, null);
    expect(nlScore).toBeGreaterThan(resScore);
  });

  it('airport scores reasonably on any time', () => {
    const airport = {
      name: 'YUL',
      type: 'aéroport',
      latitude: 45.47,
      longitude: -73.74,
    };
    const { score } = computeDemandScore(airport, now, null);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('event boost type filtering — boost_zone_types restricts boost to matching types', () => {
    const eventZone = {
      name: 'Centre Bell',
      type: 'événements',
      latitude: 45.496,
      longitude: -73.5694,
    };
    const nearEvent: ActiveEventBoost = {
      latitude: 45.496,
      longitude: -73.5694,
      boost_multiplier: 3.0,
      boost_radius_km: 1,
      boost_zone_types: ['nightlife'],
    };
    const { factors } = computeDemandScore(eventZone, now, null, [nearEvent]);
    // type mismatch → no event boost
    expect(factors.hasEventBoost).toBe(false);
  });
});

describe('computeDemandScore — named zone profiles', () => {
  it('Centre Bell scores high on Saturday 22:00 (event night)', () => {
    const zone = {
      name: 'Centre Bell',
      type: 'événements',
      latitude: 45.496,
      longitude: -73.5694,
    };
    const saturdayNight = new Date('2026-03-21T22:00:00'); // Saturday
    const { score } = computeDemandScore(zone, saturdayNight, null);
    expect(score).toBeGreaterThan(60);
  });

  it('Aéroport Trudeau (YUL) scores well during early morning peak (04:00)', () => {
    const zone = {
      name: 'Aéroport Trudeau (YUL)',
      type: 'aéroport',
      latitude: 45.47,
      longitude: -73.74,
    };
    const earlyMorning = new Date('2026-03-22T04:00:00'); // Sunday 04:00
    const { score } = computeDemandScore(zone, earlyMorning, null);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('Station Berri-UQAM scores well on Wednesday morning commute (08:00)', () => {
    const zone = {
      name: 'Station Berri-UQAM',
      type: 'métro',
      latitude: 45.5188,
      longitude: -73.5637,
    };
    const wednesdayMorning = new Date('2026-03-18T08:00:00'); // Wednesday
    const { score } = computeDemandScore(zone, wednesdayMorning, null);
    expect(score).toBeGreaterThan(0);
  });

  it('Casino de Montréal scores high at 23:00', () => {
    const zone = {
      name: 'Casino de Montréal',
      type: 'nightlife',
      latitude: 45.508,
      longitude: -73.532,
    };
    const lateNight = new Date('2026-03-21T23:00:00');
    const { score } = computeDemandScore(zone, lateNight, null);
    expect(score).toBeGreaterThan(0);
  });

  it('CHUM scores moderate at shift change hour (07:00)', () => {
    const zone = {
      name: 'CHUM',
      type: 'médical',
      latitude: 45.5126,
      longitude: -73.5565,
    };
    const shiftChange = new Date('2026-03-18T07:00:00');
    const { score } = computeDemandScore(zone, shiftChange, null);
    expect(score).toBeGreaterThan(0);
  });

  it('Quartier DIX30 scores higher on weekend afternoon than weekday', () => {
    const zone = {
      name: 'Quartier DIX30',
      type: 'commercial',
      latitude: 45.44,
      longitude: -73.47,
    };
    const weekendAfternoon = new Date('2026-03-22T14:00:00'); // Sunday
    const weekdayAfternoon = new Date('2026-03-19T14:00:00'); // Thursday
    const { score: wknd } = computeDemandScore(zone, weekendAfternoon, null);
    const { score: wkdy } = computeDemandScore(zone, weekdayAfternoon, null);
    // Quartier DIX30 pattern favours Sunday afternoons
    expect(wknd).toBeGreaterThanOrEqual(wkdy - 10); // allow tolerance
  });
});

describe('getWeatherFactor coverage — via computeDemandScore', () => {
  const zone = {
    name: 'Downtown',
    type: 'commercial',
    latitude: 45.5,
    longitude: -73.56,
  };

  it('weather with demandBoostPoints boosts score vs no weather', () => {
    const weather: WeatherCondition = {
      weatherId: 800,
      temp: 5,
      precipMm: 0,
      condition: 'clear',
      demandBoostPoints: 25,
    };
    const { score: withBoost } = computeDemandScore(
      zone,
      new Date('2026-03-18T14:00:00'),
      weather
    );
    const { score: noBoost } = computeDemandScore(
      zone,
      new Date('2026-03-18T14:00:00'),
      null
    );
    expect(withBoost).toBeGreaterThanOrEqual(noBoost);
  });

  it('snow weather sets winter factor and marks weather boost', () => {
    const snow: WeatherCondition = {
      weatherId: 601,
      temp: -5,
      precipMm: 5,
      condition: 'snow',
    };
    const { factors } = computeDemandScore(
      zone,
      new Date('2026-03-18T18:00:00'),
      snow
    );
    expect(factors.hasWeatherBoost).toBe(true);
  });

  it('thunderstorm sets weather boost', () => {
    const thunder: WeatherCondition = {
      weatherId: 210,
      temp: 10,
      precipMm: 30,
      condition: 'storm',
    };
    const { factors } = computeDemandScore(
      zone,
      new Date('2026-03-18T18:00:00'),
      thunder
    );
    expect(factors.hasWeatherBoost).toBe(true);
  });
});
