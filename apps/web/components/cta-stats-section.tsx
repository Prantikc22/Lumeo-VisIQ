import React from "react";
import { motion, easeInOut } from "framer-motion";
import Link from "next/link";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription
} from "./ui/dialog";

const stats = [
  {
    number: "250+",
    description: "Countries and territories where VisitorIQ identifies devices.",
  },
  {
    number: "1 Billion+",
    description: "Unique browsers and mobile devices recognized.",
  },
  {
    number: "25 Million+",
    description: "Real-time intelligence API events processed daily.",
  },
];

const badges = [
  { src: "/badges/gdpr.svg", alt: "GDPR Compliant", label: "GDPR Compliant" },
  { src: "/badges/soc2.svg", alt: "SOC2", label: "SOC2" },
];

const statMotion = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.11, duration: 0.5, ease: easeInOut },
  }),
};

const ctaMotion = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeInOut } },
};

const badgeMotion = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: 0.2 + i * 0.08, duration: 0.4, ease: easeInOut },
  }),
};

const CTAStatsSection: React.FC = () => (
  <section className="relative w-full bg-white py-20 px-4 border-t border-b border-slate-100">
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-stretch gap-10 relative">
      {/* Stats Column (vertical stack on left) */}
      <div className="flex flex-row md:flex-col gap-4 md:w-1/3 w-full md:justify-start justify-center items-center md:items-stretch">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.number}
            className="bg-white border border-slate-200 rounded-lg shadow-sm px-6 py-5 flex flex-col items-center text-center min-w-[160px] max-w-[220px]"
            variants={statMotion}
            initial="hidden"
            whileInView="visible"
            custom={i}
            viewport={{ once: true, amount: 0.3 }}
          >
            <span className="text-3xl font-bold text-blue-600 mb-1">{stat.number}</span>
            <span className="text-sm text-slate-600 font-medium leading-tight">
              {stat.description}
            </span>
          </motion.div>
        ))}
      </div>
      {/* CTA Block on right */}
      <motion.div
        className="flex-1 bg-white border-l-4 border-blue-600 px-8 py-8 rounded-xl shadow-md flex flex-col items-start justify-center"
        variants={ctaMotion}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-1">
          Identify your web and mobile traffic in minutes
        </h3>
        <div className="text-base text-slate-700 mb-5 font-medium max-w-xl">
          Collect visitor IDs and signals instantly for free, or reach out to our team for a demo.
        </div>
        <div className="flex gap-3 mb-4">
          <Link
            href="/pricing"
            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-semibold text-white text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            Get Started
          </Link>
          <Dialog>
            <DialogTrigger asChild>
              <button
                className="inline-flex items-center px-5 py-2.5 rounded-lg border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 transition font-semibold text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                type="button"
              >
                Contact Sales
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Contact Sales</DialogTitle>
              <DialogDescription>
                Please fill out the form below and our team will get in touch with you soon.
              </DialogDescription>
              {/* Replace with actual contact form if needed */}
              <form className="flex flex-col gap-3 mt-4">
                <input className="border rounded px-3 py-2" type="text" placeholder="Your Name" />
                <input className="border rounded px-3 py-2" type="email" placeholder="Your Email" />
                <textarea className="border rounded px-3 py-2" placeholder="How can we help?" />
                <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" type="submit">
                  Submit
                </button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        {/* Badges Row - text only, no logos */}
        <div className="flex flex-wrap gap-2 items-center mt-2">
          {badges.map((badge, i) => (
            <motion.span
              key={badge.alt}
              className="border border-slate-200 bg-white rounded px-3 py-1 text-xs text-slate-600 font-semibold"
              variants={badgeMotion}
              initial="hidden"
              whileInView="visible"
              custom={i}
              viewport={{ once: true, amount: 0.3 }}
            >
              {badge.label}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
    {/* Subtle grid lines */}
    <div className="absolute inset-0 pointer-events-none z-0">
      <svg width="100%" height="100%" className="h-full w-full opacity-10">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2563eb" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  </section>
);

export default CTAStatsSection;
