"use client"
import { useState } from "react"
import Link from "next/link"
import browserSupabase from "@/app/lib/supabase-browser"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "../../../components/ui/input"
import { Button } from "@/components/ui/button"

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
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Sign in to VisitorIQ</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
              {message && <p className="mt-2 text-center text-sm text-red-600">{message}</p>}
              <div className="mt-4 text-center text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href={{
                  pathname: "/register",
                  query: Object.fromEntries(new URLSearchParams(typeof window !== "undefined" ? window.location.search : ""))
                }} className="text-blue-600 hover:underline">Sign up</Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
