// TODO: Add auth check when ready
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createServerClient } from '@supabase/ssr';

import { withCORS } from '../withCORS';

export const GET = withCORS(async function GET(req: Request) {
  const cookieStore = cookies();
  let response: NextResponse | undefined = undefined;
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
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
      global: { fetch: (...args) => fetch(...args) },
    }
  );
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  console.log('SSR DEBUG VISITORS POST', {
    cookies: cookies(),
    session,
    sessionError,
    env_url: process.env.SUPABASE_URL,
    env_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'present' : 'missing',
  });
  console.log('SSR DEBUG VISITORS', {
    cookies: cookies(),
    session,
    sessionError,
    env_url: process.env.SUPABASE_URL,
    env_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'present' : 'missing',
  });
  console.log('SSR DEBUG VISITORS GET:', {
    cookies: cookies(),
    session,
    sessionError,
    env_url: process.env.SUPABASE_URL,
    env_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'present' : 'missing',
  });
  if (!session || sessionError) {
    return NextResponse.json({ error: 'Not authenticated', debug: { session, sessionError, cookies: cookies() } }, { status: 401 });
  }
  // Parse query params for pagination/filters
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')
  const offset = (page - 1) * pageSize
  const site = searchParams.get('site')
  const verdict = searchParams.get('verdict')
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  // Get all site_ids for this user
  const { data: sites, error: sitesError } = await supabase.from('sites').select('id').eq('user_id', session.user.id);
  if (sitesError) {
    return NextResponse.json({ error: sitesError.message }, { status: 500 });
  }
  const siteIds = (sites || []).map((s: any) => s.id);

  let query = supabase.from('events').select('*', { count: 'exact' }).in('site_id', siteIds);
  if (site) {
    // Lookup site_id from sites table using api_key
    const { data: siteRow, error: siteError } = await supabase.from('sites').select('id').eq('api_key', site).maybeSingle();
    if (!siteRow || siteError) {
      return NextResponse.json({ error: 'Invalid site', details: siteError?.message }, { status: 400 })
    }
    query = query.eq('site_id', siteRow.id)
  }
  if (verdict) query = query.eq('verdict', verdict)
  if (start) query = query.gte('timestamp', start)
  if (end) query = query.lte('timestamp', end)
  query = query.order('timestamp', { ascending: false }).range(offset, offset + pageSize - 1)

  const { data, count, error } = await query
  if (error) {
    console.error('[VISITORS API] Supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Map fingerprint_hash from properties to top-level for dashboard compatibility
  const mapped = (data || []).map((event: any) => ({
    ...event,
    fingerprint_hash: event.properties?.fingerprint_hash || '',
    risk_score: event.properties?.risk_score ?? null,
    verdict: event.properties?.verdict ?? '',
    ip: event.properties?.ip ?? '',
    ip_city: event.properties?.ip_city ?? '',
    ip_country: event.properties?.ip_country ?? '',
    ip_org: event.properties?.ip_org ?? '',
    signals: Array.isArray(event.signals) ? event.signals : []
  }))
  return NextResponse.json({ events: mapped, total: count })
});
