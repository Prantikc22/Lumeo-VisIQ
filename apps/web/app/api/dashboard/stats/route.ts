import { NextResponse } from 'next/server'
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';


function getTodayISOString() {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now.toISOString()
}

export async function GET() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable");
  }

  const supabaseServer = createServerClient(url, key, {
    cookies: cookies(),
    global: {
      fetch: (...args) => fetch(...args),
    },
  });
  const today = getTodayISOString()

  // 1. Events today (total visitors = total events)
  const { count: eventsToday } = await supabaseServer
    .from('events')
    .select('id', { count: 'exact', head: true })
    .gte('timestamp', today)

  // 2. High-risk events today (from properties.verdict)
  const { count: highRiskToday } = await supabaseServer
    .from('events')
    .select('id', { count: 'exact', head: true })
    .gte('timestamp', today)
    .contains('properties', { verdict: 'high' })

  // 3. Total visitors today (not unique, for billing)
  const totalVisitors = eventsToday || 0;

  // 4. Unique visitors today (distinct visitor_id or fingerprint_hash)
  const { data: uniqVisitorsData } = await supabaseServer
    .from('events')
    .select('visitor_id, properties')
    .gte('timestamp', today)

  const uniqueVisitors = uniqVisitorsData
    ? new Set(uniqVisitorsData.map((v: any) => v.visitor_id || v.properties?.fingerprint_hash)).size
    : 0;

  // 5. Top countries today (from properties.ip_country)
  const { data: countryRows } = await supabaseServer
    .from('events')
    .select('properties')
    .gte('timestamp', today)

  const countryCounts: Record<string, number> = {}
  countryRows?.forEach((row: any) => {
    const country = row.properties?.ip_country;
    if (country) countryCounts[country] = (countryCounts[country] || 0) + 1;
  })
  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([country, count]) => ({ country, count }))

  // 6. Risk breakdown (low, medium, high)
  const { data: riskRows } = await supabaseServer
    .from('events')
    .select('properties')
    .gte('timestamp', today)

  let lowRisk = 0, mediumRisk = 0, highRisk = 0;
  riskRows?.forEach((row: any) => {
    const verdict = row.properties?.verdict;
    if (verdict === 'low') lowRisk++;
    else if (verdict === 'medium') mediumRisk++;
    else if (verdict === 'high') highRisk++;
  });

  // 7. Recent activity (last 10 events)
  const { data: recentEvents } = await supabaseServer
    .from('events')
    .select('id, timestamp, visitor_id, properties')
    .gte('timestamp', today)
    .order('timestamp', { ascending: false })
    .limit(10);

  // 8. Events over time (hourly counts for today)
  const { data: timeRows } = await supabaseServer
    .from('events')
    .select('timestamp')
    .gte('timestamp', today);
  const eventsOverTime: Record<string, number> = {};
  timeRows?.forEach((row: any) => {
    const hour = new Date(row.timestamp).getHours();
    eventsOverTime[hour] = (eventsOverTime[hour] || 0) + 1;
  });

  return NextResponse.json({
    eventsToday: eventsToday || 0,
    highRiskToday: highRiskToday || 0,
    totalVisitors,
    uniqueVisitors,
    topCountries,
    riskBreakdown: { low: lowRisk, medium: mediumRisk, high: highRisk },
    recentActivity: recentEvents || [],
    eventsOverTime
  })
}
