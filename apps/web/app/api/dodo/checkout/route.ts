import { NextRequest, NextResponse } from "next/server";
import DodoPayments from "dodopayments";

export const runtime = "nodejs"; // ensure Node runtime
console.log((process.env.DODO_PAYMENTS_API_KEY || "").slice(0,6), process.env.DODO_ENV);
function resolveEnv() {
  const raw = (process.env.DODO_ENV || "").trim();
  return raw === "test_mode" || raw === "live_mode" ? raw : "live_mode";
}

export async function POST(req: NextRequest) {
  try {
    const { email, product_id } = (await req.json()) as { email?: string; product_id: string };
    if (!product_id) return NextResponse.json({ error: "Missing product_id" }, { status: 400 });

    const apiKey =
      process.env.DODO_PAYMENTS_API_KEY ||
      process.env.DODO_API_KEY || // fallback if you kept the old name
      "";

    if (!apiKey) {
      return NextResponse.json({ error: "Dodo API key not set" }, { status: 500 });
    }

    // Instantiate INSIDE the handler so envs are definitely available
    const client = new DodoPayments({
      bearerToken: apiKey,
      environment: resolveEnv(),
    });

    const session = await client.checkoutSessions.create({
      product_cart: [{ product_id, quantity: 1 }],
      metadata: { ...(email ? { email } : {}), product_id }, 
      return_url: 'https://lumeovisiq.com/dashboard', // Your desired redirect URL

    });

    if (!session?.checkout_url) {
      return NextResponse.json({ error: "No checkout URL from Dodo" }, { status: 502 });
    }
    return NextResponse.json({ url: session.checkout_url });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
