import Link from "next/link";
import { Check } from "lucide-react";

const PRIMARY = "#2563eb"; // blue accent
const TEXT_MUTED = "text-slate-600";
const BORDER = "border-slate-200";
const RING = "ring-1 ring-slate-200";
const CARD =
  "bg-white border " + BORDER + " rounded-2xl p-6 hover:shadow-md transition-shadow";


  const plans = [
    {
      name: "Free",
      price: "$0/mo",
      limit: "2,000 API calls",
      plan_id: "Free-USD-Monthly",
      features: [
        "All features & signals included",
        "AI Auto-Block & Trial Abuse Prevention",
        "Community support",
      ],
    },
    {
      name: "Starter",
      price: "$29/mo",
      limit: "25,000 API calls",
      plan_id: "Starter-USD-Monthly",
      features: [
        "All features & signals included",
        "AI Auto-Block & Trial Abuse Prevention",
        "Email support",
      ],
    },
    {
      name: "Growth",
      price: "$99/mo",
      limit: "150,000 API calls",
      plan_id: "Growth-USD-Monthly",
      features: [
        "All features & signals included",
        "AI Auto-Block & Trial Abuse Prevention",
        "Priority support",
      ],
    },
    {
      name: "Business",
      price: "$299/mo",
      limit: "500,000 API calls",
      plan_id: "Business-USD-Monthly",
      features: [
        "All features & signals included",
        "AI Auto-Block & Trial Abuse Prevention",
        "SLA-backed support",
      ],
    },
    {
      name: "Scale",
      price: "$699/mo",
      limit: "1M+ API calls",
      plan_id: "Scale-USD-Monthly",
      features: [
        "All features & signals included",
        "AI Auto-Block & Trial Abuse Prevention",
        "Dedicated manager & custom SLAs",
      ],
    },
  ];  
export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <p className="text-sm font-medium tracking-widest text-slate-500 uppercase">
            Pricing
          </p>
          <h2
            className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight text-slate-900"
            style={{ color: undefined }}
          >
            Pricing Plans
          </h2>
          <p className={`mt-3 ${TEXT_MUTED}`}>
            Start free and scale as you grow. Simple, transparent, no surprises.
          </p>
        </header>

        {/* Grid auto-fits any number of plans (your array has 5) */}
        <div className="w-full overflow-x-auto">
          <div className="flex gap-6 min-w-[1100px] justify-center">
              {plans.map((plan) => {
                const isPopular = (plan as any).popular === true; // optional flag
                return (
                  <div
                    key={plan.name}
                    className={`${CARD} relative flex flex-col`}
                    style={{ borderColor: isPopular ? PRIMARY : undefined }}
              >
                {isPopular && (
                  <span
                    className="absolute -top-3 left-6 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                    style={{
                      background: `${PRIMARY}1a`,
                      color: PRIMARY,
                      border: `1px solid ${PRIMARY}`,
                    }}
                  >
                    Most Popular
                  </span>
                )}

                <div className="mb-4">
                  <h3
                    className="text-xl font-semibold text-slate-900"
                    style={{ color: undefined }}
                  >
                    {plan.name}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-slate-900">
                      {plan.price}
                    </span>
                                      </div>
                  {plan.limit && (
                    <p className={`mt-1 text-sm ${TEXT_MUTED}`}>{plan.limit}</p>
                  )}
                </div>

                <ul className="space-y-2 mb-6 text-sm">
                  {plan.features.map((f: string) => (
                    <li key={f} className="flex gap-2">
                      <Check
                        className="h-4 w-4 shrink-0 mt-0.5"
                        style={{ color: PRIMARY }}
                        aria-hidden
                      />
                      <span className="text-slate-700">{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <Link
                    href="/pricing"
                    className="w-full inline-flex items-center justify-center rounded-lg px-4 py-2.5 font-semibold transition-colors"
                    style={{
                      background: isPopular ? PRIMARY : "transparent",
                      color: isPopular ? "#fff" : PRIMARY,
                      border: `1px solid ${PRIMARY}`,
                    }}
                  >
                    {isPopular ? "Get Started" : "Choose Plan"}
                  </Link>
                </div>
              </div>
            );
          })}
          </div>
        </div>

        {/* Fine print */}
        <p className={`mt-8 text-center text-xs ${TEXT_MUTED}`}>
          All plans include device intelligence APIs, SDKs, and developer support. Contact
          sales for volume pricing and enterprise SLAs.
        </p>
      </div>
    </section>
  );
}
