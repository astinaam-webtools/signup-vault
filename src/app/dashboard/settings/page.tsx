"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Settings as SettingsIcon, ShieldCheck, Database, ServerCog, MoonStar } from "lucide-react"
import dynamic from "next/dynamic"

const ChangePasswordForm = dynamic(() => import("./change-password"), { ssr: false })

interface Settings {
  allowUserRegistration: boolean
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({ allowUserRegistration: false })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleRegistration = async (allowUserRegistration: boolean) => {
    setSaving(true)
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowUserRegistration }),
      })

      if (response.ok) {
        setSettings({ allowUserRegistration })
      } else {
        // Revert on error
        setSettings(prev => ({ ...prev, allowUserRegistration: !allowUserRegistration }))
      }
    } catch (error) {
      console.error("Error updating settings:", error)
      // Revert on error
      setSettings(prev => ({ ...prev, allowUserRegistration: !allowUserRegistration }))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background px-2 py-4 sm:px-4 lg:px-6">
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.14),transparent_32%),radial-gradient(circle_at_80%_12%,rgba(14,165,233,0.16),transparent_30%),radial-gradient(circle_at_28%_82%,rgba(248,180,0,0.12),transparent_28%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(10,15,28,0.14)_0%,rgba(8,12,22,0.08)_55%,rgba(255,255,255,0.14)_100%)] mix-blend-multiply"
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 mix-blend-overlay bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08),transparent_52%)]" aria-hidden />

      <div className="flex w-full flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card/80 p-6 shadow-lg shadow-black/10 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
              <SettingsIcon className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
              <p className="text-sm text-muted-foreground">Configure system-wide controls and policies.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            Admin access only
          </div>
        </div>

        <Card className="border-border/70 bg-card/80 shadow-md shadow-black/10">
          <CardHeader>
            <CardTitle>User Registration</CardTitle>
            <CardDescription>
              Control whether new users can register accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 rounded-xl border border-border/70 bg-background/70 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="text-sm font-medium text-foreground">Allow User Registration</div>
                <div className="text-sm text-muted-foreground">
                  When enabled, users can create their own accounts. When disabled, only admins can create user accounts.
                </div>
              </div>
              <Switch
                checked={settings.allowUserRegistration}
                onCheckedChange={handleToggleRegistration}
                disabled={saving}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Changes apply immediately to all sign-up flows.</p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 shadow-md shadow-black/10">
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>
              Current system configuration details
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/70 p-4">
              <Database className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Database</p>
                <p className="text-sm text-muted-foreground">PostgreSQL</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/70 p-4">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Authentication</p>
                <p className="text-sm text-muted-foreground">NextAuth.js</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/70 p-4">
              <MoonStar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Framework</p>
                <p className="text-sm text-muted-foreground">Next.js 15</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/70 p-4">
              <ServerCog className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Deployment</p>
                <p className="text-sm text-muted-foreground">Optimized for Coolify</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <ChangePasswordForm />
    </div>
  )
}