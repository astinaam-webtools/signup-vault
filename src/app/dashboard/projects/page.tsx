import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, Settings, BarChart3 } from "lucide-react"

async function getProjects(userId: string, isAdmin: boolean) {
  const where = isAdmin ? {} : { userId }

  const projects = await prisma.project.findMany({
    where,
    include: {
      _count: {
        select: { emailSubmissions: true }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  return projects
}

export default async function ProjectsPage() {
  const session = await auth()
  if (!session?.user) return null

  const isAdmin = session.user.role === "ADMIN"
  const projects = await getProjects(session.user.id, isAdmin)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage your email collection projects</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search projects..." className="pl-8" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {project.name}
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/projects/${project.id}`}>
                      <BarChart3 className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/projects/${project.id}/edit`}>
                      <Settings className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>{project.description || "No description"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project._count.emailSubmissions}</div>
              <p className="text-xs text-muted-foreground">Total emails collected</p>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">API Key: {project.apiKey.slice(0, 8)}...</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No projects yet. Create your first project to start collecting emails.</p>
        </div>
      )}
    </div>
  )
}