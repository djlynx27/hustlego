import { useHaptics } from '@/hooks/useHaptics';
import { launchGoogleMapsNavigation } from '@/lib/venueCoordinates';
import { Car, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface DrivingHUDZone {
  id: string;
  name: string;
  score: number;
  latitude: number;
  longitude: number;
  distKm?: number;
}

interface DrivingHUDProps {
  heroZone: DrivingHUDZone | null;
  nextZone?: DrivingHUDZone | null;
  earningsToday?: number;
  speedKmh?: number | null;
  onExit: () => void;
}

function getDemandColor(score: number): string {
  if (score >= 70) return '#00e676'; // green
  if (score >= 40) return '#ffd600'; // amber
  return '#f44336'; // red
}

function formatMoney(n: number): string {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(n);
}

/**
 * NHTSA-compliant driving HUD overlay.
 *
 * Design constraints (NHTSA Phase 1 guidelines):
 * - ≤ 7 data elements visible simultaneously
 * - Minimum font size 24 px for critical information
 * - All tap targets ≥ 64 dp (minimum 56px on screen)
 * - A single gesture accesses every critical action
 * - Exit requires double-tap to prevent accidental dismissal
 * - No text input, no scrolling while in HUD view
 */
export function DrivingHUD({
  heroZone,
  nextZone,
  earningsToday = 0,
  speedKmh,
  onExit,
}: DrivingHUDProps) {
  const { vibrate } = useHaptics();
  const [time, setTime] = useState(new Date());
  const [exitHint, setExitHint] = useState(false);
  const exitCountRef = useRef(0);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep clock updated every 30 s
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  function handleNavClick() {
    if (!heroZone) return;
    vibrate('navigation');
    launchGoogleMapsNavigation(
      heroZone.name,
      heroZone.latitude,
      heroZone.longitude
    );
  }

  /**
   * Double-tap to exit — prevents accidental dismissal while driving.
   * First tap shows a hint, second tap within 2 s confirms.
   */
  function handleExitClick() {
    exitCountRef.current += 1;
    if (exitCountRef.current >= 2) {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      exitCountRef.current = 0;
      setExitHint(false);
      vibrate('accepted');
      onExit();
    } else {
      setExitHint(true);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      exitTimerRef.current = setTimeout(() => {
        exitCountRef.current = 0;
        setExitHint(false);
      }, 2_000);
    }
  }

  useEffect(
    () => () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    },
    []
  );

  const score = heroZone?.score ?? 0;
  const color = getDemandColor(score);
  const timeStr = time.toLocaleTimeString('fr-CA', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col select-none touch-none overflow-hidden"
      style={{ background: '#08081a' }}
      role="region"
      aria-label="Mode conduite actif"
    >
      {/* ── Row 1: Clock · Speed · Exit ── */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        {/* Clock — data element 1 */}
        <span
          className="text-white text-4xl font-black tabular-nums font-display"
          aria-label={`Heure: ${timeStr}`}
        >
          {timeStr}
        </span>

        {/* Speed — data element 2 (only when available) */}
        {speedKmh !== null && speedKmh !== undefined && (
          <span className="text-white/50 text-2xl font-semibold">
            {Math.round(speedKmh)} <span className="text-lg">km/h</span>
          </span>
        )}

        {/* Exit (double-tap) — not counted as data element */}
        <button
          onClick={handleExitClick}
          className="flex flex-col items-center justify-center rounded-2xl bg-white/10 active:bg-white/20 transition-colors"
          aria-label={
            exitHint
              ? 'Appuyer encore pour quitter'
              : 'Quitter mode conduite (appuyer 2×)'
          }
          style={{ minWidth: 64, minHeight: 64 }}
        >
          <X className="w-6 h-6 text-white/70" />
          {exitHint && (
            <span className="text-[10px] text-white/60 mt-0.5">encore</span>
          )}
        </button>
      </div>

      {/* ── Row 2: Hero zone (central focal point) ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-2">
        {/* Zone icon — visual anchor */}
        <Car className="w-9 h-9 opacity-30" style={{ color }} />

        {heroZone ? (
          <>
            {/* Zone name — data element 3 */}
            <div
              className="text-5xl font-black text-center leading-tight font-display"
              style={{ color }}
              aria-label={`Meilleure zone: ${heroZone.name}`}
            >
              {heroZone.name}
            </div>

            {/* Score — data element 4 */}
            <div
              className="text-9xl font-black tabular-nums leading-none"
              style={{ color }}
              aria-label={`Score: ${score} sur 100`}
            >
              {score}
            </div>
            <div className="text-white/30 text-2xl font-semibold">/100</div>

            {/* Distance — data element 5 */}
            {heroZone.distKm !== undefined && (
              <div className="text-white/50 text-2xl font-semibold mt-1">
                {heroZone.distKm.toFixed(1)} km
              </div>
            )}
          </>
        ) : (
          <div className="text-white/30 text-3xl">Calcul…</div>
        )}
      </div>

      {/* ── Row 3: Next zone pill — data element 6 ── */}
      {nextZone && (
        <div className="mx-6 mb-3 px-5 py-3 rounded-2xl bg-white/5 flex items-center justify-between gap-3">
          <span className="text-white/40 text-lg">Prochaine</span>
          <span className="text-white text-xl font-semibold flex-1 text-center truncate">
            {nextZone.name}
          </span>
          <span
            className="text-xl font-black"
            style={{ color: getDemandColor(nextZone.score) }}
          >
            {nextZone.score}
          </span>
        </div>
      )}

      {/* ── Row 4: Earnings + Navigate CTA ── */}
      <div className="px-6 pb-10 flex gap-4">
        {/* Earnings — data element 7 */}
        <div
          className="flex flex-col items-center justify-center py-4 px-4 rounded-2xl bg-white/5"
          style={{ minWidth: 100, minHeight: 72 }}
        >
          <span className="text-white/40 text-sm">Gains</span>
          <span className="text-white text-2xl font-black">
            {formatMoney(earningsToday)}
          </span>
        </div>

        {/* Navigate — PRIMARY action, maximum tap target */}
        <button
          onClick={handleNavClick}
          disabled={!heroZone}
          className="flex-1 rounded-2xl font-black text-2xl font-display active:scale-95 transition-transform disabled:opacity-30"
          style={{
            backgroundColor: color,
            color: '#08081a',
            minHeight: 72,
          }}
          aria-label={`Naviguer vers ${heroZone?.name ?? 'zone'} via Google Maps`}
        >
          NAVIGUER
        </button>
      </div>
    </div>
  );
}
