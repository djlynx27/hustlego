// Étape 1 du pipeline d'ingestion Ville de Montréal : mappe chaque poste de
// taxi officiel (postestaxi.geojson.json, données ouvertes VdM) à la zone
// Delivroom la plus proche par distance haversine, puis génère
// src/data/taxiStands.ts. Un poste sans zone à moins de MAX_ZONE_DISTANCE_M
// est un poste hors de notre territoire (dataset VdM ne couvre que
// Montréal-agglo) — il est ignoré plutôt que forcé sur une zone lointaine.
//
// Node-only script (run via `tsx`, jamais bundlé par Vite) — voir la note
// dans seedSyntheticTrips.ts sur pourquoi ce fichier a sa propre référence
// node plutôt qu'un tsconfig élargi.
/// <reference types="node" />
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import type { Database } from '../integrations/supabase/types';
import { nearestZone, type ZoneRow } from './lib/geo';

type TaxiStandFeature = {
  properties: {
    Nom: string;
    Localisation: string;
    Type: string;
    Etat_poste: string;
    Nb_place: number;
    Heure_operation: string;
  };
  geometry: { type: 'Point'; coordinates: [number, number] };
};

const MAX_ZONE_DISTANCE_M = 3000;
const DEFAULT_GEOJSON_PATH = 'D:/documents/Transport dataset/postestaxi.geojson.json';
const OUTPUT_PATH = new URL('../data/taxiStands.ts', import.meta.url);

async function main() {
  const geojsonPath = process.argv[2] ?? DEFAULT_GEOJSON_PATH;

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('VITE_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis (voir .env.local)');
  }
  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);

  const { data: zones, error } = await supabase
    .from('zones')
    .select('id, city_id, latitude, longitude');
  if (error) throw error;
  if (!zones || zones.length === 0) throw new Error('Aucune zone trouvée dans public.zones');

  const raw = readFileSync(geojsonPath, 'utf-8').replace(/^\uFEFF/, '');
  const geojson = JSON.parse(raw) as { features: TaxiStandFeature[] };

  const { mapped, skippedInactive, skippedTooFar } = mapStands(geojson.features, zones);

  const header = buildHeader(mapped, geojson.features.length, skippedInactive, skippedTooFar);
  writeFileSync(OUTPUT_PATH, header);

  console.log(
    `${mapped.length} postes mappés → src/data/taxiStands.ts (${skippedInactive} inactifs ignorés, ${skippedTooFar} hors zone ignorés)`
  );
}

type MappedStand = {
  standId: string;
  zoneId: string;
  cityId: string;
  latitude: number;
  longitude: number;
  capacity: number;
  address: string;
  distanceToZoneM: number;
};

function mapStands(features: readonly TaxiStandFeature[], zones: readonly ZoneRow[]) {
  const mapped: MappedStand[] = [];
  let skippedInactive = 0;
  let skippedTooFar = 0;

  for (const feature of features) {
    if (feature.properties.Etat_poste !== 'Actif') {
      skippedInactive++;
      continue;
    }
    const [lng, lat] = feature.geometry.coordinates;
    const match = nearestZone(lat, lng, zones);
    if (!match || match.distanceM > MAX_ZONE_DISTANCE_M) {
      skippedTooFar++;
      continue;
    }
    mapped.push({
      standId: feature.properties.Nom,
      zoneId: match.zone.id,
      cityId: match.zone.city_id,
      latitude: lat,
      longitude: lng,
      capacity: feature.properties.Nb_place,
      address: feature.properties.Localisation,
      distanceToZoneM: Math.round(match.distanceM),
    });
  }
  return { mapped, skippedInactive, skippedTooFar };
}

function buildHeader(
  mapped: readonly MappedStand[],
  totalFeatures: number,
  skippedInactive: number,
  skippedTooFar: number
): string {
  return `// Généré par \`tsx src/scripts/mapTaxiStands.ts\` depuis les données ouvertes
// Ville de Montréal (postestaxi.geojson.json). Ne pas éditer à la main —
// re-lancer le script pour rafraîchir. ${mapped.length} postes mappés sur
// ${totalFeatures} (${skippedInactive} inactifs, ${skippedTooFar} hors zone à >${MAX_ZONE_DISTANCE_M}m).
export type TaxiStand = {
  standId: string
  zoneId: string
  cityId: string
  latitude: number
  longitude: number
  capacity: number
  address: string
  distanceToZoneM: number
}

export const TAXI_STANDS: readonly TaxiStand[] = ${JSON.stringify(mapped, null, 2)} as const
`;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
