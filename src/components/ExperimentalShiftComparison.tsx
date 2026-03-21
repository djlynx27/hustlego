import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { getTripHours } from '@/lib/tripAnalytics';
import { useQuery } from '@tanstack/react-query';
import { FlaskConical } from 'lucide-react';

type ShiftComparisonTrip = {
  earnings: number | null;
  tips: number | null;
  started_at: string | null;
  ended_at: string | null;
  distance_km: number | null;
  experiment: boolean | null;
  zones: { name?: string | null } | null;
};

type ShiftComparisonStats = {
  count: number;
  earningsPerHour: number;
  totalEarnings: number;
  avgKm: number;
  bestZone: string;
};

function useShiftComparison() {
  return useQuery({
    queryKey: ['shift-comparison'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select(
          'earnings, tips, started_at, ended_at, distance_km, experiment, zones(name)'
        )
        .order('started_at', { ascending: false })
        .limit(500);
      if (error) throw error;

      const groups: Record<'normal' | 'experiment', ShiftComparisonTrip[]> = {
        normal: [],
        experiment: [],
      };
      for (const t of data ?? []) {
        const key = t.experiment ? 'experiment' : 'normal';
        groups[key].push(t as ShiftComparisonTrip);
      }

      function calcStats(
        trips: ShiftComparisonTrip[]
      ): ShiftComparisonStats | null {
        if (trips.length === 0) return null;
        let totalEarnings = 0,
          totalHours = 0,
          totalKm = 0;
        const zoneCounts: Record<string, number> = {};
        for (const t of trips) {
          totalEarnings += Number(t.earnings || 0) + Number(t.tips || 0);
          totalKm += Number(t.distance_km || 0);
          totalHours += getTripHours(t);
          const zn = t.zones?.name || 'Inconnu';
          zoneCounts[zn] = (zoneCounts[zn] || 0) + 1;
        }
        const bestZone =
          Object.entries(zoneCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
        return {
          count: trips.length,
          earningsPerHour: totalHours > 0 ? totalEarnings / totalHours : 0,
          totalEarnings,
          avgKm: totalKm / trips.length,
          bestZone,
        };
      }

      return {
        normal: calcStats(groups.normal),
        experiment: calcStats(groups.experiment),
      };
    },
  });
}

export function ExperimentalShiftComparison() {
  const { data } = useShiftComparison();
  if (!data?.experiment) return null;

  const { normal, experiment } = data;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-primary" /> Comparaison
          expérimentale
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          Cette comparaison reste basée sur le temps en course des trips marqués
          expérimentaux, pas sur des heures totales de shift trackées.
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Normal', stats: normal },
            { label: 'Expérimental', stats: experiment },
          ].map(({ label, stats }) => (
            <div
              key={label}
              className="bg-background rounded-lg border border-border p-3 space-y-1.5"
            >
              <span className="text-[13px] font-display font-bold block">
                {label}
              </span>
              {stats ? (
                <>
                  <div className="text-[12px] text-muted-foreground">
                    {stats.count} courses
                  </div>
                  <div className="text-[16px] font-display font-bold text-primary">
                    ${stats.earningsPerHour.toFixed(2)}/h en course
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    🏆 {stats.bestZone}
                  </div>
                </>
              ) : (
                <div className="text-[12px] text-muted-foreground">
                  Pas de données
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
