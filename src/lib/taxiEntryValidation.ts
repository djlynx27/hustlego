export interface TaxiEntryFormValues {
  amount: string;
  km: string;
  durationMin: string;
}

export interface ParsedTaxiEntryValues {
  amount: number;
  km: number;
  durationMin: number;
}

export type TaxiEntryValidationResult =
  | { ok: true; values: ParsedTaxiEntryValues }
  | { ok: false; message: string };

function parseOptionalNumber(value: string) {
  if (value.trim() === '') return 0;

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function validateTaxiEntryForm(
  form: TaxiEntryFormValues
): TaxiEntryValidationResult {
  if (form.amount.trim() === '') {
    return {
      ok: false,
      message: 'Ajoute un montant pour enregistrer l’entrée',
    };
  }

  const amount = Number.parseFloat(form.amount);
  if (!Number.isFinite(amount)) {
    return {
      ok: false,
      message: 'Montant invalide — veuillez entrer un nombre',
    };
  }

  const km = parseOptionalNumber(form.km);
  if (km === null) {
    return {
      ok: false,
      message: 'Distance invalide — veuillez entrer un nombre',
    };
  }

  const durationMin = Number.parseInt(form.durationMin, 10);
  if (!Number.isFinite(durationMin) || durationMin <= 0) {
    return {
      ok: false,
      message: 'Ajoute une durée active en minutes pour calculer le $/heure',
    };
  }

  return {
    ok: true,
    values: {
      amount,
      km,
      durationMin,
    },
  };
}
