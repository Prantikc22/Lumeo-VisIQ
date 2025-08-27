"use client";
import { useRouter } from "next/navigation";
import browserSupabase from "@/app/lib/supabase-browser";
import React from "react";

// DodoPayments products (your created product_id values)
const plans = [
  { name: "Free",     product_id: "pdt_7QTupnhTTO7P6AYzw6I3P", price: "$0/mo",   limit: "2,000 API calls",  features: ["All core features", "Basic analytics", "Community support"] },
  { name: "Starter",  product_id: "pdt_rHv6C3XW8TLUX2C7jiX3f", price: "$29/mo",  limit: "25,000 API calls", features: ["Everything in Free", "Email support", "Usage alerts"] },
  { name: "Growth",   product_id: "pdt_Zebig578m3gbu9LSqTJCc", price: "$99/mo",  limit: "150,000 API calls",features: ["Everything in Starter", "Advanced analytics", "Priority support"] },
  { name: "Business", product_id: "pdt_Mrcnohw7coIDFpwgEgn7g", price: "$299/mo", limit: "500,000 API calls",features: ["Everything in Growth", "Custom integrations", "SLA"] },
  { name: "Scale",    product_id: "pdt_DILOH67XtnK6QLhUmbGYe", price: "$699/mo", limit: "1M+ API calls",    features: ["Everything in Business", "Dedicated manager", "Custom SLAs"] }
];

export default function PricingPage() {
  const router = useRouter();

  const handleChoosePlan = async (product_id: string) => {
    const { data: { session } } = await browserSupabase.auth.getSession();
    if (!session) {
      router.push(`/login?next=/pricing`);
      return;
    }
    const res = await fetch("/api/dodo/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: session.user.email, product_id })
    });
    const { url, error } = await res.json();
    if (error) {
      alert(error);
      return;
    }
    if (url) window.location.href = url;
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold mb-8">Choose Your Plan</h1>
      <div className="flex flex-wrap gap-8 justify-center">
        {plans.map(plan => (
          <div key={plan.product_id} className="bg-white rounded shadow p-6 w-72 flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
            <div className="text-xl mb-2">{plan.price}</div>
            <div className="mb-2 text-gray-500">{plan.limit}</div>
            <ul className="mb-4 text-sm text-gray-600 list-disc list-inside">
              {plan.features.map(f => <li key={f}>{f}</li>)}
            </ul>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded w-full mt-auto"
              onClick={() => handleChoosePlan(plan.product_id)}
            >
              Choose Plan
            </button>
          </div>
        ))}
      </div>

      {/* --- Feature comparison (unchanged content, but keys now use product_id) --- */}
      <section className="w-full max-w-6xl mx-auto mt-16 px-4">
        <details className="group bg-white border border-slate-200 rounded-2xl p-6">
          <summary className="cursor-pointer list-none flex items-center justify-between">
            <div>
              <p className="text-sm tracking-widest text-slate-500 font-medium uppercase">
                Comparison
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">
                Compare all features
              </h2>
              <p className="mt-2 text-slate-600">
                All features & signals are included on every plan. Only monthly API calls
                and support level vary.
              </p>
            </div>
            <span className="ml-6 text-slate-500 transition-transform group-open:rotate-180">
              ▾
            </span>
          </summary>

          <div className="overflow-x-auto mt-6">
            <table className="min-w-full border-separate border-spacing-y-2 text-sm">
              <thead>
                <tr>
                  <th className="text-left text-slate-500 font-medium p-3">Feature</th>
                  {plans.map((p) => (
                    <th key={p.product_id} className="text-left text-slate-900 font-semibold p-3">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* --- Plan limits --- */}
                <tr className="align-top">
                  <th className="p-3 bg-slate-50 rounded-l-xl text-slate-700">Monthly API calls</th>
                  {plans.map((p) => (
                    <td key={p.product_id + '-limit'} className="p-3 bg-slate-50 rounded-r-xl">
                      <span className="font-medium text-slate-900">{p.limit}</span>
                    </td>
                  ))}
                </tr>

                {/* --- Identification & Decisions (all ✅) --- */}
                {[
                  "Visitor ID (industry-leading accuracy)",
                  "AI Auto-Block (real-time risky visitor blocking)",
                  "Trial Abuse Prevention",
                  "Confidence Score",
                  "Velocity Signals",
                  "URL Hashing",
                ].map((row) => (
                  <tr key={row} className="align-top">
                    <th className="p-3 text-slate-700">{row}</th>
                    {plans.map((p) => (
                      <td key={p.product_id + row} className="p-3">
                        <span className="inline-flex items-center gap-2 text-blue-600 font-medium">
                          <span aria-hidden>✓</span> Included
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}

                {/* --- Smart Signals (all ✅) --- */}
                {[
                  "VPN / Proxy / IP Blocklist Matching",
                  "IP Geolocation & Location-Aware Insights",
                  "Browser Tamper / Headless / Incognito Detection",
                  "Browser Bot & Virtual Machine Detection",
                  "Android Emulator / Rooted / Cloned / Factory-Reset / Frida Detection",
                  "Geolocation Spoofing & MitM Detection",
                  "High-Activity Device, Privacy-Focused Browser",
                  "Raw Device Attributes",
                  "Suspect Score",
                ].map((row) => (
                  <tr key={row} className="align-top">
                    <th className="p-3 text-slate-700">{row}</th>
                    {plans.map((p) => (
                      <td key={p.product_id + row} className="p-3">
                        <span className="inline-flex items-center gap-2 text-blue-600 font-medium">
                          <span aria-hidden>✓</span> Included
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}

                {/* --- Support levels (varies) --- */}
                <tr className="align-top">
                  <th className="p-3 text-slate-700">Support level</th>
                  {plans.map((p) => {
                    const m: Record<string, string> = {
                      Free: "Community",
                      Starter: "Email",
                      Growth: "Priority",
                      Business: "SLA-backed",
                      Scale: "Dedicated manager",
                    };
                    return (
                      <td key={p.product_id + '-support'} className="p-3">
                        <span className="text-slate-900 font-medium">{m[p.name] ?? "Support"}</span>
                      </td>
                    );
                  })}
                </tr>

                {/* --- Security & compliance (mostly same) --- */}
                <tr className="align-top">
                  <th className="p-3 text-slate-700">Security & compliance</th>
                  {plans.map((p) => (
                    <td key={p.product_id + '-sec'} className="p-3 text-slate-700">
                      <div>GDPR & CCPA aligned</div>
                      <div>Payload encryption (at rest & in transit)</div>
                      <div>Audit logging</div>
                    </td>
                  ))}
                </tr>

                {/* --- Data retention (varies) --- */}
                <tr className="align-top">
                  <th className="p-3 text-slate-700">Data retention</th>
                  {plans.map((p) => {
                    const m: Record<string, string> = {
                      Free: "30 days",
                      Starter: "30 days",
                      Growth: "30 days",
                      Business: "90 days",
                      Scale: "Custom",
                    };
                    return (
                      <td key={p.product_id + '-retention'} className="p-3">
                        <span className="text-slate-900 font-medium">{m[p.name] ?? "30 days"}</span>
                      </td>
                    );
                  })}
                </tr>

                {/* --- SLA / Enterprise (varies) --- */}
                <tr className="align-top">
                  <th className="p-3 text-slate-700">SLA / Enterprise options</th>
                  {plans.map((p) => {
                    const m: Record<string, string> = {
                      Free: "—",
                      Starter: "—",
                      Growth: "—",
                      Business: "SLA available",
                      Scale: "Custom SLAs & security reviews",
                    };
                    return (
                      <td key={p.product_id + '-sla'} className="p-3 text-slate-700">
                        {m[p.name]}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </details>
      </section>
    </main>
  );
}
