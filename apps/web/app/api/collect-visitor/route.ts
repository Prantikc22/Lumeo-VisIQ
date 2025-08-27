export const runtime = 'nodejs';
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
import { ipInList, emailIsDisposable } from './utils';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

import { withCORS } from '../withCORS';

export const OPTIONS = withCORS(async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
});

function normalizeBotdResult(botd: any) {
  if (!botd) return undefined;
  // If BotD OSS result is just {bot: false}, normalize to {result: 'notDetected'}
  if (typeof botd === 'object' && botd !== null && botd.bot === false) {
    return { result: 'notDetected' };
  }
  return botd;
}

export const POST = withCORS(async function POST(req: Request) {
  try {
    const body = await req.json()
    const parse = CollectVisitorSchema.safeParse(body)
    if (!parse.success) {
      return NextResponse.json({ error: 'Invalid body', details: parse.error.errors }, { status: 400 })
    }
    const {
      siteKey, fingerprint_hash, userAgent, language, timezone, resolution, referrer = '', incognito = false, webdriver = false, thumbmark_signals, email, phone, name, botd_result
    } = parse.data

    // IP detection
    const ip = (headers().get('x-forwarded-for')?.split(',')[0] ?? (req as any).ip ?? (req as any).socket?.remoteAddress ?? '').trim()
    if (!ip) return NextResponse.json({ error: 'IP not found' }, { status: 400 })

    // OSS Tor/Proxy/Disposable Email checks
    // Lookup site_id, repeat_signup_limit, user_id, and trial abuse settings from sites table using api_key
    const { data: siteRow, error: siteError } = await supabaseServer.from('sites').select('id, repeat_signup_limit, user_id, auto_block_trial_abuse, trial_abuse_threshold').eq('api_key', siteKey).maybeSingle();
    if (!siteRow || siteError) {
      return NextResponse.json({ error: 'invalid_site_key', details: 'Site not found for provided siteKey' }, { status: 400 });
    }
    // Check API usage quota BEFORE running any expensive operations
    let quotaExceeded = false;
    if (siteRow.user_id) {
      const { data: usageRows, error: usageFetchErr } = await supabaseServer
        .from('user_api_usage')
        .select('used, quota, cycle_end')
        .eq('user_id', siteRow.user_id)
        .limit(1);
      if (usageFetchErr) {
        console.error('[COLLECT-VISITOR][USAGE] Failed to fetch usage row:', usageFetchErr, { user_id: siteRow.user_id });
      }
      if (usageRows && usageRows.length > 0) {
        const { used, quota, cycle_end } = usageRows[0];
        const now = new Date();
        if (!cycle_end || new Date(cycle_end) < now) {
          quotaExceeded = true;
        } else if (quota > 0 && used >= quota) {
          quotaExceeded = true;
        }
      }
    }
    if (quotaExceeded) {
      return NextResponse.json({ error: 'quota_exceeded', details: 'API quota reached for this account.' }, { status: 429 });
    }
    // The rest of the handler now just uses siteRow; do not redeclare or re-check quota below.

    // OSS Tor/Proxy/Disposable Email checks (async, robust)
    // Use correct path for disposable email domains
    // Correct path to disposable-email-domains.txt from monorepo root
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
    if (!rl.allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })

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
    let suspiciousReason: string | null = null;
    let suspicious: boolean = false;
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

    // Lookup site_id, repeat_signup_limit, user_id, and trial abuse settings from sites table using api_key
    console.log('[DEBUG siteKey]', siteKey);
    console.log('[DEBUG siteRow FULL]', JSON.stringify(siteRow));
    console.log('[DEBUG siteRow.auto_block_trial_abuse]', siteRow ? siteRow.auto_block_trial_abuse : undefined);
    console.log('[DEBUG siteError]', siteError);
    if (!siteRow || siteError) {
      return NextResponse.json({ error: 'invalid_site_key', details: 'Site not found for provided siteKey' }, { status: 400 });
    }
    const autoBlockTrialAbuse = siteRow.auto_block_trial_abuse ?? false;
    const trialAbuseThreshold = siteRow.trial_abuse_threshold ?? 2; // Default threshold = 2

    // Check API usage quota BEFORE running IPInfo or event insert
    if (siteRow.user_id) {
      const { data: usageRows, error: usageFetchErr } = await supabaseServer
        .from('user_api_usage')
        .select('used, quota, cycle_end')
        .eq('user_id', siteRow.user_id)
        .limit(1);
      if (usageFetchErr) {
        console.error('[COLLECT-VISITOR][USAGE] Failed to fetch usage row:', usageFetchErr, { user_id: siteRow.user_id });
      }
      if (usageRows && usageRows.length > 0) {
        const { used, quota, cycle_end } = usageRows[0];
        const now = new Date();
        if (!cycle_end || new Date(cycle_end) < now) {
          quotaExceeded = true;
        } else if (quota > 0 && used >= quota) {
          quotaExceeded = true;
        }
      }
    }
    if (quotaExceeded) {
      return NextResponse.json({ error: 'quota_exceeded', details: 'API quota reached for this account.' }, { status: 429 });
    }

    // Upsert visitor before inserting event to satisfy FK constraint
    const { data: upsertedVisitor, error: upsertVisitorErr } = await supabaseServer.from('visitors').upsert({
      id: visitor_id, // must be UUID
      site_id: siteRow.id,
      visitor_id: visitor_id, // keep as UUID
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
      risk_score: 0,
      is_tor: isTor,
      is_proxy: isProxy,
      is_temp_email: isTempEmail
    }, { onConflict: 'id' });
    console.log('[DEBUG upsertedVisitor]', upsertedVisitor);
    console.log('[DEBUG upsertVisitorErr]', upsertVisitorErr);
    if (upsertVisitorErr) {
      return NextResponse.json({ error: 'db_upsert_visitor_failed', details: upsertVisitorErr.message }, { status: 500 });
    }
    // [TRIAL ABUSE BLOCK LOGIC] Count unique emails for this fingerprint/site BEFORE event insert
    if (email && fingerprint_hash) {
      // Insert new email into visitor_emails if not already present
      const { data: existingEmail, error: emailLookupErr } = await supabaseServer
        .from('visitor_emails')
        .select('id')
        .eq('site_id', siteRow.id)
        .eq('fingerprint', fingerprint_hash)
        .eq('email', email.toLowerCase())
        .maybeSingle();
      if (!emailLookupErr && !existingEmail) {
        await supabaseServer.from('visitor_emails').insert({
          site_id: siteRow.id,
          fingerprint: fingerprint_hash,
          email: email.toLowerCase(),
          created_at: new Date().toISOString()
        });
      }
      // Count unique emails from visitor_emails
      const { data: emailRows, error: emailErr } = await supabaseServer
        .from('visitor_emails')
        .select('email')
        .eq('site_id', siteRow.id)
        .eq('fingerprint', fingerprint_hash);
      console.log('[DEBUG trial abuse visitor_emails] emailRows:', emailRows);
      if (!emailErr && emailRows) {
        const uniqueEmails = Array.from(new Set(emailRows.map((r: any) => (r.email || '').toLowerCase()).filter(Boolean)));
        console.log('[DEBUG trial abuse visitor_emails] uniqueEmails:', uniqueEmails, 'length:', uniqueEmails.length, 'threshold:', trialAbuseThreshold, 'autoBlockTrialAbuse:', autoBlockTrialAbuse);
        // If threshold reached or exceeded
        if (uniqueEmails.length >= trialAbuseThreshold) {
          if (autoBlockTrialAbuse) {
            // Check if already blocked for trial abuse
            const { data: existingBlock, error: blockErr } = await supabaseServer
              .from('manual_blocks')
              .select('id')
              .eq('site_key', siteKey)
              .eq('fingerprint_hash', fingerprint_hash)
              .eq('reason', 'trial abuse: multiple emails')
              .maybeSingle();
            console.log('[DEBUG trial abuse visitor_emails] blockErr:', blockErr, 'existingBlock:', existingBlock);
            if (!blockErr && !existingBlock) {
              const { error: insertBlockErr, data: insertBlockData } = await supabaseServer.from('manual_blocks').insert({
                fingerprint_hash,
                reason: 'trial abuse: multiple emails',
                site_key: siteKey
              });
              console.log('[DEBUG trial abuse visitor_emails] block insert error:', insertBlockErr, 'block insert data:', insertBlockData);
              manualBlock = true;
              blockReason = 'trial abuse: multiple emails';
              action = 'auto_block';
              finalScore = 100;
              finalVerdict = 'high';
            }
          } else if (!manualBlock) {
            suspicious = true;
            suspiciousReason = `Multiple emails (${uniqueEmails.length}) for same fingerprint`;
          }
        }
      } else {
        console.log('[DEBUG trial abuse visitor_emails] emailErr:', emailErr);
      }
    }
    // --- Event insert logic START ---
    // Fetch and increment visit_count
    let newVisitCount = 1;
    const { data: visitorRow, error: visitorFetchErr } = await supabaseServer
      .from('visitors')
      .select('visit_count')
      .eq('id', visitor_id)
      .maybeSingle();
    if (!visitorFetchErr && visitorRow && typeof visitorRow.visit_count === 'number') {
      newVisitCount = visitorRow.visit_count + 1;
      await supabaseServer
        .from('visitors')
        .update({ visit_count: newVisitCount, last_seen: new Date().toISOString() })
        .eq('id', visitor_id);
    } else {
      // fallback: set to 1 if not found or error
      await supabaseServer
        .from('visitors')
        .update({ visit_count: 1, last_seen: new Date().toISOString() })
        .eq('id', visitor_id);
    }
    // Insert event and get ID
    const { data: insertedEvent, error: insertErr } = await supabaseServer.from('events').insert({
      site_id: siteRow.id,
      visitor_id,
      event_type: 'page_view',
      event_name: 'page_view',
      url: '',
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
        is_bot: false,
        browser: body.browser || '',
        os: body.os || '',
        resolution: body.resolution || '',
        timezone: body.timezone || '',
        userAgent: body.userAgent || '',
        signals: Array.isArray(body.signals) ? body.signals : (body.thumbmark_signals?.signals || []),
        gps_location: body.geo && body.geo.lat && body.geo.lon ? { lat: body.geo.lat, lon: body.geo.lon, accuracy: body.geo.accuracy } : undefined,
        gps_permission: body.geo?.permission,
        emulator_detected: !!body.emulator?.isEmulator,
        emulator_reasons: body.emulator?.reasons || [],
        geo_mismatch: (body.geo && body.geo.lat && body.geo.lon && info && info.loc) ? (Math.abs(body.geo.lat - info.loc[0]) > 0.5 || Math.abs(body.geo.lon - info.loc[1]) > 0.5) : false,
        location_spoofed: (body.geo && body.geo.lat && body.geo.lon && info && info.loc) ? (Math.abs(body.geo.lat - info.loc[0]) > 1.5 || Math.abs(body.geo.lon - info.loc[1]) > 1.5) : false,
        suspicious,
        suspiciousReason,
        visit_count: newVisitCount
      },
      timestamp: new Date().toISOString()
    }).select('id').single();
    if (insertErr) {
      return NextResponse.json({ error: 'db_insert_failed', details: insertErr.message }, { status: 500 });
    }
    // --- Event insert logic END ---

      const { data: usageRows, error: usageFetchErr } = await supabaseServer
        .from('user_api_usage')
        .select('used, quota, cycle_end')
        .eq('user_id', siteRow.user_id)
        .limit(1);
      if (usageFetchErr) {
        console.error('[COLLECT-VISITOR][USAGE] Failed to fetch usage row:', usageFetchErr, { user_id: siteRow.user_id });
      }
      if (usageRows && usageRows.length > 0) {
        const { used, quota, cycle_end } = usageRows[0];
        const now = new Date();
        if (!cycle_end || new Date(cycle_end) < now) {
          quotaExceeded = true;
        } else if (quota > 0 && used >= quota) {
          quotaExceeded = true;
        }
      }

    // Count unique emails for this fingerprint/site
    if (email && fingerprint_hash) {
      const { data: emailRows, error: emailErr } = await supabaseServer
        .from('visitors')
        .select('email')
        .eq('site_id', siteRow.id)
        .eq('fingerprint', fingerprint_hash)
        .neq('email', null);
      if (!emailErr && emailRows) {
        const uniqueEmails = Array.from(new Set(emailRows.map((r: any) => (r.email || '').toLowerCase()).filter(Boolean)));
        // If threshold reached or exceeded
        if (uniqueEmails.length >= trialAbuseThreshold) {
          if (autoBlockTrialAbuse) {
            // Check if already blocked for trial abuse
            const { data: existingBlock, error: blockErr } = await supabaseServer
              .from('manual_blocks')
              .select('id')
              .eq('site_key', siteKey)
              .eq('fingerprint_hash', fingerprint_hash)
              .eq('reason', 'trial abuse: multiple emails')
              .maybeSingle();
            if (!blockErr && !existingBlock) {
              await supabaseServer.from('manual_blocks').insert({
                fingerprint_hash,
                reason: 'trial abuse: multiple emails',
                site_key: siteKey
              });
              manualBlock = true;
              blockReason = 'trial abuse: multiple emails';
              action = 'auto_block';
              finalScore = 100;
              finalVerdict = 'high';
            }
          } else if (!manualBlock) {
            suspicious = true;
            suspiciousReason = `Multiple emails (${uniqueEmails.length}) for same fingerprint`;
          }
        }
      }
    }
    // Increment API usage for this user
    try {
      if (siteRow.user_id) {
        // Try to increment used
        const { data: usageRows, error: usageFetchErr } = await supabaseServer
          .from('user_api_usage')
          .select('used, quota')
          .eq('user_id', siteRow.user_id)
          .limit(1);
        if (usageFetchErr) {
          console.error('[COLLECT-VISITOR][USAGE] Failed to fetch usage row:', usageFetchErr, { user_id: siteRow.user_id });
        }
        if (usageRows && usageRows.length > 0) {
          const currentUsed = usageRows[0].used || 0;
          const quota = usageRows[0].quota || 0;
          const { error: usageUpdateErr } = await supabaseServer
            .from('user_api_usage')
            .update({ used: currentUsed + 1, updated_at: new Date().toISOString() })
            .eq('user_id', siteRow.user_id);
          if (usageUpdateErr) {
            console.error('[COLLECT-VISITOR][USAGE] Failed to increment usage:', usageUpdateErr, { user_id: siteRow.user_id });
          }
        } else {
          // Insert new usage row if not present
          const { error: usageInsertErr } = await supabaseServer
            .from('user_api_usage')
            .insert({ user_id: siteRow.user_id, used: 1, quota: 0, updated_at: new Date().toISOString() });
          if (usageInsertErr) {
            console.error('[COLLECT-VISITOR][USAGE] Failed to insert usage row:', usageInsertErr, { user_id: siteRow.user_id });
          }
        }
      }
    } catch (err) {
      console.error('[COLLECT-VISITOR][USAGE] Unexpected error incrementing API usage:', err, { user_id: siteRow.user_id });
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
      visitor_event_id: insertedEvent.id,
      signals: {
        vpnDetected,
        timezoneMismatch,
        velocityCount: v
      }
    }))
  } catch (err: any) {
    return NextResponse.json({ error: 'server_error', details: err.message }, { status: 500 })
  }
});
