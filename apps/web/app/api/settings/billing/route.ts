// app/api/settings/billing/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role; server-side only
);

// Map item_price_id -> pretty label
const PLAN_DISPLAY: Record<string, string> = {
  "Free-USD-Monthly": "Free",
  "Starter-USD-Monthly1": "Starter",
  "Growth-USD-Monthly-USD-Monthly": "Growth",
  "Business-USD-Monthly1": "Business",
  "Scale-USD-Monthly": "Scale",
};

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing bearer token" }, { status: 401 });
    }
    const token = auth.slice("Bearer ".length);

    // Resolve user from JWT
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const userId = userData.user.id;

    // Latest billing row for this user
    const { data: billingRows, error: billErr } = await supabase
      .from("user_billing")
      .select("plan_id, plan_name, renewal_date, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1);

    if (billErr) {
      return NextResponse.json({ error: "Failed to fetch billing" }, { status: 500 });
    }

    const billing = billingRows?.[0] ?? null;
    const plan_id = billing?.plan_id ?? null;
    const plan_label = plan_id ? (PLAN_DISPLAY[plan_id] ?? plan_id) : "—";
    const renewal_date = billing?.renewal_date ?? null;

    // Usage row
    const { data: usageRows, error: usageErr } = await supabase
      .from("user_api_usage")
      .select("quota, used, cycle_start, cycle_end")
      .eq("user_id", userId)
      .limit(1);

    if (usageErr) {
      return NextResponse.json({ error: "Failed to fetch usage" }, { status: 500 });
    }

    const usage = usageRows?.[0] ?? null;

    return NextResponse.json({
      plan_id,
      plan_label,
      renewal_date,
      quota: usage?.quota ?? 0,
      used: usage?.used ?? 0,
      cycle_start: usage?.cycle_start ?? null,
      cycle_end: usage?.cycle_end ?? null,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
