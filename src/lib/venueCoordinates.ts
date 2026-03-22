/**
 * Precise drop-off/entrance coordinates for known venues.
 * All coordinates are positioned at the MAIN STREET ENTRANCE (not parking lots
 * or rear alleys) to ensure Google Maps navigation drops the driver curbside.
 */
const VENUE_DROPOFF: Record<string, { lat: number; lng: number }> = {
  // ── Montréal ──────────────────────────────────────────────────────────────
  // Stade olympique — entrée principale avenue Pierre-de-Coubertin (côté rue)
  'Stade olympique': { lat: 45.5558, lng: -73.5512 },
  // Centre Bell — entrée principale rue de la Gauchetière Ouest
  'Centre Bell': { lat: 45.4961, lng: -73.5693 },
  // Gare Centrale — entrée principale boul. René-Lévesque / Manoir McGill
  'Gare Centrale': { lat: 45.4994, lng: -73.5685 },
  // Aéroport Trudeau (YUL) — zone dépose-minute départs int.
  'Aéroport Trudeau (YUL)': { lat: 45.4706, lng: -73.7408 },
  // Marché Jean-Talon — entrée principale rue Jean-Talon Est
  'Marché Jean-Talon': { lat: 45.5349, lng: -73.6148 },
  // Casino de Montréal — entrée principale avenue du Casino (côté entrée VIP)
  'Casino de Montréal': { lat: 45.5095, lng: -73.5296 },

  // ── Laval ─────────────────────────────────────────────────────────────────
  // Place Bell — entrée principale rue Claude-Gagné face au stationnement P3
  'Place Bell': { lat: 45.5559, lng: -73.7217 },
  // Carrefour Laval — entrée côté boul. Le Carrefour (Nord)
  'CF Carrefour Laval': { lat: 45.57, lng: -73.7506 },
  'Carrefour Laval': { lat: 45.57, lng: -73.7506 },
  // Métro Montmorency — sortie principale boul. Le Carrefour
  'Métro Montmorency': { lat: 45.5584, lng: -73.721 },
  'Station Montmorency': { lat: 45.5584, lng: -73.721 },
  // Centropolis — entrée principale boul. du Souvenir
  Centropolis: { lat: 45.5613, lng: -73.7494 },
  'Centropolis Laval': { lat: 45.5613, lng: -73.7494 },
  // Gare Sainte-Rose — face à la rue de la Gare, côté taxis
  'Gare Sainte-Rose': { lat: 45.6049, lng: -73.7698 },
  // Hôpital Cité-de-la-Santé — entrée urgences boul. des Laurentides
  'Hôpital de la Cité-de-la-Santé': { lat: 45.5535, lng: -73.7528 },
  'Hôpital Cité-de-la-Santé': { lat: 45.5535, lng: -73.7528 },

  // ── Rive-Sud ──────────────────────────────────────────────────────────────
  // Quartier DIX30 — entrée principale porte A, boul. du Quartier
  'Quartier DIX30': { lat: 45.4411, lng: -73.4403 },
  // Promenades Saint-Bruno — entrée principale boul. Sir-Wilfred-Laurier
  'Promenades St-Bruno': { lat: 45.5243, lng: -73.3572 },
  'Promenades Saint-Bruno': { lat: 45.5243, lng: -73.3572 },
  // Métro Longueuil — sortie taxis boul. Roland-Therrien
  'Longueuil–Université-de-Sherbrooke': { lat: 45.5252, lng: -73.5205 },
  'Station Longueuil U. Sherbrooke': { lat: 45.5252, lng: -73.5205 },
  // Carrefour Richelieu — entrée principale boul. Laurier
  'Carrefour Richelieu': { lat: 45.4467, lng: -73.257 },

  // ── Boisbriand ────────────────────────────────────────────────────────────
  // Gare Boisbriand exo — entrée côté Champ-des-Élans (dépose taxis)
  'Gare Boisbriand exo': { lat: 45.6202, lng: -73.8428 },
  'Gare Boisbriand': { lat: 45.6202, lng: -73.8428 },
  // Carrefour du Nord — entrée principale boul. Saint-Jean côté Est
  'Carrefour du Nord': { lat: 45.6234, lng: -73.8396 },
  // Promenades de Boisbriand — entrée principale chemin Thimens
  'Promenades de Boisbriand': { lat: 45.6281, lng: -73.8494 },

  // ── Sainte-Thérèse ────────────────────────────────────────────────────────
  // Gare Sainte-Thérèse exo — face à la rue de la Gare, côté dépose
  'Gare Sainte-Thérèse exo': { lat: 45.6435, lng: -73.8284 },
  'Centre-ville Sainte-Thérèse': { lat: 45.6422, lng: -73.8295 },
  // Cégep Lionel-Groulx — entrée principale rue de la Vérendrye
  'Cégep Lionel-Groulx': { lat: 45.6462, lng: -73.8408 },
  // Galeries Sainte-Thérèse — entrée principale boul. du Curé-Labelle
  'Galeries Sainte-Thérèse': { lat: 45.638, lng: -73.8248 },

  // ── Blainville ────────────────────────────────────────────────────────────
  // Gare Blainville exo — entrée principale boul. Martin côté dépose
  'Gare Blainville-Saint-Martin exo': { lat: 45.6784, lng: -73.8648 },
  'Gare Blainville': { lat: 45.6784, lng: -73.8648 },
  'Gare Blainville exo': { lat: 45.6784, lng: -73.8648 },
  // Complexe sportif — entrée principale rue Vachon Nord (face aux portes)
  'Complexe sportif de Blainville': { lat: 45.6715, lng: -73.8878 },
  // Centre commercial — entrée principale boul. Saint-Jean
  'Centre commercial Blainville': { lat: 45.675, lng: -73.8779 },

  // ── Rosemère ──────────────────────────────────────────────────────────────
  // Gare Sainte-Rose exo (sert Rosemère) — face à la rue de la Gare
  'Gare Sainte-Rose exo': { lat: 45.6049, lng: -73.7698 },
  // Place Rosemère — entrée principale boul. Grande-Côte (porte principale)
  'Centre commercial Place Rosemère': { lat: 45.6365, lng: -73.7993 },
  'Place Rosemère': { lat: 45.6365, lng: -73.7993 },
  'Gare Rosemère (Ste-Rose)': { lat: 45.6049, lng: -73.7698 },

  // ── Bois-des-Filion ───────────────────────────────────────────────────────
  // Secteur commercial boul. Curé-Labelle (côté rue)
  'Secteur Curé-Labelle': { lat: 45.6691, lng: -73.7563 },
  // Aréna Bois-des-Filion — entrée principale boul. Henri-Bourassa
  'Aréna Bois-des-Filion': { lat: 45.6658, lng: -73.7603 },
  'Rue Principale Bois-des-Filion': { lat: 45.667, lng: -73.7588 },

  // ── Terrebonne ────────────────────────────────────────────────────────────
  // Carrefour des Laurentides — entrée principale boul. des Laurentides (Nord)
  'Carrefour des Laurentides': { lat: 45.704, lng: -73.642 },
  // Vieux-Terrebonne — dépose rue Saint-Louis (zone piétonne proche)
  'Vieux-Terrebonne': { lat: 45.7017, lng: -73.6449 },
  // Gare Terrebonne — face à la rue Notre-Dame (côté taxis)
  'Gare Terrebonne': { lat: 45.7033, lng: -73.6367 },
  'Gare Terrebonne exo': { lat: 45.7033, lng: -73.6367 },
  // Cégep de Terrebonne — entrée principale ch. Saint-François
  'Cégep de Terrebonne': { lat: 45.6942, lng: -73.6449 },
  // Hôpital Pierre-Le Gardeur — entrée urgences montée des Pionniers
  'Hôpital Pierre-Le Gardeur': { lat: 45.7248, lng: -73.48 },
};

/**
 * Get the best drop-off coordinates for a venue.
 * Falls back to the provided lat/lng if no override exists.
 */
export function getDropoffCoords(
  zoneName: string,
  fallbackLat: number,
  fallbackLng: number
): { lat: number; lng: number } {
  // Try exact match first
  if (VENUE_DROPOFF[zoneName]) return VENUE_DROPOFF[zoneName];
  // Try partial match (venue name contained in zone name or vice versa)
  for (const [key, coords] of Object.entries(VENUE_DROPOFF)) {
    if (zoneName.includes(key) || key.includes(zoneName)) return coords;
  }
  return { lat: fallbackLat, lng: fallbackLng };
}

export function getGoogleMapsNavUrl(
  zoneName: string,
  lat: number,
  lng: number
): string {
  const c = getDropoffCoords(zoneName, lat, lng);
  return `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}&travelmode=driving`;
}

export function getWazeNavUrl(
  zoneName: string,
  lat: number,
  lng: number
): string {
  const c = getDropoffCoords(zoneName, lat, lng);
  return `https://waze.com/ul?ll=${c.lat},${c.lng}&navigate=yes`;
}

export function launchExternalNavigation(url: string) {
  window.location.assign(url);
}

export function launchGoogleMapsNavigation(
  zoneName: string,
  lat: number,
  lng: number
) {
  launchExternalNavigation(getGoogleMapsNavUrl(zoneName, lat, lng));
}
