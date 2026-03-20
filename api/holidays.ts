export default async function handler(req, res) {
  const yearParam = Array.isArray(req.query.year)
    ? req.query.year[0]
    : req.query.year;
  const year = /^\d{4}$/.test(String(yearParam ?? ''))
    ? String(yearParam)
    : String(new Date().getFullYear());

  try {
    const upstream = await fetch(
      `https://canada-holidays.ca/api/v1/holidays?province=QC&year=${year}`
    );

    if (!upstream.ok) {
      res.setHeader(
        'Cache-Control',
        's-maxage=3600, stale-while-revalidate=86400'
      );
      return res.status(200).json({ holidays: [] });
    }

    const payload = await upstream.json();
    res.setHeader(
      'Cache-Control',
      's-maxage=3600, stale-while-revalidate=86400'
    );
    return res.status(200).json(payload);
  } catch {
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
    return res.status(200).json({ holidays: [] });
  }
}
