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
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/projects/${project.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Project
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Project</h1>
          <p className="text-muted-foreground">Update your project settings</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
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
                        <Input placeholder="My Awesome Project" {...field} />
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
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Project"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Settings</CardTitle>
            <CardDescription>Manage your project's API key</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Current API Key</label>
              <div className="flex items-center space-x-2 mt-1">
                <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                  {project.apiKey}
                </code>
                <Button variant="outline" size="sm" onClick={regenerateApiKey}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Regenerating the key will break existing integrations
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}