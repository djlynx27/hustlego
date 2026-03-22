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

import type {
  SimilarContextMatch,
  SimilarContextsResult,
} from '@/lib/learningSync';
import { cn } from '@/lib/utils';
import { useState } from 'react';

// ── Types (mirroring what useDemandScores returns) ────────────────────────────

export interface ContextSignal {
  zoneId: string;
  result: SimilarContextsResult;
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

type ContextPanelModel = {
  averageEarningsPerHour: number;
  averageSimilarity: number;
  baselineEph: number;
  boostPct: number;
  isPositive: boolean;
  matches: SimilarContextMatch[];
  topMatch: SimilarContextMatch | undefined;
};

function buildContextPanelModel(
  result: SimilarContextsResult | undefined
): ContextPanelModel | null {
  if (!result || !result.ok || result.matches.length === 0) return null;
  if (result.averageEarningsPerHour < 15) return null;

  const baselineEph = 30;
  const boostPct = Math.round(
    ((result.averageEarningsPerHour - baselineEph) / baselineEph) * 100
  );

  return {
    averageEarningsPerHour: result.averageEarningsPerHour,
    averageSimilarity: result.averageSimilarity,
    baselineEph,
    boostPct,
    isPositive: boostPct > 0,
    matches: result.matches,
    topMatch: result.matches[0],
  };
}

function CollapsedSimilaritySummary({
  model,
  onExpand,
}: {
  model: ContextPanelModel;
  onExpand: () => void;
}) {
  return (
    <button
      onClick={onExpand}
      className="w-full flex items-center gap-2 bg-muted/50 rounded-xl border border-border/60 px-3 py-2 text-left hover:bg-muted/80 transition-colors active:scale-[0.98]"
    >
      <span className="text-[16px]">🔮</span>
      <div className="flex-1 min-w-0">
        <span className="text-[13px] font-body text-muted-foreground leading-tight">
          Situations similaires ({model.matches.length}) ·{' '}
          <span
            className={cn(
              'font-semibold',
              model.isPositive ? 'text-emerald-400' : 'text-orange-400'
            )}
          >
            {model.isPositive ? '+' : ''}
            {model.boostPct}% vs baseline
          </span>
        </span>
        <span className="text-[11px] text-muted-foreground/70 block font-body">
          ~${formatEph(model.averageEarningsPerHour)}/h · similarité{' '}
          {Math.round(model.averageSimilarity * 100)}%
        </span>
      </div>
      <span className="text-[11px] text-muted-foreground">▼</span>
    </button>
  );
}

function ExpandedSimilarityCard({
  model,
  onCollapse,
}: {
  model: ContextPanelModel;
  onCollapse: () => void;
}) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <button
        onClick={onCollapse}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-[16px]">🔮</span>
          <div className="text-left">
            <span className="text-[14px] font-display font-bold block leading-tight">
              Situations similaires
            </span>
            <span className="text-[11px] text-muted-foreground font-body">
              {model.matches.length} correspondance{model.matches.length > 1 ? 's' : ''} · vecteur 8D pgvector
            </span>
          </div>
        </div>
        <span className="text-[11px] text-muted-foreground">▲</span>
      </button>

      <div className="flex items-center gap-0 border-t border-border/50 divide-x divide-border/50">
        <div className="flex-1 text-center py-3 px-2">
          <span
            className={cn(
              'text-[20px] font-mono font-bold block leading-tight',
              model.isPositive ? 'text-emerald-400' : 'text-orange-400'
            )}
          >
            ${formatEph(model.averageEarningsPerHour)}/h
          </span>
          <span className="text-[10px] text-muted-foreground font-body">
            moy. situations similaires
          </span>
        </div>
        <div className="flex-1 text-center py-3 px-2">
          <span className="text-[20px] font-mono font-bold block leading-tight">
            {Math.round(model.averageSimilarity * 100)}%
          </span>
          <span className="text-[10px] text-muted-foreground font-body">
            similarité cosinus
          </span>
        </div>
        <div className="flex-1 text-center py-3 px-2">
          <span
            className={cn(
              'text-[20px] font-mono font-bold block leading-tight',
              model.isPositive ? 'text-emerald-400' : 'text-orange-400'
            )}
          >
            {model.isPositive ? '+' : ''}
            {model.boostPct}%
          </span>
          <span className="text-[10px] text-muted-foreground font-body">
            vs baseline ${model.baselineEph}/h
          </span>
        </div>
      </div>

      {model.topMatch ? (
        <div className="border-t border-border/50 px-4 py-3">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-2">
            Meilleure correspondance
          </p>
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span className="text-[13px] font-body">
                Similarité{' '}
                <span className="font-semibold text-foreground">
                  {Math.round(model.topMatch.similarity * 100)}%
                </span>{' '}
                — {similarityLabel(model.topMatch.similarity)}
              </span>
            </div>
            {model.topMatch.actualEarningsPerHour !== null ? (
              <span className="text-[16px] font-mono font-bold text-primary flex-shrink-0">
                ${formatEph(model.topMatch.actualEarningsPerHour)}/h
              </span>
            ) : null}
          </div>
          <p className="text-[11px] text-muted-foreground font-body mt-1">
            Contexte enregistré le{' '}
            {new Date(model.topMatch.createdAt).toLocaleDateString('fr-CA')}
          </p>
        </div>
      ) : null}

      {model.matches.length > 1 ? (
        <div className="border-t border-border/50 px-4 pb-3 pt-2">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-2">
            Toutes les correspondances
          </p>
          <div className="space-y-1.5">
            {model.matches.map((match, index) => (
              <div key={match.id ?? index} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-4">
                  {index + 1}.
                </span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/60 rounded-full"
                    style={{ width: `${Math.round(match.similarity * 100)}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono text-muted-foreground w-8 text-right">
                  {Math.round(match.similarity * 100)}%
                </span>
                {match.actualEarningsPerHour !== null ? (
                  <span className="text-[11px] font-mono font-semibold text-foreground w-16 text-right">
                    ${formatEph(match.actualEarningsPerHour)}/h
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ContextSimilarityPanel({
  zoneId,
  similarContextSignals,
  className,
}: ContextSimilarityPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const signal = similarContextSignals.find((s) => s.zoneId === zoneId);
  const model = buildContextPanelModel(signal?.result);
  if (!model) return null;

  return (
    <div className={cn('', className)}>
      {!expanded ? (
        <CollapsedSimilaritySummary
          model={model}
          onExpand={() => setExpanded(true)}
        />
      ) : (
        <ExpandedSimilarityCard
          model={model}
          onCollapse={() => setExpanded(false)}
        />
      )}
    </div>
  );
}
