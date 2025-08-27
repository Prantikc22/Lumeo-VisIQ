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
    plan_id: "pdt_7QTupnhTTO7P6AYzw6I3P",
    features: ["All features & signals included", "AI Auto-Block & Trial Abuse Prevention", "Community support"],
  },
  {
    name: "Starter",
    price: "$29/mo",
    limit: "25,000 API calls",
    plan_id: "pdt_rHv6C3XW8TLUX2C7jiX3f",
    features: ["All features & signals included", "AI Auto-Block & Trial Abuse Prevention", "Email support"],
  },
  {
    name: "Growth",
    price: "$99/mo",
    limit: "150,000 API calls",
    plan_id: "pdt_Zebig578m3gbu9LSqTJCc",
    features: ["All features & signals included", "AI Auto-Block & Trial Abuse Prevention", "Email support"],
  },
  {
    name: "Business",
    price: "$299/mo",
    limit: "200,000 API calls",
    plan_id: "pdt_Mrcnohw7coIDFpwgEgn7g",
    features: ["All features & signals included", "AI Auto-Block & Trial Abuse Prevention", "Email support"],
  },
  {
    name: "Scale",
    price: "$699/mo",
    limit: "1M+ API calls",
    plan_id: "pdt_DILOH67XtnK6QLhUmbGYe",
    features: ["All features & signals included", "AI Auto-Block & Trial Abuse Prevention", "Email support"],
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
