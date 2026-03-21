export interface TripEntryFormValues {
  zone_id: string;
  date: string;
  start_time: string;
  end_time: string;
  earnings: string;
  tips: string;
  distance_km: string;
}

export interface ParsedTripEntryValues {
  earnings: number;
  tips: number;
  distanceKm: number;
}

export type TripEntryValidationResult =
  | { ok: true; values: ParsedTripEntryValues }
  | { ok: false; message: string };

function parseOptionalNumber(value: string) {
  if (value.trim() === '') return 0;

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function validateTripEntryForm(
  form: TripEntryFormValues
): TripEntryValidationResult {
  if (!form.zone_id || !form.date || form.earnings.trim() === '') {
    return { ok: false, message: 'Zone, date et montant requis' };
  }

  const earnings = Number.parseFloat(form.earnings);
  if (!Number.isFinite(earnings)) {
    return {
      ok: false,
      message: 'Montant invalide — veuillez entrer un nombre',
    };
  }

  const tips = parseOptionalNumber(form.tips);
  if (tips === null) {
    return {
      ok: false,
      message: 'Pourboire invalide — veuillez entrer un nombre',
    };
  }

  const distanceKm = parseOptionalNumber(form.distance_km);
  if (distanceKm === null) {
    return {
      ok: false,
      message: 'Distance invalide — veuillez entrer un nombre',
    };
  }

  return {
    ok: true,
    values: {
      earnings,
      tips,
      distanceKm,
    },
  };
}