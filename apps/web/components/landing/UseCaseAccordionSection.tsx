import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgePercent,
  ShieldCheck,
  CreditCard,
  Bot,
  Users,
  Video,
  UserCheck,
  Globe,
} from "lucide-react";

// SectionWrapper component
export const SectionWrapper: React.FC<{ title: React.ReactNode; subtitle: string; children: React.ReactNode }> = ({ title, subtitle, children }) => {
  const headingRef = useRef<HTMLDivElement>(null);
  return (
    <section className="w-full py-20 px-4 bg-white" style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
      <div ref={headingRef} className="max-w-4xl mx-auto text-center mb-12">
        <div className="text-3xl md:text-4xl font-extrabold text-center mb-4">
          {title}
        </div>
        <p className="text-lg text-gray-600 font-semibold">{subtitle}</p>
      </div>
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, { headingRef })
          : child
      )}
    </section>
  );
}

// Accordion data
const useCases = [
  {
    icon: <BadgePercent className="w-6 h-6 text-[#164e63]" />,
    title: "Trial Abuse Prevention",
    desc: "Stop multiple fake signups abusing free trials.",
    expanded: ["Detects duplicate signups via device fingerprinting, email, and IP.", "Blocks promo fraud in real time."]
  },
  {
    icon: <UserCheck className="w-6 h-6 text-[#164e63]" />,
    title: "Account Takeover Protection",
    desc: "Block stolen login attempts while recognizing real users.",
    expanded: ["Real-time credential stuffing detection.", "Adaptive authentication for trusted users."]
  },
  {
    icon: <CreditCard className="w-6 h-6 text-[#164e63]" />,
    title: "Payment Fraud Defense",
    desc: "Reduce chargebacks and protect revenue with device intelligence.",
    expanded: ["Detects high-risk payments instantly.", "Links fraudulent cards to device and IP."]
  },
  {
    icon: <Bot className="w-6 h-6 text-[#164e63]" />,
    title: "Bot Detection",
    desc: "Shut down malicious automation and fake traffic in real time.",
    expanded: ["Blocks headless browsers and scripts.", "Alerts on suspicious bot patterns."]
  },
  {
    icon: <Globe className="w-6 h-6 text-[#164e63]" />,
    title: 'Visitor <span className="text-[#0ea5e9]">Intelligence</span>',
    desc: "Identify every visitor and enrich with location data — even when they’re anonymous.",
    expanded: ["Geolocation and device enrichment.", "Anonymous visitor tracking."]
  },
];

// AccordionUseCases component
export const AccordionUseCases: React.FC<{
  activeIndex: number;
  setActiveIndex: (i: number) => void;
}> = ({ activeIndex, setActiveIndex }) => (
  <div className="flex flex-col divide-y divide-gray-200 bg-white rounded-xl shadow-sm border border-gray-100">
    {useCases.map((item, i) => (
      <div key={item.title}>
        <button
          className={`w-full flex items-start gap-4 px-6 py-5 text-left transition-colors duration-150 focus:outline-none ${activeIndex === i ? "bg-gray-50" : "bg-white"}`}
          onClick={() => setActiveIndex(activeIndex === i ? -1 : i)}
        >
          <span>{item.icon}</span>
          <span>
            <h3 className="font-bold text-lg text-[#0f172a] mb-1" dangerouslySetInnerHTML={{ __html: item.title }} />
            <span className="text-gray-500 text-base font-medium">{item.desc}</span>
          </span>
        </button>
        <AnimatePresence initial={false}>
          {activeIndex === i && (
            <motion.div
              key="expand"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden px-16 pb-4"
            >
              <ul className="list-disc text-gray-600 pl-4">
                {item.expanded.map((line, idx) => (
                  <li key={idx} className="text-sm mb-1">{line}</li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    ))}
  </div>
);

// UseCasePanel component
export const UseCasePanel: React.FC<{
  activeIndex: number;
}> = ({ activeIndex }) => {
  // Placeholder visuals for each use case

const visuals = [
  // Trial Abuse
  <img
    src="/usecases/first.webp"
    alt="Trial Abuse Prevention"
    className="w-full h-full object-contain rounded-xl"
    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
  />,
  // Account Takeover
  <img
    src="/usecases/sec.webp"
    alt="Account Takeover Prevention"
    className="w-full h-full object-contain rounded-xl"
    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
  />,
  // Payment Fraud
  <img
    src="/usecases/third.webp"
    alt="Payment Fraud Defense"
    className="w-full h-full object-contain rounded-xl"
    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
  />,
  // Bot Detection
  <img
    src="/usecases/fourth.webp"
    alt="Bot Detection"
    className="w-full h-full object-contain rounded-xl"
    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
  />,
  // Visitor Intelligence
  <img
    src="/usecases/fifth.webp"
    alt="Visitor Intelligence"
    className="w-full h-full object-contain rounded-xl"
    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
  />,
];

  // Loom video modal state (future enhancement)
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="relative w-full h-full min-h-[320px] flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Visual panel */}
      <AnimatePresence initial={false}>
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full flex items-center justify-center"
        >
          {visuals[activeIndex]}
        </motion.div>
      </AnimatePresence>
      {/* Video modal (future, placeholder) */}
      {showVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full relative">
            <button className="absolute top-2 right-2" onClick={() => setShowVideo(false)}>
              <span className="text-2xl">×</span>
            </button>
            {/* Replace with Loom embed */}
            <div className="aspect-w-16 aspect-h-9 w-full bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">[Loom Video Placeholder]</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Section Component
const UseCaseAccordionSection: React.FC<{ headingRef?: React.RefObject<HTMLDivElement> }> = ({ headingRef }) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [leftHeight, setLeftHeight] = useState<number | undefined>(undefined);
  const leftRef = useRef<HTMLDivElement>(null);
  const panelIndex = activeIndex === -1 ? 0 : activeIndex;

  useEffect(() => {
    if (leftRef.current) {
      setLeftHeight(leftRef.current.offsetHeight);
    }
  }, [activeIndex]);

  return (
    <SectionWrapper
      title={<>Fraud Prevention That Fits <span className="text-blue-600">Every Use Case</span></>}
      subtitle="From trial abuse to payment fraud, stop threats without blocking real customers."
    >
      <div className="flex flex-col md:flex-row gap-8 items-start justify-center w-full">
        <div className="w-full md:w-2/5" ref={leftRef}>
          <AccordionUseCases activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
        </div>
        <div className="w-full md:w-1/3 flex items-center justify-center overflow-hidden" style={{ maxHeight: 340, height: '100%', marginTop: headingRef?.current ? headingRef.current.offsetHeight : 0 }}>
          <UseCasePanel activeIndex={panelIndex} />
        </div>
      </div>
    </SectionWrapper>
  );
};

export default UseCaseAccordionSection;
