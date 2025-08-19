// TODO: Add auth check when ready
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

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
  // Get the block to find its site_key
  const { data: block, error: blockError } = await supabaseServer.from('manual_blocks').select('site_key').eq('id', id).maybeSingle();
  if (!block || blockError) {
    return NextResponse.json({ error: 'Block not found' }, { status: 404 });
  }
  // Check site ownership
  const { data: site, error: siteError } = await supabaseServer.from('sites').select('user_id').eq('api_key', block.site_key).maybeSingle();
  if (!site || siteError || site.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  // Delete the block
  const { error } = await supabaseServer.from('manual_blocks').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
