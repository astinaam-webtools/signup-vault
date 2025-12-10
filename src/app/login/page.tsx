"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginForm = z.infer<typeof loginSchema>

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get("from") || "/dashboard"

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })
      console.log("Sign in result:", result)

      if (result?.error) {
        setError("Invalid credentials")
      } else {
        router.push(from)
        router.refresh()
      }
    } catch {
      setError("An error occurred")
    } finally {
      setIsLoading(false)
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

      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-10 lg:flex-row lg:items-center lg:gap-14">
        <div className="space-y-4 text-center lg:text-left">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200/40 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-emerald-900 shadow-inner shadow-emerald-500/20">
            Secure workspace
          </p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Welcome back to SignupVault
          </h1>
          <p className="max-w-xl text-base text-foreground/70">
            Log in to manage projects, monitor submissions, and export contacts. Your session respects your system theme automatically.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-foreground/60">
            <span className="rounded-full border border-border/70 bg-card/70 px-3 py-1">Encrypted sessions</span>
            <span className="rounded-full border border-border/70 bg-card/70 px-3 py-1">Role-aware access</span>
            <span className="rounded-full border border-border/70 bg-card/70 px-3 py-1">Coolify-ready stack</span>
          </div>
        </div>

        <div className="w-full max-w-md rounded-2xl border border-border/70 bg-card/80 p-8 text-foreground shadow-2xl shadow-emerald-500/15 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Login</p>
              <p className="text-2xl font-semibold">Admin dashboard</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-foreground shadow-inner shadow-black/10">
              SV
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        className="border-border bg-card text-foreground placeholder:text-muted-foreground"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder=""
                        className="border-border bg-card text-foreground placeholder:text-muted-foreground"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && <div className="text-sm text-destructive">{error}</div>}

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground shadow-lg shadow-emerald-500/30 transition hover:shadow-emerald-500/40"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-xs text-muted-foreground text-center">
            <a href="/login/reset" className="text-primary underline hover:opacity-80">Forgot password?</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}