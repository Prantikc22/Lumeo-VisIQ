// TODO: Add auth check when ready
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = params.id
  const body = await req.json()
  const update: any = {}
  if ('name' in body) update.name = body.name
  if ('webhook_url' in body) update.webhook_url = body.webhook_url
  if ('auto_block' in body) update.auto_block = body.auto_block
  if ('risk_threshold' in body) update.risk_threshold = body.risk_threshold
  if ('repeat_signup_limit' in body) update.repeat_signup_limit = body.repeat_signup_limit
  const { data, error } = await supabaseServer.from('sites').update(update).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ site: data })
}

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: cookies() });
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (!session || sessionError) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const id = params.id;
  // Check site ownership
  const { data: site, error: siteError } = await supabaseServer.from('sites').select('user_id').eq('id', id).maybeSingle();
  if (!site || siteError || site.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { error } = await supabaseServer.from('sites').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
