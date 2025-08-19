"use client"
import { useState } from "react"
import browserSupabase from "@/app/lib/supabase-browser"
import { useRouter } from "next/navigation"

import { useEffect } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    const { data, error } = await browserSupabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setMessage(error.message)
    } else {
      setMessage("")
      // Sync session to cookies for SSR
      await fetch("/api/auth/callback", {
        method: "POST",
        body: JSON.stringify({ event: "SIGNED_IN", session: data.session }),
        headers: { "Content-Type": "application/json" },
      });
      router.push("/dashboard")
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
        <h2 className="text-2xl font-bold mb-6 text-center">Sign in to VisitorIQ</h2>
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
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
        {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
        <div className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <a href="/register" className="text-blue-600 hover:underline">Sign up</a>
        </div>
      </form>
    </div>
  )
}
