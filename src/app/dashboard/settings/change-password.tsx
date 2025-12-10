"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle2 } from "lucide-react"

const schema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters")
})

type FormType = z.infer<typeof schema>

export default function ChangePasswordForm() {
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: "", newPassword: "" }
  })

  const onSubmit = async (data: FormType) => {
    setError("")
    setSuccess(false)
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      if (res.ok) setSuccess(true)
      else {
        const err = await res.json()
        setError(err.error || "Failed to change password")
      }
    } catch {
      setError("Failed to change password")
    }
  }

  return (
    <Card className="mt-6 w-full border-border/70 bg-card/80 shadow-md shadow-black/10 backdrop-blur-xl">
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>Update your credentials securely from within the dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="currentPassword" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <FormControl><Input type="password" autoComplete="current-password" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField name="newPassword" control={form.control} render={({ field }) => (
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
            {success && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Password changed successfully</span>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Updating..." : "Change Password"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
