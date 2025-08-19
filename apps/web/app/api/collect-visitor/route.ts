console.log('[CASCADE DEBUG] collect-visitor route.ts loaded');
import { NextResponse } from 'next/server'
import path from 'path';
import { fileURLToPath } from 'url';
import { headers } from 'next/headers'
import { z } from 'zod'
import { redis, tokenBucket } from '@/lib/redis'
import { getIPInfo } from '@/lib/ipinfo'
import { checkAbuseIP } from '@/lib/abuse'
import { velocityCount } from '@/lib/velocity'
import { computeRisk } from '@/lib/risk'
import { supabaseServer } from '@/lib/supabaseServer'
import { v5 as uuidv5 } from 'uuid';

// OSS Tor/Proxy/Disposable Email helpers (module scope for ES5 strict mode)
export async function ipInList(ip: string, file: string): Promise<boolean> {
  try {
    const { readFile } = await import('fs/promises');
    const data = await readFile(file, 'utf8');
    const set = new Set(data.split('\n').map(l => l.trim()).filter(Boolean));
    return set.has(ip);
  } catch { return false; }
}

export async function emailIsDisposable(email: string, file: string): Promise<boolean> {
  if (!email) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  try {
    const { readFile } = await import('fs/promises');
    const data = await readFile(file, 'utf8');
    if (domain === 'zzz.com' || domain === 'gmail.com') {
      // Log file path
      console.log('[DISPOSABLE FILE PATH]', file);
      // Log first and last 20 lines
      const lines = data.split('\n');
      console.log('[DISPOSABLE FILE HEAD]', lines.slice(0, 20));
      console.log('[DISPOSABLE FILE TAIL]', lines.slice(-20));
      // Log last 200 chars
      console.log('[DISPOSABLE RAW FILE]', JSON.stringify(data.slice(-200)), 'LENGTH:', data.length);
    }
    // Defensive: trim domain and all set values
    // Remove invisible characters and normalize lines
    const clean = (s: string) => s.replace(/[\u200B-\u200D\uFEFF\r\n\t ]+/g, '').toLowerCase();
    const set = new Set(data.split('\n').map(l => clean(l)).filter(Boolean));
    return set.has(clean(domain));
  } catch { return false; }
}

const CollectVisitorSchema = z.object({
  siteKey: z.string(),
  fingerprint_hash: z.string(),
  userAgent: z.string(),
  language: z.string(),
  timezone: z.string(),
  resolution: z.string(),
  referrer: z.string().optional(),
  incognito: z.boolean().optional(),
  webdriver: z.boolean().optional(),
  thumbmark_signals: z.any().optional(),
  thumbmark_details: z.any().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  name: z.string().optional(),
  botd_result: z.any().optional(),
})

function withCORS(res: Response) {
  res.headers.set('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.headers.set('Vary', 'Origin');
  return res;
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:8080",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400"
    }
  });
}

function normalizeBotdResult(botd: any) {
  if (!botd) return undefined;
  // If BotD OSS result is just {bot: false}, normalize to {result: 'notDetected'}
  if (typeof botd === 'object' && botd !== null && botd.bot === false) {
    return { result: 'notDetected' };
  }
  return botd;
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parse = CollectVisitorSchema.safeParse(body)
    if (!parse.success) {
      return withCORS(NextResponse.json({ error: 'Invalid body', details: parse.error.errors }, { status: 400 }))
    }
    const {
      siteKey, fingerprint_hash, userAgent, language, timezone, resolution, referrer = '', incognito = false, webdriver = false, thumbmark_signals, email, phone, name, botd_result
    } = parse.data

    // IP detection
    const ip = (headers().get('x-forwarded-for')?.split(',')[0] ?? (req as any).ip ?? (req as any).socket?.remoteAddress ?? '').trim()
    if (!ip) return withCORS(NextResponse.json({ error: 'IP not found' }, { status: 400 }))

    // OSS Tor/Proxy/Disposable Email checks
    // OSS Tor/Proxy/Disposable Email checks (async, robust)
    // Use correct path for disposable email domains
    // Correct path to disposable-email-domains.txt from monorepo root
    const disposableFilePath = path.resolve(process.cwd(), '../../packages/disposable-email-domains.txt');
    let debugTempEmailDomain = '';
    let debugTempEmailResult = false;
    // Log the resolved path and file existence
    const fs = await import('fs');
            if (email) {
      debugTempEmailDomain = email.split('@')[1]?.toLowerCase();
      debugTempEmailResult = await emailIsDisposable(email, disposableFilePath);
          }
    const [isTor, isProxy] = await Promise.all([
      ipInList(ip, path.join(__dirname, '../../../packages/tor-exit-nodes.txt')),
      ipInList(ip, path.join(__dirname, '../../../packages/proxy-list.txt'))
    ]);
    const isTempEmail = debugTempEmailResult;


    // Rate limit
    const rl = await tokenBucket(`rl:${ip}`, 60, 1)
    if (!rl.allowed) return withCORS(NextResponse.json({ error: 'rate_limited' }, { status: 429 }))

    // IPInfo
    const info = await getIPInfo(ip)

    // Timezone mismatch (MVP: compare string presence)
    let timezoneMismatch = false
    if (info?.timezone && timezone) {
      timezoneMismatch = info.timezone !== timezone
    } else {
      timezoneMismatch = true
    }

    // AbuseIPDB
    const abuse = await checkAbuseIP(ip)

    // Velocity
    // Use visitor_id for velocityCount as per schema
    // If you do not have visitor_id from the request, generate one (UUID) or derive it deterministically
    // Use fingerprint_hash (or thumbmark hash) as stable visitor_id if possible
    let visitor_id = fingerprint_hash;
    // If not a valid UUID, create a deterministic UUID from the hash
    const uuidValidate = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
    if (!uuidValidate(visitor_id)) {
      // Use a deterministic UUID based on the hash (v5, but simple fallback here)
      const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // DNS namespace
      visitor_id = uuidv5(fingerprint_hash, NAMESPACE);
    }
    const v = await velocityCount(supabaseServer, siteKey, visitor_id, 60)

    // Compute risk
    const vpnDetected = info?.privacy?.vpn || info?.privacy?.hosting || false
    const { score, verdict } = computeRisk({
      incognito,
      vpn: vpnDetected,
      timezoneMismatch,
      webdriver,
      abuseListed: abuse.blocklisted,
      velocityCount: v
    })

    // Manual blocklist
    let action = 'manual_review'
    let manualBlock = false
    let blockId: string | null = null
    let blockReason: string | null = null
    const { data: blocks } = await supabaseServer
      .from('manual_blocks')
      .select('id,reason')
      .eq('site_key', siteKey)
      .or(`fingerprint_hash.eq.${fingerprint_hash},ip.eq.${ip}`)
      .is('expires_at', null)
      .limit(1)
    if (blocks && blocks.length > 0) {
      manualBlock = true
      blockId = blocks[0].id
      blockReason = blocks[0].reason
    }
    let finalScore = score
    let finalVerdict = verdict
    if (manualBlock) {
      action = 'auto_block'
      finalScore = 100
      finalVerdict = 'high'
    }

    // Lookup site_id and repeat_signup_limit from sites table using api_key
    const { data: siteRow, error: siteError } = await supabaseServer.from('sites').select('id, repeat_signup_limit').eq('api_key', siteKey).maybeSingle();
    if (!siteRow || siteError) {
      return withCORS(NextResponse.json({ error: 'invalid_site_key', details: 'Site not found for provided siteKey' }, { status: 400 }));
    }
    // Upsert visitor before inserting event to satisfy FK constraint
    await supabaseServer.from('visitors').upsert({
      id: visitor_id,
      site_id: siteRow.id,
      visitor_id: visitor_id.toString(),
      fingerprint: fingerprint_hash,
      thumbmark: thumbmark_signals?.hash || '',
      user_agent: userAgent,
      screen_resolution: resolution,
      timezone,
      language,
      platform: '',
      ip_address: ip,
      country: info?.country ?? '',
      city: info?.city ?? '',
      region: info?.region ?? '',
      isp: info?.org ?? '',
      is_bot: false,
      email: email || null,
      phone: phone || null,
      name: name || null,
      botd_result: botd_result || null,
      risk_score: 0,
      is_tor: isTor,
      is_proxy: isProxy,
      is_temp_email: isTempEmail
    }, { onConflict: 'id' });
    // Insert event
    // Insert event using only schema fields and available data
    const { data: inserted, error: insertErr } = await supabaseServer.from('events').insert({
      site_id: siteRow.id,
      visitor_id,
      event_type: 'page_view',
      event_name: 'page_view',
      url: '', // Not available from SDK, set blank
      referrer,
      properties: {
        fingerprint_hash,
        thumbmark_signals,
        thumbmark_details: body.thumbmark_details || {},
        risk_score: finalScore,
        verdict: finalVerdict,
        ip,
        ip_city: info?.city ?? '',
        ip_country: info?.country ?? '',
        ip_org: info?.org ?? '',
        email: body.email || undefined,
        botd_result: normalizeBotdResult(body.botd_result),
        is_tor: isTor,
        is_proxy: isProxy,
        is_temp_email: !!isTempEmail,
        vpnDetected,
        is_bot: false, // update with real detection if available
        // Ensure these are always present for frontend display
        browser: body.browser || '',
        os: body.os || '',
        resolution: body.resolution || '',
        timezone: body.timezone || '',
        userAgent: body.userAgent || '',
        signals: Array.isArray(body.signals) ? body.signals : (body.thumbmark_signals?.signals || []),
        // Advanced detection fields
        gps_location: body.geo && body.geo.lat && body.geo.lon ? { lat: body.geo.lat, lon: body.geo.lon, accuracy: body.geo.accuracy } : undefined,
        gps_permission: body.geo?.permission,
        emulator_detected: !!body.emulator?.isEmulator,
        emulator_reasons: body.emulator?.reasons || [],
        geo_mismatch: (body.geo && body.geo.lat && body.geo.lon && info && info.loc) ? (Math.abs(body.geo.lat - info.loc[0]) > 0.5 || Math.abs(body.geo.lon - info.loc[1]) > 0.5) : false,
        location_spoofed: (body.geo && body.geo.lat && body.geo.lon && info && info.loc) ? (Math.abs(body.geo.lat - info.loc[0]) > 1.5 || Math.abs(body.geo.lon - info.loc[1]) > 1.5) : false
      },
      timestamp: new Date().toISOString()
    }).select('id').single()
    if (insertErr) {
      return withCORS(NextResponse.json({ error: 'db_insert_failed', details: insertErr.message }, { status: 500 }))
    }

    // Get client settings
    const { data: clientApp } = await supabaseServer
      .from('client_apps')
      .select('auto_block, risk_threshold, share_reputation')
      .eq('site_key', siteKey)
      .maybeSingle()
    const risk_threshold = clientApp?.risk_threshold ?? 80
    const auto_block = clientApp?.auto_block ?? false
    const share_reputation = clientApp?.share_reputation ?? false

    // Decide action
    if (auto_block && finalScore >= risk_threshold) {
      action = 'auto_block'
    }

    // Share reputation
    if (share_reputation && finalVerdict === 'high') {
      await supabaseServer.from('global_reputation').upsert({
        fingerprint_hash,
        ip,
        abuse_count: 1,
        last_seen: new Date().toISOString()
      }, { onConflict: 'fingerprint_hash,ip' })
    }

    return withCORS(NextResponse.json({
      risk_score: finalScore,
      verdict: finalVerdict,
      action,
      visitor_event_id: inserted.id,
      signals: {
        vpnDetected,
        timezoneMismatch,
        velocityCount: v
      }
    }))
  } catch (err: any) {
    return withCORS(NextResponse.json({ error: 'server_error', details: err.message }, { status: 500 }))
  }
}
