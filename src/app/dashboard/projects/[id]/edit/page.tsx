"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"

const projectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
})

type ProjectForm = z.infer<typeof projectSchema>

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [project, setProject] = useState<any>(null)

  const form = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
  })

  useEffect(() => {
    async function fetchProject() {
      try {
        const { id } = await params
        const response = await fetch(`/api/projects/${id}`)
        if (response.ok) {
          const data = await response.json()
          setProject(data)
          form.reset({
            name: data.name,
            description: data.description || "",
          })
        }
      } catch (error) {
        console.error("Error fetching project:", error)
      } finally {
        setIsFetching(false)
      }
    }
    fetchProject()
  }, [params, form])

  async function onSubmit(data: ProjectForm) {
    setIsLoading(true)
    try {
      const { id } = await params
      const response = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push(`/dashboard/projects/${id}`)
      } else {
        console.error("Failed to update project")
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function regenerateApiKey() {
    if (!confirm("Are you sure you want to regenerate the API key? This will break any existing integrations.")) {
      return
    }

    try {
      const { id } = await params
      const response = await fetch(`/api/projects/${id}/regenerate-key`, {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        setProject({ ...project, apiKey: data.apiKey })
      }
    } catch (error) {
      console.error("Error regenerating API key:", error)
    }
  }

  if (isFetching) {
    return <div>Loading...</div>
  }

  if (!project) {
    return <div>Project not found</div>
  }

  return (
    <div className="relative isolate min-h-screen w-full overflow-hidden bg-background px-2 py-4 sm:px-4 lg:px-6">
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_22%,rgba(16,185,129,0.14),transparent_32%),radial-gradient(circle_at_82%_12%,rgba(14,165,233,0.16),transparent_30%),radial-gradient(circle_at_28%_82%,rgba(248,180,0,0.12),transparent_28%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(10,15,28,0.14)_0%,rgba(8,12,22,0.08)_55%,rgba(255,255,255,0.14)_100%)] mix-blend-multiply"
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 mix-blend-overlay bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08),transparent_52%)]" aria-hidden />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/70 bg-card/80 p-5 shadow-lg shadow-black/10 backdrop-blur-xl">
          <Button variant="ghost" size="sm" asChild className="border border-border/60 bg-background/60 text-foreground/80">
            <Link href={`/dashboard/projects/${project.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Project
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Edit Project</h1>
            <p className="text-sm text-muted-foreground">Update your project settings.</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border/70 bg-card/80 shadow-md shadow-black/10">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Update basic project information</CardDescription>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isLoading} className="shadow-md shadow-emerald-500/20">
                    {isLoading ? "Updating..." : "Update Project"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80 shadow-md shadow-black/10">
            <CardHeader>
              <CardTitle>API Settings</CardTitle>
              <CardDescription>Manage your project&apos;s API key</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Current API Key</label>
                <div className="mt-2 flex items-center gap-2">
                  <code className="flex-1 rounded border border-border/70 bg-background/70 p-2 text-sm font-mono text-foreground">
                    {project.apiKey}
                  </code>
                  <Button variant="outline" size="sm" onClick={regenerateApiKey} className="border-border/70 bg-background/70">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Regenerating the key will break existing integrations
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}