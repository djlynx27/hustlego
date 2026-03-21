import {
  buildProfitReportUpdate,
  extractProfitReportMetrics,
} from '@/lib/profitReportExtraction';
import { describe, expect, it } from 'vitest';

describe('profit report extraction', () => {
  it('preserves legitimate zero earnings instead of treating them as missing', () => {
    expect(extractProfitReportMetrics({ earnings: 0 })).toEqual({
      ok: true,
      values: {
        earnings: 0,
        tripsCount: 0,
        distanceKm: 0,
        hoursWorked: 0,
      },
    });
  });

  it('rejects missing earnings data', () => {
    expect(extractProfitReportMetrics({})).toEqual({
      ok: false,
      message: 'Aucune donnée de gains/profit détectée pour le rapport',
    });
  });

  it('rejects malformed optional metrics instead of coercing them to zero', () => {
    expect(
      extractProfitReportMetrics({ earnings: 10, trips_count: 'abc' })
    ).toEqual({
      ok: false,
      message: 'Nombre de trajets invalide dans l’analyse',
    });
  });

  it('merges extracted metrics into an existing daily report', () => {
    expect(
      buildProfitReportUpdate(
        {
          total_earnings: 100,
          total_trips: 2,
          total_distance_km: 10,
          hours_worked: 4,
        },
        {
          earnings: 20,
          trips_count: 1,
          distance_km: 5,
          hours_worked: 2,
        }
      )
    ).toEqual({
      ok: true,
      values: {
        total_earnings: 120,
        total_trips: 3,
        total_distance_km: 15,
        hours_worked: 6,
      },
    });
  });
});
