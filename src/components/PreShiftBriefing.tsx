import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AppEvent } from '@/hooks/useEvents';
import type { StmTransitStatus } from '@/hooks/useStmTransit';
import type { TicketmasterEvent } from '@/hooks/useTicketmaster';
import type { WeatherData } from '@/hooks/useWeather';
import type { YulStatus } from '@/hooks/useYulFlights';
import { Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Zone {
  id: string;
  name: string;
  type: string;
  score: number;
}

interface PreShiftBriefingProps {
  /** Top 5 zones scorées */
  topZones: Zone[];
  weather: WeatherData | null;
  /** Événements DB actifs/à venir dans les 2h */
  upcomingEvents: AppEvent[];
  /** Événements Ticketmaster */
  tmEvents: TicketmasterEvent[];
  stmStatus: StmTransitStatus | null;
  yulStatus: YulStatus | null;
  cityId: string;
}

// ── Générateur de briefing textuel ───────────────────────────────────────────

function buildBriefing(props: PreShiftBriefingProps): {
  headline: string;
  bullets: string[];
  strategy: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
} {
  const {
    topZones,
    weather,
    upcomingEvents,
    tmEvents,
    stmStatus,
    yulStatus,
    cityId,
  } = props;

  const bullets: string[] = [];
  let urgencyScore = 0;

  // ── Météo ────────────────────────────────────────────────────────────────
  if (weather) {
    if (weather.demandBoostPoints >= 25) {
      bullets.push(
        `🌨️ ${weather.description} — surge météo actif (+${weather.demandBoostPoints} pts). Demande rideshare en forte hausse.`
      );
      urgencyScore += 3;
    } else if (weather.demandBoostPoints >= 10) {
      bullets.push(
        `🌧️ ${weather.description} — légère hausse de la demande (+${weather.demandBoostPoints} pts).`
      );
      urgencyScore += 1;
    } else {
      bullets.push(
        `☀️ Météo dégagée — demande normale. Cible les zones événements et commerciales.`
      );
    }

    if (weather.temp < -20) {
      bullets.push(
        `🥶 -${Math.abs(Math.round(weather.temp))}°C — vague de froid critique. Bonus surge +30-50%. Zone métro prioritaire.`
      );
      urgencyScore += 3;
    } else if (weather.temp < -10) {
      bullets.push(
        `🧊 ${Math.round(weather.temp)}°C — froid intense. Attends-toi à un boost de demande significatif.`
      );
      urgencyScore += 1;
    }
  }

  // ── Perturbation STM ─────────────────────────────────────────────────────
  if (stmStatus?.hasDisruption) {
    const n = stmStatus.alertCount;
    bullets.push(
      `🚇 ${n} alerte${n > 1 ? 's' : ''} STM active${n > 1 ? 's' : ''} — passagers bloqués cherchent un taxi/Lyft. Cible les zones métro.`
    );
    urgencyScore += 2;
  }

  // ── Aéroport YUL ─────────────────────────────────────────────────────────
  if (yulStatus?.isActivePeriod && yulStatus.currentWave && cityId === 'mtl') {
    bullets.push(
      `✈️ ${yulStatus.currentWave.label} en cours — ${yulStatus.currentWave.rideshareImpact}`
    );
    urgencyScore += 2;
  } else if (
    yulStatus?.nextWave &&
    yulStatus.minutesToNextWave !== null &&
    yulStatus.minutesToNextWave <= 45 &&
    cityId === 'mtl'
  ) {
    bullets.push(
      `✈️ Prochaine vague YUL dans ${yulStatus.minutesToNextWave} min (${yulStatus.nextWave.label}). Prépare-toi à te positionner.`
    );
    urgencyScore += 1;
  }

  // ── Événements DB ────────────────────────────────────────────────────────
  if (upcomingEvents.length > 0) {
    const biggest = upcomingEvents.reduce((a, b) =>
      a.capacity > b.capacity ? a : b
    );
    bullets.push(
      `🎫 ${biggest.name} @ ${biggest.venue} — ${biggest.capacity.toLocaleString('fr-CA')} pers. Boostera la zone dans ${biggest.boost_radius_km} km.`
    );
    urgencyScore += 2;

    if (upcomingEvents.length > 1) {
      const others = upcomingEvents
        .filter((e) => e.id !== biggest.id)
        .slice(0, 2)
        .map((e) => e.name)
        .join(', ');
      bullets.push(`📋 Autres événements actifs : ${others}.`);
    }
  }

  // ── Événements Ticketmaster ───────────────────────────────────────────────
  if (tmEvents.length > 0 && upcomingEvents.length === 0) {
    const first = tmEvents[0];
    bullets.push(
      `🎟️ TM: ${first.name} @ ${first.venueName} — surveille les sorties.`
    );
    urgencyScore += 1;
  }

  // ── Top zones ────────────────────────────────────────────────────────────
  const top3 = topZones.slice(0, 3);
  if (top3.length > 0) {
    bullets.push(
      `📍 Top 3 zones : ${top3.map((z) => `${z.name} (${z.score})`).join(' → ')}.`
    );
  }

  // ── Heure de la journée ──────────────────────────────────────────────────
  const hour = new Date().getHours();
  if (hour >= 2 && hour < 4) {
    bullets.push(
      `🍺 Fermeture des bars dans ${3 - hour}h — reste sur Crescent, St-Laurent, Village et Vieux-MTL.`
    );
    urgencyScore += 2;
  } else if (hour >= 17 && hour < 19) {
    bullets.push(
      '🚗 Heure de pointe PM — positionne-toi près des stations de métro (Berri-UQAM, McGill, Peel).'
    );
    urgencyScore += 1;
  } else if (hour >= 7 && hour < 9) {
    bullets.push(
      '☕ Commute matinal — CHUM, MUHC, Gare Centrale, YUL sont tes zones prioritaires.'
    );
  }

  // ── Urgency & Headline ───────────────────────────────────────────────────
  const urgency: 'low' | 'medium' | 'high' | 'critical' =
    urgencyScore >= 6
      ? 'critical'
      : urgencyScore >= 4
        ? 'high'
        : urgencyScore >= 2
          ? 'medium'
          : 'low';

  const bestZone = topZones[0];
  const eventName = upcomingEvents[0]?.name ?? tmEvents[0]?.name ?? null;

  const headline =
    urgency === 'critical'
      ? `🔴 Conditions exceptionnelles — surge imminent. Zone prioritaire : ${bestZone?.name ?? 'en chargement'}.`
      : urgency === 'high'
        ? `🟠 Forte demande prévue. Mise sur ${bestZone?.name ?? 'les zones événements'}.`
        : urgency === 'medium'
          ? `🟡 Opportunités présentes.${eventName ? ` ${eventName} en cours.` : ''} Zone : ${bestZone?.name ?? '–'}.`
          : `🟢 Shift tranquille. Optimise avec ${bestZone?.name ?? 'la meilleure zone disponible'}.`;

  const strategyMap: Record<string, string> = {
    critical: `Priorité absolue aux zones métro et événements. Ne quitte pas le périmètre central. Attends les pics de 15 min avant de bouger.`,
    high: `Reste mobile entre les 3 top zones. Active les alertes. Repositionne-toi 20 min avant les fins d'événements.`,
    medium: `Travaille le créneau ${topZones[0]?.name ?? 'central'} et surveille les sorties d'événements. Garde un œil sur les alertes STM.`,
    low: `Créneau calme — optimise le déadtime. Pars chercher les aéroports ou les zones résidentielles si le centre est vide.`,
  };

  return {
    headline,
    bullets,
    strategy: strategyMap[urgency],
    urgency,
  };
}

const URGENCY_STYLES: Record<string, string> = {
  critical: 'border-destructive bg-destructive/10',
  high: 'border-orange-500 bg-orange-500/10',
  medium: 'border-yellow-500 bg-yellow-500/10',
  low: 'border-primary bg-primary/5',
};

/**
 * Briefing intelligent pré-shift, généré localement à partir de toutes
 * les sources de données disponibles (météo, STM, YUL, événements, zones).
 *
 * Pas de call API — calcul déterministe, disponible offline.
 * Affiché en header de TodayScreen sous forme de carte dépliable.
 */
export function PreShiftBriefing(props: PreShiftBriefingProps) {
  const [expanded, setExpanded] = useState(false);
  const {
    cityId,
    stmStatus,
    tmEvents,
    topZones,
    upcomingEvents,
    weather,
    yulStatus,
  } = props;

  const { headline, bullets, strategy, urgency } = useMemo(
    () =>
      buildBriefing({
        cityId,
        stmStatus,
        tmEvents,
        topZones,
        upcomingEvents,
        weather,
        yulStatus,
      }),
    [cityId, stmStatus, tmEvents, topZones, upcomingEvents, weather, yulStatus]
  );

  return (
    <Card className={`border ${URGENCY_STYLES[urgency]} rounded-xl`}>
      <CardHeader className="pb-1 pt-3 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Brain className="w-4 h-4 text-primary flex-shrink-0" />
            <CardTitle className="text-[13px] font-display font-bold leading-snug">
              {headline}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 flex-shrink-0"
            onClick={() => setExpanded((e) => !e)}
            aria-label={
              expanded ? 'Réduire le briefing' : 'Voir le briefing complet'
            }
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="px-4 pb-4 pt-0 space-y-2">
          <ul className="space-y-1.5">
            {bullets.map((bullet, i) => (
              <li
                key={i}
                className="text-[12px] font-body text-muted-foreground leading-relaxed"
              >
                {bullet}
              </li>
            ))}
          </ul>
          <div className="mt-3 bg-muted/50 rounded-lg px-3 py-2">
            <p className="text-[12px] font-display font-semibold text-foreground">
              🧠 Stratégie
            </p>
            <p className="text-[12px] font-body text-muted-foreground mt-0.5 leading-relaxed">
              {strategy}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
