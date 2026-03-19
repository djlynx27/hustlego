import { useQuery } from '@tanstack/react-query';

const STM_KEY = import.meta.env.VITE_STM_KEY ?? '';
const ALERTS_URL = 'https://api.stm.info/pub/od/gtfs-rt/ic/v2/serviceAlerts';

export interface StmTransitStatus {
  /** true si au moins une alerte de service est active */
  hasDisruption: boolean;
  /** 0..1 — injecté directement dans le facteur transitDisruption du scoring engine */
  disruptionScore: number;
  alertCount: number;
  fetchedAt: string;
}

/**
 * Parseur GTFS-RT binaire léger.
 *
 * Protocole Buffers — FeedMessage.entity est le champ n°2, wire type 2 (LEN).
 * Tag byte = (fieldNumber=2 << 3) | wireType=2 = 0x12
 * On compte les occurrences de ce tag pour détecter les entités sans charger
 * une librairie protobuf complète.
 */
function countGtfsEntities(buffer: ArrayBuffer): number {
  const bytes = new Uint8Array(buffer);
  let entityCount = 0;
  let i = 0;

  while (i < bytes.length - 1) {
    if (bytes[i] !== 0x12) {
      i++;
      continue;
    }

    // Lire le varint longueur qui suit l'octet 0x12
    let len = 0;
    let shift = 0;
    let j = i + 1;

    while (j < bytes.length && shift < 28) {
      const b = bytes[j++];
      len |= (b & 0x7f) << shift;
      shift += 7;
      if ((b & 0x80) === 0) break;
    }

    // Longueur plausible pour une entité GTFS-RT (entre 5 et 10 000 octets)
    if (len >= 5 && j + len <= bytes.length) {
      entityCount++;
      i = j + len; // sauter le corps de l'entité
    } else {
      i++;
    }
  }

  return entityCount;
}

async function fetchStmAlerts(): Promise<StmTransitStatus> {
  // Sans clé STM : retourner un état neutre (aucune perturbation)
  if (!STM_KEY) {
    return {
      hasDisruption: false,
      disruptionScore: 0,
      alertCount: 0,
      fetchedAt: new Date().toISOString(),
    };
  }

  const response = await fetch(ALERTS_URL, {
    headers: { apikey: STM_KEY },
  });

  if (!response.ok) {
    throw new Error(`STM alerts fetch failed (HTTP ${response.status})`);
  }

  const buffer = await response.arrayBuffer();
  const alertCount = countGtfsEntities(buffer);

  return {
    hasDisruption: alertCount > 0,
    // 5 alertes ou plus = perturbation maximale (score 1.0)
    disruptionScore: Math.min(1, alertCount / 5),
    alertCount,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Hook de surveillance des alertes STM en temps réel.
 * Rafraîchi toutes les 5 minutes.
 * Si VITE_STM_KEY n'est pas défini, retourne toujours hasDisruption=false.
 *
 * Inscription gratuite : https://portail.developpeurs.stm.info/
 */
export function useStmTransit() {
  return useQuery<StmTransitStatus>({
    queryKey: ['stm-transit-alerts'],
    queryFn: fetchStmAlerts,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    // On ne réessaie qu'une seule fois — les erreurs CORS sont fréquentes
    // si la clé est absente ou invalide
    retry: 1,
    retryDelay: 15_000,
  });
}
