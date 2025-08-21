import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// This handler expects Chargebee to send events for subscription changes
// It updates the user_billing table with the new plan for the user

export async function POST(req: NextRequest) {
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: req.cookies }
      );

  const body = await req.json();
  // Chargebee sends event type and subscription/customer info
  const event = body.event_type;
  const subscription = body.content?.subscription;
  const customer = body.content?.customer;

  if (!subscription || !customer) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  // Look up Supabase user_id by customer.email
  let user_id: string | null = null;
  if (customer.email) {
    const { data: user, error: userError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', customer.email)
      .single();
    if (user && user.id) {
      user_id = user.id;
    } else {
      console.error('Supabase user not found for Chargebee email', customer.email, userError);
      return NextResponse.json({ error: 'Supabase user not found for Chargebee email' }, { status: 404 });
    }
  } else {
    return NextResponse.json({ error: 'No customer email in Chargebee payload' }, { status: 400 });
  }

  const plan_id = subscription.plan_id;
  const plan_name = subscription.plan_id;
  const subscription_id = subscription.id;
  const renewal_date = subscription.next_billing_at
    ? new Date(subscription.next_billing_at * 1000).toISOString()
    : null;

  // Upsert user_billing record
  const { error } = await supabase.from('user_billing').upsert([
    {
      user_id,
      plan_id,
      plan_name,
      subscription_id,
      renewal_date
    }
  ], { onConflict: 'user_id' });

  if (error) {
    console.error('Supabase upsert error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
