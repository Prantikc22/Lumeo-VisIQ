"use client"
import { useState } from "react"
import browserSupabase from "@/app/lib/supabase-browser"
import { useRouter } from "next/navigation"

import { useEffect } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location || !email || !password || !confirmPassword) {
      setMessage("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    setLoading(true);
    setMessage("");
    const { data, error } = await browserSupabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, location }
      }
    });
    setLoading(false);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email to confirm your registration!");
      // Sync session to cookies for SSR if available (for magic link, session may be null)
      if (data.session) {
        await fetch("/api/auth/callback", {
          method: "POST",
          body: JSON.stringify({ event: "SIGNED_IN", session: data.session }),
          headers: { "Content-Type": "application/json" },
        });
      }
      setTimeout(() => router.push("/dashboard"), 1200);
    }
  }

  // Sync session on auth state change
  useEffect(() => {
    const { data: { subscription } = {} } = browserSupabase.auth.onAuthStateChange(
      async (event, session) => {
        await fetch("/api/auth/callback", {
          method: "POST",
          body: JSON.stringify({ event, session }),
          headers: { "Content-Type": "application/json" },
        });
      }
    );
    return () => {
      subscription?.unsubscribe();
    };


  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Sign up for VisitorIQ</h2>
        <input
          type="text"
          className="border rounded w-full py-2 px-3 mb-4"
          placeholder="Full Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          type="text"
          className="border rounded w-full py-2 px-3 mb-4"
          placeholder="Location"
          value={location}
          onChange={e => setLocation(e.target.value)}
          required
        />
        <input
          type="email"
          className="border rounded w-full py-2 px-3 mb-4"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="border rounded w-full py-2 px-3 mb-4"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          className="border rounded w-full py-2 px-3 mb-4"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? "Registering..." : "Sign Up"}
        </button>
        {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
      </form>
    </div>
  )
}
