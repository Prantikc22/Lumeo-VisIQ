// supabase/functions/dodopayment/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// Admin client (service role)
const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
// Webhook secret from Dodo (paste exactly as shown there, usually starts with "whsec_")
const WEBHOOK_SECRET = (Deno.env.get("DODO_PAYMENTS_WEBHOOK_SECRET") || "").trim();
// === Quotas: supports old Chargebee codes + your new Dodo product_ids ===
const ITEM_PRICE_QUOTAS = {
  "Free-USD-Monthly": 2000,
  "Starter-USD-Monthly1": 25000,
  "Growth-USD-Monthly-USD-Monthly": 150000,
  "Business-USD-Monthly1": 500000,
  "Scale-USD-Monthly": 1000000,
  "pdt_62vRd7Coq5dDHEo0dG8XG": 2000,
  "pdt_fh8OkdklHQCdeXGfUfzz6": 25000,
  "pdt_ymWoIrqD34xdnEgP1zfTh": 150000,
  "pdt_bxwVE7k46iihRc5sic03H": 500000,
  "pdt_xaKpL1DVG6MKzWtVY1uv1": 1000000,
  "pdt_7QTupnhTTO7P6AYzw6I3P": 2000,
  "pdt_rHv6C3XW8TLUX2C7jiX3f": 25000,
  "pdt_Zebig578m3gbu9LSqTJCc": 150000,
  "pdt_Mrcnohw7coIDFpwgEgn7g": 500000,
  "pdt_DILOH67XtnK6QLhUmbGYe": 1000000
};
// Events to handle
const HANDLED_EVENTS = new Set([
  "subscription.active",
  "subscription.renewed",
  "subscription.plan_changed",
  "subscription.cancelled"
]);
function tsc(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for(let i = 0; i < a.length; i++)r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
// Normalize Base64/URL-safe Base64 (remove padding, then compare variants)
function toBase64Url(b64) {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function addB64Padding(s) {
  const m = s.length % 4;
  return m === 0 ? s : s + "====".slice(m);
}
async function importHmacKey(secret) {
  // Try Svix-style: remove "whsec_" and base64-decode; if that fails, use raw UTF-8
  const enc = new TextEncoder();
  const cleaned = secret.replace(/^whsec_/, "");
  try {
    const bytes = Uint8Array.from(atob(cleaned), (c)=>c.charCodeAt(0));
    return await crypto.subtle.importKey("raw", bytes, {
      name: "HMAC",
      hash: "SHA-256"
    }, false, [
      "sign"
    ]);
  } catch  {
    return await crypto.subtle.importKey("raw", enc.encode(secret), {
      name: "HMAC",
      hash: "SHA-256"
    }, false, [
      "sign"
    ]);
  }
}
async function hmacBase64(key, id, ts, body) {
  const enc = new TextEncoder();
  const data = `${id}.${ts}.${body}`;
  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sigBuf))); // standard Base64
}
async function verifySignature(req, raw) {
  if (!WEBHOOK_SECRET) return false;
  const key = await importHmacKey(WEBHOOK_SECRET);
  // 1) Svix headers
  const svixId = req.headers.get("svix-id") || req.headers.get("svix_id") || "";
  const svixTs = req.headers.get("svix-timestamp") || req.headers.get("svix_timestamp") || "";
  const svixSig = req.headers.get("svix-signature") || req.headers.get("svix_signature") || "";
  if (svixId && svixTs && svixSig) {
    const oursB64 = await hmacBase64(key, svixId, svixTs, raw);
    const oursB64Url = toBase64Url(oursB64);
    // svix-signature may contain one or more entries like: "v1,BASE64" separated by spaces
    const theirs = svixSig.split(/\s+/).map((p)=>p.trim()).filter(Boolean).map((part)=>{
      const [, sig] = part.split(",");
      return (sig || "").trim();
    });
    // Their signatures might be base64url or standard base64, with or without padding
    for (const t of theirs){
      const tNorm = toBase64Url(addB64Padding(t));
      if (tsc(tNorm, oursB64Url)) return true;
      if (tsc(addB64Padding(t), oursB64)) return true;
    }
  }
  // 2) Standard headers (webhook-*) — Dodo may send versioned "v1,<base64>"
  const stdId = req.headers.get("webhook-id") || "";
  const stdTs = req.headers.get("webhook-timestamp") || "";
  let stdSig = (req.headers.get("webhook-signature") || "").trim();
  if (stdId && stdTs && stdSig) {
    // Strip optional "v1," prefix (or any "<ver>,")
    if (stdSig.includes(",")) {
      const parts = stdSig.split(",");
      stdSig = parts[parts.length - 1].trim(); // take last segment = actual Base64
    }
    const oursB64 = await hmacBase64(key, stdId, stdTs, raw);
    const oursB64Url = toBase64Url(oursB64);
    // Compare Base64URL (no padding) and standard Base64 (with padding)
    const stdSigUrl = toBase64Url(addB64Padding(stdSig));
    if (tsc(stdSigUrl, oursB64Url)) return true;
    if (tsc(addB64Padding(stdSig), oursB64)) return true;
  }
  return false;
}
async function findUserIdByEmail(rawEmail) {
  const email = (rawEmail || "").trim().toLowerCase();
  if (!email) return null;
  try {
    const { data } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    });
    const match = data?.users?.find((u)=>(u.email || "").toLowerCase() === email);
    return match?.id ?? null;
  } catch (e) {
    console.error("[lookup] admin.listUsers error:", e);
    return null;
  }
}
function candidateEmailsFrom(sub) {
  const out = [];
  // Common places
  if (sub?.customer?.email) out.push(sub.customer.email);
  if (sub?.customer_email) out.push(sub.customer_email);
  if (sub?.billing_email) out.push(sub.billing_email);
  // Metadata (when you created checkout you sent metadata: { email })
  const md = sub?.metadata || {};
  for (const k of [
    "email",
    "customer_email",
    "billing_email",
    "supabase_user_email",
    "supabase_email"
  ]){
    if (md && md[k]) out.push(md[k]);
  }
  // Normalize / dedupe
  return Array.from(new Set(out.map((e)=>String(e || "").trim().toLowerCase()).filter(Boolean)));
}
serve(async (req)=>{
  try {
    const raw = await req.text();
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch  {
      return new Response("Invalid JSON", {
        status: 400
      });
    }
    const ok = await verifySignature(req, raw);
    if (!ok) {
      // minimal bread-crumbs without leaking secrets
      const hasSvix = !!(req.headers.get("svix-id") && req.headers.get("svix-timestamp") && req.headers.get("svix-signature"));
      const hasStd = !!(req.headers.get("webhook-id") && req.headers.get("webhook-timestamp") && req.headers.get("webhook-signature"));
      console.error("Signature verify failed", {
        hasSvix,
        hasStd
      });
      return new Response("Invalid signature", {
        status: 401
      });
    }
    const event_type = payload?.type;
    const subscription = payload?.data;
    if (!HANDLED_EVENTS.has(event_type)) {
      return new Response("OK (ignored event)", {
        status: 200
      });
    }
    // Try to resolve a Supabase user from multiple possible email fields
    const emails = candidateEmailsFrom(subscription);
    let userId = null;
    let resolvedEmail = "";
    for (const e of emails){
      userId = await findUserIdByEmail(e);
      if (userId) {
        resolvedEmail = e;
        break;
      }
    }
    if (!userId) {
      // Don’t fail the webhook; just ack and log. Dodo test payloads often use dummy emails.
      console.warn("No matching user — ignoring event. Candidate emails:", emails);
      return new Response("OK (no matching user; ignored)", {
        status: 200
      });
    }
    const productId = subscription.product_id;
    const subscriptionId = subscription.subscription_id ?? null;
    const renewalDateIso = subscription.next_billing_date ?? null;
    const cycleStartIso = subscription.previous_billing_date ?? subscription.current_term_start ?? subscription.created_at ?? null;
    const cycleEndIso = subscription.next_billing_date ?? subscription.current_term_end ?? subscription.expires_at ?? null;
    const quota = ITEM_PRICE_QUOTAS[productId] ?? 0;
    const { data: existingBilling, error: getBillErr } = await supabase.from("user_billing").select("id").eq("user_id", userId).limit(1);
    if (getBillErr) {
      console.error("user_billing select error:", getBillErr);
      return new Response("DB error (user_billing select)", {
        status: 500
      });
    }
    const nowIso = new Date().toISOString();
    const isCancel = event_type === "subscription.cancelled";
    if (existingBilling && existingBilling.length > 0) {
      const { error: updErr } = await supabase.from("user_billing").update({
        plan_id: productId,
        plan_name: productId,
        subscription_id: subscriptionId,
        renewal_date: isCancel ? null : renewalDateIso,
        updated_at: nowIso
      }).eq("user_id", userId);
      if (updErr) {
        console.error("user_billing update error:", updErr);
        return new Response("DB error (user_billing update)", {
          status: 500
        });
      }
    } else {
      const { error: insErr } = await supabase.from("user_billing").insert({
        user_id: userId,
        plan_id: productId,
        plan_name: productId,
        subscription_id: subscriptionId,
        renewal_date: isCancel ? null : renewalDateIso,
        created_at: nowIso,
        updated_at: nowIso
      });
      if (insErr) {
        console.error("user_billing insert error:", insErr);
        return new Response("DB error (user_billing insert)", {
          status: 500
        });
      }
    }
    if (isCancel) {
      const { error: usageCancelErr } = await supabase.from("user_api_usage").update({
        cycle_end: nowIso,
        updated_at: nowIso
      }).eq("user_id", userId);
      if (usageCancelErr) console.error("user_api_usage update (cancel) error:", usageCancelErr);
      return new Response("OK", {
        status: 200
      });
    }
    const { data: existingUsage, error: getUsageErr } = await supabase.from("user_api_usage").select("user_id").eq("user_id", userId).limit(1);
    if (getUsageErr) {
      console.error("user_api_usage select error:", getUsageErr);
      return new Response("DB error (user_api_usage select)", {
        status: 500
      });
    }
    const usagePayload = {
      user_id: userId,
      quota,
      used: 0,
      cycle_start: cycleStartIso,
      cycle_end: cycleEndIso,
      updated_at: nowIso
    };
    if (existingUsage && existingUsage.length > 0) {
      const { error: usageUpdErr } = await supabase.from("user_api_usage").update(usagePayload).eq("user_id", userId);
      if (usageUpdErr) {
        console.error("user_api_usage update error:", usageUpdErr);
        return new Response("DB error (user_api_usage update)", {
          status: 500
        });
      }
    } else {
      const { error: usageInsErr } = await supabase.from("user_api_usage").insert(usagePayload);
      if (usageInsErr) {
        console.error("user_api_usage insert error:", usageInsErr);
        return new Response("DB error (user_api_usage insert)", {
          status: 500
        });
      }
    }
    return new Response("OK", {
      status: 200
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Server error", {
      status: 500
    });
  }
});