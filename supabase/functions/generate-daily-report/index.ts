import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    // ─── Aggregate today's trips ──────────────────────────────────────
    const { data: trips, error: tripsErr } = await supabase
      .from('trips')
      .select('earnings, tips, distance_km, started_at, ended_at, zone_id')
      .gte('started_at', `${today}T00:00:00Z`)
      .lt('started_at', `${today}T23:59:59Z`)

    if (tripsErr) throw tripsErr

    const totalTrips = trips?.length ?? 0
    const totalEarnings = trips?.reduce((s, t) => s + (t.earnings ?? 0) + (t.tips ?? 0), 0) ?? 0
    const totalDistance = trips?.reduce((s, t) => s + (t.distance_km ?? 0), 0) ?? 0

    // Compute hours worked from trip timestamps
    let hoursWorked = 0
    for (const trip of trips ?? []) {
      if (trip.started_at && trip.ended_at) {
        const start = new Date(trip.started_at).getTime()
        const end = new Date(trip.ended_at).getTime()
        if (end > start) hoursWorked += (end - start) / 3_600_000
      }
    }
    hoursWorked = Math.round(hoursWorked * 100) / 100

    // ─── Identify best zone by earnings ──────────────────────────────
    const zoneEarnings: Record<string, number> = {}
    for (const trip of trips ?? []) {
      if (!trip.zone_id) continue
      zoneEarnings[trip.zone_id] = (zoneEarnings[trip.zone_id] ?? 0) + (trip.earnings ?? 0)
    }

    let bestZoneId: string | null = null
    let bestZoneEarnings = -1
    for (const [id, val] of Object.entries(zoneEarnings)) {
      if (val > bestZoneEarnings) {
        bestZoneEarnings = val
        bestZoneId = id
      }
    }

    let bestZoneName: string | null = null
    if (bestZoneId) {
      const { data: zone } = await supabase
        .from('zones')
        .select('name')
        .eq('id', bestZoneId)
        .single()
      bestZoneName = zone?.name ?? null
    }

    // ─── AI recommendation (optional, Gemini) ────────────────────────
    let aiRecommendation: string | null = null
    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    if (geminiKey && totalTrips > 0) {
      try {
        const earningsPerHour = hoursWorked > 0
          ? (totalEarnings / hoursWorked).toFixed(2)
          : 'N/A'
        const prompt = `Tu es un coach pour chauffeur Lyft/DoorDash à Montréal.
Données du jour ${today}:
- Courses: ${totalTrips}
- Revenus bruts: $${totalEarnings.toFixed(2)} CAD
- Distance: ${totalDistance.toFixed(1)} km
- Heures travaillées: ${hoursWorked.toFixed(1)} h
- $/h: ${earningsPerHour}
- Meilleure zone: ${bestZoneName ?? 'N/A'}

Donne une recommandation courte et actionnable pour demain (max 120 caractères, en français).
Réponds UNIQUEMENT avec la recommandation, pas d'explication.`

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.4, maxOutputTokens: 150 },
            }),
          }
        )

        if (geminiRes.ok) {
          const gData = await geminiRes.json()
          const rawText: string = gData?.candidates?.[0]?.content?.parts?.[0]?.text || ''
          aiRecommendation = rawText.trim().slice(0, 250) || null
        }
      } catch (err) {
        console.warn('Gemini recommendation skipped:', err)
      }
    }

    // ─── Upsert daily_reports row ─────────────────────────────────────
    const reportRow = {
      report_date: today,
      total_trips: totalTrips,
      total_earnings: Math.round(totalEarnings * 100) / 100,
      total_distance_km: Math.round(totalDistance * 100) / 100,
      hours_worked: hoursWorked,
      best_zone_name: bestZoneName,
      ai_recommendation: aiRecommendation,
    }

    const { data: existing, error: fetchErr } = await supabase
      .from('daily_reports')
      .select('id')
      .eq('report_date', today)
      .single()

    // PGRST116 = no rows found (not an actual error)
    if (fetchErr && fetchErr.code !== 'PGRST116') throw fetchErr

    if (existing) {
      const { error: upErr } = await supabase
        .from('daily_reports')
        .update(reportRow)
        .eq('id', existing.id)
      if (upErr) throw upErr
    } else {
      const { error: insErr } = await supabase
        .from('daily_reports')
        .insert(reportRow)
      if (insErr) throw insErr
    }

    return new Response(
      JSON.stringify({
        success: true,
        report: reportRow,
        action: existing ? 'updated' : 'created',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('generate-daily-report error:', err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
