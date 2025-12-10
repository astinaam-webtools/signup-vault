import Link from "next/link"
import { ArrowRight, LogIn } from "lucide-react"
import LandingSignup from "@/components/landing-signup"
import { auth } from "@/lib/auth"

export default async function Home() {
  const session = await auth()

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background px-6 py-10 text-foreground sm:px-10">
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.14),transparent_32%),radial-gradient(circle_at_85%_18%,rgba(14,165,233,0.16),transparent_30%),radial-gradient(circle_at_28%_80%,rgba(248,180,0,0.12),transparent_28%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(10,15,28,0.18)_0%,rgba(8,12,22,0.08)_55%,rgba(255,255,255,0.12)_100%)] mix-blend-multiply"
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 mix-blend-overlay bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08),transparent_52%)]" aria-hidden />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-full border border-border/60 bg-card/80 px-4 py-3 shadow-lg shadow-black/10 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-emerald-400/80 to-sky-400/80 text-sm font-semibold text-black shadow-lg shadow-emerald-500/30">
            SV
          </div>
          <div>
            <p className="text-sm text-foreground/80">SignupVault</p>
            <p className="text-xs text-foreground/60">Multi-tenant email collection</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {!session && (
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2 text-foreground/80 transition hover:border-foreground/40 hover:text-foreground"
            >
              <LogIn size={16} className="text-emerald-200" />
              Login
              <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
            </Link>
          )}
          {session && (
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-emerald-400/25 transition hover:shadow-lg hover:shadow-emerald-400/35"
            >
              Open dashboard
              <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col items-center gap-12 pt-14 lg:flex-row lg:items-start lg:gap-14">
        <section className="max-w-2xl space-y-6 text-foreground">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200/40 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-900 shadow-inner shadow-emerald-500/20">
            Designed for shipping fast
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Collect emails, segment audiences, and ship campaigns without plumbing.
          </h1>
          <p className="text-lg text-foreground/70">
            SignupVault is a multi-tenant email collection platform with project-scoped APIs, rate-limited capture, and an admin dashboard that respects your system theme out of the box.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="w-full sm:w-auto">
              <LandingSignup />
            </div>
            <div className="text-sm text-foreground/60 sm:max-w-xs">
              No spam, just product updates and patterns on how we run high-converting capture forms.
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
            <div className="rounded-xl border border-border/70 bg-card/80 p-4 shadow-md shadow-black/10">
              <p className="text-foreground">Project-scoped API keys</p>
              <p className="text-muted-foreground">Per-project keys with IP, UA, and country capture.</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-card/80 p-4 shadow-md shadow-black/10">
              <p className="text-foreground">Analytics-ready</p>
              <p className="text-muted-foreground">Events flow straight into PostgreSQL for dashboards.</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-card/80 p-4 shadow-md shadow-black/10">
              <p className="text-foreground">Coolify-ready</p>
              <p className="text-muted-foreground">Docker build tuned for fast deploys.</p>
            </div>
          </div>
        </section>

        <section className="w-full max-w-md rounded-2xl border border-border/70 bg-card/80 p-6 text-foreground shadow-2xl shadow-emerald-500/15 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Live preview</p>
              <p className="mt-1 text-2xl font-semibold">Inbox-ready captures</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-foreground/80">API</div>
          </div>
          <div className="mt-6 space-y-4 rounded-xl border border-border/70 bg-background/60 p-5 shadow-inner shadow-black/10">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="flex items-center gap-2 text-foreground">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Rate limit
              </span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-foreground">Enabled</span>
            </div>
            <div className="rounded-lg border border-border/70 bg-card/70 p-4 text-xs text-muted-foreground">
              <p className="font-mono text-foreground">POST /api/public/collect/:projectId</p>
              <p className="mt-2 font-mono">x-api-key: sk_live_***</p>
              <p className="font-mono">body: &#123; email, ip, country, ua &#125;</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="rounded-lg border border-border/70 bg-card/80 p-3 text-center">
                <p className="text-lg font-semibold text-foreground">64%</p>
                <p className="text-muted-foreground">open rate</p>
              </div>
              <div className="rounded-lg border border-border/70 bg-card/80 p-3 text-center">
                <p className="text-lg font-semibold text-foreground">2.3k</p>
                <p className="text-muted-foreground">contacts</p>
              </div>
              <div className="rounded-lg border border-border/70 bg-card/80 p-3 text-center">
                <p className="text-lg font-semibold text-foreground">99.9%</p>
                <p className="text-muted-foreground">uptime</p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
            <span>Export to CSV or plug into your ESP.</span>
            <ArrowRight size={16} className="text-emerald-500" />
          </div>
        </section>
      </main>
    </div>
  )
}
