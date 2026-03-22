/**
 * AutoShiftMonitor — composant sans rendering qui active useAutoShift
 * globalement (monté dans App.tsx pour couvrir toutes les pages).
 */
import { useAutoShift } from '@/hooks/useAutoShift';

export function AutoShiftMonitor() {
  useAutoShift();
  return null;
}
