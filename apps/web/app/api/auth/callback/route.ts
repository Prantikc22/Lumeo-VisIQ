import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const { event, session } = await req.json();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookies() }
  );
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    await supabase.auth.setSession(session);
  }
  if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
    await supabase.auth.signOut();
  }
  return NextResponse.json({ success: true });
}
