import {
  getPlatformMeta,
  inferPlatformSignalsClientSide,
  usePlatformSignals,
  type Platform,
  type PlatformSignal,
} from '@/hooks/usePlatformSignals';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────────

interface PlatformArbitrageProps {
  zoneId: string;
  zoneScore: number;
  nowHour?: number;
  /** Show compact inline version (no per-platform breakdown) */
  compact?: boolean;
  className?: string;
}

// ── Demand bar ────────────────────────────────────────────────────────────────

function DemandBar({ demand, surge }: { demand: number; surge: boolean }) {
  const pct = Math.round((demand / 10) * 100);
  return (
    <div className="h-1 w-full rounded-full bg-border overflow-hidden">
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500',
          surge
            ? 'bg-red-500 animate-pulse'
            : demand >= 7.5
              ? 'bg-orange-500'
              : demand >= 5.0
                ? 'bg-yellow-500'
                : 'bg-emerald-500'
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── Single platform row ───────────────────────────────────────────────────────

function PlatformRow({
  signal,
  isBest,
}: {
  signal: PlatformSignal;
  isBest: boolean;
}) {
  const meta = getPlatformMeta(signal.platform as Platform);

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors',
        isBest ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted/40'
      )}
    >
      {/* Emoji + label */}
      <span className="text-[16px] leading-none select-none">{meta.emoji}</span>
      <span
        className={cn(
          'text-[13px] font-display font-semibold flex-1 leading-tight',
          isBest ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        {meta.label}
      </span>

      {/* Surge badge */}
      {signal.latest_surge && (
        <span className="text-[10px] font-bold bg-red-500/20 text-red-400 rounded px-1 py-0.5 leading-none">
          {signal.latest_multiplier
            ? `${signal.latest_multiplier.toFixed(2)}×`
            : 'SURGE'}
        </span>
      )}

      {/* Demand score */}
      <span
        className={cn(
          'text-[13px] font-mono tabular-nums font-bold w-8 text-right',
          signal.avg_demand >= 7.5
            ? 'text-red-400'
            : signal.avg_demand >= 5.0
              ? 'text-orange-400'
              : 'text-emerald-400'
        )}
      >
        {signal.avg_demand.toFixed(1)}
      </span>
    </div>
  );
}

// ── Compact mode: just the best platform chip ──────────────────────────────────

function CompactBestPlatform({ signal }: { signal: PlatformSignal }) {
  const meta = getPlatformMeta(signal.platform as Platform);
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5">
      <span className="text-[14px] leading-none">{meta.emoji}</span>
      <span className="text-[12px] font-display font-bold text-primary">
        {meta.label}
      </span>
      {signal.latest_surge && (
        <span className="text-[10px] font-bold text-red-400">
          {signal.latest_multiplier?.toFixed(2)}×
        </span>
      )}
    </div>
  );
}

function resolveSignals({
  recommendation,
  zoneScore,
  hour,
}: {
  recommendation: Awaited<ReturnType<typeof usePlatformSignals>>['data'];
  zoneScore: number;
  hour: number;
}) {
  const signals =
    recommendation && recommendation.all.length > 0
      ? recommendation.all
      : inferPlatformSignalsClientSide(zoneScore, hour);

  return {
    signals,
    best: signals[0],
    second: signals[1],
    isInferred: !recommendation || recommendation.all.length === 0,
    arbitrageGap: recommendation?.arbitrageGap ?? 0,
  };
}

function CompactPlatformArbitrage({
  isLoading,
  best,
  isInferred,
  className,
}: {
  isLoading: boolean;
  best: PlatformSignal;
  isInferred: boolean;
  className?: string;
}) {
  if (isLoading) {
    return (
      <div
        className={cn(
          'h-5 w-20 rounded-full bg-muted animate-pulse',
          className
        )}
      />
    );
  }

  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <CompactBestPlatform signal={best} />
      {isInferred && (
        <span className="text-[10px] text-muted-foreground/60 pl-1">
          estimé
        </span>
      )}
    </div>
  );
}

function ActiveSignalLabel({ signal }: { signal: PlatformSignal }) {
  return (
    <span className="text-[11px] font-bold text-red-400 block leading-tight">
      SURGE{' '}
      {signal.latest_multiplier
        ? `${signal.latest_multiplier.toFixed(2)}×`
        : ''}
    </span>
  );
}

function PlatformArbitrageHeader({ isInferred }: { isInferred: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] font-display font-bold text-muted-foreground uppercase tracking-wide">
        Meilleure plateforme
      </span>
      {isInferred ? (
        <span className="text-[10px] text-muted-foreground/50 font-body">
          estimé
        </span>
      ) : (
        <span className="text-[10px] text-emerald-500 font-body font-semibold">
          ● live
        </span>
      )}
    </div>
  );
}

function BestPlatformHighlight({ best }: { best: PlatformSignal }) {
  const meta = getPlatformMeta(best.platform as Platform);

  return (
    <div className="flex items-center gap-2">
      <span className="text-[24px] leading-none">{meta.emoji}</span>
      <div className="flex-1 min-w-0">
        <span className="text-[16px] font-display font-bold leading-tight block">
          {meta.label}
        </span>
        <DemandBar demand={best.avg_demand} surge={best.latest_surge} />
      </div>
      <div className="text-right flex-shrink-0">
        <span className="text-[20px] font-mono font-bold leading-tight block">
          {best.avg_demand.toFixed(1)}
          <span className="text-[12px] text-muted-foreground font-body font-normal">
            /10
          </span>
        </span>
        {best.latest_surge && <ActiveSignalLabel signal={best} />}
      </div>
    </div>
  );
}

function ArbitrageGapNotice({
  second,
  arbitrageGap,
}: {
  second: PlatformSignal | undefined;
  arbitrageGap: number;
}) {
  if (!second || arbitrageGap < 0.5) {
    return null;
  }

  return (
    <div className="text-[12px] text-muted-foreground font-body px-1">
      {arbitrageGap >= 1.5 ? '⚡ ' : '↑ '}
      {arbitrageGap.toFixed(1)} pts d'avance sur{' '}
      {getPlatformMeta(second.platform as Platform).label}
      {arbitrageGap >= 1.5 && (
        <span className="ml-1 text-primary font-semibold">— Basculer!</span>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

/**
 * PlatformArbitrage
 *
 * Shows which platform (Lyft, DoorDash, Skip, Hypra) currently has the highest
 * demand signal for a given zone. Falls back to client-side inference when no
 * DB signals exist yet (before any screenshots are captured).
 *
 * Usage:
 *   <PlatformArbitrage zoneId={zone.id} zoneScore={score} />
 *   <PlatformArbitrage zoneId={zone.id} zoneScore={score} compact />
 */
export function PlatformArbitrage({
  zoneId,
  zoneScore,
  nowHour,
  compact = false,
  className,
}: PlatformArbitrageProps) {
  const hour = nowHour ?? new Date().getHours();
  const { data: recommendation, isLoading } = usePlatformSignals(zoneId);

  const { signals, best, second, isInferred, arbitrageGap } = resolveSignals({
    recommendation,
    zoneScore,
    hour,
  });

  if (!best) return null;

  if (compact) {
    return (
      <CompactPlatformArbitrage
        isLoading={isLoading}
        best={best}
        isInferred={isInferred}
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl bg-card border border-border p-3 space-y-2',
        className
      )}
    >
      <PlatformArbitrageHeader isInferred={isInferred} />
      <BestPlatformHighlight best={best} />
      <ArbitrageGapNotice second={second} arbitrageGap={arbitrageGap} />
      <div className="space-y-0.5 pt-1 border-t border-border/50">
        {signals.map((sig, i) => (
          <PlatformRow key={sig.platform} signal={sig} isBest={i === 0} />
        ))}
      </div>
    </div>
  );
}
