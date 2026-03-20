interface AviationstackFlight {
  flight_status?: string;
  arrival?: { iata?: string; scheduled?: string };
}

interface AviationstackResponse {
  data?: AviationstackFlight[];
}

interface YulWave {
  label: string;
  startHour: number;
  endHour: number;
  intensity: 'high' | 'medium' | 'low';
  rideshareImpact: string;
}

interface YulStatus {
  isActivePeriod: boolean;
  currentWave: YulWave | null;
  nextWave: YulWave | null;
  minutesToNextWave: number | null;
  liveArrivalsCount: number | null;
  fetchedAt: string;
}

const AVIATIONSTACK_URL = 'https://api.aviationstack.com/v1/flights';
const CACHE_HEADER = 's-maxage=14400, stale-while-revalidate=86400';
const YUL_WAVES: YulWave[] = [
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

function getAviationstackKey() {
  return (
    process.env.AVIATIONSTACK_API_KEY?.trim() ||
    process.env.VITE_AVIATIONSTACK_KEY?.trim() ||
    ''
  );
}

function getWaveStatus(now: Date) {
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

function buildFallbackYulStatus(
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

function json(res, status) {
  return (payload) => {
    res.setHeader('Cache-Control', CACHE_HEADER);
    return res.status(status).json(payload);
  };
}

export default async function handler(_req, res) {
  const now = new Date();
  const respondOk = json(res, 200);
  const aviationstackKey = getAviationstackKey();

  if (!aviationstackKey) {
    return respondOk(buildFallbackYulStatus(now));
  }

  if (aviationstackKey === 'mock') {
    return respondOk(buildFallbackYulStatus(now, 12));
  }

  try {
    const params = new URLSearchParams({
      access_key: aviationstackKey,
      arr_iata: 'YUL',
      flight_status: 'active',
      limit: '50',
    });
    const upstream = await fetch(`${AVIATIONSTACK_URL}?${params.toString()}`);

    if (!upstream.ok) {
      return respondOk(buildFallbackYulStatus(now));
    }

    const payload = (await upstream.json()) as AviationstackResponse;
    const liveArrivalsCount = payload.data?.length ?? 0;
    const baseStatus = buildFallbackYulStatus(now, liveArrivalsCount);

    const response: YulStatus = {
      ...baseStatus,
      isActivePeriod: baseStatus.isActivePeriod || liveArrivalsCount > 5,
      liveArrivalsCount,
      fetchedAt: now.toISOString(),
    };

    return respondOk(response);
  } catch {
    return respondOk(buildFallbackYulStatus(now));
  }
}
