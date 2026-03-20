import { buildFallbackYulStatus, type YulStatus } from '../src/lib/yulStatus';

interface AviationstackFlight {
  flight_status?: string;
  arrival?: { iata?: string; scheduled?: string };
}

interface AviationstackResponse {
  data?: AviationstackFlight[];
}

const AVIATIONSTACK_URL = 'https://api.aviationstack.com/v1/flights';
const CACHE_HEADER = 's-maxage=14400, stale-while-revalidate=86400';

function getAviationstackKey() {
  return (
    process.env.AVIATIONSTACK_API_KEY?.trim() ||
    process.env.VITE_AVIATIONSTACK_KEY?.trim() ||
    ''
  );
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
