// FAQAccordionBrut: brutal accordion with required topics
import React, { useState } from "react";

const faqs = [
  {
    q: "How accurate and permanent are device IDs?",
    a: "Our device IDs are highly stable and accurate, persisting across sessions and resistant to evasion.",
  },
  {
    q: "How do you handle privacy?",
    a: "We never use cookies or PII. All signals are privacy-friendly and compliant by design.",
  },
  {
    q: "How fast is implementation?",
    a: "Most customers integrate in under 30 minutes with our SDKs and docs.",
  },
  {
    q: "Does it work on mobile?",
    a: "Yes, we support web, iOS, and Android with native SDKs.",
  },
  {
    q: "How do you detect bots?",
    a: "We use advanced device, network, and behavior signals to detect even the most sophisticated bots.",
  },
  {
    q: "How does billing/trials work?",
    a: "Free and paid tiers are available. Overage is billed per API call. See pricing for details.",
  },
];

export const FAQAccordionBrut: React.FC = () => {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="max-w-3xl mx-auto py-16 px-4">
      <h2 className="text-2xl font-black mb-8 text-center">
        Frequently Asked Questions
      </h2>
      <div className="flex flex-col gap-4">
        {faqs.map((f, i) => (
          <div
            key={f.q}
            className="bg-gray-50 rounded-xl border border-teal-50"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full text-left px-6 py-4 font-bold text-lg flex justify-between items-center"
            >
              {f.q}
              <span className="ml-4 text-2xl">{open === i ? "−" : "+"}</span>
            </button>
            {open === i && <div className="px-6 pb-6 text-gray-800">{f.a}</div>}
          </div>
        ))}
      </div>
    </section>
  );
};
