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

export function HeroSection() {
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
            Stop Fraud. Approve Real Customers. <span className="text-blue-600">Instantly</span>.
          </h1>
        </AnimatedGroup>
        {/* Subheadline */}
        <AnimatedGroup variants={transitionVariants}>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground">
            Identify every visitor with industry-leading accuracy — even if they’re anonymous. Block trial abuse, account takeovers, payment fraud, and bots, without adding friction for trusted users.
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
            asChild
            size="lg"
            variant="outline"
            className="rounded-xl px-6 text-base font-semibold flex items-center gap-2 border-foreground text-foreground border">
            <Link href="#watch-demo">
              <PlayCircle className="size-5" /> <span>Watch Demo</span>
            </Link>
          </Button>
        </AnimatedGroup>
      </div>
    </section>
  );
}
