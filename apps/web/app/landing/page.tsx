"use client";
import React from "react";
import { NavBarBrut } from "../../components/landing/NavBarBrut";
import { NavBarModern } from "../../components/ui/navbar-modern";
import { HeroSection } from "@/components/ui/hero-section-1";
import { MarqueeLogos } from "../../components/landing/MarqueeLogos";
import { ProblemSolution2Up } from "../../components/landing/ProblemSolution2Up";
import UseCaseAccordionSection from "../../components/landing/UseCaseAccordionSection";
import WhyAccuracySection from "../../components/why-accuracy-section";
import CTAStatsSection from "../../components/cta-stats-section";
import TestimonialsSection from "../../components/testimonials-section";
import PricingSection from "../../components/landing/PricingTeaser";
import { FooterModern } from "../../components/ui/footer-modern";
import { FooterMega } from "../../components/landing/FooterMega";
import Link from "next/link";

// --- Lumeo VisIQ Branding ---
const BRAND = {
  name: "Lumeo VisIQ",
  tagline:
    "Identify Every Visitor. Stop fraud, detect bots, delight customers.",
  colors: {
    primary: "#0f172a",
    accent: "#fbbf24",
    bg: "#f1f5f9",
    card: "#fff",
    border: "#22223b",
  },
  logo: "/logo.svg", // Place your SVG logo in public folder
};

const plans = [
  {
    name: "Free",
    price: "$0/mo",
    limit: "2,000 API calls",
    plan_id: "Free-USD-Monthly",
    features: ["All core features", "Basic analytics", "Community support"],
  },
  {
    name: "Starter",
    price: "$29/mo",
    limit: "25,000 API calls",
    plan_id: "Starter-USD-Monthly1",
    features: ["Everything in Free", "Email support", "Usage alerts"],
  },
  {
    name: "Growth",
    price: "$99/mo",
    limit: "150,000 API calls",
    plan_id: "Growth-USD-Monthly-USD-Monthly",
    features: [
      "Everything in Starter",
      "Advanced analytics",
      "Priority support",
    ],
  },
  {
    name: "Business",
    price: "$299/mo",
    limit: "500,000 API calls",
    plan_id: "Business-USD-Monthly1",
    features: ["Everything in Growth", "Custom integrations", "SLA"],
  },
  {
    name: "Scale",
    price: "$699/mo",
    limit: "1M+ API calls",
    plan_id: "Scale-USD-Monthly",
    features: ["Everything in Business", "Dedicated manager", "Custom SLAs"],
  },
];

export default function LandingPage() {
  return (
    <main style={{ background: BRAND.colors.bg, minHeight: "100vh" }}>
      <NavBarModern />
      <HeroSection />
      <MarqueeLogos />
      <ProblemSolution2Up />
      <UseCaseAccordionSection />
      <WhyAccuracySection />
      <TestimonialsSection />
      <PricingSection />
      <CTAStatsSection />
      <hr className="border-black my-0" />
      <FooterModern />
    </main>
  );
}
