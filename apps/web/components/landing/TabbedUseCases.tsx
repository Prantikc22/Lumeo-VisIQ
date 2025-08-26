// TabbedUseCases: tabs for each use case, neobrutal style
import React, { useState } from "react";
import { motion } from "framer-motion";

const useCases = [
  {
    tab: "Trial Abuse",
    flow: "Detect repeat signups and limit trial abuse.",
    metrics: "98%+ abuse reduction",
    payload: '{ "event": "trial_abuse", "deviceId": "...", "repeat": true }',
    cta: "See Docs",
  },
  {
    tab: "Account Sharing",
    flow: "Spot concurrent logins and prevent sharing.",
    metrics: "Up to 80% less sharing",
    payload:
      '{ "event": "account_sharing", "deviceId": "...", "locations": ["US", "IN"] }',
    cta: "See Docs",
  },
  {
    tab: "Bot Defense",
    flow: "Block malicious bots, let good bots in.",
    metrics: "99.9% bot detection",
    payload: '{ "event": "bot_detected", "deviceId": "...", "bot": true }',
    cta: "See Docs",
  },
  {
    tab: "ATO",
    flow: "Prevent account takeovers with device risk signals.",
    metrics: "ATO cut by 75%",
    payload: '{ "event": "ato", "deviceId": "...", "risk": "high" }',
    cta: "See Docs",
  },
  {
    tab: "Payments",
    flow: "Stop payment/chargeback fraud and card testing.",
    metrics: "Chargebacks down 60%",
    payload:
      '{ "event": "payment_fraud", "deviceId": "...", "pattern": "card_testing" }',
    cta: "See Docs",
  },
  {
    tab: "SMS",
    flow: "Detect SMS pumping and SIM swaps.",
    metrics: "SMS fraud blocked",
    payload: '{ "event": "sms_fraud", "deviceId": "...", "sim_swap": true }',
    cta: "See Docs",
  },
  {
    tab: "Promo Abuse",
    flow: "Block coupon/promo abuse across devices.",
    metrics: "Promo abuse nearly eliminated",
    payload: '{ "event": "promo_abuse", "deviceId": "...", "repeat": true }',
    cta: "See Docs",
  },
  {
    tab: "Marketplace Abuse",
    flow: "Detect multi-accounting and seller/buyer collusion.",
    metrics: "Marketplace risk reduced",
    payload:
      '{ "event": "marketplace_abuse", "deviceId": "...", "multi_account": true }',
    cta: "See Docs",
  },
];

export const TabbedUseCases: React.FC = () => {
  const [active, setActive] = useState(0);
  return (
    <section className="max-w-5xl mx-auto py-20 px-4">
      <h2
        className="text-3xl font-black mb-10 text-center text-[#0f172a]"
      >
        Use Case Demos
      </h2>
      <div className="flex flex-wrap gap-3 justify-center mb-8">
        {useCases.map((uc, i) => (
          <button
            key={uc.tab}
            onClick={() => setActive(i)}
            className={`px-5 py-2 rounded-lg font-bold border border-teal-200 ${active === i ? 'bg-gradient-to-r from-[#0ea5e9] to-[#164e63] text-white' : 'bg-gray-50 text-[#164e63]'} transition`}
          >
            {uc.tab}
          </button>
        ))}
      </div>
      <div className="bg-gray-50 rounded-xl p-8 flex flex-col gap-4 items-start border border-teal-50">
        <div className="font-bold text-xl mb-2">{useCases[active].flow}</div>
        <div className="text-green-700 font-bold">
          {useCases[active].metrics}
        </div>
        <pre className="bg-white border border-teal-100 rounded-lg p-4 text-sm w-full overflow-x-auto">
          {useCases[active].payload}
        </pre>
        <a
          href="/docs"
          className="mt-2 px-6 py-2 rounded-lg font-bold bg-gradient-to-r from-[#0ea5e9] to-[#164e63] text-white shadow-sm hover:from-[#164e63] hover:to-[#0ea5e9] transition border-none"
        >
          {useCases[active].cta}
        </a>
      </div>
    </section>
  );
};
