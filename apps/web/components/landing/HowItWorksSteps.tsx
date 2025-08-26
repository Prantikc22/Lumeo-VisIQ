// HowItWorksSteps: 4 brutal steps, neobrutal style
import React from "react";

const steps = [
  {
    step: 1,
    title: "Collect 100+ signals",
    desc: "Gather device, browser, network, and sensor data.",
  },
  {
    step: 2,
    title: "Generate Visitor ID",
    desc: "Create a stable, persistent device ID with server-side deduplication.",
  },
  {
    step: 3,
    title: "Enrich with Smart Signals",
    desc: "Add VPN, Incognito, tampering, and device history intelligence.",
  },
  {
    step: 4,
    title: "Real-Time Risk Engine",
    desc: "Use via API/SDK/webhook for instant fraud decisions.",
  },
];

export const HowItWorksSteps: React.FC = () => (
  <section className="max-w-5xl mx-auto py-20 px-4">
    <h2
      className="text-3xl font-black mb-10 text-center"
      style={{ textShadow: "2px 2px 0 #fbbf24" }}
    >
      How It Works
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {steps.map((s) => (
        <div
          key={s.step}
          className="bg-gray-50 rounded-xl p-8 flex flex-col items-center border border-teal-50"
        >
          <span className="text-4xl font-black mb-3">{s.step}</span>
          <div className="font-bold text-lg mb-2 text-black">{s.title}</div>
          <div className="text-gray-700 text-center">{s.desc}</div>
        </div>
      ))}
    </div>
  </section>
);
