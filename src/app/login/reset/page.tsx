"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { AlertCircle, Mail } from "lucide-react"

const resetSchema = z.object({
  email: z.string().email("Invalid email address")
})

type ResetForm = z.infer<typeof resetSchema>

export default function ResetPasswordPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const form = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: "" }
  })

  const onSubmit = async (data: ResetForm) => {
    setError("")
    try {
      const res = await fetch("/api/auth/reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      if (res.ok) setSent(true)
      else setError("Failed to send reset email")
    } catch {
      setError("Failed to send reset email")
    }
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background px-4 py-12 text-foreground">
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_20%,rgba(56,189,248,0.18),transparent_32%),radial-gradient(circle_at_82%_16%,rgba(16,185,129,0.18),transparent_28%),radial-gradient(circle_at_40%_80%,rgba(250,204,21,0.12),transparent_30%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(140deg,rgba(12,18,32,0.9)_0%,rgba(11,22,41,0.72)_40%,rgba(12,15,28,0.55)_100%)] mix-blend-multiply"
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08),transparent_50%)] mix-blend-overlay" aria-hidden />

      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-10 lg:flex-row lg:items-start lg:gap-14">
        <div className="space-y-4 text-center lg:text-left">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200/40 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-emerald-900 shadow-inner shadow-emerald-500/20">
            Account support
          </p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Reset your password
          </h1>
          <p className="max-w-xl text-base text-foreground/70">
            Send a secure reset link to your email. The link expires in one hour to keep accounts safe.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-foreground/60">
            <span className="rounded-full border border-border/70 bg-card/70 px-3 py-1">No user enumeration</span>
            <span className="rounded-full border border-border/70 bg-card/70 px-3 py-1">One-hour validity</span>
          </div>
        </div>

        <Card className="w-full max-w-md border-border/70 bg-card/80 p-1 shadow-2xl shadow-emerald-500/15 backdrop-blur-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">Reset password</CardTitle>
            <CardDescription>Enter your account email and we will send a reset link.</CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary">
                <Mail className="h-4 w-4" />
                If your email exists, a reset link is on the way.
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField name="email" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" autoComplete="email" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  {error && (
                    <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span>{error}</span>
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Sending..." : "Send reset link"}
                  </Button>
                </form>
              </Form>
            )}

            <div className="mt-4 text-center text-xs text-muted-foreground">
              <Link href="/login" className="text-primary underline hover:opacity-80">Back to login</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
