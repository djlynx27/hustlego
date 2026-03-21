import {
  parseOptionalCurrencyValue,
  parseOptionalMilesToKm,
  parseRequiredCurrencyValue,
} from '@/lib/csvTripParsing';
import { describe, expect, it } from 'vitest';

describe('csv trip parsing', () => {
  it('parses required earnings values', () => {
    expect(parseRequiredCurrencyValue('$12.50')).toBe(12.5);
  });

  it('rejects missing or malformed required earnings', () => {
    expect(parseRequiredCurrencyValue('')).toBeNull();
    expect(parseRequiredCurrencyValue('ERR')).toBeNull();
  });

  it('parses optional tips and normalizes blanks to zero', () => {
    expect(parseOptionalCurrencyValue('')).toBe(0);
    expect(parseOptionalCurrencyValue('$4.25')).toBe(4.25);
  });

  it('rejects malformed optional currency values', () => {
    expect(parseOptionalCurrencyValue('N/A')).toBeNull();
  });

  it('parses optional distance in miles to km and rejects malformed values', () => {
    expect(parseOptionalMilesToKm('10 mi')).toBe(16.1);
    expect(parseOptionalMilesToKm('')).toBe(0);
    expect(parseOptionalMilesToKm('abc')).toBeNull();
  });
});