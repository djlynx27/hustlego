export interface YulWave {
  label: string;
  startHour: number;
  endHour: number;
  intensity: 'high' | 'medium' | 'low';
  rideshareImpact: string;
}

export interface YulStatus {
  isActivePeriod: boolean;
  currentWave: YulWave | null;
  nextWave: YulWave | null;
  minutesToNextWave: number | null;
  liveArrivalsCount: number | null;
  fetchedAt: string;
}

export const YUL_WAVES: YulWave[] = [
  {
    label: '6h-10h (transatlantiques)',
    startHour: 6,
    endHour: 10,
    intensity: 'high',
    rideshareImpact:
      '✈️ Vague YUL — vols transatlantiques. Zone aéroport prioritaire.',
  },
  {
    label: '11h-14h (domestiques / US)',
    startHour: 11,
    endHour: 14,
    intensity: 'medium',
    rideshareImpact:
      '✈️ Vague YUL — vols domestiques. Aéroport + hôtels centre-ville.',
  },
  {
    label: '17h-21h (retours domestiques / US)',
    startHour: 17,
    endHour: 21,
    intensity: 'high',
    rideshareImpact:
      '✈️ Vague YUL — retours soir. Aéroport + hôtels + Westmount.',
  },
];

export function getWaveStatus(now: Date): {
  current: YulWave | null;
  next: YulWave | null;
  minutesToNext: number | null;
} {
  const hour = now.getHours();
  const current =
    YUL_WAVES.find((wave) => hour >= wave.startHour && hour < wave.endHour) ??
    null;
  const futureWaves = YUL_WAVES.filter((wave) => wave.startHour > hour);
  const next = futureWaves[0] ?? YUL_WAVES[0] ?? null;

  if (!next) {
    return { current, next: null, minutesToNext: null };
  }

  if (current) {
    return { current, next, minutesToNext: null };
  }

  const nextStart = new Date(now);
  nextStart.setHours(next.startHour, 0, 0, 0);
  if (next.startHour <= hour) {
    nextStart.setDate(nextStart.getDate() + 1);
  }

  return {
    current: null,
    next,
    minutesToNext: Math.round((nextStart.getTime() - now.getTime()) / 60_000),
  };
}

export function buildFallbackYulStatus(
  now: Date,
  liveArrivalsCount: number | null = null
): YulStatus {
  const { current, next, minutesToNext } = getWaveStatus(now);

  return {
    isActivePeriod: current !== null,
    currentWave: current,
    nextWave: next,
    minutesToNextWave: minutesToNext,
    liveArrivalsCount,
    fetchedAt: now.toISOString(),
  };
}
