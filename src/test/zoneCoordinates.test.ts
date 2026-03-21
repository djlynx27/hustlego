import { parseZoneCoordinates } from '@/lib/zoneCoordinates';
import { describe, expect, it } from 'vitest';

describe('zone coordinates', () => {
  it('parses valid coordinates including comma decimals', () => {
    expect(parseZoneCoordinates('45,5017', '-73.5673')).toEqual({
      latitude: 45.5017,
      longitude: -73.5673,
    });
  });

  it('rejects invalid numeric input', () => {
    expect(parseZoneCoordinates('abc', '-73.5673')).toBeNull();
    expect(parseZoneCoordinates('45.5017', 'NaN')).toBeNull();
  });

  it('rejects out-of-range coordinates', () => {
    expect(parseZoneCoordinates('95', '-73.5673')).toBeNull();
    expect(parseZoneCoordinates('45.5017', '-190')).toBeNull();
  });
});
