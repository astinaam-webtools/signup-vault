import Link from "next/link"
import { ArrowRight, BarChart2, Clock3, FolderOpen, Mail, Plus } from "lucide-react"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EmailChart } from "@/components/email-chart"

async function getDashboardStats(userId: string, isAdmin: boolean) {
  const whereClause = isAdmin ? {} : { userId }

  const totalProjects = await prisma.project.count({ where: whereClause })
  const totalEmails = await prisma.emailSubmission.count({
    where: {
      project: whereClause
    }
  })

  // Recent activity: last 10 submissions
  const recentSubmissions = await prisma.emailSubmission.findMany({
    take: 10,
    orderBy: { timestamp: "desc" },
    where: {
      project: whereClause
    },
    include: {
      project: {
        select: { name: true }
      }
    }
  })

  // For chart: emails per day for last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const emailStats = await prisma.emailSubmission.groupBy({
    by: ['timestamp'],
    where: {
      timestamp: {
        gte: sevenDaysAgo
      },
      project: whereClause
    },
    _count: {
      id: true
    }
  })

  // Group by date
  const statsMap = new Map<string, number>()
  emailStats.forEach(stat => {
    const date = stat.timestamp.toISOString().split('T')[0]
    statsMap.set(date, (statsMap.get(date) || 0) + stat._count.id)
  })

  const emailStatsFormatted = Array.from(statsMap.entries()).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString(),
    emails: count
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return {
    totalProjects,
    totalEmails,
    recentSubmissions,
    emailStats: emailStatsFormatted
  }
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) return null

  const isAdmin = session.user.role === "ADMIN"
  const stats = await getDashboardStats(session.user.id, isAdmin)

  return (
    <div className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden bg-background px-2 py-4 sm:px-4 lg:px-6">
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(16,185,129,0.16),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.16),transparent_32%),radial-gradient(circle_at_20%_85%,rgba(248,180,0,0.12),transparent_28%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(10,15,28,0.14)_0%,rgba(8,12,22,0.08)_55%,rgba(255,255,255,0.14)_100%)] mix-blend-multiply"
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 mix-blend-overlay bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08),transparent_52%)]" aria-hidden />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/80 p-6 shadow-lg shadow-black/10 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Overview</p>
              <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Track project health, capture flow, and recent activity at a glance.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm" className="border-border/70 bg-background/60">
                <Link href="/dashboard/projects">
                  View projects
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="sm" className="shadow-md shadow-emerald-500/20">
                <Link href="/dashboard/projects/new">
                  <Plus className="size-4" />
                  New project
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/70 bg-card/80 shadow-md shadow-black/10">
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div>
                  <CardTitle className="text-sm text-muted-foreground">Total Projects</CardTitle>
                  <div className="mt-2 text-3xl font-semibold text-foreground">{stats.totalProjects}</div>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FolderOpen className="size-4" />
                </span>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-muted-foreground">All projects in your workspace.</CardContent>
            </Card>

            <Card className="border-border/70 bg-card/80 shadow-md shadow-black/10">
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div>
                  <CardTitle className="text-sm text-muted-foreground">Total Emails</CardTitle>
                  <div className="mt-2 text-3xl font-semibold text-foreground">{stats.totalEmails}</div>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail className="size-4" />
                </span>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-muted-foreground">Captured across all projects.</CardContent>
            </Card>

            <Card className="border-border/70 bg-card/80 shadow-md shadow-black/10">
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div>
                  <CardTitle className="text-sm text-muted-foreground">Recent Activity</CardTitle>
                  <div className="mt-2 text-3xl font-semibold text-foreground">{stats.recentSubmissions.length}</div>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Clock3 className="size-4" />
                </span>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-muted-foreground">Last 10 submissions.</CardContent>
            </Card>

            <Card className="border-border/70 bg-card/80 shadow-md shadow-black/10">
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div>
                  <CardTitle className="text-sm text-muted-foreground">Avg per Project</CardTitle>
                  <div className="mt-2 text-3xl font-semibold text-foreground">
                    {stats.totalProjects > 0 ? Math.round(stats.totalEmails / stats.totalProjects) : 0}
                  </div>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <BarChart2 className="size-4" />
                </span>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-muted-foreground">Rolling average per project.</CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Card className="border-border/70 bg-card/80 shadow-lg shadow-black/10">
            <CardHeader>
              <CardTitle>Email collection trend</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <EmailChart data={stats.emailStats} />
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80 shadow-lg shadow-black/10">
            <CardHeader>
              <CardTitle>Recent submissions</CardTitle>
              <CardDescription>Latest email captures</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentSubmissions.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
                  No submissions yet. Once captures arrive, they will appear here with country and project context.
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentSubmissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="flex items-center justify-between rounded-lg border border-border/60 bg-card/70 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{submission.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {submission.project.name} • {submission.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {submission.country || "Unknown"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}