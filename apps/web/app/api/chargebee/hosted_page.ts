import { NextResponse } from "next/server";
import chargebee from "chargebee";

chargebee.configure({
  site: process.env.CHARGEBEE_SITE!,
  api_key: process.env.CHARGEBEE_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { email, item_price_id } = await req.json();

    if (!email || !item_price_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await chargebee.hosted_page.checkout_new_for_items({
      customer: { email },
      subscription_items: [
        {
          item_price_id,
          quantity: 1,
        },
      ],
      discounts: [] // ✅ fix TS complaint (optional, API ignores empty array)
    }).request();

    return NextResponse.json({ url: result.hosted_page.url });
  } catch (err: any) {
    console.error("Chargebee error:", err.response?.body || err.message);
    return NextResponse.json(
      { error: err.response?.body || err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
