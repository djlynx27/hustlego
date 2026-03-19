import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface ZoneDetected {
  area: string;
  demand: string;
  surge_multiplier: number | null;
  color_intensity: string;
}

interface AnalysisResult {
  zones_detected?: ZoneDetected[];
  overall_demand?: string;
  time_context?: string | null;
  notes?: string;
  recommended_target?:
    | 'demand'
    | 'shift'
    | 'daily'
    | 'mileage'
    | 'profit'
    | 'unknown';
  extracted_data?: {
    earnings?: number | null;
    tips?: number | null;
    distance_km?: number | null;
    hours_worked?: number | null;
    trips_count?: number | null;
    date?: string | null;
  };
  matched_zone_id?: string;
  matched_zone_name?: string;
}

interface RequestBody {
  image_url?: string;
  file_content?: string;
  file_name?: string;
  zone_id?: string;
  zone_name?: string;
  auto_zone?: boolean;
  mode?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json().catch(() => ({}));
    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // ─── File / text path ────────────────────────────────────────────
    if (body.file_content) {
      const analysis = analyzeFileContent(body.file_content, body.file_name);
      return jsonResponse({ analysis });
    }

    // ─── Image path ───────────────────────────────────────────────────
    if (!body.image_url) {
      return jsonResponse({ analysis: fallbackAnalysis(body.zone_name) });
    }

    if (!geminiKey) {
      return jsonResponse({ analysis: fallbackAnalysis(body.zone_name) });
    }

    // Fetch image bytes from Supabase Storage or any public URL
    let imageBytes: Uint8Array;
    let mimeType = 'image/jpeg';
    try {
      const imgRes = await fetch(body.image_url);
      if (!imgRes.ok) throw new Error(`HTTP ${imgRes.status}`);
      const contentType = imgRes.headers.get('content-type') || '';
      if (contentType.startsWith('image/'))
        mimeType = contentType.split(';')[0].trim();
      imageBytes = new Uint8Array(await imgRes.arrayBuffer());
    } catch {
      return jsonResponse({ analysis: fallbackAnalysis(body.zone_name) });
    }

    const base64Image = btoa(String.fromCharCode(...imageBytes));

    const prompt = buildPrompt(body.zone_name);

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: base64Image,
                  },
                },
                { text: prompt },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini Vision error:', errText);
      return jsonResponse({ analysis: fallbackAnalysis(body.zone_name) });
    }

    const geminiData = await geminiRes.json();
    const rawContent =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    let analysis: AnalysisResult;
    try {
      analysis = JSON.parse(rawContent);
    } catch {
      analysis = fallbackAnalysis(body.zone_name);
    }

    // Persist inferred zone if Supabase is available and auto_zone requested
    if (
      body.auto_zone &&
      analysis.zones_detected?.length &&
      supabaseUrl &&
      supabaseServiceKey
    ) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const detectedArea = analysis.zones_detected[0].area;
      const { data: matchedZone } = await supabase
        .from('zones')
        .select('id, name')
        .ilike('name', `%${detectedArea}%`)
        .limit(1)
        .single();
      if (matchedZone) {
        // attach matched zone id to response so frontend can preselect it
        analysis.matched_zone_id = matchedZone.id;
        analysis.matched_zone_name = matchedZone.name;
      }
    }

    return jsonResponse({ analysis });
  } catch (err) {
    console.error('analyze-screenshot error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildPrompt(zoneName?: string): string {
  const zoneCtx = zoneName
    ? `The driver is currently positioned near "${zoneName}" in Montreal/Laval/Longueuil (Quebec).`
    : '';
  return `You are analyzing a rideshare/delivery driver screenshot taken in Quebec, Canada.
${zoneCtx}

Extract all useful information from this image and return ONLY a raw JSON object (no markdown fences) matching:
{
  "zones_detected": [{ "area": string, "demand": "low"|"medium"|"high"|"surge", "surge_multiplier": number|null, "color_intensity": "light"|"medium"|"dark" }],
  "overall_demand": "low"|"medium"|"high"|"surge",
  "time_context": "morning"|"afternoon"|"evening"|"night"|null,
  "notes": "brief human-readable summary in French (max 120 chars)",
  "recommended_target": "demand"|"shift"|"daily"|"mileage"|"profit"|"unknown",
  "extracted_data": {
    "earnings": number|null,
    "tips": number|null,
    "distance_km": number|null,
    "hours_worked": number|null,
    "trips_count": number|null,
    "date": "YYYY-MM-DD"|null
  }
}

Rules:
- zones_detected: list visible demand zones/areas in the image (empty array if none)
- recommended_target: "demand" for heatmaps/zone screenshots, "shift" for earnings/trip summaries, "mileage" for distance/mileage reports, "daily" for daily summaries, "profit" for profit/loss screens
- extracted_data: populate only fields visually present in the image; null otherwise
- All monetary values in CAD
- distance_km: convert miles to km if needed (1 mi = 1.609 km)
- Return ONLY the JSON, no other text`;
}

function analyzeFileContent(
  content: string,
  fileName?: string
): AnalysisResult {
  const lines = content.split('\n');
  const headers = lines[0]?.toLowerCase() || '';

  const isMileage =
    /distance|mileage|km|mi\b/.test(headers) &&
    /earnings|fare|revenue/.test(headers);
  const isShift =
    /lyft|uber|doordash|skip/.test(fileName?.toLowerCase() || '') ||
    /trip|fare|earnings/.test(headers);

  let totalEarnings = 0;
  let totalTips = 0;
  let totalDistance = 0;
  let tripsCount = 0;

  for (const line of lines.slice(1)) {
    const cols = line.split(',').map((c) => c.replace(/["$]/g, '').trim());
    for (let i = 0; i < cols.length; i++) {
      const header = lines[0].split(',')[i]?.toLowerCase() || '';
      const val = parseFloat(cols[i]);
      if (isNaN(val)) continue;
      if (/earnings|fare|revenue/.test(header)) totalEarnings += val;
      if (/tip/.test(header)) totalTips += val;
      if (/distance|km|mileage/.test(header)) totalDistance += val;
      if (/trip|ride/.test(header) && Number.isInteger(val)) tripsCount++;
    }
  }

  // convert miles to km if unit looks like miles
  if (/\bmi\b|mile/.test(headers) && !/km/.test(headers)) {
    totalDistance = totalDistance * 1.609;
  }

  return {
    overall_demand: 'medium',
    notes: `Fichier CSV analysé : ${isMileage ? 'kilométrage' : isShift ? 'quart de travail' : 'données'} importé`,
    recommended_target: isMileage ? 'mileage' : isShift ? 'shift' : 'daily',
    extracted_data: {
      earnings: totalEarnings || null,
      tips: totalTips || null,
      distance_km:
        totalDistance > 0 ? Math.round(totalDistance * 100) / 100 : null,
      trips_count: tripsCount || null,
    },
  };
}

function fallbackAnalysis(zoneName?: string): AnalysisResult {
  return {
    zones_detected: [],
    overall_demand: 'medium',
    time_context: null,
    notes: zoneName
      ? `Analyse non disponible — zone ${zoneName} sélectionnée`
      : 'Analyse non disponible — sélectionnez une zone',
    recommended_target: 'demand',
    extracted_data: {
      earnings: null,
      tips: null,
      distance_km: null,
      hours_worked: null,
      trips_count: null,
      date: null,
    },
  };
}

function jsonResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
