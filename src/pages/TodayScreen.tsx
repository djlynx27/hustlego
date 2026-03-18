import { CitySelect } from '@/components/CitySelect';
import { DeadTimeTimer } from '@/components/DeadTimeTimer';
import { DemandBadge } from '@/components/DemandBadge';
import { MultiAppStatus } from '@/components/MultiAppStatus';
import { NavigationSheet } from '@/components/NavigationSheet';
import { ScoreFactorIcons } from '@/components/ScoreFactorIcons';
import { Button } from '@/components/ui/button';
import { WeatherWidget } from '@/components/WeatherWidget';
import { WeeklyGoalDisplay } from '@/components/WeeklyGoal';
import { useI18n } from '@/contexts/I18nContext';
import { useCityId } from '@/hooks/useCityId';
import { useAutoCity } from '@/hooks/useAutoCity';
import { useDemandScores } from '@/hooks/useDemandScores';
import { useHabsGame } from '@/hooks/useHabsGame';
import { useHoliday } from '@/hooks/useHoliday';
import { useNotifications } from '@/hooks/useNotifications';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { useCities } from '@/hooks/useSupabase';
import { haversineKm, useUserLocation } from '@/hooks/useUserLocation';
import { getCurrentSlotTime, getDemandClass } from '@/lib/demandUtils';
import { getActiveTimeBoosts } from '@/lib/timeBoosts';
import { getGoogleMapsNavUrl, getWazeNavUrl } from '@/lib/venueCoordinates';
import {
  Bell,
  Clock,
  Download,
  Navigation,
  PartyPopper,
  Ticket,
  WifiOff,
} from 'lucide-react';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
const MapboxHeatmap = lazy(() => import('@/components/MapboxHeatmap'));

const CITY_CENTERS: Record<string, [number, number]> = {
  mtl: [45.5017, -73.5673],
  lvl: [45.5503, -73.7006],
  lng: [45.5252, -73.5205],
};

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

export default function TodayScreen() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [cityId, setCityId] = useCityId();
  const [now, setNow] = useState(new Date());
  const { canInstall, install, dismiss: dismissInstall } = usePwaInstall();
  const isOnline = useOnlineStatus();
  const { enabled: notifEnabled, requestPermission } = useNotifications(cityId);
  const { location: userLocation } = useUserLocation();
  useAutoCity(setCityId, userLocation?.latitude, userLocation?.longitude);
  const [navZone, setNavZone] = useState<{
    name: string;
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  const { start, end } = getCurrentSlotTime(now);
  const { data: cities = [] } = useCities();
  const { scores, factors, zones, endingSoon, relevantTmEvents } =
    useDemandScores(cityId);
  const { data: holiday } = useHoliday(getCurrentSlotTime(now).date);
  const { data: habsGame } = useHabsGame(getCurrentSlotTime(now).date);
  const timeBoosts = useMemo(() => getActiveTimeBoosts(now), [now]);

  const [driverMode, setDriverMode] = useState<
    'rideshare' | 'delivery' | 'all'
  >('all');

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

  const heroZone = modeZones[0] ?? null;
  const nextZones = modeZones.slice(1, 4);

  const getDistance = (zone: any) => {
    if (!userLocation || !zone) return null;
    return haversineKm(
      userLocation.latitude,
      userLocation.longitude,
      zone.latitude,
      zone.longitude
    );
  };

  const heroDistance = getDistance(heroZone);

  const mapCenter = heroZone
    ? ([heroZone.latitude, heroZone.longitude] as [number, number])
    : (CITY_CENTERS[cityId] ?? CITY_CENTERS.mtl);

  const mapMarkers = useMemo(() => {
    return modeZones.map((z) => ({
      id: z.id,
      name: z.name,
      type: z.type,
      latitude: z.latitude,
      longitude: z.longitude,
      demandScore: z.score,
    }));
  }, [modeZones]);

  return (
    <div className="flex flex-col h-full pb-20">
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
      </div>

      {/* Mode filter tabs */}
      <div className="px-3 mt-2">
        <div className="flex rounded-xl border border-border bg-muted/30 p-1 gap-1">
          {(
            [
              { key: 'all', label: '🌐 Les deux' },
              { key: 'rideshare', label: '🚗 Personnes' },
              { key: 'delivery', label: '📦 Livraison' },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setDriverMode(key)}
              className={`flex-1 text-[13px] font-display font-semibold py-2 rounded-lg transition-colors ${
                driverMode === key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts */}
      <div className="px-3 space-y-1.5 mt-2">
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
                🔴 {ev.name} se termine dans {minsLeft}min – Demande maximale
                prévue!
              </span>
            </div>
          );
        })}
        {relevantTmEvents.length > 0 && (
          <div
            onClick={() => navigate('/events')}
            className="flex items-center gap-2 bg-accent/20 border border-accent/40 rounded-lg px-3 py-2 cursor-pointer active:scale-[0.98] transition-transform"
          >
            <Ticket className="w-5 h-5 text-accent-foreground flex-shrink-0" />
            <span className="text-[14px] font-body font-medium text-accent-foreground">
              🎫 {relevantTmEvents.length} événement
              {relevantTmEvents.length > 1 ? 's' : ''} en cours/à venir –{' '}
              {relevantTmEvents
                .map((e) => e.venueName)
                .filter((v, i, a) => a.indexOf(v) === i)
                .join(', ')}
            </span>
          </div>
        )}
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
                className="w-full h-16 text-[18px] font-display font-bold gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
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
                  <Navigation className="w-5 h-5" />
                  🗺️ GO – Google Maps
                </a>
              </Button>
              <Button
                asChild
                variant="secondary"
                className="w-full h-16 text-[18px] font-display font-bold gap-2"
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
                  🧭 Waze
                </a>
              </Button>
            </div>
          )}
        </div>
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
          />
        </Suspense>
      </div>

      {/* Multi-App Status */}
      <div className="px-3 mt-3">
        <MultiAppStatus cityId={cityId} mode={driverMode} />
      </div>

      {/* 4. PROCHAINS CRÉNEAUX */}
      <div className="px-3 mt-3 pb-4 space-y-2">
        <h3 className="text-[16px] font-display font-bold text-muted-foreground uppercase tracking-wide">
          {t('nextSlots')}
        </h3>
        {nextZones.map((zone) => {
          const dc = getDemandClass(zone.score);
          const dist = getDistance(zone);
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
                <span className="text-[12px] text-muted-foreground font-body">
                  {start}–{end}
                </span>
              </div>
              <div className="flex-shrink-0">
                <DemandBadge score={zone.score} size="lg" />
              </div>
            </div>
          );
        })}
      </div>

      <NavigationSheet
        open={!!navZone}
        onClose={() => setNavZone(null)}
        zoneName={navZone?.name ?? ''}
        latitude={navZone?.lat ?? 0}
        longitude={navZone?.lng ?? 0}
      />
    </div>
  );
}
