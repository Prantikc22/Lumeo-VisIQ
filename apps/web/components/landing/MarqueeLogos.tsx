// MarqueeLogos: auto-scrolls placeholder logos horizontally, neobrutal style
import React from "react";

const logos = [
  { src: "/companyLogo1.svg", alt: "Ramp" },
  { src: "/companyLogo2.svg", alt: "Western Union" },
  { src: "/companyLogo3.svg", alt: "Checkout.com" },
  { src: "/companyLogo4.svg", alt: "US Bank" },
  { src: "/companyLogo5.svg", alt: "Trustpilot" },
  { src: "/companyLogo6.svg", alt: "Dropbox" },
  { src: "/companyLogo7.svg", alt: "Dropbox" }
];

export const MarqueeLogos: React.FC = () => (
  <section className="w-full overflow-hidden py-8 bg-white border-b border-teal-50">
    <div
      className="marquee flex gap-16 animate-marquee items-center"
      style={{ minWidth: "1200px" }}
    >
      {logos.map((logo, i) => (
        <div
          key={i}
          className="flex flex-col items-center justify-center min-w-[160px]"
        >
          <img
            src={logo.src}
            alt={logo.alt}
            style={{ height: 80 }}
          />
          
        </div>
      ))}
      {/* Duplicate for seamless scroll */}
      {logos.map((logo, i) => (
        <div
          key={logos.length + i}
          className="flex flex-col items-center justify-center min-w-[160px]"
        >
          <img
            src={logo.src}
            alt={logo.alt}
            style={{ height: 80 }}
          />
          
        </div>
      ))}
    </div>
    <style jsx>{`
      .marquee {
        animation: marquee 24s linear infinite;
      }
      @keyframes marquee {
        0% {
          transform: translateX(0);
        }
        100% {
          transform: translateX(-50%);
        }
      }
    `}</style>
  </section>
);
