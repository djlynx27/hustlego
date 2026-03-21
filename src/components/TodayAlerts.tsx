import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/I18nContext';
import type { StmTransitStatus } from '@/hooks/useStmTransit';
import type { TimeBoost } from '@/lib/timeBoosts';
import type { YulStatus } from '@/lib/yulStatus';
import { Bell, Download, PartyPopper, WifiOff } from 'lucide-react';

interface EndingSoonEvent {
  id: string;
  name: string;
  end_at: string;
}

interface TodayAlertsProps {
  waitTimer: { zoneId: string; zoneName: string; startedAt: number } | null;
  waitDisplay: string;
  timerExpired: boolean;
  cancelTimer: () => void;
  dismissExpired: () => void;
  isOnline: boolean;
  canInstall: boolean;
  install: () => void;
  dismissInstall: () => void;
  notifEnabled: boolean;
  requestPermission: () => void;
  conservativePresence: boolean;
  holiday?: { isHoliday: boolean; name: string | null };
  cityId: string;
  habsGame?: { isHomeGame: boolean };
  yulStatus?: YulStatus | null;
  stmStatus?: StmTransitStatus | null;
  timeBoosts: TimeBoost[];
  endingSoon: EndingSoonEvent[];
  now: Date;
}

export function TodayAlerts({
  waitTimer,
  waitDisplay,
  timerExpired,
  cancelTimer,
  dismissExpired,
  isOnline,
  canInstall,
  install,
  dismissInstall,
  notifEnabled,
  requestPermission,
  conservativePresence,
  holiday,
  cityId,
  habsGame,
  yulStatus,
  stmStatus,
  timeBoosts,
  endingSoon,
  now,
}: TodayAlertsProps) {
  const { t } = useI18n();

  return (
    <div className="px-3 space-y-1.5 mt-2">
      {waitTimer && (
        <div className="flex items-center justify-between gap-2 bg-primary/15 border border-primary/40 rounded-lg px-3 py-2">
          <div>
            <span className="text-[15px] font-display font-bold text-primary tabular-nums">
              ⏱ {waitDisplay}
            </span>
            <span className="text-[12px] text-muted-foreground font-body block">
              En attente · {waitTimer.zoneName}
            </span>
          </div>
          <button
            onClick={cancelTimer}
            className="text-muted-foreground hover:text-foreground text-xl leading-none px-1"
            aria-label="Annuler le timer"
          >
            ×
          </button>
        </div>
      )}
      {timerExpired && (
        <div className="flex items-center justify-between gap-2 bg-destructive/20 border border-destructive/40 rounded-lg px-3 py-2">
          <span className="text-[14px] font-display font-bold text-destructive">
            ⏱ Temps de bouger ! Prochaine zone recommandée ↓
          </span>
          <button
            onClick={dismissExpired}
            className="text-muted-foreground hover:text-foreground text-xl leading-none px-1"
          >
            ×
          </button>
        </div>
      )}
      {!isOnline && (
        <div className="flex items-center gap-2 bg-destructive/20 border border-destructive/40 rounded-lg px-3 py-2">
          <WifiOff className="w-5 h-5 text-destructive flex-shrink-0" />
          <span className="text-[14px] font-body font-medium text-destructive">
            {t('offline')}
          </span>
        </div>
      )}
      {canInstall && (
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/40 rounded-lg px-3 py-2">
          <Download className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="flex-1 min-w-0 text-[13px] font-body text-primary font-medium">
            {t('installApp')}
          </span>
          <button
            onClick={install}
            className="bg-primary text-primary-foreground rounded-lg h-8 px-3 text-[12px] font-display font-semibold shrink-0 hover:bg-primary/90 transition-colors"
          >
            Installer
          </button>
          <button
            onClick={dismissInstall}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 shrink-0 text-lg leading-none"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
      )}
      {!notifEnabled && (
        <Button
          onClick={requestPermission}
          variant="outline"
          className="w-full gap-2 border-accent/40 text-accent-foreground hover:bg-accent/10 h-12"
        >
          <Bell className="w-5 h-5" /> {t('enableNotifications')}
        </Button>
      )}
      {notifEnabled && (
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-lg px-3 py-2">
          <Bell className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-[13px] font-body text-primary">
            {t('notificationsEnabled')}
          </span>
        </div>
      )}
      {conservativePresence && (
        <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2">
          <span className="text-lg flex-shrink-0">🎯</span>
          <span className="text-[13px] font-body text-blue-500">
            Presence prudente Lyft active: privilegie les filtres destination
            aux deplacements agressifs.
          </span>
        </div>
      )}
      {holiday?.isHoliday && holiday.name && (
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-lg px-3 py-2">
          <PartyPopper className="w-5 h-5 text-primary flex-shrink-0" />
          <span className="text-[14px] font-body font-medium text-primary">
            {holiday.name}
          </span>
        </div>
      )}
      {cityId === 'mtl' && habsGame?.isHomeGame && (
        <div className="flex items-center gap-2 bg-accent/30 border border-accent rounded-lg px-3 py-2">
          <span className="text-lg flex-shrink-0">🏒</span>
          <span className="text-[14px] font-body font-medium">
            {t('canadiensGame')}
          </span>
        </div>
      )}
      {cityId === 'mtl' &&
        yulStatus?.isActivePeriod &&
        yulStatus.currentWave && (
          <div className="flex items-center gap-2 bg-blue-500/15 border border-blue-500/40 rounded-lg px-3 py-2">
            <span className="text-lg flex-shrink-0">✈️</span>
            <span className="text-[13px] font-body font-medium text-blue-400">
              {yulStatus.currentWave.rideshareImpact}
            </span>
          </div>
        )}
      {stmStatus?.hasDisruption && (
        <div className="flex items-center gap-2 bg-orange-500/15 border border-orange-500/40 rounded-lg px-3 py-2">
          <span className="text-lg flex-shrink-0">🚇</span>
          <span className="text-[13px] font-body font-medium text-orange-400">
            Perturbation STM active — demande rideshare en hausse (
            {stmStatus.alertCount} alerte{stmStatus.alertCount > 1 ? 's' : ''})
          </span>
        </div>
      )}
      {timeBoosts.map((boost, index) => (
        <div
          key={index}
          className="flex items-center gap-2 bg-secondary border border-border rounded-lg px-3 py-2"
        >
          <span className="text-lg flex-shrink-0">{boost.icon}</span>
          <span className="text-[14px] font-body font-medium">
            {t(boost.bannerKey)}
          </span>
        </div>
      ))}
      {endingSoon.map((ev) => {
        const minsLeft = Math.round(
          (new Date(ev.end_at).getTime() - now.getTime()) / 60_000
        );
        return (
          <div
            key={ev.id}
            className="flex items-center gap-2 bg-destructive/20 border border-destructive/40 rounded-lg px-3 py-2"
          >
            <span className="text-[14px] font-body font-bold text-destructive">
              🔴 {ev.name} se termine dans {minsLeft} min – Demande maximale
              prévue !
            </span>
          </div>
        );
      })}
    </div>
  );
}
