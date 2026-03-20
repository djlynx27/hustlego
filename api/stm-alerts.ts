const ALERTS_URL = 'https://api.stm.info/pub/od/gtfs-rt/ic/v2/serviceAlerts';

export default async function handler(_req, res) {
  const stmKey = process.env.VITE_STM_KEY ?? '';

  if (!stmKey) {
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).send(Buffer.alloc(0));
  }

  try {
    const upstream = await fetch(ALERTS_URL, {
      headers: { apikey: stmKey },
    });

    if (!upstream.ok) {
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
      return res.status(200).send(Buffer.alloc(0));
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.setHeader(
      'Content-Type',
      upstream.headers.get('content-type') ?? 'application/octet-stream'
    );
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).send(buffer);
  } catch {
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).send(Buffer.alloc(0));
  }
}
