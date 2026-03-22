import { useWeather } from '@/hooks/useWeather';
import { Smartphone } from 'lucide-react';
import { useMemo } from 'react';

interface AppRec {
  name: string;
  icon: string;
  on: boolean;
  reason: string;
  category: 'rideshare' | 'delivery';
}

type RecommendationContext = {
  isWeekend: boolean;
  isMealTime: boolean;
  isLateNight: boolean;
  isMorningRush: boolean;
  isAfternoonRush: boolean;
  isBadWeather: boolean;
};

function getRideshareReason(context: RecommendationContext) {
  if (context.isBadWeather) return 'Mauvais temps = forte demande';
  if (context.isLateNight) return 'Forte demande nocturne';
  if (context.isMorningRush || context.isAfternoonRush)
    return 'Heure de pointe';
  if (context.isWeekend) return 'Weekend actif';
  return 'Demande faible';
}

function getDeliveryReason({
  context,
  mealLabel,
  weatherLabel,
  weekendLabel,
  fallbackLabel,
}: {
  context: RecommendationContext;
  mealLabel: string;
  weatherLabel: string;
  weekendLabel?: string;
  fallbackLabel: string;
}) {
  if (context.isMealTime) return mealLabel;
  if (context.isBadWeather) return weatherLabel;
  if (weekendLabel && context.isWeekend) return weekendLabel;
  return fallbackLabel;
}

function buildRideshareRecommendation(
  name: string,
  icon: string,
  context: RecommendationContext
): AppRec {
  return {
    name,
    icon,
    category: 'rideshare',
    on:
      context.isMorningRush ||
      context.isAfternoonRush ||
      context.isLateNight ||
      context.isBadWeather ||
      context.isWeekend,
    reason: getRideshareReason(context),
  };
}

function buildDeliveryRecommendation({
  name,
  icon,
  context,
  weekendEnabled,
  mealLabel,
  weatherLabel,
  weekendLabel,
  fallbackLabel,
}: {
  name: string;
  icon: string;
  context: RecommendationContext;
  weekendEnabled: boolean;
  mealLabel: string;
  weatherLabel: string;
  weekendLabel?: string;
  fallbackLabel: string;
}): AppRec {
  return {
    name,
    icon,
    category: 'delivery',
    on:
      context.isMealTime ||
      context.isBadWeather ||
      (weekendEnabled && context.isWeekend),
    reason: getDeliveryReason({
      context,
      mealLabel,
      weatherLabel,
      weekendLabel,
      fallbackLabel,
    }),
  };
}

function buildRecommendationContext(
  hour: number,
  dayOfWeek: number,
  isBadWeather: boolean
): RecommendationContext {
  return {
    isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    isMealTime: (hour >= 11 && hour <= 13) || (hour >= 17 && hour <= 21),
    isLateNight: hour >= 22 || hour < 5,
    isMorningRush: hour >= 6 && hour <= 9,
    isAfternoonRush: hour >= 15 && hour <= 18,
    isBadWeather,
  };
}

function getRecommendations(
  hour: number,
  dayOfWeek: number,
  isBadWeather: boolean
): AppRec[] {
  const context = buildRecommendationContext(hour, dayOfWeek, isBadWeather);

  return [
    buildRideshareRecommendation('Uber', '🚗', context),
    buildRideshareRecommendation('Lyft', '🚕', context),
    {
      name: 'EVA',
      icon: '🚙',
      category: 'rideshare',
      on: context.isMorningRush || context.isAfternoonRush || context.isWeekend,
      reason:
        context.isMorningRush || context.isAfternoonRush
          ? 'Heure de pointe'
          : context.isWeekend
            ? 'Weekend actif'
            : 'Demande limitée',
    },
    buildDeliveryRecommendation({
      name: 'Skip',
      icon: '🍔',
      context,
      weekendEnabled: false,
      mealLabel: 'Heure de repas',
      weatherLabel: 'Livraisons en hausse',
      fallbackLabel: 'Hors heures de repas',
    }),
    buildDeliveryRecommendation({
      name: 'DoorDash',
      icon: '🛵',
      context,
      weekendEnabled: true,
      mealLabel: 'Heure de repas',
      weatherLabel: 'Mauvais temps boost',
      weekendLabel: 'Weekend chargé',
      fallbackLabel: 'Hors heures de pointe',
    }),
    buildDeliveryRecommendation({
      name: 'Instacart',
      icon: '🛒',
      context,
      weekendEnabled: true,
      mealLabel: 'Heure de repas',
      weatherLabel: 'Épicerie en hausse',
      weekendLabel: 'Courses du weekend',
      fallbackLabel: 'Demande faible',
    }),
  ];
}

function getFilteredApps(apps: AppRec[], mode: Props['mode']) {
  if (mode === 'all') {
    return apps;
  }

  const expectedCategory = mode === 'rideshare' ? 'rideshare' : 'delivery';
  return apps.filter((app) => app.category === expectedCategory);
}

function AppRecommendationCard({ app }: { app: AppRec }) {
  return (
    <div
      className={`rounded-lg border px-3 py-2.5 ${
        app.on
          ? 'bg-green-500/10 border-green-500/30'
          : 'bg-muted/20 border-border'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{app.icon}</span>
        <span className="text-[14px] font-display font-bold">{app.name}</span>
        <span
          className={`text-[11px] font-body font-bold ml-auto ${
            app.on ? 'text-green-400' : 'text-muted-foreground'
          }`}
        >
          {app.on ? 'ON' : 'OFF'}
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground font-body mt-0.5">
        {app.reason}
      </p>
    </div>
  );
}

interface Props {
  cityId: string;
  mode?: 'rideshare' | 'delivery' | 'all';
}

export function MultiAppStatus({ cityId, mode = 'all' }: Props) {
  const { data: weather } = useWeather(cityId);
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay();

  const allApps = useMemo(() => {
    return getRecommendations(
      currentHour,
      currentDay,
      weather?.isBadWeather ?? false
    );
  }, [currentDay, currentHour, weather?.isBadWeather]);

  const apps = useMemo(() => getFilteredApps(allApps, mode), [allApps, mode]);

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Smartphone className="w-4 h-4 text-primary" />
        <span className="text-[14px] font-display font-bold">
          Statut recommandé
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {apps.map((app) => (
          <AppRecommendationCard key={app.name} app={app} />
        ))}
      </div>
    </div>
  );
}
