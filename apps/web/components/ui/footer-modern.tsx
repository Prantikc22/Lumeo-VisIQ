import React from "react";
import Link from "next/link";

export function FooterModern() {
  return (
    <footer className="w-full border-t border-border/40 bg-background py-10 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between md:items-center gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 mb-2">
            <img src="/Logo.png" alt="Logo" className="h-7 w-auto" />
            {/* Place your logo file at: /public/logo.svg */}
          </div>
          <span className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} VisitorIQ. All rights reserved.</span>
        </div>
        <nav className="flex flex-wrap gap-6 md:gap-10">
          <Link href="#from-chaos-to-clarity" className="text-sm text-foreground hover:text-primary transition-colors">Features</Link>
          <Link href="#fraud-prevention-use-cases" className="text-sm text-foreground hover:text-primary transition-colors">Use Cases</Link>
          <Link href="#" className="text-sm text-foreground hover:text-primary transition-colors" onClick={e => {e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'});}}>Contact</Link>
          <Link href="/register?next=%2Fpricing" className="text-sm text-foreground hover:text-primary transition-colors">Get Started</Link>
          <Link href="/login" className="text-sm font-bold text-primary hover:text-primary transition-colors">Sign In</Link>
        </nav>
      </div>
    </footer>
  );
}
