import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useAgentObservability,
  type FirewallStatus,
} from '@/hooks/useAgentObservability';
import { cn } from '@/lib/utils';
import { Activity, Brain, Shield, TrendingDown } from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────

function firewallStatusLabel(status: FirewallStatus): string {
  switch (status) {
    case 'healthy':
      return 'Nominal';
    case 'warning':
      return 'Attention';
    case 'critical':
      return 'Critique';
  }
}

function firewallStatusColor(status: FirewallStatus): string {
  switch (status) {
    case 'healthy':
      return 'text-green-400';
    case 'warning':
      return 'text-yellow-400';
    case 'critical':
      return 'text-red-400';
  }
}

function firewallBadgeVariant(
  status: FirewallStatus
): 'default' | 'secondary' | 'destructive' {
  switch (status) {
    case 'healthy':
      return 'default';
    case 'warning':
      return 'secondary';
    case 'critical':
      return 'destructive';
  }
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-CA', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── Metric card ──────────────────────────────────────────────────────────────

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  colorClass?: string;
}

function MetricCard({ icon, label, value, sub, colorClass }: MetricCardProps) {
  return (
    <div className="bg-muted/30 rounded-xl border border-border p-3 flex items-start gap-3">
      <div
        className={cn('mt-0.5 shrink-0', colorClass ?? 'text-muted-foreground')}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground font-body uppercase tracking-wide truncate">
          {label}
        </p>
        <p className="text-[20px] font-mono font-bold leading-tight">{value}</p>
        <p className="text-[11px] text-muted-foreground font-body">{sub}</p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function AgentObservabilityPanel() {
  const { data, isLoading, isError } = useAgentObservability();

  return (
    <div className="space-y-1">
      <h2 className="text-[18px] font-display font-bold px-1">
        Observabilité IA
      </h2>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Shield size={16} className="text-primary" />
            Hallucination Firewall
          </CardTitle>
          {data && (
            <Badge variant={firewallBadgeVariant(data.firewallStatus)}>
              {firewallStatusLabel(data.firewallStatus)}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          {isLoading && (
            <p className="text-[13px] text-muted-foreground font-body text-center py-3 animate-pulse">
              Chargement des métriques…
            </p>
          )}

          {isError && (
            <p className="text-[13px] text-red-400 font-body text-center py-3">
              Erreur lors de la récupération des métriques.
            </p>
          )}

          {data && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <MetricCard
                  icon={<Shield size={16} />}
                  label="Dérive score IA"
                  value={`${data.avgScoreDrift.toFixed(1)}`}
                  sub="pts en moyenne · 24h"
                  colorClass={firewallStatusColor(data.firewallStatus)}
                />
                <MetricCard
                  icon={<TrendingDown size={16} />}
                  label="MAE prédictions"
                  value={`${data.avgPredictionMAE.toFixed(2)}`}
                  sub="erreur absolue · 7 jours"
                  colorClass={
                    data.avgPredictionMAE < 5
                      ? 'text-green-400'
                      : data.avgPredictionMAE < 15
                        ? 'text-yellow-400'
                        : 'text-red-400'
                  }
                />
                <MetricCard
                  icon={<Activity size={16} />}
                  label="Zones scorées"
                  value={String(data.totalScoredZones)}
                  sub="entrées · dernières 24h"
                />
                <MetricCard
                  icon={<Brain size={16} />}
                  label="Dernière calib."
                  value={
                    data.lastCalibration
                      ? `MAE ${data.lastCalibration.mae.toFixed(2)}`
                      : '—'
                  }
                  sub={
                    data.lastCalibration
                      ? formatDate(data.lastCalibration.createdAt)
                      : 'Aucune calibration'
                  }
                />
              </div>

              {/* Calibration history timeline */}
              {data.calibrationHistory.length > 0 && (
                <div className="mt-2">
                  <p className="text-[11px] text-muted-foreground font-body uppercase tracking-wide mb-1.5">
                    Historique calibration
                  </p>
                  <div className="space-y-1.5">
                    {data.calibrationHistory.slice(0, 5).map((event, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-[12px] font-body"
                      >
                        <span className="text-muted-foreground">
                          {formatDate(event.createdAt)}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground/70 text-[10px]">
                            {event.triggeredBy}
                          </span>
                          <span
                            className={cn(
                              'font-mono font-semibold',
                              event.mae < 5
                                ? 'text-green-400'
                                : event.mae < 15
                                  ? 'text-yellow-400'
                                  : 'text-red-400'
                            )}
                          >
                            MAE {event.mae.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.calibrationHistory.length === 0 && (
                <p className="text-[12px] text-muted-foreground font-body text-center py-1">
                  Aucune calibration enregistrée.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
