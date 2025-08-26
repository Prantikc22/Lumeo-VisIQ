// Neobrutal navigation bar for landing page
// Props: onCTAClick, onSalesClick (optional), highlight (optional)
import React from "react";
import Link from "next/link";

export interface NavBarBrutProps {
  onCTAClick?: () => void;
  onSalesClick?: () => void;
  highlight?: string;
}

const links = [
  { href: "#features", label: "Features" },
  { href: "#usecases", label: "Use Cases" },
  { href: "#docs", label: "Docs" },
  { href: "#pricing", label: "Pricing" },
  { href: "#customers", label: "Customers" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

export const NavBarBrut: React.FC<NavBarBrutProps> = ({
  onCTAClick,
  onSalesClick,
  highlight,
}) => (
  <nav className="w-full flex justify-between items-center px-8 py-4 bg-white border-b border-teal-100" style={{fontFamily: 'Inter, Segoe UI, Arial, sans-serif'}}>
    <div className="flex items-center gap-8">
      <img src="/logo.svg" alt="Lumeo VisIQ Logo" style={{ height: 40 }} />
      <span
        className="font-black text-2xl tracking-tight text-[#0f172a]"
      >
        Lumeo VisIQ
      </span>
      <div className="hidden md:flex gap-5 ml-8">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={
              "font-semibold text-base px-3 py-1 rounded transition text-[#164e63] hover:text-[#0ea5e9] hover:bg-teal-50/60 " +
              (highlight === link.label ? "text-[#0ea5e9] underline underline-offset-4" : "")
            }
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
    <div className="flex gap-4">
      <button
        onClick={onCTAClick}
        className="px-6 py-2 rounded-lg font-bold bg-gradient-to-r from-[#0ea5e9] to-[#164e63] text-white shadow-sm hover:from-[#164e63] hover:to-[#0ea5e9] transition border-none focus:ring-2 focus:ring-cyan-400/80 focus:outline-none"
      >
        Get Started Free
      </button>
      <button
        onClick={onSalesClick}
        className="px-6 py-2 rounded-lg font-bold bg-transparent border border-teal-200 text-[#164e63] hover:bg-teal-50/60 hover:text-[#0ea5e9] transition"
      >
        Talk to Sales
      </button>
    </div>
  </nav>
);
