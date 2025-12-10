"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle2 } from "lucide-react"

const schema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters")
})

type FormType = z.infer<typeof schema>

export default function ResetTokenPage() {
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const params = useParams<{ token: string }>()
  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: { password: "" }
  })

  const onSubmit = async (data: FormType) => {
    setError("")
    try {
      const token = params?.token
      if (!token) {
        setError("Reset link is invalid. Please request a new one.")
        return
      }

      const res = await fetch("/api/auth/reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password })
      })
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => router.push("/login"), 2000)
      } else {
        const err = await res.json()
        setError(err.error || "Failed to reset password")
      }
    } catch {
      setError("Failed to reset password")
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

      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-10 lg:flex-row lg:items-start lg:gap-14">
        <div className="space-y-4 text-center lg:text-left">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200/40 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-emerald-900 shadow-inner shadow-emerald-500/20">
            Secure reset
          </p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">Set a new password</h1>
          <p className="max-w-xl text-base text-foreground/70">
            Choose a new password to regain access. This link is single-use and expires in one hour.
          </p>
        </div>

        <Card className="w-full max-w-md border-border/70 bg-card/80 p-1 shadow-2xl shadow-emerald-500/15 backdrop-blur-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">Update password</CardTitle>
            <CardDescription>Enter a strong password you have not used before.</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                Password updated! Redirecting to login...
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField name="password" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl><Input type="password" autoComplete="new-password" {...field} /></FormControl>
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
                    {form.formState.isSubmitting ? "Updating..." : "Set password"}
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
