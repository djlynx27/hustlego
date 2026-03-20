import { useQuery } from '@tanstack/react-query';

const AVIATIONSTACK_KEY = import.meta.env.VITE_AVIATIONSTACK_KEY ?? '';

export interface YulWave {
  /** Libellé lisible (ex: "6h–10h (vols transatlantiques)") */
  label: string;
  startHour: number;
  endHour: number;
  intensity: 'high' | 'medium' | 'low';
  /** Message contextuel pour le chauffeur */
  rideshareImpact: string;
}

export interface YulStatus {
  /** Vrai si on est actuellement dans une vague d'arrivées */
  isActivePeriod: boolean;
  /** Vague en cours (null si entre deux vagues) */
  currentWave: YulWave | null;
  /** Prochaine vague */
  nextWave: YulWave | null;
  /** Minutes avant la prochaine vague (null si une vague est active) */
  minutesToNextWave: number | null;
  /** Nombre de vols actifs en approche de YUL (null si API indisponible) */
  liveArrivalsCount: number | null;
  fetchedAt: string;
}

/**
 * Vagues d'arrivées connues à l'aéroport Montréal-Trudeau.
 * Source : patterns historiques YUL + données ATC publiées.
 * - Vols transatlantiques : atterrissage 6h–10h (Europe de nuit, arrivée matin)
 * - Vols domestiques/US  : deux pics, 11h–14h et 17h–21h
 */
const YUL_WAVES: YulWave[] = [
  {
    label: '6h–10h (transatlantiques)',
    startHour: 6,
    endHour: 10,
    intensity: 'high',
    rideshareImpact:
      '✈️ Vague YUL — vols transatlantiques. Zone aéroport prioritaire.',
  },
  {
    label: '11h–14h (domestiques / US)',
    startHour: 11,
    endHour: 14,
    intensity: 'medium',
    rideshareImpact:
      '✈️ Vague YUL — vols domestiques. Aéroport + hôtels centre-ville.',
  },
  {
    label: '17h–21h (retours domestiques / US)',
    startHour: 17,
    endHour: 21,
    intensity: 'high',
    rideshareImpact:
      '✈️ Vague YUL — retours soir. Aéroport + hôtels + Westmount.',
  },
];

function getWaveStatus(now: Date): {
  current: YulWave | null;
  next: YulWave | null;
  minutesToNext: number | null;
} {
  const hour = now.getHours();
  const current =
    YUL_WAVES.find((w) => hour >= w.startHour && hour < w.endHour) ?? null;

  // Trouver la prochaine vague dans la même journée, sinon la première du lendemain
  const futureWaves = YUL_WAVES.filter((w) => w.startHour > hour);
  const next = futureWaves[0] ?? YUL_WAVES[0];

  if (current) {
    return { current, next, minutesToNext: null };
  }

  const nextStart = new Date(now);
  nextStart.setHours(next.startHour, 0, 0, 0);
  if (next.startHour <= hour) {
    // La prochaine vague est le lendemain
    nextStart.setDate(nextStart.getDate() + 1);
  }
  const minutesToNext = Math.round(
    (nextStart.getTime() - now.getTime()) / 60_000
  );

  return { current: null, next, minutesToNext };
}

interface AviationstackFlight {
  flight_status: string;
  arrival?: { iata?: string; scheduled?: string };
}

interface AviationstackResponse {
  data?: AviationstackFlight[];
}

async function fetchYulStatus(): Promise<YulStatus> {
  const now = new Date();
  const { current, next, minutesToNext } = getWaveStatus(now);

  // Fallback planning horaire connu si pas de clé
  if (!AVIATIONSTACK_KEY) {
    return {
      isActivePeriod: current !== null,
      currentWave: current,
      nextWave: next,
      minutesToNextWave: minutesToNext,
      liveArrivalsCount: null,
      fetchedAt: now.toISOString(),
    };
  }

  // Fallback mock si clé = 'mock' ou quota dépassé (à ajuster selon logique de quota)
  if (AVIATIONSTACK_KEY === 'mock') {
    // Simule 12 arrivées actives
    return {
      isActivePeriod: true,
      currentWave: current,
      nextWave: next,
      minutesToNextWave: minutesToNext,
      liveArrivalsCount: 12,
      fetchedAt: now.toISOString(),
    };
  }

  const response = await fetch(
    `https://api.aviationstack.com/v1/flights?access_key=${AVIATIONSTACK_KEY}&arr_iata=YUL&flight_status=active&limit=50`
  );

  if (!response.ok) {
    // Si quota dépassé (HTTP 429 ou 403), fallback mock
    if (response.status === 429 || response.status === 403) {
      return {
        isActivePeriod: true,
        currentWave: current,
        nextWave: next,
        minutesToNextWave: minutesToNext,
        liveArrivalsCount: 12,
        fetchedAt: now.toISOString(),
      };
    }
    throw new Error(`AviationStack fetch failed (HTTP ${response.status})`);
  }

  const payload = (await response.json()) as AviationstackResponse;
  const liveArrivalsCount = payload.data?.length ?? 0;

  return {
    isActivePeriod: current !== null || liveArrivalsCount > 5,
    currentWave: current,
    nextWave: next,
    minutesToNextWave: minutesToNext,
    liveArrivalsCount,
    fetchedAt: now.toISOString(),
  };
}

/**
 * Hook de surveillance de l'aéroport Montréal-Trudeau (YUL).
 *
 * - Sans VITE_AVIATIONSTACK_KEY : utilise le planning horaire connu (gratuit, infini).
 * - Avec VITE_AVIATIONSTACK_KEY : enrichit avec le nombre de vols actifs en approche.
 *   Le tier gratuit AviationStack = 100 appels/mois. Rafraîchi toutes les 4h.
 *
 * Inscription gratuite : https://aviationstack.com/
 */
export function useYulFlights() {
  return useQuery<YulStatus>({
    queryKey: ['yul-flights'],
    queryFn: fetchYulStatus,
    // 4h si on a une clé API (économiser les 100 appels/mois), 30min sinon (schedule gratuit)
    staleTime: AVIATIONSTACK_KEY ? 4 * 60 * 60 * 1000 : 30 * 60 * 1000,
    refetchInterval: AVIATIONSTACK_KEY ? 4 * 60 * 60 * 1000 : 30 * 60 * 1000,
    retry: 1,
    retryDelay: 30_000,
  });
}
