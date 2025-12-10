import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmailChart } from "@/components/email-chart"
import { Copy, ExternalLink, Settings } from "lucide-react"
import Link from "next/link"

async function getProject(id: string, userId: string, isAdmin: boolean) {
  const project = await prisma.project.findFirst({
    where: isAdmin ? { id } : { id, userId },
    include: {
      _count: {
        select: { emailSubmissions: true }
      }
    }
  })

  if (!project) return null

  // Get email stats for chart
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const emailStats = await prisma.emailSubmission.groupBy({
    by: ['timestamp'],
    where: {
      projectId: id,
      timestamp: {
        gte: sevenDaysAgo
      }
    },
    _count: {
      id: true
    }
  })

  const statsMap = new Map<string, number>()
  emailStats.forEach(stat => {
    const date = stat.timestamp.toISOString().split('T')[0]
    statsMap.set(date, (statsMap.get(date) || 0) + stat._count.id)
  })

  const emailStatsFormatted = Array.from(statsMap.entries()).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString(),
    emails: count
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Recent submissions
  const recentSubmissions = await prisma.emailSubmission.findMany({
    where: { projectId: id },
    take: 10,
    orderBy: { timestamp: "desc" }
  })

  return {
    ...project,
    emailStats: emailStatsFormatted,
    recentSubmissions
  }
}

export default async function ProjectPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) return null

  const isAdmin = session.user.role === "ADMIN"
  const project = await getProject(id, session.user.id, isAdmin)

  if (!project) {
    notFound()
  }

  const apiEndpoint = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/public/collect/${project.id}`
  const embedCode = `<form action="${apiEndpoint}" method="POST">
  <input type="email" name="email" placeholder="Enter your email" required>
  <input type="hidden" name="x-api-key" value="${project.apiKey}">
  <button type="submit">Subscribe</button>
</form>`

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
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card/80 p-5 shadow-lg shadow-black/10 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{project.name}</h1>
            <p className="text-sm text-muted-foreground">{project.description || "No description"}</p>
          </div>
          <Button variant="outline" asChild className="border-border/70 bg-background/70">
            <Link href={`/dashboard/projects/${project.id}/edit`}>
              <Settings className="mr-2 h-4 w-4" />
              Edit Project
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="integration">Integration</TabsTrigger>
            <TabsTrigger value="emails">Emails</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-border/70 bg-card/80 shadow-md shadow-black/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Emails</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-foreground">{project._count.emailSubmissions}</div>
                </CardContent>
              </Card>
              <Card className="border-border/70 bg-card/80 shadow-md shadow-black/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-foreground">
                    {project.emailStats.reduce((sum, stat) => sum + stat.emails, 0)}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/70 bg-card/80 shadow-md shadow-black/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">API Key</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded border border-border/70 bg-background/70 px-3 py-2 text-sm font-mono text-foreground">{project.apiKey.slice(0, 12)}...</div>
                </CardContent>
              </Card>
              <Card className="border-border/70 bg-card/80 shadow-md shadow-black/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">Active</Badge>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/70 bg-card/80 shadow-lg shadow-black/10">
              <CardHeader>
                <CardTitle>Email Collection Trend</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <EmailChart data={project.emailStats} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integration" className="space-y-4">
            <Card className="border-border/70 bg-card/80 shadow-md shadow-black/10">
              <CardHeader>
                <CardTitle>API Endpoint</CardTitle>
                <CardDescription>Use this endpoint to collect emails programmatically</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded border border-border/70 bg-background/70 p-2 text-sm text-foreground">{apiEndpoint}</code>
                  <Button variant="outline" size="sm" className="border-border/70 bg-background/70">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Headers Required:</h4>
                  <code className="block rounded border border-border/70 bg-background/70 p-2 text-sm text-foreground">
                    x-api-key: {project.apiKey}
                  </code>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Example Request:</h4>
                  <pre className="overflow-x-auto rounded border border-border/70 bg-background/70 p-2 text-sm">
{`curl -X POST "${apiEndpoint}" \
  -H "Content-Type: application/json" \
  -H "x-api-key: ${project.apiKey}" \
  -d '{"email": "user@example.com"}'`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/80 shadow-md shadow-black/10">
              <CardHeader>
                <CardTitle>Embeddable Form</CardTitle>
                <CardDescription>HTML form code to embed on your website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <pre className="flex-1 overflow-x-auto rounded border border-border/70 bg-background/70 p-2 text-sm">{embedCode}</pre>
                  <Button variant="outline" size="sm" className="border-border/70 bg-background/70">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="outline" asChild className="border-border/70 bg-background/70">
                  <a href={`/preview/${project.id}`} target="_blank">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Preview Form
                  </a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emails" className="space-y-4">
            <Card className="border-border/70 bg-card/80 shadow-md shadow-black/10">
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
                <CardDescription>Latest emails collected for this project</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.recentSubmissions.map((submission) => (
                    <div key={submission.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-background/70 px-3 py-2">
                      <div>
                        <p className="font-medium text-foreground">{submission.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {submission.timestamp.toLocaleDateString()} • {submission.country || "Unknown"}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {submission.ip}
                      </div>
                    </div>
                  ))}
                </div>
                {project.recentSubmissions.length > 0 && (
                  <div className="mt-4">
                    <Button asChild className="shadow-md shadow-emerald-500/20">
                      <Link href={`/dashboard/projects/${project.id}/emails`}>
                        View All Emails
                      </Link>
                    </Button>
                  </div>
                )}
                {project.recentSubmissions.length === 0 && (
                  <p className="py-8 text-center text-muted-foreground">No emails collected yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}