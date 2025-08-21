"use client"
import { useState, useEffect } from "react"
import browserSupabase from "@/app/lib/supabase-browser"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "../../../components/ui/input"
import { Button } from "@/components/ui/button"

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams?.get("email") || "";
    setEmail(emailParam);
  }, [searchParams]);

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
      const next = searchParams?.get("next") || "/dashboard";
      setTimeout(() => router.push(next), 1200);
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
            <CardTitle className="text-2xl font-bold text-center">Sign up for VisitorIQ</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
              <Input
                type="text"
                placeholder="Location"
                value={location}
                onChange={e => setLocation(e.target.value)}
                required
              />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                readOnly={!!searchParams?.get("email")}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Registering..." : "Sign Up"}
              </Button>
              {message && <p className="mt-2 text-center text-sm text-red-600">{message}</p>}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
