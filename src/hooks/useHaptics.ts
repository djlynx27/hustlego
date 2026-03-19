/**
 * Haptic feedback via the Web Vibration API.
 *
 * Each pattern is semantically named so call sites are self-documenting.
 * Patterns follow the classification from Android Haptics Design:
 * - "Clear" patterns: confirmations & nav cues
 * - "Rich" patterns: multi-step feedback (success, error)
 * - "Buzzy" patterns: urgent alerts
 *
 * Returns a no-op when the browser doesn't support vibration (iOS Safari,
 * most desktops).
 */
export type HapticEvent =
  | 'newOrder' // Double pulse — get driver attention for an incoming order
  | 'accepted' // Firm single — confirm an accepted action
  | 'completed' // Ascending pattern — celebrate a completed trip/delivery
  | 'error' // Harsh double — alert for rejection or error
  | 'navigation' // Soft single — gentle navigation turn cue
  | 'warning'; // Moderate double — caution / timer running out

// VibratePattern = number | number[]
// Odd indices = vibration ms, even indices = pause ms
const PATTERNS: Record<HapticEvent, VibratePattern> = {
  newOrder: [100, 50, 100], // • • (double, medium)
  accepted: [200], // ——  (single firm)
  completed: [80, 40, 80, 40, 200], // • • —  (ascending)
  error: [300, 100, 300], // —— —— (harsh double)
  navigation: [40], // · (barely there)
  warning: [150, 80, 150], // — — (warning)
};

export interface HapticsController {
  /** Trigger a named haptic pattern */
  vibrate: (event: HapticEvent) => void;
  /** Cancel any ongoing vibration */
  stop: () => void;
  /** False on iOS Safari and desktops without vibration support */
  isSupported: boolean;
}

export function useHaptics(): HapticsController {
  const isSupported =
    typeof navigator !== 'undefined' && 'vibrate' in navigator;

  function vibrate(event: HapticEvent): void {
    if (!isSupported) return;
    navigator.vibrate(PATTERNS[event]);
  }

  function stop(): void {
    if (!isSupported) return;
    navigator.vibrate(0);
  }

  return { vibrate, stop, isSupported };
}
