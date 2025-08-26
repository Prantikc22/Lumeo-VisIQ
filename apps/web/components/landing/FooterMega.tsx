// FooterMega: multi-column brutal footer with newsletter and language switcher
import React from "react";
import Link from "next/link";

const columns = [
  {
    title: "Product",
    links: ["Features", "Use Cases", "Pricing", "Docs", "FAQ"],
  },
  {
    title: "Solutions",
    links: [
      "Trial Abuse",
      "Account Sharing",
      "Bot Defense",
      "ATO",
      "Payments",
      "Promo Abuse",
    ],
  },
  {
    title: "Developers",
    links: ["SDKs", "API Docs", "Webhooks", "Changelog"],
  },
  {
    title: "Company",
    links: ["About", "Customers", "Blog", "Contact"],
  },
  {
    title: "Legal",
    links: ["Terms", "Privacy", "Security"],
  },
  {
    title: "Social",
    links: ["Twitter", "GitHub", "LinkedIn"],
  },
];

export const FooterMega: React.FC = () => (
  <footer className="bg-white border-t border-teal-50 py-16 px-4 mt-16 w-full" style={{fontFamily: 'Inter, Segoe UI, Arial, sans-serif'}}>
    <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 mb-12">
      {columns.map((col) => (
        <div key={col.title}>
          <div className="font-black text-lg mb-3 text-[#0f172a]">{col.title}</div>
          <ul className="flex flex-col gap-2">
            {col.links.map((l) => (
              <li key={l}>
                <Link
                  href="#"
                  className="font-semibold text-[#164e63] hover:underline"
                >
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto">
      <form className="flex gap-2">
        <input
          type="email"
          placeholder="Your email"
          className="px-4 py-2 border-2 border-black rounded-xl"
        />
        <button
          type="submit"
          className="px-6 py-2 rounded-xl font-bold bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0_#22223b]"
        >
          Subscribe
        </button>
      </form>
      <div className="flex gap-2 items-center">
        <span className="font-bold text-black">Language:</span>
        <select className="px-3 py-2 border-2 border-black rounded-xl">
          <option>English</option>
          <option>Español</option>
          <option>Deutsch</option>
        </select>
      </div>
    </div>
    <div className="text-center text-gray-500 mt-10">
      &copy; {new Date().getFullYear()} Lumeo VisIQ. All rights reserved.
    </div>
  </footer>
);
