// CTABannerSmash: big brutal CTA with confetti/sticker effect
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export const CTABannerSmash: React.FC = () => (
  <section className="relative py-16 px-4 text-center bg-white rounded-xl mx-auto w-full max-w-6xl mb-16 border border-gray-200 shadow-sm" style={{fontFamily: 'Inter, Segoe UI, Arial, sans-serif'}}>

    <h2
      className="text-4xl font-black mb-6"
      style={{ textShadow: "2px 2px 0 #fff" }}
    >
      Ready to Smash Fraud?
    </h2>
    <p className="text-xl mb-8 font-semibold text-black">
      Start for free or talk to our sales team. Your users and revenue will
      thank you.
    </p>
    <div className="flex flex-col sm:flex-row gap-6 justify-center mb-4">
      <Link
        href="/register"
        className="px-10 py-4 rounded-lg font-extrabold bg-gradient-to-r from-[#0ea5e9] to-[#164e63] text-white text-xl shadow-lg hover:from-[#164e63] hover:to-[#0ea5e9] transition border-none"
      >
        Start Free
      </Link>
      <Link
        href="/contact"
        className="px-10 py-4 rounded-lg font-extrabold bg-transparent border border-gray-200 text-[#164e63] text-xl hover:bg-gray-50 hover:text-[#0ea5e9] transition"
      >
        Talk to Sales
      </Link>
    </div>
    <div className="text-xs text-gray-700 font-bold mt-2">
      No credit card required. 24/7 support. Privacy-first.
    </div>
    <div
      className="absolute inset-0 pointer-events-none select-none"
      style={{ zIndex: 1 }}
    >
      {/* Confetti border effect */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 200"
        className="absolute top-0 left-0 w-full h-full"
      >
        <circle cx="50" cy="30" r="8" fill="#fff" />
        <circle cx="950" cy="30" r="8" fill="#fff" />
        <circle cx="120" cy="180" r="6" fill="#22223b" />
        <circle cx="880" cy="180" r="6" fill="#22223b" />
        <rect x="480" y="10" width="10" height="10" fill="#22223b" />
        <rect x="510" y="180" width="10" height="10" fill="#fbbf24" />
      </svg>
    </div>
  </section>
);
