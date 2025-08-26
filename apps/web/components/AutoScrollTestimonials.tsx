import React, { useRef, useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

type Testimonial = {
  text: string;
  name: string;
  title: string;
  logo: string;
};

interface AutoScrollTestimonialsProps {
  testimonials: Testimonial[];
}

const CARD_WIDTH = 350; // px, matches max-w-[350px]
const CARD_GAP = 24; // px, matches gap-6
const SCROLL_SPEED = 32; // seconds for full scroll

const AutoScrollTestimonials: React.FC<AutoScrollTestimonialsProps> = ({ testimonials }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const [scrollWidth, setScrollWidth] = useState(0);

  useEffect(() => {
    // Calculate total scroll width (all cards + gaps)
    setScrollWidth((CARD_WIDTH + CARD_GAP) * testimonials.length);
  }, [testimonials.length]);

  useEffect(() => {
    if (!scrollWidth) return;
    controls.start({
      x: [0, -scrollWidth],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: SCROLL_SPEED,
          ease: "linear",
        },
      },
    });
  }, [scrollWidth, controls]);

  return (
    <motion.div
      ref={containerRef}
      className="flex gap-6"
      animate={controls}
      style={{ willChange: "transform" }}
    >
      {testimonials.concat(testimonials).map((t, i) => (
        <div
          key={i}
          className="flex flex-col justify-between bg-white border border-slate-200 rounded-xl shadow-sm min-w-[320px] max-w-[350px] px-8 py-7 mx-1"
          style={{ flex: "0 0 340px" }}
        >
          <div className="flex items-center mb-4">
            <span className="text-base font-semibold text-slate-700">{t.name}</span>
          </div>
          <div className="text-slate-900 text-lg font-medium mb-3">“{t.text}”</div>
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide">{t.title}</div>
        </div>
      ))}
    </motion.div>
  );
};

export default AutoScrollTestimonials;
