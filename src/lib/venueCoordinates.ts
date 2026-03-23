

/**
 * Fichier: src/lib/venueCoordinates.ts
 * Coordonnées des entrées principales des lieux majeurs (hôpitaux, gares, centres commerciaux, etc.)
 * Désormais, la source de vérité des hotspots stratégiques est dans hotspots.ts
 */

import { HOTSPOTS, Hotspot } from './hotspots';

export type VenueCoordinate = Hotspot;

// Pour compatibilité descendante
export const VENUE_COORDINATES: VenueCoordinate[] = HOTSPOTS;
