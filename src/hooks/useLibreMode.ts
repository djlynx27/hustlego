/**
 * useLibreMode — "Je suis libre" state machine
 *
 * Extracted from TodayScreen per SRP (ISO 25010 Maintainability).
 * Manages:
 * - libreMode (driver free vs occupied)
 * - 15-min wait timer with second-precision countdown
 * - push notification when timer expires
 * - auto-selected zone and reason from pickBestDestination
 */
import { useCallback, useEffect, useRef, useState } from 'react';

const WAIT_DURATION_MS = 15 * 60 * 1000;

export interface LibreModeZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface UseLibreModeReturn {
  libreMode: boolean;
  waitTimer: { zoneId: string; zoneName: string; startedAt: number } | null;
  timerExpired: boolean;
  waitDisplay: string;
  autoSelectedZone: LibreModeZone | null;
  autoNavReason: 'proche' | 'score' | null;
  startWaitAt: (zone: LibreModeZone) => void;
  cancelTimer: () => void;
  dismissExpired: () => void;
  toggleLibre: (params: {
    smartZones: LibreModeZone[];
    onActivate: (zone: LibreModeZone) => void;
  }) => void;
  nextSmartZoneRef: React.RefObject<LibreModeZone | null>;
}

export function useLibreMode(): UseLibreModeReturn {
  const [libreMode, setLibreMode] = useState(false);
  const [waitTimer, setWaitTimer] = useState<{
    zoneId: string;
    zoneName: string;
    startedAt: number;
  } | null>(null);
  const [timerExpired, setTimerExpired] = useState(false);
  const [nowTick, setNowTick] = useState(Date.now());
  const [autoSelectedZone, setAutoSelectedZone] =
    useState<LibreModeZone | null>(null);
  const [autoNavReason, setAutoNavReason] = useState<
    'proche' | 'score' | null
  >(null);

  // Ref so the timer effect can access the latest smart zones without dep issues
  const nextSmartZoneRef = useRef<LibreModeZone | null>(null);

  // 1-second tick — only when a timer is active
  useEffect(() => {
    if (!waitTimer) return;
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, [waitTimer]);

  // Timer completion — fires push notification when 15 min elapses
  useEffect(() => {
    if (!waitTimer) return;
    const remaining = WAIT_DURATION_MS - (Date.now() - waitTimer.startedAt);
    if (remaining <= 0) {
      setTimerExpired(true);
      setWaitTimer(null);
      return;
    }
    const timeoutId = setTimeout(() => {
      setTimerExpired(true);
      setWaitTimer(null);
      const next = nextSmartZoneRef.current;
      if (Notification.permission === 'granted') {
        navigator.serviceWorker?.ready
          .then((reg) =>
            reg.showNotification('⏱ Temps de bouger !', {
              body: `Dirige-toi vers ${next?.name ?? 'la prochaine zone'}.`,
              icon: '/pwa-icon-192.png',
              tag: 'wait-timer',
              renotify: true,
            } as NotificationOptions)
          )
          .catch(() => {
            try {
              new Notification('⏱ Temps de bouger !', {
                body: 'Déplace-toi vers la prochaine zone.',
                icon: '/pwa-icon-192.png',
              });
            } catch {
              // Notification API unavailable — silent failure.
            }
          });
      }
    }, remaining);
    return () => clearTimeout(timeoutId);
  }, [waitTimer]);

  const waitRemainingMs = waitTimer
    ? Math.max(0, WAIT_DURATION_MS - (nowTick - waitTimer.startedAt))
    : 0;
  const waitMin = Math.floor(waitRemainingMs / 60000);
  const waitSec = Math.floor((waitRemainingMs % 60000) / 1000);
  const waitDisplay = `${waitMin}:${String(waitSec).padStart(2, '0')}`;

  const startWaitAt = useCallback((zone: LibreModeZone) => {
    setWaitTimer({ zoneId: zone.id, zoneName: zone.name, startedAt: Date.now() });
    setTimerExpired(false);
  }, []);

  const cancelTimer = useCallback(() => setWaitTimer(null), []);

  const dismissExpired = useCallback(() => setTimerExpired(false), []);

  const toggleLibre = useCallback(
    ({
      smartZones,
      onActivate,
    }: {
      smartZones: LibreModeZone[];
      onActivate: (zone: LibreModeZone) => void;
    }) => {
      setLibreMode((prev) => {
        if (!prev) {
          // Activating: pick best zone
          const picked = pickBest(smartZones);
          setAutoSelectedZone(picked?.zone ?? null);
          setAutoNavReason(picked?.reason ?? null);
          if (picked) onActivate(picked.zone);
        } else {
          setAutoSelectedZone(null);
          setAutoNavReason(null);
        }
        return !prev;
      });
      setWaitTimer(null);
      setTimerExpired(false);
    },
    []
  );

  return {
    libreMode,
    waitTimer,
    timerExpired,
    waitDisplay,
    autoSelectedZone,
    autoNavReason,
    startWaitAt,
    cancelTimer,
    dismissExpired,
    toggleLibre,
    nextSmartZoneRef,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface ScoredZone extends LibreModeZone {
  distKm: number;
  arrivalScore: number;
}

function pickBest(
  zones: LibreModeZone[]
): { zone: LibreModeZone; reason: 'proche' | 'score' } | null {
  // Filter airport zones — never auto-navigate there
  const navZones = (zones as ScoredZone[]).filter(
    (z) => !('type' in z) || (z as { type?: string }).type !== 'aéroport'
  );
  if (navZones.length === 0) return null;

  const bestScore = navZones[0]; // already sorted by arrivalScore desc
  const closest = [...navZones].sort((a, b) => a.distKm - b.distKm)[0];
  if (!bestScore || !closest) return null;
  if (closest.id === bestScore.id)
    return { zone: closest, reason: 'proche' };

  // Prefer farther zone only when the score gap is large AND the closer zone is weak
  if (
    bestScore.arrivalScore - closest.arrivalScore >= 20 &&
    closest.arrivalScore < 62
  ) {
    return { zone: bestScore, reason: 'score' };
  }
  return { zone: closest, reason: 'proche' };
}
