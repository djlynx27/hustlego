import { getGoogleMapsNavUrl, getWazeNavUrl } from '@/lib/hotspots';
import { describe, expect, it } from 'vitest';

describe('getGoogleMapsNavUrl', () => {
  it('builds a valid Google Maps direction URL with venue coordinates', () => {
    const url = getGoogleMapsNavUrl('Centre Bell', 0, 0);
    expect(url).toContain('https://www.google.com/maps/dir/');
    expect(url).toContain('travelmode=driving');
    expect(url).toContain('45.4961');
  });

  it('uses fallback coordinates for unknown venue', () => {
    const url = getGoogleMapsNavUrl('Unknown Zone', 45.5, -73.5);
    expect(url).toContain('45.5');
    expect(url).toContain('-73.5');
  });
});

describe('getWazeNavUrl', () => {
  it('builds a valid Waze navigation URL with venue coordinates', () => {
    const url = getWazeNavUrl('Centre Bell', 0, 0);
    expect(url).toContain('https://waze.com/ul');
    expect(url).toContain('navigate=yes');
    expect(url).toContain('45.4961');
  });

  it('uses fallback coordinates for unknown venue', () => {
    const url = getWazeNavUrl('Unknown', 45.5, -73.5);
    expect(url).toContain('45.5');
    expect(url).toContain('-73.5');
  });
});
