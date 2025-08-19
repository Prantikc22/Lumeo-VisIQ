// Add this field to your Supabase 'sites' table if not already present:
// repeat_signup_limit: integer (default 1)

// In your settings UI, let customers set this value:
// "Maximum allowed signups from the same device/browser (fingerprint) before blocking: [ 1 | 2 | 3 | ... ]"

// Backend pseudocode for signup protection:
const { repeat_signup_limit = 1 } = siteSettings // fetch from 'sites' table for this site

const { count: signupsFromFingerprint } = await supabaseServer
  .from('visitors')
  .select('id', { count: 'exact', head: true })
  .eq('site_id', siteRow.id)
  .eq('fingerprint', fingerprint_hash)

if (signupsFromFingerprint >= repeat_signup_limit) {
  // Block or flag as abuse
}

// This logic can be added to your /api/collect-visitor or /api/verify-trial endpoint.
// Default is 1, but customer can set to any value in dashboard settings.
