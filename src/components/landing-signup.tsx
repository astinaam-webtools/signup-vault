"use client"

import { useState } from "react"

export default function LandingSignup() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const validateEmail = (value: string) => {
    return /^\S+@\S+\.\S+$/.test(value)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError((body && body.error) || "Failed to submit — please try again.")
      } else {
        setSuccess("Thanks! Check your inbox — you'll hear from us soon.")
        setEmail("")
      }
    } catch (err) {
      setError("Network error — please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-xl">
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <input
          type="email"
          aria-label="Email address"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-4 py-3 rounded-md border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-12 px-5 rounded-md bg-primary text-primary-foreground font-semibold shadow-sm disabled:opacity-60"
        >
          {loading ? "Submitting…" : "Get updates"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      {success && <p className="mt-3 text-sm text-primary-foreground">{success}</p>}
      <p className="mt-3 text-xs text-muted-foreground">No spam — unsubscribe anytime.</p>
    </form>
  )
}
