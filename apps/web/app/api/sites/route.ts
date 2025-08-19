// TODO: Add auth check when ready
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { v4 as uuidv4 } from 'uuid'

import { cookies } from 'next/headers';
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
  if (!session || sessionError) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  // Only return sites belonging to the authenticated user
  const { data, error } = await supabase.from('sites')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Map api_key to site_key for frontend compatibility
  const sites = (data || []).map((site: any) => ({ ...site, site_key: site.api_key }));
  return NextResponse.json({ sites });
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
  if (!session || sessionError) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const body = await req.json();
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: 'Site name required' }, { status: 400 });
  const { data, error } = await supabase.from('sites').insert({
    name,
    domain: 'localhost',
    user_id: session.user.id
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Map api_key to site_key for frontend compatibility
  return NextResponse.json({ site: { ...data, site_key: data.api_key } });
});
