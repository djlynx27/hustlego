type ParsedCoordinates = {
  latitude: number;
  longitude: number;
};

function parseCoordinate(value: string) {
  const normalized = value.trim().replace(',', '.');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseZoneCoordinates(
  latitudeInput: string,
  longitudeInput: string
): ParsedCoordinates | null {
  const latitude = parseCoordinate(latitudeInput);
  const longitude = parseCoordinate(longitudeInput);

  if (latitude === null || longitude === null) {
    return null;
  }

  if (latitude < -90 || latitude > 90) {
    return null;
  }

  if (longitude < -180 || longitude > 180) {
    return null;
  }

  return { latitude, longitude };
}
