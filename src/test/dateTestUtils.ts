export function makeLocalDate(
  year: number,
  monthIndex: number,
  day: number,
  hour: number,
  minute = 0
) {
  return new Date(year, monthIndex, day, hour, minute, 0, 0);
}

export function makeLocalIso(
  year: number,
  monthIndex: number,
  day: number,
  hour: number,
  minute = 0
) {
  return makeLocalDate(year, monthIndex, day, hour, minute).toISOString();
}
