"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Settings as SettingsIcon } from "lucide-react"

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
    <div className="space-y-6">
      <div className="flex items-center">
        <SettingsIcon className="mr-2 h-6 w-6" />
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure system-wide settings</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Registration</CardTitle>
          <CardDescription>
            Control whether new users can register accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Allow User Registration</div>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>
            Current system configuration details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Database:</span> PostgreSQL
            </div>
            <div>
              <span className="font-medium">Authentication:</span> NextAuth.js
            </div>
            <div>
              <span className="font-medium">Framework:</span> Next.js 15
            </div>
            <div>
              <span className="font-medium">Deployment:</span> Optimized for Coolify
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}