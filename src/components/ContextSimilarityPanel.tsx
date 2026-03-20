/**
 * ContextSimilarityPanel
 *
 * Affiche les enseignements de la recherche de similarité pgvector pour une zone.
 *
 * Source de données : `similarContextSignals` retourné par `useDemandScores`,
 * lui-même calculé via `find_similar_contexts()` (RPC Supabase IVFFlat cosine).
 *
 * Design : collapsible pill → expanded card.
 *
 * Usage :
 *   <ContextSimilarityPanel zoneId={zone.id} similarContextSignals={similarContextSignals} />
 */

import { cn } from '@/lib/utils';
import { useState } from 'react';

// ── Types (mirroring what useDemandScores returns) ────────────────────────────

interface ContextMatch {
  id: string;
  zone_id: string;
  similarity: number;
  surge_multiplier: number | null;
  surge_class: string | null;
  earnings_per_hour: number | null;
  trip_count: number | null;
}

interface ContextQueryResult {
  ok: boolean;
  matches: ContextMatch[];
  averageEarningsPerHour: number;
  averageSimilarity: number;
}

export interface ContextSignal {
  zoneId: string;
  result: ContextQueryResult;
}

interface ContextSimilarityPanelProps {
  zoneId: string;
  similarContextSignals: ContextSignal[];
  className?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatEph(v: number) {
  return v.toFixed(1);
}

function similarityLabel(s: number): string {
  if (s >= 0.92) return 'Très similaire';
  if (s >= 0.8) return 'Similaire';
  return 'Partiellement';
}

function surgeClassColor(cls: string | null): string {
  switch (cls) {
    case 'peak':
      return 'text-red-400';
    case 'high':
      return 'text-orange-400';
    case 'elevated':
      return 'text-yellow-400';
    default:
      return 'text-muted-foreground';
  }
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ContextSimilarityPanel({
  zoneId,
  similarContextSignals,
  className,
}: ContextSimilarityPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const signal = similarContextSignals.find((s) => s.zoneId === zoneId);
  if (!signal || !signal.result.ok || signal.result.matches.length === 0) {
    return null; // Nothing useful to show
  }

  const { averageEarningsPerHour, averageSimilarity, matches } = signal.result;

  // Only show when earnings data is meaningful
  if (averageEarningsPerHour < 15) return null;

  const topMatch = matches[0];
  const baselineEph = 30; // ~30$/h is a neutral Montreal reference
  const boostPct = Math.round(
    ((averageEarningsPerHour - baselineEph) / baselineEph) * 100
  );
  const isPositive = boostPct > 0;

  return (
    <div className={cn('', className)}>
      {/* Collapsed pill */}
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="w-full flex items-center gap-2 bg-muted/50 rounded-xl border border-border/60 px-3 py-2 text-left hover:bg-muted/80 transition-colors active:scale-[0.98]"
        >
          <span className="text-[16px]">🔮</span>
          <div className="flex-1 min-w-0">
            <span className="text-[13px] font-body text-muted-foreground leading-tight">
              Situations similaires ({matches.length}) ·{' '}
              <span
                className={cn(
                  'font-semibold',
                  isPositive ? 'text-emerald-400' : 'text-orange-400'
                )}
              >
                {isPositive ? '+' : ''}
                {boostPct}% vs baseline
              </span>
            </span>
            <span className="text-[11px] text-muted-foreground/70 block font-body">
              ~${formatEph(averageEarningsPerHour)}/h · similarité{' '}
              {Math.round(averageSimilarity * 100)}%
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">▼</span>
        </button>
      ) : (
        /* Expanded card */
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Header */}
          <button
            onClick={() => setExpanded(false)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-[16px]">🔮</span>
              <div className="text-left">
                <span className="text-[14px] font-display font-bold block leading-tight">
                  Situations similaires
                </span>
                <span className="text-[11px] text-muted-foreground font-body">
                  {matches.length} correspondance{matches.length > 1 ? 's' : ''}{' '}
                  · vecteur 8D pgvector
                </span>
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground">▲</span>
          </button>

          {/* Summary row */}
          <div className="flex items-center gap-0 border-t border-border/50 divide-x divide-border/50">
            <div className="flex-1 text-center py-3 px-2">
              <span
                className={cn(
                  'text-[20px] font-mono font-bold block leading-tight',
                  isPositive ? 'text-emerald-400' : 'text-orange-400'
                )}
              >
                ${formatEph(averageEarningsPerHour)}/h
              </span>
              <span className="text-[10px] text-muted-foreground font-body">
                moy. situations similaires
              </span>
            </div>
            <div className="flex-1 text-center py-3 px-2">
              <span className="text-[20px] font-mono font-bold block leading-tight">
                {Math.round(averageSimilarity * 100)}%
              </span>
              <span className="text-[10px] text-muted-foreground font-body">
                similarité cosinus
              </span>
            </div>
            <div className="flex-1 text-center py-3 px-2">
              <span
                className={cn(
                  'text-[20px] font-mono font-bold block leading-tight',
                  isPositive ? 'text-emerald-400' : 'text-orange-400'
                )}
              >
                {isPositive ? '+' : ''}
                {boostPct}%
              </span>
              <span className="text-[10px] text-muted-foreground font-body">
                vs baseline ${baselineEph}/h
              </span>
            </div>
          </div>

          {/* Best match detail */}
          {topMatch && (
            <div className="border-t border-border/50 px-4 py-3">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-2">
                Meilleure correspondance
              </p>
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-[13px] font-body">
                    Similarité{' '}
                    <span className="font-semibold text-foreground">
                      {Math.round(topMatch.similarity * 100)}%
                    </span>{' '}
                    — {similarityLabel(topMatch.similarity)}
                  </span>
                  {topMatch.surge_class &&
                    topMatch.surge_class !== 'normal' && (
                      <span
                        className={cn(
                          'text-[12px] font-body block',
                          surgeClassColor(topMatch.surge_class)
                        )}
                      >
                        Surge {topMatch.surge_multiplier?.toFixed(2)}× —{' '}
                        {topMatch.surge_class.toUpperCase()}
                      </span>
                    )}
                </div>
                {topMatch.earnings_per_hour !== null && (
                  <span className="text-[16px] font-mono font-bold text-primary flex-shrink-0">
                    ${formatEph(topMatch.earnings_per_hour)}/h
                  </span>
                )}
              </div>
              {(topMatch.trip_count ?? 0) > 0 && (
                <p className="text-[11px] text-muted-foreground font-body mt-1">
                  Basé sur {topMatch.trip_count} course
                  {(topMatch.trip_count ?? 0) > 1 ? 's' : ''} enregistrée
                  {(topMatch.trip_count ?? 0) > 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}

          {/* All matches minilist */}
          {matches.length > 1 && (
            <div className="border-t border-border/50 px-4 pb-3 pt-2">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-2">
                Toutes les correspondances
              </p>
              <div className="space-y-1.5">
                {matches.map((m, i) => (
                  <div key={m.id ?? i} className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-4">
                      {i + 1}.
                    </span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/60 rounded-full"
                        style={{ width: `${Math.round(m.similarity * 100)}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground w-8 text-right">
                      {Math.round(m.similarity * 100)}%
                    </span>
                    {m.earnings_per_hour !== null && (
                      <span className="text-[11px] font-mono font-semibold text-foreground w-16 text-right">
                        ${formatEph(m.earnings_per_hour)}/h
                      </span>
                    )}
                    {m.surge_class && m.surge_class !== 'normal' && (
                      <span
                        className={cn(
                          'text-[10px] font-bold',
                          surgeClassColor(m.surge_class)
                        )}
                      >
                        {m.surge_class.toUpperCase()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
