import { SupabaseClient } from '@supabase/supabase-js'
import dayjs from 'dayjs'

export async function velocityCount(
  supabase: SupabaseClient,
  siteKey: string,
  visitorId: string,
  windowMinutes = 60
): Promise<number> {
  const since = dayjs().subtract(windowMinutes, 'minute').toISOString()
  // Lookup site_id from sites table using api_key
  const { data: siteRow, error: siteError } = await supabase
    .from('sites')
    .select('id')
    .eq('api_key', siteKey)
    .maybeSingle();
  if (!siteRow || siteError) return 0;
  const { count } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('site_id', siteRow.id)
    .eq('visitor_id', visitorId)
    .gt('timestamp', since)
  return count || 0
}
