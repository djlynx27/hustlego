import { validateTaxiEntryForm } from '@/lib/taxiEntryValidation';
import { describe, expect, it } from 'vitest';

describe('validateTaxiEntryForm', () => {
  it('accepts valid numeric inputs', () => {
    const result = validateTaxiEntryForm({
      amount: '42.50',
      km: '12.4',
      durationMin: '35',
    });

    expect(result).toEqual({
      ok: true,
      values: {
        amount: 42.5,
        km: 12.4,
        durationMin: 35,
      },
    });
  });

  it('rejects a non-numeric amount instead of coercing it to zero', () => {
    const result = validateTaxiEntryForm({
      amount: 'abc',
      km: '10',
      durationMin: '30',
    });

    expect(result).toEqual({
      ok: false,
      message: 'Montant invalide — veuillez entrer un nombre',
    });
  });

  it('rejects a non-numeric distance when provided', () => {
    const result = validateTaxiEntryForm({
      amount: '25',
      km: 'abc',
      durationMin: '30',
    });

    expect(result).toEqual({
      ok: false,
      message: 'Distance invalide — veuillez entrer un nombre',
    });
  });

  it('allows an empty distance and normalizes it to zero', () => {
    const result = validateTaxiEntryForm({
      amount: '25',
      km: '',
      durationMin: '30',
    });

    expect(result).toEqual({
      ok: true,
      values: {
        amount: 25,
        km: 0,
        durationMin: 30,
      },
    });
  });

  it('rejects missing or invalid active duration', () => {
    const result = validateTaxiEntryForm({
      amount: '25',
      km: '4',
      durationMin: '0',
    });

    expect(result).toEqual({
      ok: false,
      message: 'Ajoute une durée active en minutes pour calculer le $/heure',
    });
  });

  it('rejects empty amount with dedicated message', () => {
    const result = validateTaxiEntryForm({
      amount: '',
      km: '10',
      durationMin: '30',
    });

    expect(result).toEqual({
      ok: false,
      message: 'Ajoute un montant pour enregistrer l\u2019entr\u00e9e',
    });
  });
});
