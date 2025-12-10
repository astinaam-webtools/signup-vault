"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const projectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
})

type ProjectForm = z.infer<typeof projectSchema>

export default function NewProjectPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  async function onSubmit(data: ProjectForm) {
    setIsLoading(true)
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push("/dashboard/projects")
      } else {
        // Handle error
        console.error("Failed to create project")
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background px-2 py-4 sm:px-4 lg:px-6">
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_22%,rgba(16,185,129,0.14),transparent_32%),radial-gradient(circle_at_82%_12%,rgba(14,165,233,0.16),transparent_30%),radial-gradient(circle_at_28%_82%,rgba(248,180,0,0.12),transparent_28%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(10,15,28,0.14)_0%,rgba(8,12,22,0.08)_55%,rgba(255,255,255,0.14)_100%)] mix-blend-multiply"
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 mix-blend-overlay bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08),transparent_52%)]" aria-hidden />

      <div className="flex w-full flex-col gap-6">
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/70 bg-card/80 p-5 shadow-lg shadow-black/10 backdrop-blur-xl">
          <Button variant="ghost" size="sm" asChild className="border border-border/60 bg-background/60 text-foreground/80">
            <Link href="/dashboard/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Create New Project</h1>
            <p className="text-sm text-muted-foreground">Set up a new email collection project.</p>
          </div>
        </div>

        <Card className="border-border/70 bg-card/80 shadow-md shadow-black/10">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>Configure your project&apos;s basic information</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Awesome Project" className="border-border bg-card" {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for your project
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description of what this project is for..."
                          className="resize-none border-border bg-card"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Help others understand the purpose of this project
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isLoading} className="shadow-md shadow-emerald-500/20">
                  {isLoading ? "Creating..." : "Create Project"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}