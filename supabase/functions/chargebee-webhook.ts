import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// Admin client (service role)
const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
// Webhook Basic Auth
const WEBHOOK_USER = Deno.env.get("WEBHOOK_USER") || "";
const WEBHOOK_PASS = Deno.env.get("WEBHOOK_PASS") || "";
// Quotas by Chargebee item_price_id (PC 2.0)
const ITEM_PRICE_QUOTAS = {
  "Free-USD-Monthly": 2000,
  "Starter-USD-Monthly1": 25000,
  "Growth-USD-Monthly-USD-Monthly": 150000,
  "Business-USD-Monthly1": 500000,
  "Scale-USD-Monthly": 1000000
};
const HANDLED_EVENTS = new Set([
  "subscription_created",
  "subscription_renewed",
  "subscription_changed",
  "subscription_cancelled"
]);
async function findUserIdByEmail(rawEmail) {
  const email = rawEmail.trim().toLowerCase();
  // Use Admin API (reliable across projects; public REST often cannot reach auth schema)
  try {
    // Pull first 1000; sufficient for your current testing scale.
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
serve(async (req)=>{
  try {
    // 1) Basic Auth
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Basic ")) return new Response("Unauthorized", {
      status: 401
    });
    const decoded = atob(authHeader.slice("Basic ".length).trim());
    const i = decoded.indexOf(":");
    const u = i >= 0 ? decoded.slice(0, i) : decoded;
    const p = i >= 0 ? decoded.slice(i + 1) : "";
    if (u !== WEBHOOK_USER || p !== WEBHOOK_PASS) return new Response("Unauthorized", {
      status: 401
    });
    // 2) Parse & gate
    const payload = await req.json();
    const { event_type, content } = payload;
    if (!HANDLED_EVENTS.has(event_type)) {
      return new Response("OK (ignored event)", {
        status: 200
      });
    }
    const subscription = content?.subscription;
    const customer = content?.customer;
    if (!subscription || !customer?.email) {
      return new Response("Invalid payload (missing subscription/customer)", {
        status: 400
      });
    }
    // 3) Resolve user
    const userId = await findUserIdByEmail(customer.email);
    if (!userId) {
      console.error("No matching user for email:", customer.email);
      return new Response("No matching user", {
        status: 404
      });
    }
    // 4) Extract PC 2.0 fields
    const itemPriceId = subscription?.subscription_items?.[0]?.item_price_id;
    if (!itemPriceId) {
      console.error("No item_price_id on subscription:", subscription?.id);
      return new Response("Invalid payload (no item_price_id)", {
        status: 400
      });
    }
    const subscriptionId = subscription?.id;
    const nextBillingAt = subscription?.next_billing_at;
    const renewalDateIso = nextBillingAt ? new Date(nextBillingAt * 1000).toISOString() : subscription?.current_term_end ? new Date(subscription.current_term_end * 1000).toISOString() : null;
    const quota = ITEM_PRICE_QUOTAS[itemPriceId] ?? 0;
    // 5) user_billing (singular) — update-if-exists else insert
    const { data: existingBilling, error: getBillErr } = await supabase.from("user_billing").select("id").eq("user_id", userId).limit(1);
    if (getBillErr) {
      console.error("user_billing select error:", getBillErr);
      return new Response("DB error (user_billing select)", {
        status: 500
      });
    }
    if (event_type === "subscription_cancelled") {
      if (existingBilling && existingBilling.length > 0) {
        const { error: updErr } = await supabase.from("user_billing").update({
          plan_id: itemPriceId,
          plan_name: itemPriceId,
          subscription_id: subscriptionId ?? null,
          renewal_date: null,
          updated_at: new Date().toISOString()
        }).eq("user_id", userId);
        if (updErr) {
          console.error("user_billing update (cancel) error:", updErr);
          return new Response("DB error (user_billing cancel)", {
            status: 500
          });
        }
      } else {
        const { error: insErr } = await supabase.from("user_billing").insert({
          user_id: userId,
          plan_id: itemPriceId,
          plan_name: itemPriceId,
          subscription_id: subscriptionId ?? null,
          renewal_date: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        if (insErr) {
          console.error("user_billing insert (cancel) error:", insErr);
          return new Response("DB error (user_billing cancel insert)", {
            status: 500
          });
        }
      }
      // Optional: end the usage window now
      const { error: usageCancelErr } = await supabase.from("user_api_usage").update({
        cycle_end: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).eq("user_id", userId);
      if (usageCancelErr) console.error("user_api_usage update (cancel) error:", usageCancelErr);
      return new Response("OK", {
        status: 200
      });
    }
    // created/renewed/changed → user_billing write
    if (existingBilling && existingBilling.length > 0) {
      const { error: updErr } = await supabase.from("user_billing").update({
        plan_id: itemPriceId,
        plan_name: itemPriceId,
        subscription_id: subscriptionId ?? null,
        renewal_date: renewalDateIso,
        updated_at: new Date().toISOString()
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
        plan_id: itemPriceId,
        plan_name: itemPriceId,
        subscription_id: subscriptionId ?? null,
        renewal_date: renewalDateIso,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      if (insErr) {
        console.error("user_billing insert error:", insErr);
        return new Response("DB error (user_billing insert)", {
          status: 500
        });
      }
    }
    // 6) user_api_usage upsert-like
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
      cycle_start: subscription.current_term_start ? new Date(subscription.current_term_start * 1000).toISOString() : null,
      cycle_end: subscription.current_term_end ? new Date(subscription.current_term_end * 1000).toISOString() : null,
      updated_at: new Date().toISOString()
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
