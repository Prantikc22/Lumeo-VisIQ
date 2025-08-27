import { createBrowserClient } from '@supabase/ssr';

const browserSupabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default browserSupabase;

// Returns true if the user has an active subscription (renewal_date in the future or quota > 0)
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  // Check user_billing for future renewal_date
  const { data: billingRows, error: billingErr } = await browserSupabase
    .from('user_billing')
    .select('renewal_date')
    .eq('user_id', userId)
    .limit(1);
  if (billingErr) return false;
  if (billingRows && billingRows.length > 0) {
    const renewal = billingRows[0].renewal_date;
    if (renewal && new Date(renewal) > new Date()) return true;
  }
  // Fallback: check user_api_usage for quota
  const { data: usageRows, error: usageErr } = await browserSupabase
    .from('user_api_usage')
    .select('quota,cycle_end')
    .eq('user_id', userId)
    .limit(1);
  if (usageErr) return false;
  if (usageRows && usageRows.length > 0) {
    const { quota, cycle_end } = usageRows[0];
    if (quota > 0 && (!cycle_end || new Date(cycle_end) > new Date())) return true;
  }
  return false;
}
