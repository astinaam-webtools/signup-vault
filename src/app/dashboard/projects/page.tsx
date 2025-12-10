import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, Settings, BarChart3, Sparkles } from "lucide-react"

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

      <div className="flex w-full flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card/80 p-6 shadow-lg shadow-black/10 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
              <p className="text-sm text-muted-foreground">Manage your email collection projects.</p>
            </div>
          </div>
          <Button asChild className="shadow-md shadow-emerald-500/20">
            <Link href="/dashboard/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search projects..." className="pl-8" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="border-border/70 bg-card/80 shadow-md shadow-black/10">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="break-words pr-3">{project.name}</span>
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
                <CardDescription className="line-clamp-2">{project.description || "No description"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-2xl font-semibold text-foreground">{project._count.emailSubmissions}</div>
                <p className="text-xs text-muted-foreground">Total emails collected</p>
                <div className="rounded-lg border border-border/60 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
                  <span className="font-mono text-foreground">API Key: {project.apiKey.slice(0, 8)}...</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border/70 bg-card/60 px-6 py-12 text-center shadow-inner shadow-black/5">
            <p className="text-muted-foreground">No projects yet. Create your first project to start collecting emails.</p>
          </div>
        )}
      </div>
    </div>
  )
}