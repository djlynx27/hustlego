import {
  getDropoffCoords,
  getGoogleMapsNavUrl,
  getWazeNavUrl,
} from '@/lib/venueCoordinates';
import { describe, expect, it } from 'vitest';

describe('getDropoffCoords', () => {
  it('returns exact venue override when zone name matches', () => {
    const coords = getDropoffCoords('Centre Bell', 0, 0);
    expect(coords.lat).toBeCloseTo(45.4961, 3);
    expect(coords.lng).toBeCloseTo(-73.5693, 3);
  });

  it('returns partial-match override when zone name contains venue key', () => {
    // "Centre Bell - Porte A" contains "Centre Bell"
    const coords = getDropoffCoords('Centre Bell - Porte A', 0, 0);
    expect(coords.lat).toBeCloseTo(45.4961, 3);
  });

  it('falls back to provided lat/lng for unknown venue', () => {
    const coords = getDropoffCoords('Zone Inconnue XYZ', 45.1234, -73.5678);
    expect(coords).toEqual({ lat: 45.1234, lng: -73.5678 });
  });

  it('returns override for Place Bell', () => {
    const coords = getDropoffCoords('Place Bell', 0, 0);
    expect(coords.lat).toBeCloseTo(45.5559, 3);
    expect(coords.lng).toBeCloseTo(-73.7217, 3);
  });

  it('returns override for Quartier DIX30', () => {
    const coords = getDropoffCoords('Quartier DIX30', 0, 0);
    expect(coords.lat).toBeCloseTo(45.4411, 3);
  });
});

describe('getGoogleMapsNavUrl', () => {
  it('builds a valid Google Maps direction URL with venue coordinates', () => {
    const url = getGoogleMapsNavUrl('Centre Bell', 0, 0);
    expect(url).toContain('https://www.google.com/maps/dir/');
    expect(url).toContain('travelmode=driving');
    // Uses the exact Centre Bell coordinates, not the fallback
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
