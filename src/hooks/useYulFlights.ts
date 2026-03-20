import { buildFallbackYulStatus, type YulStatus } from '@/lib/yulStatus';
import { useQuery } from '@tanstack/react-query';

export type { YulStatus } from '@/lib/yulStatus';

const YUL_STATUS_URL = '/api/yul-flights';

async function fetchYulStatus(): Promise<YulStatus> {
  try {
    const response = await fetch(YUL_STATUS_URL);
    if (!response.ok) {
      return buildFallbackYulStatus(new Date());
    }

    return (await response.json()) as YulStatus;
  } catch {
    return buildFallbackYulStatus(new Date());
  }
}

/**
 * Hook de surveillance de l'aéroport Montréal-Trudeau (YUL).
 *
 * - Utilise un endpoint same-origin pour éviter les erreurs console en cas de quota dépassé.
 * - Fallback automatique sur le planning horaire YUL connu si l'API live est absente ou limitée.
 * - Le tier gratuit AviationStack = 100 appels/mois. Rafraîchi toutes les 4h.
 *
 * Inscription gratuite : https://aviationstack.com/
 */
export function useYulFlights() {
  return useQuery<YulStatus>({
    queryKey: ['yul-flights'],
    queryFn: fetchYulStatus,
    staleTime: 4 * 60 * 60 * 1000,
    refetchInterval: 4 * 60 * 60 * 1000,
    retry: 1,
    retryDelay: 30_000,
  });
}
