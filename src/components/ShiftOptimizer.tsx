/**
 * ShiftOptimizer
 *
 * Planning hebdomadaire IA pour chauffeur gig Montréal.
 * Recommande les meilleurs blocs horaires pour atteindre un objectif de revenus,
 * en s'appuyant sur les scores de demande (computeDemandScore) et le
 * feedback loop (EMA patterns + weight_history).
 *
 * Usage:
 *   <ShiftOptimizer cityId={cityId} targetWeeklyRevenue={800} />
 */

import { DemandBadge } from '@/components/DemandBadge';
import { useZones } from '@/hooks/useSupabase';
import { useTrips } from '@/hooks/useTrips';
import { useWeather } from '@/hooks/useWeather';
import { getDemandClass } from '@/lib/demandUtils';
import { deriveLearningInsights } from '@/lib/learningEngine';
import { computeDemandScore, type WeatherCondition } from '@/lib/scoringEngine';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface ShiftBlock {
  dayLabel: string; // 'Lundi 23 mars'
  dayIndex: number; // 0=Mon … 6=Sun
  startHour: number;
  endHour: number;
  label: string; // 'Lundi 18h–22h'
  estimatedRevenue: number;
  avgScore: number;
  topZone: string;
  topZoneId: string;
  reason: string;
}

interface ShiftOptimizerProps {
  cityId: string;
  targetWeeklyRevenue?: number;
  className?: string;
}

// ── Score-to-$/h mapping (calibrated Montreal reference) ──────────────────────
// score 80 → ~$45/h, score 60 → ~$32/h, score 40 → ~$22/h
function scoreToEarningsPerH(score: number): number {
  return Math.max(12, 12 + score * 0.42);
}

// ── High-value time blocks per day-of-week (0=Mon…6=Sun) ─────────────────────
const PRIME_BLOCKS: Array<{
  startHour: number;
  endHour: number;
  hours: number;
}> = [
  { startHour: 6, endHour: 9, hours: 3 }, // Morning rush
  { startHour: 11, endHour: 14, hours: 3 }, // Midday
  { startHour: 16, endHour: 20, hours: 4 }, // Evening rush
  { startHour: 20, endHour: 24, hours: 4 }, // Nightlife
];

const DAY_LABELS_FR = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
];
const DOW_JS_TO_MON0 = [6, 0, 1, 2, 3, 4, 5]; // JS sun=0 → mon=0

function fmt(h: number): string {
  return `${h}h`;
}

export function ShiftOptimizer({
  cityId,
  targetWeeklyRevenue = 700,
  className,
}: ShiftOptimizerProps) {
  const [targetRevenue, setTargetRevenue] = useState(targetWeeklyRevenue);
  const { data: zones = [] } = useZones(cityId);
  const { data: weather } = useWeather(cityId);
  const { data: trips = [] } = useTrips(300);

  const weatherCond: WeatherCondition | null = useMemo(
    () =>
      weather
        ? {
            weatherId: weather.weatherId,
            temp: weather.temp,
            demandBoostPoints: weather.demandBoostPoints,
          }
        : null,
    [weather]
  );

  // Derive EMA patterns from trip history for $/h estimates
  const learningInsights = useMemo(() => {
    if (trips.length === 0) return null;
    return deriveLearningInsights(trips);
  }, [trips]);

  // Build the next 7-day optimized schedule
  const recommended = useMemo((): ShiftBlock[] => {
    if (zones.length === 0) return [];

    const today = new Date();
    const blocks: ShiftBlock[] = [];

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = new Date(today);
      date.setDate(today.getDate() + dayOffset);
      const jsDay = date.getDay(); // 0=Sun … 6=Sat
      const dayIndex = DOW_JS_TO_MON0[jsDay] ?? 0; // 0=Mon … 6=Sun

      for (const block of PRIME_BLOCKS) {
        const slotDate = new Date(date);
        slotDate.setHours(block.startHour, 0, 0, 0);

        // Score the top zone for this block
        let bestScore = 0;
        let bestZoneName = '';
        let bestZoneId = '';

        for (const zone of zones) {
          const { score } = computeDemandScore(zone, slotDate, weatherCond);
          if (score > bestScore) {
            bestScore = score;
            bestZoneName = zone.name;
            bestZoneId = zone.id;
          }
        }

        if (bestScore < 40) continue; // Skip very low demand blocks

        // Try to use EMA-derived $/h for this day/slot if available
        let earningsPerH = scoreToEarningsPerH(bestScore);
        if (learningInsights) {
          const slotIdx = block.startHour * 4; // 15-min slot index
          const emaPattern = learningInsights.emaPatterns.find(
            (p) =>
              p.dayOfWeek === jsDay &&
              Math.abs(p.slotIndex - slotIdx) < 8 &&
              p.zoneId === bestZoneId
          );
          if (emaPattern && emaPattern.observationCount >= 2) {
            // Blend EMA with score-based estimate (trust EMA more as observations grow)
            const emaTrust = Math.min(0.85, emaPattern.observationCount * 0.1);
            earningsPerH =
              emaTrust * emaPattern.emaEarningsPerHour +
              (1 - emaTrust) * earningsPerH;
          }
        }

        const estimatedRevenue =
          Math.round(earningsPerH * block.hours * 10) / 10;

        const dateLabel = date.toLocaleDateString('fr-CA', {
          day: 'numeric',
          month: 'short',
        });
        const dayLabel = `${DAY_LABELS_FR[dayIndex] ?? 'Jour'} ${dateLabel}`;

        // Build reason string
        let reason = '';
        if (block.startHour >= 20) {
          reason =
            dayIndex >= 4
              ? 'Bars + nightlife (vendredi/samedi)'
              : 'Soirée demande modérée';
        } else if (block.startHour >= 16) {
          reason = 'Rush heure de pointe soir';
        } else if (block.startHour >= 11) {
          reason = 'Heure de lunch';
        } else {
          reason = 'Rush matinal';
        }

        blocks.push({
          dayLabel,
          dayIndex,
          startHour: block.startHour,
          endHour: block.endHour,
          label: `${DAY_LABELS_FR[dayIndex] ?? 'Jour'} ${fmt(block.startHour)}–${fmt(block.endHour)}`,
          estimatedRevenue,
          avgScore: Math.round(bestScore),
          topZone: bestZoneName,
          topZoneId: bestZoneId,
          reason,
        });
      }
    }

    // Sort by estimated revenue desc, limit to top 14 blocks
    return blocks
      .sort((a, b) => b.estimatedRevenue - a.estimatedRevenue)
      .slice(0, 14);
  }, [zones, weatherCond, learningInsights]);

  // Greedy selection: pick blocks until target met, no day-overlap > 8h
  const selectedBlocks = useMemo((): ShiftBlock[] => {
    const selected: ShiftBlock[] = [];
    const hoursPerDay = new Map<number, number>();
    let accRevenue = 0;

    for (const block of recommended) {
      if (accRevenue >= targetRevenue) break;

      const dayHours = hoursPerDay.get(block.dayIndex) ?? 0;
      const blockHours = block.endHour - block.startHour;
      if (dayHours + blockHours > 10) continue; // max 10h/day

      selected.push(block);
      hoursPerDay.set(block.dayIndex, dayHours + blockHours);
      accRevenue += block.estimatedRevenue;
    }

    // Sort by dayIndex + startHour for display
    return selected.sort((a, b) =>
      a.dayIndex !== b.dayIndex
        ? a.dayIndex - b.dayIndex
        : a.startHour - b.startHour
    );
  }, [recommended, targetRevenue]);

  const projectedRevenue = selectedBlocks.reduce(
    (s, b) => s + b.estimatedRevenue,
    0
  );
  const totalHours = selectedBlocks.reduce(
    (s, b) => s + (b.endHour - b.startHour),
    0
  );
  const gapToTarget = Math.max(0, targetRevenue - projectedRevenue);

  if (zones.length === 0) {
    return (
      <div
        className={cn(
          'rounded-xl bg-card border border-border p-4 text-center',
          className
        )}
      >
        <p className="text-muted-foreground text-[14px] font-body">
          Chargement des zones…
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header + target input */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-[16px] font-display font-bold">
            Planning IA — Semaine
          </h2>
          <p className="text-[12px] text-muted-foreground font-body">
            Shifts optimisés pour atteindre votre objectif
          </p>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[12px] text-muted-foreground font-body">
            Objectif
          </span>
          <div className="flex items-center gap-0.5 bg-muted rounded-lg px-2 py-1">
            <span className="text-[13px] text-muted-foreground">$</span>
            <input
              type="number"
              value={targetRevenue}
              min={100}
              max={3000}
              step={50}
              onChange={(e) => setTargetRevenue(Number(e.target.value))}
              className="w-16 bg-transparent text-[14px] font-mono font-bold text-foreground outline-none"
            />
            <span className="text-[12px] text-muted-foreground">/sem</span>
          </div>
        </div>
      </div>

      {/* Summary bar */}
      <div className="rounded-xl bg-card border border-border p-3 flex items-center gap-4">
        <div className="flex-1 text-center">
          <span className="text-[22px] font-mono font-bold text-primary leading-tight block">
            ${Math.round(projectedRevenue)}
          </span>
          <span className="text-[11px] text-muted-foreground font-body">
            projeté
          </span>
        </div>
        <div className="w-px h-10 bg-border" />
        <div className="flex-1 text-center">
          <span className="text-[22px] font-mono font-bold leading-tight block">
            {totalHours}h
          </span>
          <span className="text-[11px] text-muted-foreground font-body">
            heures planifiées
          </span>
        </div>
        <div className="w-px h-10 bg-border" />
        <div className="flex-1 text-center">
          <span
            className={cn(
              'text-[22px] font-mono font-bold leading-tight block',
              gapToTarget === 0 ? 'text-emerald-400' : 'text-orange-400'
            )}
          >
            {gapToTarget === 0 ? '✓' : `-$${Math.round(gapToTarget)}`}
          </span>
          <span className="text-[11px] text-muted-foreground font-body">
            {gapToTarget === 0 ? 'objectif atteint' : 'manquant'}
          </span>
        </div>
      </div>

      {/* Shift blocks list */}
      <div className="space-y-2">
        {selectedBlocks.length === 0 ? (
          <p className="text-center text-[14px] text-muted-foreground font-body py-4">
            Aucun shift recommandé — ajustez votre objectif.
          </p>
        ) : (
          selectedBlocks.map((block, i) => {
            const dc = getDemandClass(block.avgScore);
            return (
              <div
                key={`${block.dayIndex}-${block.startHour}`}
                className={cn(
                  'bg-card rounded-xl border-l-4 border border-border p-3',
                  dc.border
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {i === 0 && (
                        <span className="text-[10px] font-bold bg-primary/20 text-primary rounded px-1.5 py-0.5">
                          TOP
                        </span>
                      )}
                      <span className="text-[15px] font-display font-bold leading-tight">
                        {block.label}
                      </span>
                    </div>
                    <span className="text-[13px] text-primary font-body block mt-0.5">
                      📍 {block.topZone}
                    </span>
                    <span className="text-[12px] text-muted-foreground font-body">
                      {block.reason}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0 space-y-1">
                    <DemandBadge score={block.avgScore} size="sm" />
                    <span className="text-[14px] font-mono font-bold text-foreground block">
                      ~${block.estimatedRevenue}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-body block">
                      ({block.endHour - block.startHour}h)
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {learningInsights && learningInsights.predictions.length > 0 && (
        <div className="rounded-xl bg-muted/40 border border-border/50 p-3">
          <p className="text-[12px] text-muted-foreground font-body text-center">
            📊 Calibré sur {learningInsights.predictions.length} courses ·
            Précision :{' '}
            <span className="text-foreground font-semibold">
              {Math.round(learningInsights.accuracyPercent)}%
            </span>{' '}
            · MAE{' '}
            <span className="text-foreground font-semibold">
              ${Math.round(learningInsights.meanAbsoluteError)}/h
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
