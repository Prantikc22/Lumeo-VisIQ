import { NextRequest, NextResponse } from "next/server";
import DodoPayments from "dodopayments";

export const runtime = "nodejs";
console.log((process.env.DODO_PAYMENTS_API_KEY || "").slice(0,6), process.env.DODO_ENV);
function resolveEnv() {
  const raw = (process.env.DODO_ENV || "").trim();
  return raw === "test_mode" || raw === "live_mode" ? raw : "live_mode";
}

export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as { email: string };
    if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

    const apiKey =
      process.env.DODO_PAYMENTS_API_KEY ||
      process.env.DODO_API_KEY ||
      "";

    if (!apiKey) {
      return NextResponse.json({ error: "Dodo API key not set" }, { status: 500 });
    }

    const client = new DodoPayments({
      bearerToken: apiKey,
      environment: resolveEnv(),
    });

    // Find or create customer by email
    const list = await client.customers.list({ email, page_size: 1, page_number: 0 });
    let customerId = list?.items?.[0]?.customer_id as string | undefined;

    if (!customerId) {
      const created = await client.customers.create({ email, name: email.split("@")[0] });
      customerId = created.customer_id;
    }

    const portal = await client.customers.customerPortal.create(customerId);
    if (!portal?.link) return NextResponse.json({ error: "No portal link" }, { status: 502 });

    return NextResponse.json({ url: portal.link });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
