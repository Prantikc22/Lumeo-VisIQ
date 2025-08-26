"use client"
import Link from "next/link"
import { ReactNode } from "react"

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/sites", label: "Sites" },
  { href: "/dashboard/visitors", label: "Visitors" },
  { href: "/dashboard/blocks", label: "Blocks" },
  { href: "/dashboard/settings", label: "Settings" },
]

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import browserSupabase from "@/app/lib/supabase-browser";

function SidebarUser() {
  const [user, setUser] = React.useState<any>(null);
  React.useEffect(() => {
    import("@/app/lib/supabase-browser").then(({ default: supabase }) => {
      supabase.auth.getUser().then(res => setUser(res.data.user));
    });
  }, []);
  return (
    <div className="text-sm text-gray-500 mb-2">Signed in as <span className="font-semibold">{user?.user_metadata?.name || user?.email || "-"}</span></div>
  );
}


export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Only require auth for protected dashboard routes
    const pathname = window.location.pathname;
    const isAuthPage = ["/login", "/register", "/forgot-password"].includes(pathname);
    if (isAuthPage) return;
    browserSupabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/dashboard/login");
      }
    });
  }, [router]);

  // Hide sidebar ONLY for /dashboard/login, /dashboard/register, /dashboard/forgot-password
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isAuthPage = ["/dashboard/login", "/dashboard/register", "/dashboard/forgot-password", "/login", "/register"].includes(pathname);
  if (isAuthPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <main className="w-full max-w-md p-4">{children}</main>
      </div>
    );
  }
  // Default: sidebar layout for all other dashboard pages
  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white border-r hidden md:flex flex-col fixed inset-y-0 left-0 z-30">
        <div className="px-6 py-5 font-bold text-xl border-b">Lumeo VisIQ</div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2 rounded hover:bg-blue-100 text-gray-700 font-medium"
              prefetch={false}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="px-6 py-4 border-t flex flex-col items-start mt-auto sticky bottom-0 bg-white">
          <SidebarUser />
          <button className="text-blue-600 hover:underline text-sm" onClick={async () => {
            await browserSupabase.auth.signOut();
            await fetch("/api/auth/callback", {
              method: "POST",
              body: JSON.stringify({ event: "SIGNED_OUT", session: null }),
              headers: { "Content-Type": "application/json" },
            });
            router.replace('/login');
          }}>Logout</button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col md:ml-64">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-white">
          <div className="font-bold text-lg">Lumeo VisIQ</div>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
