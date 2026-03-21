export function parseRequiredCurrencyValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = Number.parseFloat(trimmed.replace(/[$,]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseOptionalCurrencyValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 0;

  const parsed = Number.parseFloat(trimmed.replace(/[$,]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseOptionalMilesToKm(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 0;

  const parsedMiles = Number.parseFloat(trimmed.replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(parsedMiles)) return null;

  return Math.round(parsedMiles * 1.60934 * 10) / 10;
}