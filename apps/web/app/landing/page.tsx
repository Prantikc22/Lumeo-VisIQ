import React from "react";
import Link from "next/link";

// --- Lumeo VisIQ Branding ---
const BRAND = {
  name: "Lumeo VisIQ",
  tagline: "Identify Every Visitor. Stop fraud, detect bots, delight customers.",
  colors: {
    primary: "#0f172a",
    accent: "#fbbf24",
    bg: "#f1f5f9",
    card: "#fff",
    border: "#22223b"
  },
  logo: "/logo.svg" // Place your SVG logo in public folder
};

const plans = [
  {
    name: "Free",
    price: "$0/mo",
    limit: "2,000 API calls",
    plan_id: "Free-USD-Monthly",
    features: ["All core features", "Basic analytics", "Community support"]
  },
  {
    name: "Starter",
    price: "$29/mo",
    limit: "25,000 API calls",
    plan_id: "Starter-USD-Monthly1",
    features: ["Everything in Free", "Email support", "Usage alerts"]
  },
  {
    name: "Growth",
    price: "$99/mo",
    limit: "150,000 API calls",
    plan_id: "Growth-USD-Monthly-USD-Monthly",
    features: ["Everything in Starter", "Advanced analytics", "Priority support"]
  },
  {
    name: "Business",
    price: "$299/mo",
    limit: "500,000 API calls",
    plan_id: "Business-USD-Monthly1",
    features: ["Everything in Growth", "Custom integrations", "SLA"]
  },
  {
    name: "Scale",
    price: "Contact Us",
    limit: "1M+ API calls",
    plan_id: "Scale-USD-Monthly",
    features: ["Everything in Business", "Dedicated manager", "Custom SLAs"]
  }
];

export default function LandingPage() {
  return (
    <main style={{ background: BRAND.colors.bg, minHeight: "100vh" }}>
      {/* Hero Section */}
      <section style={{
        background: BRAND.colors.primary,
        color: BRAND.colors.accent,
        padding: "4rem 0",
        boxShadow: "8px 8px 0 #22223b"
      }} className="text-center">
        <img src={BRAND.logo} alt="Lumeo VisIQ Logo" style={{ height: 60, margin: "0 auto 1rem" }} />
        <h1 style={{ fontSize: "3rem", fontWeight: 900, letterSpacing: -2, marginBottom: 8 }}>{BRAND.name}</h1>
        <p style={{ fontSize: "1.5rem", fontWeight: 500, color: "#fff", marginBottom: 24 }}>{BRAND.tagline}</p>
        <div className="flex gap-4 justify-center mt-4">
          <Link href="/register" className="px-6 py-3 rounded-xl font-bold shadow-[4px_4px_0_#22223b] bg-yellow-400 text-black border-2 border-black hover:scale-105 transition">Subscribe</Link>
          <Link href="/login" className="px-6 py-3 rounded-xl font-bold shadow-[4px_4px_0_#22223b] bg-white text-black border-2 border-black hover:scale-105 transition">Signin</Link>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-8 text-center" style={{ borderBottom: `4px solid ${BRAND.colors.border}` }}>
        <p className="text-lg font-semibold mb-2">Trusted by innovative teams</p>
        <div className="flex flex-wrap justify-center gap-8 opacity-80">
          {/* Add your own or use placeholders */}
          <span>Dropbox</span>
          <span>Ramp</span>
          <span>Western Union</span>
          <span>Checkout.com</span>
          <span>US Bank</span>
          <span>Trustpilot</span>
        </div>
      </section>

      {/* Features / Use Cases */}
      <section className="py-16 px-4 max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
        <FeatureCard title="Account Takeover" desc="Identify and block login attempts using stolen credentials while recognizing legitimate users." />
        <FeatureCard title="Payment Fraud" desc="Reduce fraudulent transactions and increase legitimate conversions with device intelligence signals." />
        <FeatureCard title="Bot Detection" desc="Detect malicious bots, automation tools, and other sophisticated threats to prevent real-time attacks." />
      </section>

      {/* Pricing Plans */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10" style={{ color: BRAND.colors.primary }}>Pricing Plans</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {plans.map(plan => (
            <div key={plan.name} style={{ background: BRAND.colors.card, border: `4px solid ${BRAND.colors.border}` }} className="rounded-2xl p-6 shadow-[8px_8px_0_#22223b] flex flex-col items-center neubrutal-card">
              <h3 className="text-xl font-bold mb-2" style={{ color: BRAND.colors.primary }}>{plan.name}</h3>
              <div className="text-2xl font-extrabold mb-1">{plan.price}</div>
              <div className="mb-2 text-sm text-gray-500">{plan.limit}</div>
              <ul className="mb-4 text-left list-disc pl-5">
                {plan.features.map(f => <li key={f}>{f}</li>)}
              </ul>
              <Link href="/pricing" className="mt-auto px-4 py-2 rounded-xl font-bold bg-yellow-400 text-black border-2 border-black shadow-[4px_4px_0_#22223b] hover:scale-105 transition">Subscribe</Link>
            </div>
          ))}
        </div>
        <div className="text-center mt-8 text-lg">Overage charged at <span className="font-bold">$5 per 10,000 API calls</span> on top of the selected plan.</div>
      </section>

      {/* FAQ / Why Us */}
      <section className="py-12 px-4 max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Why Lumeo VisIQ?</h2>
        <p className="text-lg">Built for developers and businesses who care about security, reliability, and seamless onboarding. Neubrutal UI for a modern, bold look.</p>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 border-t-4" style={{ borderColor: BRAND.colors.border }}>
        &copy; {new Date().getFullYear()} Lumeo VisIQ. All rights reserved.
      </footer>
    </main>
  );
}

function FeatureCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div style={{ background: "#fff", border: "4px solid #22223b" }} className="rounded-2xl p-6 shadow-[4px_4px_0_#22223b] neubrutal-card">
      <h3 className="text-lg font-bold mb-2" style={{ color: "#0f172a" }}>{title}</h3>
      <p className="text-gray-700">{desc}</p>
    </div>
  );
}
