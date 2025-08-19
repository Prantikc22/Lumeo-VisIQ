// TODO: Add auth check when ready
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

import { withCORS } from '../withCORS';

export const GET = withCORS(async function GET(req: Request) {
  // Get siteKey from query param
  const { searchParams } = new URL(req.url);
  const siteKey = searchParams.get('siteKey');
  if (!siteKey) {
    return new NextResponse(JSON.stringify({ error: 'Missing siteKey param' }), { status: 400 });
  }

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get() { return undefined; },
        set() {},
        remove() {},
      }
    }
  );
  // Only return blocks for the specified siteKey (tenant)
  const { data, error } = await supabase
    .from('manual_blocks')
    .select('*')
    .eq('site_key', siteKey)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[BLOCKS API] Supabase error:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
  const blocks = (data || []).map((row: any) => ({
    id: row.id,
    type: row.fingerprint_hash ? 'fingerprint' : 'ip',
    value: row.fingerprint_hash || row.ip,
    reason: row.reason,
    site_key: row.site_key,
    created_at: row.created_at,
    expires_at: row.expires_at
  }));
  return new NextResponse(JSON.stringify({ blocks }), { status: 200 });
});


export const POST = withCORS(async function POST(req: Request) {
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
  console.log('SSR DEBUG BLOCKS POST:', {
    cookies: cookies(),
    session,
    sessionError,
    env_url: process.env.SUPABASE_URL,
    env_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'present' : 'missing',
  });
  if (!session || sessionError) {
    return NextResponse.json({ error: 'Not authenticated', debug: { session, sessionError, cookies: cookies() } }, { status: 401 });
  }
  const body = await req.json();
  console.log('[BLOCKS API][POST] Incoming body:', body);
  const { type, value, reason, site_key, expires_at } = body;
  if (!type || !value || !site_key) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  // Check site ownership
  const { data: site, error: siteError } = await supabase.from('sites').select('user_id').eq('api_key', site_key).maybeSingle();
  if (!site || siteError || site.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const insert: any = { site_key, reason, expires_at: expires_at || null };
  if (type === 'ip') insert.ip = value;
  else if (type === 'fingerprint') insert.fingerprint_hash = value;
  else return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  const { data, error } = await supabase.from('manual_blocks').insert(insert).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ block: data });
});
