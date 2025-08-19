import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseServer } from '@/lib/supabaseServer'
import { getIPInfo } from '@/lib/ipinfo'
import { velocityCount } from '@/lib/velocity'
import { computeRisk } from '@/lib/risk'

const VerifyTrialSchema = z.object({
  siteKey: z.string(),
  fingerprint_hash: z.string(),
  email: z.string().email().optional()
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parse = VerifyTrialSchema.safeParse(body)
    if (!parse.success) {
      return NextResponse.json({ allow: false, reason: 'Invalid body', details: parse.error.errors }, { status: 400 })
    }
    const { siteKey, fingerprint_hash } = parse.data

    // Lookup latest visitor_event in last 10 minutes
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    const { data: events, error } = await supabaseServer
      .from('visitor_events')
      .select('*')
      .eq('site_key', siteKey)
      .eq('fingerprint_hash', fingerprint_hash)
      .gt('created_at', since)
      .order('created_at', { ascending: false })
      .limit(1)
    if (error) {
      return NextResponse.json({ allow: false, reason: 'db_error', details: error.message }, { status: 500 })
    }
    if (!events || events.length === 0) {
      return NextResponse.json({ allow: false, reason: 'no_recent_event' }, { status: 404 })
    }
    const event = events[0]

    // Optionally refresh IPinfo/velocity (for speed, use stored event fields)
    const info = event.ip ? await getIPInfo(event.ip) : null
    const v = await velocityCount(supabaseServer, siteKey, fingerprint_hash, 60)
    const vpnDetected = info?.privacy?.vpn || info?.privacy?.hosting || false
    const timezoneMismatch = info?.timezone && event.timezone ? info.timezone !== event.timezone : true
    // Abuse status from event
    const abuseListed = !!event.blocklisted_ip

    // Recompute risk
    const { score, verdict } = computeRisk({
      incognito: !!event.incognito,
      vpn: vpnDetected,
      timezoneMismatch,
      webdriver: !!event.browser_headless,
      abuseListed,
      velocityCount: v
    })

    // Manual blocklist
    let allow = true
    let reason: string | undefined
    const { data: blocks } = await supabaseServer
      .from('manual_blocks')
      .select('id')
      .eq('site_key', siteKey)
      .or(`fingerprint_hash.eq.${fingerprint_hash},ip.eq.${event.ip}`)
      .is('expires_at', null)
      .limit(1)
    if (blocks && blocks.length > 0) {
      allow = false
      reason = 'manual_block'
    }

    // Get client settings
    const { data: clientApp } = await supabaseServer
      .from('client_apps')
      .select('auto_block, risk_threshold')
      .eq('site_key', siteKey)
      .maybeSingle()
    const risk_threshold = clientApp?.risk_threshold ?? 80
    const auto_block = clientApp?.auto_block ?? false

    if (auto_block && score >= risk_threshold) {
      allow = false
      reason = 'auto_block'
    }

    return NextResponse.json({ allow, reason, score, verdict })
  } catch (err: any) {
    return NextResponse.json({ allow: false, reason: 'server_error', details: err.message }, { status: 500 })
  }
}
