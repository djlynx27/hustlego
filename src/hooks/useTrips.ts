import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { useQuery } from '@tanstack/react-query';

type TripRow = Database['public']['Tables']['trips']['Row'];

export type TripWithZone = TripRow & {
  platform?: string | null;
  zone_score?: number | null;
  zones?: {
    name?: string | null;
    type?: string | null;
    current_score?: number | null;
  } | null;
};

export function useTrips(limit = 500) {
  return useQuery<TripWithZone[]>({
    queryKey: ['trips-feed', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('*, zones(name, type, current_score)')
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data ?? []) as TripWithZone[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
