import { validateTripEntryForm } from '@/lib/tripEntryValidation';
import { describe, expect, it } from 'vitest';

describe('validateTripEntryForm', () => {
  it('accepts valid trip inputs', () => {
    const result = validateTripEntryForm({
      zone_id: 'zone-1',
      date: '2026-03-21',
      start_time: '08:00',
      end_time: '09:00',
      earnings: '32.5',
      tips: '4.5',
      distance_km: '12.3',
    });

    expect(result).toEqual({
      ok: true,
      values: {
        earnings: 32.5,
        tips: 4.5,
        distanceKm: 12.3,
      },
    });
  });

  it('rejects invalid earnings instead of coercing them to zero', () => {
    const result = validateTripEntryForm({
      zone_id: 'zone-1',
      date: '2026-03-21',
      start_time: '08:00',
      end_time: '09:00',
      earnings: 'abc',
      tips: '',
      distance_km: '',
    });

    expect(result).toEqual({
      ok: false,
      message: 'Montant invalide — veuillez entrer un nombre',
    });
  });

  it('rejects invalid tips when provided', () => {
    const result = validateTripEntryForm({
      zone_id: 'zone-1',
      date: '2026-03-21',
      start_time: '08:00',
      end_time: '09:00',
      earnings: '20',
      tips: 'abc',
      distance_km: '',
    });

    expect(result).toEqual({
      ok: false,
      message: 'Pourboire invalide — veuillez entrer un nombre',
    });
  });

  it('rejects invalid distance when provided', () => {
    const result = validateTripEntryForm({
      zone_id: 'zone-1',
      date: '2026-03-21',
      start_time: '08:00',
      end_time: '09:00',
      earnings: '20',
      tips: '',
      distance_km: 'abc',
    });

    expect(result).toEqual({
      ok: false,
      message: 'Distance invalide — veuillez entrer un nombre',
    });
  });

  it('normalizes empty optional numeric fields to zero', () => {
    const result = validateTripEntryForm({
      zone_id: 'zone-1',
      date: '2026-03-21',
      start_time: '08:00',
      end_time: '09:00',
      earnings: '0',
      tips: '',
      distance_km: '',
    });

    expect(result).toEqual({
      ok: true,
      values: {
        earnings: 0,
        tips: 0,
        distanceKm: 0,
      },
    });
  });
});