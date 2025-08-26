// Hero section with headline, subhead, CTAs, and neobrutal stacked signal cards visual
import React from "react";
import Link from "next/link";

export interface HeroNeobrutalProps {
  onPrimary?: () => void;
  onSecondary?: () => void;
}

export const HeroNeobrutal: React.FC<HeroNeobrutalProps> = ({
  onPrimary,
  onSecondary,
}) => (
  <section className="relative py-24 px-4 text-center bg-white border-b border-teal-50 overflow-hidden" style={{fontFamily: 'Inter, Segoe UI, Arial, sans-serif'}}>
    <h1
      className="font-black text-5xl md:text-6xl mb-6 text-[#0f172a]"
      style={{letterSpacing: '-0.03em'}}
    >
      Block Fraud. Stop Abuse. Delight Real Customers.
    </h1>
    <p className="text-xl md:text-2xl font-medium mb-8 text-[#164e63] max-w-2xl mx-auto">
      Identify good and bad visitors with industry-leading accuracy — even if they’re anonymous.
    </p>
    <ul className="text-lg md:text-xl font-medium text-left mx-auto mb-10 max-w-xl space-y-2 text-[#164e63]">
      <li>🚫 End Trial Abuse: <span className="font-normal">Block fake sign-ups instantly.</span></li>
      <li>🔐 Stop Account Takeovers: <span className="font-normal">Keep out stolen credentials.</span></li>
      <li>💳 Reduce Payment Fraud: <span className="font-normal">Stop chargebacks, boost conversions.</span></li>
      <li>🤖 Defeat Bots in Real Time: <span className="font-normal">Shut down malicious automation.</span></li>
    </ul>
    <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
      <Link
        href="/register?next=%2Fpricing"
        className="px-8 py-4 rounded-lg font-extrabold bg-gradient-to-r from-[#0ea5e9] to-[#164e63] text-white text-xl shadow-sm hover:from-[#164e63] hover:to-[#0ea5e9] transition border-none focus:ring-2 focus:ring-cyan-400/80 focus:outline-none"
      >
        Get Started Free
      </Link>
      <Link
        href="/contact"
        className="px-8 py-4 rounded-lg font-extrabold bg-transparent border border-teal-200 text-[#164e63] text-xl hover:bg-teal-50/60 hover:text-[#0ea5e9] transition"
      >
        or Contact Sales
      </Link>
    </div>
    {/* Visual: Stacked signal cards with floating stickers */}
    <div className="relative flex flex-wrap justify-center gap-6 mt-10">
  {/* MagicUI MCP network/flow abstract animation placeholder */}
  {/* <MagicUINetworkDiagram /> */}
</div>
  </section>
);
