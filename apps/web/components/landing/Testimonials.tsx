// Testimonials: 3 brutal speech-bubble cards
import React from "react";

const quotes = [
  {
    name: "Product Manager, SaaS",
    quote: "VisIQ stopped 99% of our trial abuse. Integration took minutes!",
  },
  {
    name: "Head of Risk, Fintech",
    quote:
      "The device ID accuracy is unmatched. Chargebacks dropped instantly.",
  },
  {
    name: "CTO, Marketplace",
    quote:
      "We finally have a single source of truth for user identity across web and mobile.",
  },
];

export const Testimonials: React.FC = () => (
  <section className="max-w-5xl mx-auto py-20 px-4">
    <h2 className="text-2xl font-black mb-10 text-center">
      What Our Customers Say
    </h2>
    <div className="flex flex-wrap gap-8 justify-center">
      {quotes.map((q) => (
        <div
          key={q.name}
          className="bg-gray-50 rounded-xl p-8 relative max-w-sm flex-1 border border-teal-50"
        >
          <div className="absolute -top-6 left-8 bg-gradient-to-r from-[#0ea5e9] to-[#164e63] text-white px-4 py-2 rounded-full font-black text-sm border-none shadow-none">
            Testimonial
          </div>
          <blockquote className="italic text-lg mb-4">“{q.quote}”</blockquote>
          <div className="font-bold text-gray-700">{q.name}</div>
        </div>
      ))}
    </div>
  </section>
);
