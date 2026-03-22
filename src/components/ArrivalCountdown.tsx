import { Button } from '@/components/ui/button';
import { Navigation, X } from 'lucide-react';

interface ArrivalCountdownProps {
  arrivedZoneName: string;
  nextZoneName: string | null;
  secondsRemaining: number;
  onCancel: () => void;
  onLaunchNow: () => void;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Floating overlay displayed when the driver has arrived at the suggested
 * zone. Shows a 15-minute countdown then auto-launches Google Maps to the
 * next best zone. The driver can skip forward or cancel at any time.
 */
export function ArrivalCountdown({
  arrivedZoneName,
  nextZoneName,
  secondsRemaining,
  onCancel,
  onLaunchNow,
}: ArrivalCountdownProps) {
  const progress = secondsRemaining / (15 * 60); // 1.0 → 0.0

  return (
    <div className="fixed inset-x-4 bottom-32 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card border border-primary/40 rounded-2xl px-5 py-4 shadow-2xl space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[12px] font-body text-muted-foreground uppercase tracking-wide">
              Arrivé à
            </p>
            <p className="text-[18px] font-display font-bold leading-tight">
              {arrivedZoneName}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground mt-0.5 p-1 rounded-lg hover:bg-muted transition-colors"
            aria-label="Annuler le décompte"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Countdown */}
        <div className="text-center space-y-1">
          <p className="text-[13px] font-body text-muted-foreground">
            Prochaine navigation dans
          </p>
          <p className="text-[42px] font-display font-bold text-primary tabular-nums leading-none">
            {formatTime(secondsRemaining)}
          </p>
          {nextZoneName && (
            <p className="text-[13px] font-body text-muted-foreground">
              {'→ '}
              <span className="font-semibold text-foreground">{nextZoneName}</span>
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>

        {/* Action button */}
        <Button className="w-full gap-2 font-display font-bold" onClick={onLaunchNow}>
          <Navigation className="w-4 h-4" />
          Naviguer maintenant
        </Button>
      </div>
    </div>
  );
}
