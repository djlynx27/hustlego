import { CitySelect } from '@/components/CitySelect';
import { ContextSimilarityPanel } from '@/components/ContextSimilarityPanel';
import { DeadTimeTimer } from '@/components/DeadTimeTimer';
import { DemandBadge } from '@/components/DemandBadge';
import { FamilySchedulePanel } from '@/components/FamilySchedulePanel';
import { MultiAppStatus } from '@/components/MultiAppStatus';
import { GoogleMapsIcon, WazeIcon } from '@/components/NavIcons';
import { NavigationSheet } from '@/components/NavigationSheet';
import { NetProfitWidget } from '@/components/NetProfitWidget';
import { PlatformArbitrage } from '@/components/PlatformArbitrage';
import { PreShiftBriefing } from '@/components/PreShiftBriefing';
import { ScoreFactorIcons } from '@/components/ScoreFactorIcons';
import { SurgeBar, SurgeIndicator } from '@/components/SurgeIndicator';
import { SwipeToAccept } from '@/components/SwipeToAccept';
import { Button } from '@/components/ui/button';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { WeatherWidget } from '@/components/WeatherWidget';
import { WeeklyGoalDisplay } from '@/components/WeeklyGoal';
import { useI18n } from '@/contexts/I18nContext';
import { useActivityDetection } from '@/hooks/useActivityDetection';
import { useAntiDeadhead } from '@/hooks/useAntiDeadhead';
import { useAutoCity } from '@/hooks/useAutoCity';
import { useCityId } from '@/hooks/useCityId';
import { useDemandScores } from '@/hooks/useDemandScores';
import { useHabsGame } from '@/hooks/useHabsGame';
import { useHaptics } from '@/hooks/useHaptics';
import { useHoliday } from '@/hooks/useHoliday';
import { useHomeConstraints } from '@/hooks/useHomeConstraints';
import { useNotifications } from '@/hooks/useNotifications';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { useCities } from '@/hooks/useSupabase';
import { haversineKm, useUserLocation } from '@/hooks/useUserLocation';
import { useWeather } from '@/hooks/useWeather';
import { useYulFlights } from '@/hooks/useYulFlights';
import {
  formatTime24h,
  getCurrentSlotTime,
  getDemandClass,
} from '@/lib/demandUtils';
import {
  getConservativePresencePreference,
  getDriverFingerprint,
  getStoredDriverMode,
  setConservativePresencePreference,
  setStoredDriverMode,
} from '@/lib/driverPreferences';
import { recordUserPing } from '@/lib/learningSync';
import { computeSuccessProbabilityScore } from '@/lib/lyftStrategy';
import { computeDemandScore, type WeatherCondition } from '@/lib/scoringEngine';
import { getActiveTimeBoosts } from '@/lib/timeBoosts';
import {
  getGoogleMapsNavUrl,
  getWazeNavUrl,
  launchGoogleMapsNavigation,
} from '@/lib/venueCoordinates';
import {
  ArrowRight,
  Bell,
  Car,
  Clock,
  Download,
  PartyPopper,
  Timer,
  WifiOff,
} from 'lucide-react';
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
const MapboxHeatmap = lazy(() => import('@/components/MapboxHeatmap'));

const CITY_CENTERS: Record<string, [number, number]> = {
  mtl: [45.5017, -73.5673],
  lvl: [45.5503, -73.7006],
  lng: [45.5252, -73.5205],
};

function getCityCenter(cityId: string): [number, number] {
  return CITY_CENTERS[cityId] ?? CITY_CENTERS.mtl ?? [45.5017, -73.5673];
}

// Score multipliers by zone type, depending on driver mode
const RIDESHARE_BOOST: Record<string, number> = {
  tourisme: 1.3,
  événements: 1.25,
  nightlife: 1.25,
  aéroport: 1.2,
  université: 1.15,
  transport: 1.1,
  commercial: 1.05,
  médical: 1.05,
  métro: 1.05,
  résidentiel: 0.75,
};
const DELIVERY_BOOST: Record<string, number> = {
  commercial: 1.3,
  résidentiel: 1.2,
  métro: 0.95,
  transport: 0.85,
  université: 0.8,
  médical: 0.75,
  tourisme: 0.75,
  nightlife: 0.7,
  événements: 0.7,
  aéroport: 0.65,
};

function formatMoney(value: number) {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(value);
}

type SmartZone = {
  id: string;
  name: string;
  type: string;
  score: number;
  distKm: number;
  travelMin: number;
  arrivalScore: number;
  arrivalTime: string;
  latitude: number;
  longitude: number;
};

/**
 * Picks the best destination when the driver goes libre.
 * Default: closest non-airport zone.
 * Override: highest-score zone when the score gap ≥ 20 pts
 *           AND the closer zone's score < 62.
 * Airport zones are NEVER auto-selected for navigation.
 */
function pickBestDestination(
  zones: SmartZone[]
): { zone: SmartZone; reason: 'proche' | 'score' } | null {
  const navZones = zones.filter((z) => z.type !== 'aéroport');
  if (navZones.length === 0) return null;
  // zones is already sorted by arrivalScore desc → navZones[0] is the best scorer
  const bestScore = navZones[0];
  const closest = [...navZones].sort((a, b) => a.distKm - b.distKm)[0];
  if (!bestScore || !closest) return null;
  if (closest.id === bestScore.id) return { zone: closest, reason: 'proche' };
  // Override to farther zone only when gap is significant AND closer zone is weak
  if (
    bestScore.arrivalScore - closest.arrivalScore >= 20 &&
    closest.arrivalScore < 62
  ) {
    return { zone: bestScore, reason: 'score' };
  }
  return { zone: closest, reason: 'proche' };
}

export default function TodayScreen() {
  usePullToRefresh(() => window.location.reload());
  const { t } = useI18n();
  const [cityId, setCityId] = useCityId();
  const [now, setNow] = useState(new Date());
  const { canInstall, install, dismiss: dismissInstall } = usePwaInstall();
  const isOnline = useOnlineStatus();
  const { location: userLocation } = useUserLocation();
  const [conservativePresence, setConservativePresence] = useState(() =>
    getConservativePresencePreference()
  );
  const { enabled: notifEnabled, requestPermission } = useNotifications(
    cityId,
    {
      conservativePresence,
    }
  );
  useAutoCity(setCityId, userLocation?.latitude, userLocation?.longitude);
  const [navZone, setNavZone] = useState<{
    name: string;
    lat: number;
    lng: number;
  } | null>(null);
  const driverFingerprint = useMemo(() => getDriverFingerprint(), []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  const { start, end } = getCurrentSlotTime(now);
  const { data: cities = [] } = useCities();
  const {
    scores,
    factors,
    zones,
    endingSoon,
    activeEvents,
    relevantTmEvents,
    stmStatus,
    surgeMap,
    similarContextSignals,
    lyftSignalByZone,
  } = useDemandScores(cityId, {
    currentLat: userLocation?.latitude ?? null,
    currentLng: userLocation?.longitude ?? null,
    conservativePresence,
  });
  const { data: holiday } = useHoliday(getCurrentSlotTime(now).date);
  const { data: habsGame } = useHabsGame(getCurrentSlotTime(now).date);
  const timeBoosts = useMemo(() => getActiveTimeBoosts(now), [now]);
  const { data: yulStatus } = useYulFlights();

  // ── Family schedule constraints ────────────────────────────────────
  const homeConstraints = useHomeConstraints(
    userLocation?.latitude ?? null,
    userLocation?.longitude ?? null,
    now
  );

  // ── Compass UX additions ───────────────────────────────────────────
  const { isInVehicle, speedKmh } = useActivityDetection();
  const { vibrate } = useHaptics();

  // Haptic feedback when the top zone changes (new demand opportunity)
  const prevHeroIdRef = useRef<string | null>(null);

  const [driverMode, setDriverModeState] = useState<
    'rideshare' | 'delivery' | 'all'
  >(() => getStoredDriverMode());
  const setDriverMode = (mode: 'rideshare' | 'delivery' | 'all') => {
    setDriverModeState(mode);
    setStoredDriverMode(mode);
  };

  // ── "Je suis libre" mode ───────────────────────────────────────────
  const [libreMode, setLibreMode] = useState(false);
  const [waitTimer, setWaitTimer] = useState<{
    zoneId: string;
    zoneName: string;
    startedAt: number;
  } | null>(null);
  const [timerExpired, setTimerExpired] = useState(false);
  const [nowTick, setNowTick] = useState(Date.now());
  const [autoSelectedZone, setAutoSelectedZone] = useState<SmartZone | null>(
    null
  );
  const [autoNavReason, setAutoNavReason] = useState<'proche' | 'score' | null>(
    null
  );

  // Second-precision tick when timer is active
  useEffect(() => {
    if (!waitTimer) return;
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, [waitTimer]);

  const WAIT_DURATION_MS = 15 * 60 * 1000;
  const waitRemainingMs = waitTimer
    ? Math.max(0, WAIT_DURATION_MS - (nowTick - waitTimer.startedAt))
    : 0;
  const waitMin = Math.floor(waitRemainingMs / 60000);
  const waitSec = Math.floor((waitRemainingMs % 60000) / 1000);
  const waitDisplay = `${waitMin}:${String(waitSec).padStart(2, '0')}`;

  // 15-min timer completion
  const smartZonesRef = useRef<SmartZone[]>([]);
  useEffect(() => {
    if (!waitTimer) return;
    const remaining = WAIT_DURATION_MS - (Date.now() - waitTimer.startedAt);
    if (remaining <= 0) {
      setTimerExpired(true);
      setWaitTimer(null);
      return;
    }
    const t = setTimeout(() => {
      setTimerExpired(true);
      setWaitTimer(null);
      const next = smartZonesRef.current[0];
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
              // Notification API unavailable; no fallback notification.
            }
          });
      }
    }, remaining);
    return () => clearTimeout(t);
  }, [WAIT_DURATION_MS, waitTimer]);

  const { data: weather } = useWeather(cityId);
  const AVG_SPEED_KMH = 30;

  const rememberUserPreference = useCallback(
    (
      zone: {
        id: string;
        name: string;
        type: string;
        score: number;
        latitude: number;
        longitude: number;
        distKm?: number;
      },
      source: string
    ) => {
      const distanceKm =
        zone.distKm ??
        (userLocation
          ? haversineKm(
              userLocation.latitude,
              userLocation.longitude,
              zone.latitude,
              zone.longitude
            )
          : null);

      void recordUserPing(driverFingerprint, {
        zoneId: zone.id,
        zoneType: zone.type,
        currentScore: zone.score,
        now,
        weatherDemandBoostPoints: weather?.demandBoostPoints,
        distanceKm,
        lyftDemandLevel: lyftSignalByZone.get(zone.id)?.demandLevel,
        estimatedWaitMin: lyftSignalByZone.get(zone.id)?.estimatedWaitMin,
        conservativePresence,
        successScore: 1,
        metadata: {
          source,
          zoneName: zone.name,
          driverMode,
        },
      });
    },
    [
      conservativePresence,
      driverFingerprint,
      driverMode,
      lyftSignalByZone,
      now,
      userLocation,
      weather?.demandBoostPoints,
    ]
  );

  // Ranked zones by score descending
  const rankedZones = useMemo(() => {
    return zones
      .map((z) => ({ ...z, score: scores.get(z.id) ?? 0 }))
      .sort((a, b) => b.score - a.score);
  }, [zones, scores]);

  // Reweight scores based on driver objective (personnes / livraison / les deux)
  const modeZones = useMemo(() => {
    if (driverMode === 'all') return rankedZones;
    const boostMap =
      driverMode === 'rideshare' ? RIDESHARE_BOOST : DELIVERY_BOOST;
    return [...rankedZones]
      .map((z) => ({
        ...z,
        score: Math.min(Math.round(z.score * (boostMap[z.type] ?? 1.0)), 100),
      }))
      .sort((a, b) => b.score - a.score);
  }, [rankedZones, driverMode]);

  // Smart zones: scored at ARRIVAL time considering travel
  const smartZones = useMemo(() => {
    if (!userLocation) return [];
    const weatherCond: WeatherCondition | null = weather
      ? {
          weatherId: weather.weatherId,
          temp: weather.temp,
          demandBoostPoints: weather.demandBoostPoints,
        }
      : null;
    return modeZones
      .map((z) => {
        const distKm = haversineKm(
          userLocation.latitude,
          userLocation.longitude,
          z.latitude,
          z.longitude
        );
        const travelMin = Math.round((distKm / AVG_SPEED_KMH) * 60);
        const arrivalDate = new Date(now.getTime() + travelMin * 60_000);
        const { score: arrivalDemandScore } = computeDemandScore(
          z,
          arrivalDate,
          weatherCond
        );
        const arrivalScore = computeSuccessProbabilityScore({
          demandContextScore: arrivalDemandScore,
          distanceKm: distKm,
          demandLevel: lyftSignalByZone.get(z.id)?.demandLevel,
          estimatedWaitMin: lyftSignalByZone.get(z.id)?.estimatedWaitMin,
          surgeActive: lyftSignalByZone.get(z.id)?.surgeActive,
        }).score;
        return {
          ...z,
          distKm,
          travelMin,
          arrivalScore,
          arrivalTime: formatTime24h(arrivalDate),
        };
      })
      .filter((z) => z.distKm <= 20 && z.arrivalScore >= 45)
      .sort((a, b) => b.arrivalScore - a.arrivalScore)
      .slice(0, 5);
  }, [lyftSignalByZone, modeZones, now, userLocation, weather]);

  // Keep ref in sync for the timer callback
  useEffect(() => {
    smartZonesRef.current = smartZones;
  }, [smartZones]);

  const startWaitAt = useCallback((zone: (typeof smartZones)[0]) => {
    setWaitTimer({
      zoneId: zone.id,
      zoneName: zone.name,
      startedAt: Date.now(),
    });
    setTimerExpired(false);
  }, []);

  const heroZone = modeZones[0] ?? null;
  const heroFactors = heroZone ? factors.get(heroZone.id) : undefined;
  const nextZones = modeZones.slice(1, 4);

  const getDistance = (zone: (typeof modeZones)[number] | null) => {
    if (!userLocation || !zone) return null;
    return haversineKm(
      userLocation.latitude,
      userLocation.longitude,
      zone.latitude,
      zone.longitude
    );
  };

  const heroDistance = getDistance(heroZone);

  // Haptic alert when the top zone changes (new best opportunity)
  useEffect(() => {
    if (heroZone && heroZone.id !== prevHeroIdRef.current) {
      if (prevHeroIdRef.current !== null) vibrate('newOrder');
      prevHeroIdRef.current = heroZone.id;
    }
  }, [heroZone, vibrate]);

  // Anti-deadhead: suggest repositioning when in a low-demand zone
  const currentZoneId = useMemo(() => {
    if (!userLocation) return null;
    let closest: string | null = null;
    let minDist = Infinity;
    for (const z of zones) {
      const d = haversineKm(
        userLocation.latitude,
        userLocation.longitude,
        z.latitude,
        z.longitude
      );
      if (d < minDist) {
        minDist = d;
        closest = z.id;
      }
    }
    return minDist < 1.5 ? closest : null; // only claim zone if within 1.5 km
  }, [userLocation, zones]);

  const deadheadSuggestion = useAntiDeadhead({
    currentLat: userLocation?.latitude ?? null,
    currentLng: userLocation?.longitude ?? null,
    currentZoneId,
    zones: modeZones,
    scores,
    driverMode,
    conservativePresence,
  });

  const mapCenter = heroZone
    ? ([heroZone.latitude, heroZone.longitude] as [number, number])
    : getCityCenter(cityId);

  const mapMarkers = useMemo(() => {
    return modeZones.map((z) => ({
      id: z.id,
      name: z.name,
      type: z.type,
      latitude: z.latitude,
      longitude: z.longitude,
      demandScore: z.score,
      learningBoostPoints: factors.get(z.id)?.learningBoostPoints ?? 0,
    }));
  }, [modeZones, factors]);

  return (
    <div className="flex flex-col h-full pb-20" data-mode={driverMode}>
      {/* ── Driving-mode banner (NHTSA: direct to Drive screen) ── */}
      {isInVehicle && (
        <div className="mx-3 mt-2 flex items-center gap-3 rounded-xl bg-[hsl(var(--mode-rideshare)/0.15)] border border-[hsl(var(--mode-rideshare)/0.4)] px-3 py-2 animate-slide-up">
          <Car className="w-5 h-5 text-[hsl(var(--mode-rideshare))] flex-shrink-0" />
          <span className="flex-1 text-[13px] font-body text-[hsl(var(--mode-rideshare))]">
            En déplacement ·{' '}
            {speedKmh !== null ? `${Math.round(speedKmh)} km/h · ` : ''}
            Mode HUD disponible dans l'onglet conduite
          </span>
          <button
            onClick={() => window.location.assign('/drive')}
            className="flex items-center gap-1 text-[12px] font-bold text-[hsl(var(--mode-rideshare))] bg-[hsl(var(--mode-rideshare)/0.2)] rounded-lg px-2.5 py-1 active:scale-95 transition-transform"
          >
            HUD <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Compact header */}
      <div className="flex items-center gap-2 px-3 pt-2 pb-1 h-12">
        <div className="w-[130px] flex-shrink-0">
          <CitySelect cities={cities} value={cityId} onChange={setCityId} />
        </div>
        <div className="flex-1 min-w-0">
          <WeatherWidget cityId={cityId} />
        </div>
      </div>

      {/* Dead Time Timer + Weekly Goal */}
      <div className="px-3 mt-2 space-y-2">
        <DeadTimeTimer nearestZoneName={heroZone?.name} />
        <WeeklyGoalDisplay />
        <PreShiftBriefing
          topZones={modeZones.slice(0, 5).map((z) => ({
            id: z.id,
            name: z.name,
            type: z.type,
            score: z.score,
          }))}
          weather={weather ?? null}
          upcomingEvents={activeEvents ?? []}
          tmEvents={relevantTmEvents}
          stmStatus={stmStatus ?? null}
          yulStatus={yulStatus ?? null}
          cityId={cityId}
          familyConstraintMessage={homeConstraints.alert?.message ?? null}
        />
      </div>

      {/* Mode filter tabs — colour-coded per compass doc (blue=rideshare, amber=delivery) */}
      <div className="px-3 mt-2">
        <div className="flex rounded-xl border border-border bg-muted/30 p-1 gap-1">
          {(
            [
              {
                key: 'all',
                label: '🌐 Les deux',
                activeClass: 'bg-primary text-primary-foreground',
              },
              {
                key: 'rideshare',
                label: '🚗 Personnes',
                activeClass: 'bg-rideshare text-white',
              },
              {
                key: 'delivery',
                label: '📦 Livraison',
                activeClass: 'bg-delivery text-white',
              },
            ] as const
          ).map(({ key, label, activeClass }) => (
            <button
              key={key}
              onClick={() => {
                setDriverMode(key);
                vibrate('navigation');
              }}
              className={`flex-1 text-[13px] font-display font-semibold py-2 rounded-lg transition-colors ${
                driverMode === key
                  ? `${activeClass} shadow-sm`
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-3 mt-2">
        <button
          onClick={() => {
            const nextValue = !conservativePresence;
            setConservativePresence(nextValue);
            setConservativePresencePreference(nextValue);
          }}
          className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${
            conservativePresence
              ? 'border-primary/40 bg-primary/10'
              : 'border-border bg-card'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[14px] font-display font-bold">
                Mode Conservative Presence
              </p>
              <p className="text-[12px] text-muted-foreground font-body mt-1">
                Ne suggère jamais de couper Lyft. Oriente plutôt vers un filtre
                destination et une présence patiente en zone froide.
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                conservativePresence
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {conservativePresence ? 'ACTIF' : 'OFF'}
            </span>
          </div>
        </button>
      </div>

      {/* Statut chauffeur : Occupé / Libre */}
      <div className="px-3 mt-2">
        <FamilySchedulePanel constraints={homeConstraints} />
      </div>

      {/* Statut chauffeur : Occupé / Libre (real) */}
      <div className="px-3 mt-2">
        <button
          onClick={() => {
            if (!libreMode) {
              // Activating libre mode: auto-pick best destination and launch Google Maps
              const picked = pickBestDestination(smartZones as SmartZone[]);
              setAutoSelectedZone(picked?.zone ?? null);
              setAutoNavReason(picked?.reason ?? null);
              if (picked) {
                rememberUserPreference(picked.zone, 'libre-auto-pick');
                launchGoogleMapsNavigation(
                  picked.zone.name,
                  picked.zone.latitude,
                  picked.zone.longitude
                );
              }
            } else {
              setAutoSelectedZone(null);
              setAutoNavReason(null);
            }
            setLibreMode((l) => !l);
            setWaitTimer(null);
            setTimerExpired(false);
          }}
          className={`w-full h-11 rounded-xl text-[14px] font-display font-bold border transition-colors flex items-center justify-center gap-2 ${
            libreMode
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          <Timer className="w-4 h-4" />
          {libreMode
            ? conservativePresence
              ? '🟢 Je suis libre – Où rester visible ?'
              : '🟢 Je suis libre – Où aller ?'
            : '🔴 Occupé (course en cours)'}
        </button>
      </div>

      {/* Alerts */}
      <div className="px-3 space-y-1.5 mt-2">
        {/* 15-min parking countdown */}
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
              onClick={() => setWaitTimer(null)}
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
              onClick={() => setTimerExpired(false)}
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
              onClick={() => install()}
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
              Présence conservatrice active: privilégie les filtres destination
              Lyft aux déplacements agressifs.
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
        {/* Badge YUL — vague d'arrivées aéroport */}
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
        {/* Badge STM — perturbation transit */}
        {stmStatus?.hasDisruption && (
          <div className="flex items-center gap-2 bg-orange-500/15 border border-orange-500/40 rounded-lg px-3 py-2">
            <span className="text-lg flex-shrink-0">🚇</span>
            <span className="text-[13px] font-body font-medium text-orange-400">
              Perturbation STM active — demande rideshare en hausse (
              {stmStatus.alertCount} alerte
              {stmStatus.alertCount > 1 ? 's' : ''})
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

      {/* 2. MEILLEURE ZONE hero card */}
      <div className="px-3 mt-2">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-[14px] text-muted-foreground font-body uppercase tracking-wide">
              {driverMode === 'rideshare'
                ? '🚗 Meilleure zone passagers'
                : driverMode === 'delivery'
                  ? '📦 Meilleure zone livraison'
                  : t('bestZoneNow')}{' '}
              · {start}–{end}
            </span>
          </div>

          {heroZone ? (
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-[28px] font-display font-bold leading-tight break-words">
                  {heroZone.name}
                </h2>
                <span className="text-[16px] text-muted-foreground capitalize block mt-0.5">
                  {heroZone.type}
                  <ScoreFactorIcons factors={factors.get(heroZone.id)} />
                </span>
                {Number(heroFactors?.learningBoostPoints ?? 0) > 0 && (
                  <span className="text-[13px] text-primary/90 font-body block mt-1">
                    {`IA contextuelle +${heroFactors?.learningBoostPoints} pts · similarité ${Math.round((heroFactors?.learningSimilarity ?? 0) * 100)}% · historique ${formatMoney(heroFactors?.learningAvgEarningsPerHour ?? 0)}/h`}
                  </span>
                )}
                {Number(heroFactors?.habitBoostPercent ?? 0) > 0 && (
                  <span className="text-[13px] text-blue-500 font-body block mt-1">
                    {`Habitude perso +${heroFactors?.habitBoostPercent}% · similarité ${Math.round((heroFactors?.habitSimilarity ?? 0) * 100)}%`}
                  </span>
                )}
                {heroFactors?.successProbability != null && (
                  <span className="text-[13px] text-muted-foreground font-body block mt-1">
                    {`Probabilité de succès ${Math.round(heroFactors.successProbability * 100)}% · offre chauffeurs ${heroFactors.driverSupplyEstimate?.toFixed(1) ?? '0.0'} · proximité ${Math.round((heroFactors.proximityFactor ?? 0) * 100)}%`}
                  </span>
                )}
                {heroDistance !== null && (
                  <span className="text-[20px] font-display font-semibold text-muted-foreground mt-1 block">
                    📍 {heroDistance.toFixed(1)} km
                  </span>
                )}
              </div>
              <DemandBadge score={heroZone.score} size="giant" />
            </div>
          ) : (
            <p className="text-[18px] font-body text-muted-foreground">
              {t('loadingZonesEllipsis')}
            </p>
          )}

          {heroZone && (
            <div className="mt-4 space-y-2">
              <Button
                asChild
                className="w-full h-16 text-[18px] font-display font-bold gap-2.5 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <a
                  href={getGoogleMapsNavUrl(
                    heroZone.name,
                    heroZone.latitude,
                    heroZone.longitude
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GoogleMapsIcon className="w-6 h-6 flex-shrink-0" /> Google
                  Maps
                </a>
              </Button>
              <Button
                asChild
                variant="secondary"
                className="w-full h-16 text-[18px] font-display font-bold gap-2.5"
              >
                <a
                  href={getWazeNavUrl(
                    heroZone.name,
                    heroZone.latitude,
                    heroZone.longitude
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WazeIcon className="w-6 h-6 flex-shrink-0" /> Waze
                </a>
              </Button>

              {/* Swipe-to-accept — safer in-vehicle hero zone confirmation */}
              {isInVehicle && (
                <SwipeToAccept
                  label="Glisser → confirmer direction"
                  onAccept={() => {
                    window.open(
                      getGoogleMapsNavUrl(
                        heroZone.name,
                        heroZone.latitude,
                        heroZone.longitude
                      ),
                      '_blank'
                    );
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Anti-deadhead suggestion */}
      {deadheadSuggestion && (
        <div
          className={`mx-3 mt-2 rounded-xl border px-3 py-2.5 flex items-center gap-3 animate-slide-up ${
            deadheadSuggestion.urgency === 'high'
              ? 'border-destructive/40 bg-destructive/10'
              : deadheadSuggestion.urgency === 'medium'
                ? 'border-alert-amber/40 bg-[hsl(var(--alert-amber)/0.08)]'
                : 'border-border bg-card'
          }`}
        >
          <Car
            className={`w-5 h-5 flex-shrink-0 ${
              deadheadSuggestion.urgency === 'high'
                ? 'text-destructive'
                : 'text-alert-amber'
            }`}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-foreground">
              {deadheadSuggestion.strategy === 'destination_filter'
                ? 'Zone creuse — garde ta présence Lyft'
                : 'Zone creuse — repositionne-toi'}
            </p>
            <p className="text-[12px] text-muted-foreground leading-snug">
              {deadheadSuggestion.reason}
            </p>
          </div>
          <button
            onClick={() => {
              rememberUserPreference(
                deadheadSuggestion.zone,
                'deadhead-suggestion'
              );
              setNavZone({
                name: deadheadSuggestion.zone.name,
                lat: deadheadSuggestion.zone.latitude,
                lng: deadheadSuggestion.zone.longitude,
              });
            }}
            className="text-[12px] font-bold text-primary bg-primary/10 rounded-lg px-2.5 py-1.5 flex-shrink-0 active:scale-95 transition-transform"
          >
            {deadheadSuggestion.strategy === 'destination_filter'
              ? 'Cibler'
              : 'GO'}
          </button>
        </div>
      )}

      {/* Net profit widget — shows after hero zone */}
      <div className="px-3 mt-2">
        <NetProfitWidget grossEarnings={0} totalKm={0} hoursWorked={0} />
      </div>

      {/* 3. Heatmap */}
      <div className="flex-shrink-0 h-[260px] max-h-[260px] overflow-hidden mx-3 mt-3 rounded-xl border border-border">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              Chargement de la carte…
            </div>
          }
        >
          <MapboxHeatmap
            center={mapCenter}
            zoom={13}
            markers={mapMarkers}
            onZoneClick={(z) =>
              setNavZone({ name: z.name, lat: z.latitude, lng: z.longitude })
            }
            driverMode={driverMode}
            driverPosition={
              userLocation
                ? {
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                  }
                : null
            }
          />
        </Suspense>
      </div>

      {/* Multi-App Status */}
      <div className="px-3 mt-3">
        <MultiAppStatus cityId={cityId} mode={driverMode} />
      </div>

      {/* 4. PROCHAINS CRÉNEAUX / OÙ ALLER MAINTENANT */}
      {libreMode ? (
        <div className="px-3 mt-3 pb-4 space-y-2">
          <h3 className="text-[16px] font-display font-bold text-muted-foreground uppercase tracking-wide">
            {conservativePresence
              ? '🎯 Où garder une présence utile ?'
              : '🧭 Où aller maintenant ?'}
          </h3>
          {!userLocation ? (
            <p className="text-[14px] text-muted-foreground font-body px-1">
              Activez votre GPS pour les suggestions en temps réel.
            </p>
          ) : smartZones.length === 0 ? (
            <p className="text-[14px] text-muted-foreground font-body px-1">
              Chargement des zones…
            </p>
          ) : (
            smartZones.map((zone) => {
              const dc = getDemandClass(zone.arrivalScore);
              const isWaiting = waitTimer?.zoneId === zone.id;
              const zoneFactors = factors.get(zone.id);
              const isAirport = zone.type === 'aéroport';
              const isAutoSelected = autoSelectedZone?.id === zone.id;
              return (
                <div
                  key={zone.id}
                  className={`bg-card rounded-xl border-l-4 ${dc.border} border border-border p-3 gap-3 transition-all ${
                    isWaiting
                      ? 'ring-2 ring-primary'
                      : isAutoSelected
                        ? 'ring-2 ring-yellow-400'
                        : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-[17px] font-display font-semibold leading-tight break-words">
                          {zone.name}
                        </span>
                        {isAutoSelected && (
                          <span className="text-[11px] font-display font-bold bg-yellow-400/20 text-yellow-600 dark:text-yellow-300 border border-yellow-400/40 rounded-full px-2 py-0.5">
                            🎯{' '}
                            {autoNavReason === 'score'
                              ? 'Meilleur score'
                              : 'Le plus proche'}
                          </span>
                        )}
                        {isAirport && (
                          <span className="text-[11px] font-display font-bold bg-muted text-muted-foreground border border-border rounded-full px-2 py-0.5">
                            ℹ️ Info seulement
                          </span>
                        )}
                      </div>
                      <span className="text-[12px] text-muted-foreground font-body">
                        {zone.distKm.toFixed(1)} km · ~{zone.travelMin} min de
                        route · arrivée {zone.arrivalTime}
                      </span>
                      {Number(zoneFactors?.learningBoostPoints ?? 0) > 0 && (
                        <span className="text-[12px] text-primary/90 font-body block mt-0.5">
                          Boost IA +{zoneFactors?.learningBoostPoints} (
                          {Math.round(
                            (zoneFactors?.learningSimilarity ?? 0) * 100
                          )}
                          %)
                        </span>
                      )}
                      {Number(zoneFactors?.habitBoostPercent ?? 0) > 0 && (
                        <span className="text-[12px] text-blue-500 font-body block mt-0.5">
                          Habitude perso +{zoneFactors?.habitBoostPercent}%
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <DemandBadge score={zone.arrivalScore} size="lg" />
                      {(() => {
                        const surge = surgeMap?.get(zone.id);
                        return surge ? (
                          <SurgeIndicator
                            surgeClass={surge.surgeClass}
                            multiplier={surge.surgeMultiplier}
                            size="sm"
                            showMultiplier
                          />
                        ) : null;
                      })()}
                    </div>
                  </div>
                  {isAirport ? (
                    <p className="text-[12px] text-muted-foreground font-body mt-2 px-0.5">
                      L'aéroport est affiché à titre informatif. Rendez-vous y
                      uniquement avec un client.
                    </p>
                  ) : (
                    <div className="flex gap-2 mt-2">
                      <a
                        href={getGoogleMapsNavUrl(
                          zone.name,
                          zone.latitude,
                          zone.longitude
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          startWaitAt(zone);
                          rememberUserPreference(
                            zone,
                            'smart-zone-google-maps'
                          );
                        }}
                        className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-display font-bold text-[14px] rounded-lg h-10 hover:bg-primary/90 transition-colors"
                      >
                        <GoogleMapsIcon className="w-4 h-4 flex-shrink-0" />{' '}
                        {conservativePresence ? 'Cibler' : 'Maps'}
                      </a>
                      <a
                        href={getWazeNavUrl(
                          zone.name,
                          zone.latitude,
                          zone.longitude
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => startWaitAt(zone)}
                        className="flex-1 flex items-center justify-center gap-2 bg-secondary text-secondary-foreground font-display font-bold text-[14px] rounded-lg h-10 hover:bg-secondary/80 transition-colors"
                      >
                        <WazeIcon className="w-4 h-4 flex-shrink-0" /> Waze
                      </a>
                      {isWaiting ? (
                        <button
                          onClick={() => setWaitTimer(null)}
                          className="px-3 h-10 rounded-lg border border-border text-[13px] text-muted-foreground hover:text-foreground font-body"
                        >
                          Annuler
                        </button>
                      ) : (
                        <button
                          onClick={() => startWaitAt(zone)}
                          className="px-3 h-10 rounded-lg border border-primary/50 text-[13px] text-primary font-body"
                        >
                          J'arrive
                        </button>
                      )}
                    </div>
                  )}
                  {/* Platform arbitrage — shown below GO buttons */}
                  <PlatformArbitrage
                    zoneId={zone.id}
                    zoneScore={zone.arrivalScore}
                    compact
                    className="mt-1"
                  />
                  {/* Context similarity — pgvector k-NN */}
                  <ContextSimilarityPanel
                    zoneId={zone.id}
                    similarContextSignals={similarContextSignals}
                    className="mt-1"
                  />
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="px-3 mt-3 pb-4 space-y-2">
          <h3 className="text-[16px] font-display font-bold text-muted-foreground uppercase tracking-wide">
            {t('nextSlots')}
          </h3>
          {nextZones.map((zone) => {
            const dc = getDemandClass(zone.score);
            const dist = getDistance(zone);
            const zoneFactors = factors.get(zone.id);
            return (
              <div
                key={zone.id}
                onClick={() =>
                  setNavZone({
                    name: zone.name,
                    lat: zone.latitude,
                    lng: zone.longitude,
                  })
                }
                className={`flex items-center justify-between bg-card rounded-xl border-l-4 ${dc.border} border border-border p-4 gap-3 cursor-pointer active:scale-[0.98] transition-transform`}
              >
                <div className="flex-1 min-w-0">
                  <span className="text-[18px] font-display font-semibold block leading-tight break-words">
                    {zone.name}
                    {dist !== null && (
                      <span className="text-muted-foreground text-[14px] font-body ml-2">
                        · {dist.toFixed(1)} km
                      </span>
                    )}
                  </span>
                  <span className="text-[14px] text-muted-foreground font-body capitalize">
                    {zone.type}
                    <ScoreFactorIcons factors={factors.get(zone.id)} />
                  </span>
                  <span className="text-[12px] text-muted-foreground font-body block">
                    {start}–{end}
                  </span>
                  {Number(zoneFactors?.learningBoostPoints ?? 0) > 0 && (
                    <span className="text-[12px] text-primary/90 font-body block mt-0.5">
                      {`Boost IA +${zoneFactors?.learningBoostPoints} (${Math.round((zoneFactors?.learningSimilarity ?? 0) * 100)}%)`}
                    </span>
                  )}
                </div>
                <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                  <DemandBadge score={zone.score} size="lg" />
                  {(() => {
                    const surge = surgeMap?.get(zone.id);
                    return surge ? (
                      <SurgeBar
                        surgeClass={surge.surgeClass}
                        multiplier={surge.surgeMultiplier}
                      />
                    ) : null;
                  })()}
                  <PlatformArbitrage
                    zoneId={zone.id}
                    zoneScore={zone.score}
                    compact
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <NavigationSheet
        open={!!navZone}
        onClose={() => setNavZone(null)}
        zoneName={navZone?.name ?? ''}
        latitude={navZone?.lat ?? 0}
        longitude={navZone?.lng ?? 0}
      />

      {/* Assistant vocal mains-libres */}
      <VoiceAssistant
        heroZone={
          heroZone
            ? {
                name: heroZone.name,
                score: heroZone.score,
                type: heroZone.type,
              }
            : null
        }
        smartZones={smartZones}
        nextEvent={
          relevantTmEvents[0]
            ? {
                name: relevantTmEvents[0].name,
                venueName: relevantTmEvents[0].venueName,
              }
            : null
        }
      />
    </div>
  );
}
