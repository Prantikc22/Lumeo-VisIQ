"use client";
import { useRouter } from "next/navigation";
import browserSupabase from "@/app/lib/supabase-browser";
import React from "react";

const plans = [
  { name: "Free", item_price_id: "Free-USD-Monthly", price: "$0/mo", limit: "2,000 API calls", features: ["All core features", "Basic analytics", "Community support"] },
  { name: "Starter", item_price_id: "Starter-USD-Monthly1", price: "$29/mo", limit: "25,000 API calls", features: ["Everything in Free", "Email support", "Usage alerts"] },
  { name: "Growth", item_price_id: "Growth-USD-Monthly-USD-Monthly", price: "$99/mo", limit: "150,000 API calls", features: ["Everything in Starter", "Advanced analytics", "Priority support"] },
  { name: "Business", item_price_id: "Business-USD-Monthly1", price: "$299/mo", limit: "500,000 API calls", features: ["Everything in Growth", "Custom integrations", "SLA"] },
  { name: "Scale", item_price_id: "Scale-USD-Monthly", price: "Contact Us", limit: "1M+ API calls", features: ["Everything in Business", "Dedicated manager", "Custom SLAs"] }
];

export default function PricingPage() {
  const router = useRouter();

  const handleChoosePlan = async (item_price_id: string) => {
    const { data: { session } } = await browserSupabase.auth.getSession();
    if (!session) {
      router.push(`/login?next=/pricing`);
      return;
    }
    const res = await fetch("/api/chargebee/hosted_page", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: session.user.email, item_price_id }) // 👈 changed to item_price_id
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold mb-8">Choose Your Plan</h1>
      <div className="flex flex-wrap gap-8 justify-center">
        {plans.map(plan => (
          <div key={plan.item_price_id} className="bg-white rounded shadow p-6 w-72 flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
            <div className="text-xl mb-2">{plan.price}</div>
            <div className="mb-2 text-gray-500">{plan.limit}</div>
            <ul className="mb-4 text-sm text-gray-600 list-disc list-inside">
              {plan.features.map(f => <li key={f}>{f}</li>)}
            </ul>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded w-full mt-auto"
              onClick={() => handleChoosePlan(plan.item_price_id)}
            >
              Choose Plan
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
