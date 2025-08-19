// TODO: Add auth check when ready
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { stringify } from 'csv-stringify/sync'

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET(req: Request) {
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: cookies() });
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (!session || sessionError) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  // Parse query params for filters (same as /api/visitors)
  const { searchParams } = new URL(req.url)
  const site = searchParams.get('site')
  const verdict = searchParams.get('verdict')
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  // Check site ownership if filtering by site
  let allowedSiteId: string | undefined = undefined;
  let siteIds: string[] = [];
  if (site) {
    const { data: siteRow, error: siteError } = await supabaseServer.from('sites').select('id,user_id').eq('api_key', site).maybeSingle();
    if (!siteRow || siteError || siteRow.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Invalid or forbidden site', details: siteError?.message }, { status: 403 });
    }
    allowedSiteId = siteRow.id;
  } else {
    // If no site specified, only export events for sites owned by the user
    const { data: sites, error: sitesError } = await supabaseServer.from('sites').select('id').eq('user_id', session.user.id);
    if (sitesError) {
      return NextResponse.json({ error: sitesError.message }, { status: 500 });
    }
    allowedSiteId = undefined;
    siteIds = (sites || []).map((s: any) => s.id);
  }

  let query = supabaseServer.from('events').select('*');
  if (site) {
    query = query.eq('site_id', allowedSiteId);
  } else {
    if (!siteIds || siteIds.length === 0) {
      return NextResponse.json({ error: 'No sites found for user' }, { status: 404 });
    }
    query = query.in('site_id', siteIds);
  }
  if (verdict) query = query.eq('verdict', verdict);
  if (start) query = query.gte('created_at', start);
  if (end) query = query.lte('created_at', end);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // CSV fields
  const columns = [
    'created_at', 'ip', 'ip_city', 'ip_country', 'ip_org', 'fingerprint_hash', 'risk_score', 'verdict', 'incognito', 'vpn', 'velocity_count', 'abuse_listed', 'timezone_mismatch', 'browser_headless', 'site_key'
  ];
  const csv = stringify(data || [], { header: true, columns });
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="visitors.csv"'
    }
  });
}
