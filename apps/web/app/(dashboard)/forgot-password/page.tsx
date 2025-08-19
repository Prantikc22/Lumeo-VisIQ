"use client"
import { useState } from "react"
import { supabase } from "@/app/lib/supabase"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    setLoading(false)
    if (error) {
      setMessage(error.message)
    } else {
      setMessage("If your email is registered, a password reset link has been sent.")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
        <input
          type="email"
          className="border rounded w-full py-2 px-3 mb-4"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
        {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
      </form>
    </div>
  )
}
