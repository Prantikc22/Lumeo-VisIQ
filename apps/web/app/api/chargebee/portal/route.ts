import { NextResponse } from "next/server";
import chargebee from "chargebee";

chargebee.configure({
  site: process.env.CHARGEBEE_SITE!,
  api_key: process.env.CHARGEBEE_API_KEY!,
});

export async function POST(req: Request) {
  try {
    // Get the user's Chargebee customer id from Supabase or request
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }
    // Find the customer by email
    const customerResult = await chargebee.customer.list({ email: { is: email } }).request();
    const customer = customerResult.list?.[0]?.customer;
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    // Create a portal session
    const result = await chargebee.portal_session.create({ customer: { id: customer.id } }).request();
    return NextResponse.json({ url: result.portal_session.access_url });
  } catch (err: any) {
    console.error("Chargebee portal error:", err.response?.body || err.message);
    return NextResponse.json({ error: err.response?.body || err.message || "Internal Server Error" }, { status: 500 });
  }
}