// StatsBricks: brutal stat blocks with bold metrics
import React from "react";

const stats = [
  { value: "99.5%+", label: "Accuracy" },
  { value: "250+", label: "Regions Covered" },
  { value: "Billions", label: "Device Profiles" },
  { value: "<50ms", label: "API Latency" },
];

export const StatsBricks: React.FC = () => (
  <section className="max-w-4xl mx-auto py-16 px-4 flex flex-wrap gap-8 justify-center">
    {stats.map((s) => (
      <div
        key={s.label}
        className="bg-gray-50 rounded-xl px-10 py-8 flex flex-col items-center min-w-[180px] border border-teal-50"
      >
        <span
          className="text-4xl font-black mb-2 text-black"
          style={{ textShadow: "2px 2px 0 #fbbf24" }}
        >
          {s.value}
        </span>
        <span className="font-bold text-lg text-gray-900">{s.label}</span>
      </div>
    ))}
  </section>
);
