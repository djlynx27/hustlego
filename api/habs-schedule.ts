function resolveSeasonCode(dateParam) {
  const parsed =
    typeof dateParam === 'string' ? new Date(dateParam) : new Date();
  const baseDate = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const seasonStartYear = month >= 8 ? year : year - 1;

  return `${seasonStartYear}${seasonStartYear + 1}`;
}

export default async function handler(req, res) {
  const dateParam = Array.isArray(req.query.date)
    ? req.query.date[0]
    : req.query.date;
  const seasonCode = resolveSeasonCode(dateParam);

  try {
    const upstream = await fetch(
      `https://api-web.nhle.com/v1/club-schedule-season/mtl/${seasonCode}`
    );

    if (!upstream.ok) {
      res.setHeader(
        'Cache-Control',
        's-maxage=900, stale-while-revalidate=3600'
      );
      return res.status(200).json({ games: [] });
    }

    const payload = await upstream.json();
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');
    return res.status(200).json(payload);
  } catch {
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=1800');
    return res.status(200).json({ games: [] });
  }
}
