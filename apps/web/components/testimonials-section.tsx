import React from "react";
import { motion } from "framer-motion";
import AutoScrollTestimonials from "./AutoScrollTestimonials";

// Example testimonials and logos; you can replace/update as needed
const testimonials = [
  {
    text: "VisitorIQ's accuracy and reliability have transformed our fraud prevention strategy. Integration was seamless and the results were immediate.",
    name: "Shivam Darmora",
    title: "Associate Director of Data, Headout",
    logo: "/logos/headout.svg"
  },
  {
    text: "We can now identify returning users across devices and sessions, even in incognito mode. This has improved our marketing attribution and security.",
    name: "Anna Smith",
    title: "Product Manager, JUMIA",
    logo: "/logos/jumia.svg"
  },
  {
    text: "The support and technology from VisitorIQ is top-notch. Our team trusts their device intelligence for critical business decisions.",
    name: "James Lee",
    title: "CTO, Dropbox",
    logo: "/logos/dropbox.svg"
  },
  {
    text: "VisitorIQ gives us an edge in detecting sophisticated threats. The blue team loves the insights!",
    name: "Priya Patel",
    title: "Security Lead, Checkr",
    logo: "/logos/checkr.svg"
  }
];


// Remove scrollVariants and use direct animate prop for smoother, type-safe animation


const TestimonialsSection: React.FC = () => (
  <section className="relative w-full bg-white py-20 px-4 border-t border-b border-slate-100">
    <div className="max-w-7xl mx-auto flex flex-col gap-10 items-center">
      <div className="text-center mb-8">
        <span className="inline-block w-2 h-2 rounded-full bg-blue-600 mr-2 align-middle" />
        <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Customer Stories</span>
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2 mb-3 leading-tight">
          Fight fraud with <span className="text-blue-600">VisitorIQ</span>
        </h2>
        <div className="text-lg text-slate-700 font-medium max-w-2xl mx-auto">
          See how our customers <span className="font-bold">stop fraud in real time for real results</span>.
        </div>
      </div>
      {/* Auto-scrolling testimonials row */}
      <div className="overflow-x-hidden w-full">
        <AutoScrollTestimonials testimonials={testimonials} />
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
