/**
 * SurgeIndicator — HustleGo
 *
 * Affiche une pastille / badge de surge coloré avec animation pulse.
 * Utilisé dans les cartes zone (TodayScreen, mode libre, AdminScreen).
 *
 * Props:
 *   surgeClass   — 'normal' | 'elevated' | 'high' | 'peak'
 *   multiplier   — ex: 1.85
 *   boostPct     — ex: 85  (%)
 *   size         — 'sm' | 'md' | 'lg'
 *   showLabel    — affiche le label texte (défaut: true)
 *   showMultiplier — affiche le ×X.X (défaut: true)
 */

import { getSurgeDisplay, type SurgeResult } from '@/lib/surgeEngine';

interface SurgeIndicatorProps {
  surgeClass: SurgeResult['surgeClass'];
  multiplier: number;
  boostPct?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showMultiplier?: boolean;
  reasoning?: string;
}

const SIZE_STYLES = {
  sm: 'text-[10px] px-1.5 py-0.5 gap-0.5',
  md: 'text-[12px] px-2 py-1 gap-1',
  lg: 'text-[14px] px-3 py-1.5 gap-1.5',
};

export function SurgeIndicator({
  surgeClass,
  multiplier,
  boostPct,
  size = 'md',
  showLabel = true,
  showMultiplier = true,
  reasoning,
}: SurgeIndicatorProps) {
  if (surgeClass === 'normal') return null;

  const display = getSurgeDisplay(surgeClass);
  const sizeStyle = SIZE_STYLES[size];
  const isPulsing = surgeClass === 'peak' || surgeClass === 'high';

  return (
    <span
      title={reasoning}
      className={`inline-flex items-center rounded-full border font-display font-bold
        ${display.bgClass} ${display.textClass} ${display.borderClass}
        ${isPulsing ? 'animate-pulse' : ''}
        ${sizeStyle}
      `}
    >
      {showLabel && <span>{display.label}</span>}
      {showMultiplier && (
        <span className="tabular-nums">×{multiplier.toFixed(2)}</span>
      )}
      {boostPct !== undefined && boostPct > 0 && (
        <span className="text-[0.85em] opacity-80">+{boostPct}%</span>
      )}
    </span>
  );
}

/**
 * SurgeBar — barre inline fine sous le nom de zone.
 * Utilisée dans le mode libre (liste compacte de zones smart).
 */
export function SurgeBar({
  surgeClass,
  multiplier,
}: {
  surgeClass: SurgeResult['surgeClass'];
  multiplier: number;
}) {
  if (surgeClass === 'normal') return null;

  const fillPct = Math.min(100, Math.round(((multiplier - 1.0) / 1.5) * 100));

  return (
    <div className="mt-1 h-1 w-full rounded-full bg-border overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          surgeClass === 'peak'
            ? 'bg-red-500 animate-pulse'
            : surgeClass === 'high'
              ? 'bg-orange-500'
              : 'bg-yellow-500'
        }`}
        style={{ width: `${fillPct}%` }}
      />
    </div>
  );
}
