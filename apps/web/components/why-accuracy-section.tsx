import React from "react";
import { motion, easeInOut } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Label
} from "recharts";
import { Globe, UserCheck, MapPin, BadgeCheck } from "lucide-react";
import Link from "next/link";

const accuracyData = [
  { day: 0, viq: 99.5, comp: 98.0 },
  { day: 15, viq: 99.3, comp: 92.0 },
  { day: 30, viq: 99.1, comp: 85.0 },
  { day: 45, viq: 99.0, comp: 78.0 },
  { day: 60, viq: 98.9, comp: 68.0 },
  { day: 75, viq: 98.8, comp: 60.0 },
  { day: 90, viq: 98.7, comp: 55.0 },
  { day: 105, viq: 98.6, comp: 52.0 },
  { day: 120, viq: 98.5, comp: 50.0 },
];

const features = [
  {
    icon: Globe,
    title: "Any Browser, Any Device",
    desc: "Accurately identify visitors on web and mobile across browsers and OS.",
  },
  {
    icon: UserCheck,
    title: "Anonymous? Still Recognized",
    desc: "Detect visitors even with VPN, Incognito, or tampered browsers.",
  },
  {
    icon: MapPin,
    title: "Location-Aware Insights",
    desc: "Enrich each visitor with city-level location to add context to risk.",
  },
  {
    icon: BadgeCheck,
    title: "Trusted User Experience",
    desc: "Reduce friction for genuine users while blocking high-risk activity.",
  },
];

const chartMotion = {
  hidden: { opacity: 0, scale: 0.97, y: 24 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.7, ease: easeInOut } },
};

const cardMotion = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.11, duration: 0.5, ease: easeInOut },
  }),
};

const WhyAccuracySection: React.FC = () => {
  return (
    <motion.section
      className="w-full bg-white py-20 px-4 border-t border-b border-slate-100"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={{ hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-y-14 gap-x-16 items-center">
        {/* Left Column */}
        <div className="flex flex-col gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600" aria-hidden="true"></span>
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Why VisitorIQ</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 leading-tight">The Most Reliable Visitor Intelligence</h2>
            <div className="text-lg text-slate-700 mb-4 font-medium">
              Industry-leading accuracy that identifies visitors across sessions, devices, and locations—even when they’re anonymous.
            </div>
            <div className="text-base text-slate-600 mb-6">
              Our device intelligence persists for months, not minutes. No cookies. No weak IDs. Just stable recognition that blocks fraud and keeps trusted users flowing.
            </div>
            <Link
              href="/learn/accuracy"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-semibold text-white text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              Learn More
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
          {/* Chart */}
          <motion.div
            className="bg-white rounded-xl border border-slate-200 p-6 mt-2 shadow-sm"
            aria-label="Visitor identification accuracy over time"
            variants={chartMotion}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={accuracyData} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
                <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 13, fill: "#64748b" }}
                  label={{ value: "Days after initial identification", position: "insideBottom", offset: -2, fill: "#64748b", fontSize: 13 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="number"
                  domain={[50, 100]}
                  tick={{ fontSize: 13, fill: "#64748b" }}
                  label={{ value: "Accuracy", angle: -90, position: "left", fill: "#64748b", fontSize: 13, dx: -30, dy: 0, style: { textAnchor: 'middle' } }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow text-sm text-slate-700">
                        {payload.map((entry: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span
                              className={
                                entry.dataKey === "viq"
                                  ? "inline-block w-2 h-2 rounded-full bg-orange-500"
                                  : "inline-block w-2 h-2 rounded-full bg-slate-500"
                              }
                              aria-hidden="true"
                            ></span>
                            {entry.dataKey === "viq"
                              ? `VisitorIQ: ${entry.value}%`
                              : `Others: ${entry.value}%`}
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: 10, fontSize: 13, color: "#64748b" }}
                  formatter={(value) =>
                    value === "viq" ? (
                      <span className="text-blue-600 font-semibold">VisitorIQ</span>
                    ) : (
                      <span className="text-slate-500 font-semibold">Others</span>
                    )
                  }
                />
                <Line
                  type="monotone"
                  dataKey="viq"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 4, stroke: '#2563eb', strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 3, fill: '#fff' }}
                  isAnimationActive={true}
                />
                <Line
                  type="monotone"
                  dataKey="comp"
                  stroke="#64748b"
                  strokeWidth={3}
                  dot={false}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
        {/* Right Column */}
        <div className="flex flex-col gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="flex items-start gap-4 bg-white border border-slate-200 rounded-xl px-6 py-5 shadow-sm hover:shadow-md transition group"
              variants={cardMotion}
              initial="hidden"
              whileInView="visible"
              custom={i}
              viewport={{ once: true, amount: 0.3 }}
            >
              <f.icon className="w-7 h-7 mt-1 text-blue-600 shrink-0" aria-hidden="true" />
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-1">{f.title}</h3>
                <div className="text-base text-slate-600 leading-snug">{f.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default WhyAccuracySection;
