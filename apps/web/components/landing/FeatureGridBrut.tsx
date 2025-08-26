// FeatureGridBrut: grid of all product pillars, neobrutal style
import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Users, Bot, Smartphone, Key, CreditCard, Ticket, Lock, UserCheck, Zap } from "lucide-react";

export interface Feature {
  icon: JSX.Element;
  title: string;
  desc: string;
}

const features: Feature[] = [
  {
    icon: <Sparkles className="w-7 h-7 text-[#0ea5e9]" />,
    title: "Trial Abuse Prevention",
    desc: "Limit multi-signups, detect multi-accounting and promo abuse.",
  },
  {
    icon: <Users className="w-7 h-7 text-[#164e63]" />,
    title: "Account Sharing Prevention",
    desc: "Detect concurrent devices/locations and enforce sessions.",
  },
  {
    icon: <Bot className="w-7 h-7 text-[#0ea5e9]" />,
    title: "Bot Detection",
    desc: "Differentiate good/bad bots, edge integrations, lightweight agent.",
  },
  {
    icon: <Smartphone className="w-7 h-7 text-[#164e63]" />,
    title: "SMS Fraud Defense",
    desc: "Detect SIM swaps, abnormal OTP requests, SMS pumping.",
  },
  {
    icon: <Key className="w-7 h-7 text-[#0ea5e9]" />,
    title: "ATO Defense",
    desc: "Spot risky device changes, impossible travel, tampering.",
  },
  {
    icon: <CreditCard className="w-7 h-7 text-[#164e63]" />,
    title: "Payment & Chargeback",
    desc: "Catch card testing/cracking, device reuse, chargebacks.",
  },
  {
    icon: <Ticket className="w-7 h-7 text-[#0ea5e9]" />,
    title: "Coupon/Promo Abuse",
    desc: "Stop repeat redemptions across accounts/devices.",
  },
  {
    icon: <Lock className="w-7 h-7 text-[#164e63]" />,
    title: "Privacy Friendly",
    desc: "Works without PII, respects privacy, compliant by design.",
  },
  {
    icon: <UserCheck className="w-7 h-7 text-[#0ea5e9]" />,
    title: "Smart Signals",
    desc: "Detect incognito/VPN, browser tampering, emulators.",
  },
  {
    icon: <Zap className="w-7 h-7 text-[#164e63]" />,
    title: "SDKs & Integrations",
    desc: "JS, iOS, Android, cloud/edge, webhooks, drop-in.",
  },
];

export const FeatureGridBrut: React.FC = () => (
  <section className="w-full py-20 px-4 bg-white">
    <h2
      className="text-3xl font-black mb-10 text-center text-[#0f172a]"
    >
      All Your Fraud Prevention Pillars
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      {features.map((f, i) => (
        <motion.div
          key={f.title}
          className="bg-white rounded-xl p-8 flex flex-col items-center border border-gray-200 shadow-sm"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: i * 0.08 }}
        >
          <span className="text-4xl mb-3">{f.icon}</span>
          <div className="font-bold text-xl mb-2 text-black">{f.title}</div>
          <div className="text-gray-700 text-center">{f.desc}</div>
        </motion.div>
      ))}
    </div>
  </section>
);
