import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSessions } from '@/hooks/useSupabase';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { useQuery } from '@tanstack/react-query';
import { Clock, FileText, MapPin, Sparkles } from 'lucide-react';
import { useMemo } from 'react';

type DailyReportRow = Tables<'daily_reports'>;

function getTrackedSessionHours(session: {
  total_hours: number | null;
  started_at: string;
  ended_at: string | null;
}) {
  const explicitHours = Number(session.total_hours ?? 0);
  if (explicitHours > 0) {
    return explicitHours;
  }

  if (!session.ended_at) {
    return 0;
  }

  const startedAt = new Date(session.started_at);
  const endedAt = new Date(session.ended_at);
  const durationMs = endedAt.getTime() - startedAt.getTime();

  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    return 0;
  }

  return durationMs / (1000 * 60 * 60);
}

function useReports() {
  return useQuery<DailyReportRow[]>({
    queryKey: ['daily-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_reports')
        .select('*')
        .order('report_date', { ascending: false })
        .limit(14);
      if (error) throw error;
      return (data ?? []) as DailyReportRow[];
    },
  });
}

export function DailyReports() {
  const { data: reports = [] } = useReports();
  const sessionsSince = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() - 13);
    start.setHours(0, 0, 0, 0);
    return start.toISOString();
  }, []);
  const { data: sessions = [] } = useSessions(sessionsSince, 200);

  const trackedByDate = useMemo(() => {
    return sessions.reduce<
      Record<
        string,
        { hours: number; revenue: number; rides: number; shifts: number }
      >
    >((acc, session) => {
      const dateKey = session.started_at.split('T')[0];
      if (!dateKey) return acc;
      const current = acc[dateKey] ?? {
        hours: 0,
        revenue: 0,
        rides: 0,
        shifts: 0,
      };
      current.hours += getTrackedSessionHours(session);
      current.revenue += Number(session.total_earnings ?? 0);
      current.rides += Number(session.total_rides ?? 0);
      current.shifts += 1;
      acc[dateKey] = current;
      return acc;
    }, {});
  }, [sessions]);

  if (reports.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" /> Rapports quotidiens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Aucun rapport généré. Les rapports sont créés automatiquement à
            23h30 chaque jour.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" /> Rapports quotidiens
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {reports.map((r) => (
          <div
            key={r.id}
            className="bg-background rounded-lg border border-border p-3 space-y-2"
          >
            {(() => {
              const tracked = trackedByDate[r.report_date] ?? null;
              const displayTrips =
                tracked?.rides && tracked.rides > 0
                  ? tracked.rides
                  : Number(r.total_trips || 0);
              const displayEarnings =
                tracked?.revenue && tracked.revenue > 0
                  ? tracked.revenue
                  : Number(r.total_earnings || 0);
              const displayHours =
                tracked?.hours && tracked.hours > 0
                  ? tracked.hours
                  : Number(r.hours_worked || 0);
              return (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-display font-bold">
                      {new Date(r.report_date + 'T12:00:00').toLocaleDateString(
                        'fr-CA',
                        { weekday: 'short', day: 'numeric', month: 'short' }
                      )}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {displayTrips.toFixed(0)} courses
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <span className="text-[11px] text-muted-foreground block">
                        Gains
                      </span>
                      <span className="text-[16px] font-display font-bold text-primary">
                        ${displayEarnings.toFixed(0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">
                        Distance
                      </span>
                      <span className="text-[16px] font-display font-bold">
                        {Number(r.total_distance_km || 0).toFixed(0)} km
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">
                        {tracked && tracked.hours > 0
                          ? 'Heures trackées'
                          : 'Heures rapport'}
                      </span>
                      <span className="text-[16px] font-display font-bold">
                        {displayHours.toFixed(1)}h
                      </span>
                    </div>
                  </div>
                  {tracked && tracked.hours > 0 && (
                    <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-[12px] text-amber-100">
                      {tracked.shifts} shift{tracked.shifts > 1 ? 's' : ''}{' '}
                      tracké{tracked.shifts > 1 ? 's' : ''}:{' '}
                      {tracked.hours.toFixed(1)} h · $
                      {tracked.revenue.toFixed(0)} de revenu synchronisé
                    </div>
                  )}
                  <div className="flex gap-3 text-[12px] text-muted-foreground">
                    {r.best_zone_name && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-green-400" />{' '}
                        {r.best_zone_name}
                      </span>
                    )}
                    {r.best_time_slot && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {r.best_time_slot}
                      </span>
                    )}
                  </div>
                  {r.dead_time_pct > 0 && (
                    <div className="text-[12px] text-yellow-500">
                      ⏱️ Temps mort: {Number(r.dead_time_pct).toFixed(0)}%
                    </div>
                  )}
                  {r.ai_recommendation && (
                    <div className="flex items-start gap-1.5 text-[12px] text-muted-foreground italic bg-primary/5 rounded px-2 py-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                      {r.ai_recommendation}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
