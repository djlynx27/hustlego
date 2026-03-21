import { DemandBadge } from '@/components/DemandBadge';
import { GoogleMapsIcon, WazeIcon } from '@/components/NavIcons';
import { ScoreFactorIcons } from '@/components/ScoreFactorIcons';
import { SwipeToAccept } from '@/components/SwipeToAccept';
import { Button } from '@/components/ui/button';
import type { ScoreFactors } from '@/hooks/useDemandScores';
import { getGoogleMapsNavUrl, getWazeNavUrl } from '@/lib/venueCoordinates';
import { Clock } from 'lucide-react';

interface HeroZone {
  id: string;
  name: string;
  type: string;
  score: number;
  latitude: number;
  longitude: number;
}

interface TodayHeroCardProps {
  driverMode: 'rideshare' | 'delivery' | 'all';
  start: string;
  end: string;
  bestZoneLabel: string;
  loadingLabel: string;
  heroZone: HeroZone | null;
  heroFactors?: ScoreFactors;
  heroDistance: number | null;
  isInVehicle: boolean;
  formatMoney: (value: number) => string;
}

export function TodayHeroCard({
  driverMode,
  start,
  end,
  bestZoneLabel,
  loadingLabel,
  heroZone,
  heroFactors,
  heroDistance,
  isInVehicle,
  formatMoney,
}: TodayHeroCardProps) {
  return (
    <div className="px-3 mt-2">
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-[14px] text-muted-foreground font-body uppercase tracking-wide">
            {driverMode === 'rideshare'
              ? '🚗 Meilleure zone passagers'
              : driverMode === 'delivery'
                ? '📦 Meilleure zone livraison'
                : bestZoneLabel}{' '}
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
                <ScoreFactorIcons factors={heroFactors} />
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
            {loadingLabel}
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
                <GoogleMapsIcon className="w-6 h-6 flex-shrink-0" /> Google Maps
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
  );
}
