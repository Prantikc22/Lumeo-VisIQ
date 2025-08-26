import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./dialog";
import { useState } from "react";

export function NavBarModern() {
  const [contactOpen, setContactOpen] = React.useState(false);
  return (
    <nav className="w-full flex justify-between items-center px-6 py-3 bg-background border-b border-border/40">
      {/* LOGO: replace src below with your logo file (see comment below) */}
      <div className="flex items-center gap-3">
        <img src="/Logo.png" alt="Logo" className="h-8 w-auto" />
        {/* Place your logo file at: /public/logo.svg */}
      </div>
      <div className="hidden md:flex gap-6 items-center">
        <Link href="#from-chaos-to-clarity" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Features</Link>
        <Link href="#fraud-prevention-use-cases" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Use Cases</Link>
        <Link href="/pricing" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Pricing</Link>
        <button onClick={() => setContactOpen(true)} className="text-sm font-medium text-foreground hover:text-primary transition-colors">Contact</button>
      </div>
      <div className="flex gap-2">
        <Button asChild size="sm" variant="outline" className="rounded-lg px-4 text-primary border-primary font-bold hover:bg-primary/10">
          <Link href="/register?next=%2Fpricing" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-blue-700 transition rounded-lg flex items-center justify-center">
            Get Started
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="rounded-lg px-4 text-primary border-primary font-bold hover:bg-primary/10">
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Us</DialogTitle>
            <DialogDescription>Fill out the form below and our team will get in touch soon.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">Name</label>
              <input id="name" name="name" type="text" required className="mt-1 w-full rounded border px-3 py-2" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium">Email</label>
              <input id="email" name="email" type="email" required className="mt-1 w-full rounded border px-3 py-2" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium">Message</label>
              <textarea id="message" name="message" rows={4} required className="mt-1 w-full rounded border px-3 py-2" />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">Submit</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </nav>
  );
}
