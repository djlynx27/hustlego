import { useActivityDetection } from '@/hooks/useActivityDetection';
import { AlertTriangle, Pause, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';

const LS_KEY = 'geohustle_dead_time';

interface DeadTimeState {
  startedAt: number | null;
  accumulated: number; // ms accumulated before current session
  paused: boolean;
}

function loadState(): DeadTimeState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as DeadTimeState;
  } catch {
    // localStorage unavailable; fall back to default timer state.
  }
  return { startedAt: Date.now(), accumulated: 0, paused: false };
}

function saveState(s: DeadTimeState) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(s));
  } catch {
    // ignore storage errors
  }
}

function getTimerAppearance(paused: boolean, warning: boolean) {
  if (paused) {
    return {
      containerClass: 'bg-muted/30 border-border',
      icon: <Pause className="w-4 h-4 text-muted-foreground" />,
      label: 'Temps mort (en pause)',
      valueClass: 'text-foreground',
    };
  }

  if (warning) {
    return {
      containerClass: 'bg-yellow-500/15 border-yellow-500/40',
      icon: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
      label: 'Temps mort',
      valueClass: 'text-yellow-500',
    };
  }

  return {
    containerClass: 'bg-card border-border',
    icon: <Timer className="w-4 h-4 text-muted-foreground" />,
    label: 'Temps mort',
    valueClass: 'text-foreground',
  };
}

interface Props {
  nearestZoneName?: string | null;
}

export function DeadTimeTimer({ nearestZoneName }: Props) {
  const [state, setState] = useState<DeadTimeState>(loadState);
  const [elapsed, setElapsed] = useState(0);
  const { activity } = useActivityDetection();

  // Persist state to localStorage on every change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Listen for trip start/end events
  useEffect(() => {
    function onTripStart() {
      setState((prev) => {
        const now = Date.now();
        const totalAccum =
          prev.accumulated +
          (prev.startedAt && !prev.paused ? now - prev.startedAt : 0);
        const next = { startedAt: null, accumulated: totalAccum, paused: true };
        saveState(next);
        return next;
      });
    }
    function onTripEnd() {
      setState(() => {
        const next: DeadTimeState = {
          startedAt: Date.now(),
          accumulated: 0,
          paused: false,
        };
        saveState(next);
        return next;
      });
    }
    window.addEventListener('trip-start', onTripStart);
    window.addEventListener('trip-end', onTripEnd);
    return () => {
      window.removeEventListener('trip-start', onTripStart);
      window.removeEventListener('trip-end', onTripEnd);
    };
  }, []);

  // Pause or resume timer based on detected activity
  useEffect(() => {
    if (activity === 'walking' || activity === 'in_vehicle') {
      // Pause timer if user is moving
      setState((prev) => {
        if (prev.paused) return prev;
        const now = Date.now();
        const totalAccum =
          prev.accumulated +
          (prev.startedAt && !prev.paused ? now - prev.startedAt : 0);
        const next = { startedAt: null, accumulated: totalAccum, paused: true };
        saveState(next);
        return next;
      });
    } else if (activity === 'stationary' || activity === 'unknown') {
      // Resume timer if user is stationary or unknown
      setState((prev) => {
        if (!prev.paused) return prev;
        const next = {
          startedAt: Date.now(),
          accumulated: prev.accumulated,
          paused: false,
        };
        saveState(next);
        return next;
      });
    }
  }, [activity]);

  // Tick every second
  useEffect(() => {
    if (state.paused) {
      setElapsed(state.accumulated);
      return;
    }
    const tick = () => {
      const now = Date.now();
      const total =
        state.accumulated + (state.startedAt ? now - state.startedAt : 0);
      setElapsed(total);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [state]);

  const seconds = Math.floor(elapsed / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const display = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const isWarning = mins >= 10;
  const appearance = getTimerAppearance(state.paused, isWarning);

  return (
    <div className={`rounded-xl border px-4 py-3 ${appearance.containerClass}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {appearance.icon}
          <span className="text-[14px] font-body text-muted-foreground">
            {appearance.label}
          </span>
        </div>
        <span
          className={`text-[24px] font-display font-bold tabular-nums ${appearance.valueClass}`}
        >
          {display}
        </span>
      </div>
      {isWarning && !state.paused && nearestZoneName && (
        <p className="text-[13px] text-yellow-500 font-body mt-1">
          ⚠️ +10 min d'inactivité — Dirige-toi vers {nearestZoneName}
        </p>
      )}
    </div>
  );
}
