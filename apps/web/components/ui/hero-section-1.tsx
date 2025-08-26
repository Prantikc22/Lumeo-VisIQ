import React from 'react';
import Link from 'next/link';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedGroup } from '@/components/ui/animated-group';
import { cn } from '@/lib/utils';

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: 'blur(12px)',
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: {
        type: 'spring',
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./dialog";
import { useState, useEffect } from "react";

export function HeroSection() {
  const [contactOpen, setContactOpen] = useState(false);
  useEffect(() => {
    const handler = () => setContactOpen(true);
    window.addEventListener('open-contact-dialog', handler);
    return () => window.removeEventListener('open-contact-dialog', handler);
  }, []);
  return (
    <section className="relative overflow-hidden bg-background py-12 md:py-20">
      <div className="mx-auto max-w-4xl px-6 text-center">
        {/* Kicker */}
        <AnimatedGroup variants={transitionVariants}>
          <span className="mb-6 inline-block rounded-full bg-muted px-4 py-1 text-xs font-semibold tracking-wide text-foreground/80">
            Fraud Prevention. Visitor Intelligence. Real Results.
          </span>
        </AnimatedGroup>
        {/* Headline */}
        <AnimatedGroup variants={transitionVariants}>
          <h1 className="mx-auto mt-2 max-w-3xl text-balance text-5xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Stop Fraud. Approve Real Customers.<br />
            <span className="text-blue-600">Instantly</span>.
          </h1>
        </AnimatedGroup>
        {/* Subheadline */}
        <AnimatedGroup variants={transitionVariants}>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground">
          With unmatched visitor intelligence, stop trial abuse, account takeovers, payment fraud, and bots — while giving real customers a seamless experience that builds trust and boosts conversions.
          </p>
        </AnimatedGroup>
        {/* CTAs */}
        <AnimatedGroup
          variants={{
            container: {
              visible: {
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.75,
                },
              },
            },
            ...transitionVariants,
          }}
          className="mt-12 flex flex-col items-center justify-center gap-3 md:flex-row">
          <Button asChild size="lg" className="rounded-xl px-6 text-base font-semibold">
            <Link href="/register?next=%2Fpricing">
              <span className="mr-2">👉</span> Get Started Free
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-xl px-6 text-base font-semibold flex items-center gap-2 border-foreground text-foreground border"
            onClick={() => typeof window !== 'undefined' && window.dispatchEvent(new CustomEvent('open-contact-dialog'))}
          >
            <span>Contact Sales</span>
          </Button>
        </AnimatedGroup>
        <Dialog open={contactOpen} onOpenChange={setContactOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Contact Us</DialogTitle>
              <DialogDescription>Fill out the form below and our team will get in touch soon.</DialogDescription>
            </DialogHeader>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium">Name</label>
                <input id="name" name="name" type="text" required className="mt-1 w-full rounded border px-3 py-2" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium">Email</label>
                <input id="email" name="email" type="email" required className="mt-1 w-full rounded border px-3 py-2" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium">Message</label>
                <textarea id="message" name="message" rows={4} required className="mt-1 w-full rounded border px-3 py-2" />
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full">Submit</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
