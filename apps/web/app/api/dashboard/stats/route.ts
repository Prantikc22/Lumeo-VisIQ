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

  // Use cookies for session detection (like /api/sites)
  const cookieStore = cookies();
  let response: NextResponse | undefined = undefined;
  const supabaseServer = createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        response ||= NextResponse.next();
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        response ||= NextResponse.next();
        response.cookies.set({ name, value: '', ...options });
      }
    },
    global: {
      fetch: (...args) => fetch(...args),
    },
  });
  const today = getTodayISOString()

  // Get user session
  const { data: { session }, error: sessionError } = await supabaseServer.auth.getSession();
  if (!session || sessionError) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const userId = session.user.id;

  // Get all site IDs for this user
  const { data: sitesData, error: sitesError } = await supabaseServer
    .from('sites')
    .select('id')
    .eq('user_id', userId);
  if (sitesError) {
    return NextResponse.json({ error: sitesError.message }, { status: 500 });
  }
  const siteIds = (sitesData || []).map((site: any) => site.id);
  if (!siteIds.length) {
    // No sites for this user, return empty stats
    return NextResponse.json({
      eventsToday: 0,
      highRiskToday: 0,
      totalVisitors: 0,
      uniqueVisitors: 0,
      topCountries: [],
      riskBreakdown: { low: 0, medium: 0, high: 0 },
      recentActivity: [],
      eventsOverTime: {}
    });
  }

  // 1. Events today (daily visitors = total events today)
  const { count: dailyVisitors } = await supabaseServer
    .from('events')
    .select('id', { count: 'exact', head: true })
    .gte('timestamp', today)
    .in('site_id', siteIds)

  // 2. High-risk events today (from properties.verdict)
  const { count: highRiskToday } = await supabaseServer
    .from('events')
    .select('id', { count: 'exact', head: true })
    .gte('timestamp', today)
    .in('site_id', siteIds)
    .contains('properties', { verdict: 'high' })

  // 3. Cumulative total visitors (all-time, not just today)
  const { count: totalVisitors } = await supabaseServer
    .from('events')
    .select('id', { count: 'exact', head: true })
    .in('site_id', siteIds)

  // 4. Unique visitors today (distinct visitor_id or fingerprint_hash)
  const { data: uniqVisitorsData } = await supabaseServer
    .from('events')
    .select('visitor_id, properties')
    .gte('timestamp', today)
    .in('site_id', siteIds)

  const dailyUniqueVisitors = uniqVisitorsData
    ? new Set(uniqVisitorsData.map((v: any) => v.visitor_id || v.properties?.fingerprint_hash)).size
    : 0;

  // 5. Cumulative unique visitors (all-time, not just today)
  const { data: allUniqVisitorsData } = await supabaseServer
    .from('events')
    .select('visitor_id, properties')
    .in('site_id', siteIds)

  const uniqueVisitors = allUniqVisitorsData
    ? new Set(allUniqVisitorsData.map((v: any) => v.visitor_id || v.properties?.fingerprint_hash)).size
    : 0;

  // 5. Top countries today (from properties.ip_country)
  const { data: countryRows } = await supabaseServer
    .from('events')
    .select('properties')
    .gte('timestamp', today)
    .in('site_id', siteIds)

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
    .in('site_id', siteIds)

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
    .in('site_id', siteIds)
    .order('timestamp', { ascending: false })
    .limit(10);

  // 8. Events over time (hourly counts for today)
  const { data: timeRows } = await supabaseServer
    .from('events')
    .select('timestamp')
    .gte('timestamp', today)
    .in('site_id', siteIds);
  const eventsOverTime: Record<string, number> = {};
  timeRows?.forEach((row: any) => {
    const hour = new Date(row.timestamp).getHours();
    eventsOverTime[hour] = (eventsOverTime[hour] || 0) + 1;
  });

  return NextResponse.json({
    eventsToday: dailyVisitors || 0, // for backward compatibility, eventsToday = dailyVisitors
    highRiskToday: highRiskToday || 0,
    totalVisitors: totalVisitors || 0,
    uniqueVisitors: uniqueVisitors || 0,
    dailyVisitors: dailyVisitors || 0,
    dailyUniqueVisitors: dailyUniqueVisitors || 0,
    topCountries,
    riskBreakdown: { low: lowRisk, medium: mediumRisk, high: highRisk },
    recentActivity: recentEvents || [],
    eventsOverTime
  })
}
