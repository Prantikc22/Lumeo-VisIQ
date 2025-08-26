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
  if ('auto_block_trial_abuse' in body) update.auto_block_trial_abuse = body.auto_block_trial_abuse
  if ('trial_abuse_threshold' in body) update.trial_abuse_threshold = body.trial_abuse_threshold
  const { data, error } = await supabaseServer.from('sites').update(update).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ site: data })
}

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
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
  const id = params.id;
  // Check site ownership
  const { data: site, error: siteError } = await supabase.from('sites').select('user_id').eq('id', id).maybeSingle();
  if (!site || siteError || site.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { error } = await supabase.from('sites').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Fetch updated sites for the user after deletion
  const { data: sites, error: fetchError } = await supabase.from('sites').select('*').eq('user_id', session.user.id);
  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
  return NextResponse.json({ success: true, sites });
}
