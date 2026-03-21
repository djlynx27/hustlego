import {
  getActiveEvents,
  getStartingSoonEvents,
  isDemandRelevantEvent,
  type AppEvent,
} from '@/hooks/useEvents';
import { makeLocalDate, makeLocalIso } from '@/test/dateTestUtils';
import { describe, expect, it } from 'vitest';

function makeEvent(overrides: Partial<AppEvent> = {}): AppEvent {
  return {
    id: 'event-1',
    name: 'Visites Guidees Centre Bell',
    venue: 'Centre Bell',
    city_id: 'mtl',
    latitude: 45.496,
    longitude: -73.569,
    start_at: '2026-03-21T05:30:00.000Z',
    end_at: '2026-03-21T07:30:00.000Z',
    capacity: 400,
    demand_impact: 1,
    boost_multiplier: 1.1,
    boost_radius_km: 1,
    boost_zone_types: ['tourisme'],
    category: 'event',
    is_holiday: false,
    ...overrides,
  };
}

describe('event demand relevance', () => {
  it('filters low-impact guided events overnight', () => {
    const event = makeEvent();

    expect(isDemandRelevantEvent(event, makeLocalDate(2026, 2, 21, 2))).toBe(
      false
    );
  });

  it('keeps large nightlife-relevant events overnight', () => {
    const event = makeEvent({
      name: 'Sortie de concert Place Bell',
      capacity: 8000,
      demand_impact: 4,
      boost_multiplier: 1.9,
      boost_zone_types: ['nightlife', 'événements'],
      category: 'festival',
    });

    expect(isDemandRelevantEvent(event, makeLocalDate(2026, 2, 21, 2))).toBe(
      true
    );
  });

  it('excludes low-impact overnight events from active events', () => {
    const now = makeLocalDate(2026, 2, 21, 2);
    const events = [
      makeEvent({
        start_at: makeLocalIso(2026, 2, 21, 0, 30),
        end_at: makeLocalIso(2026, 2, 21, 2, 30),
      }),
    ];

    expect(getActiveEvents(events, now)).toEqual([]);
  });

  it('keeps upcoming major overnight events in starting soon', () => {
    const now = makeLocalDate(2026, 2, 21, 1, 15);
    const events = [
      makeEvent({
        name: 'Fin de concert Place Bell',
        start_at: makeLocalIso(2026, 2, 21, 2, 0),
        end_at: makeLocalIso(2026, 2, 21, 4, 30),
        capacity: 9000,
        demand_impact: 4,
        boost_multiplier: 1.8,
        boost_zone_types: ['nightlife', 'événements'],
        category: 'sport',
      }),
    ];

    expect(getStartingSoonEvents(events, now, 90)).toHaveLength(1);
  });
});
