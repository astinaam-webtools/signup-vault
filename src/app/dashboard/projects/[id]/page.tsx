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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">{project.description || "No description"}</p>
        </div>
        <Button variant="outline" asChild>
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{project._count.emailSubmissions}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {project.emailStats.reduce((sum, stat) => sum + stat.emails, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Key</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-mono">{project.apiKey.slice(0, 12)}...</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">Active</Badge>
              </CardContent>
            </Card>
          </div>

          <Card>
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
          <Card>
            <CardHeader>
              <CardTitle>API Endpoint</CardTitle>
              <CardDescription>Use this endpoint to collect emails programmatically</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <code className="flex-1 p-2 bg-muted rounded text-sm">{apiEndpoint}</code>
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <h4 className="font-medium mb-2">Headers Required:</h4>
                <code className="block p-2 bg-muted rounded text-sm">
                  x-api-key: {project.apiKey}
                </code>
              </div>
              <div>
                <h4 className="font-medium mb-2">Example Request:</h4>
                <pre className="p-2 bg-muted rounded text-sm overflow-x-auto">
{`curl -X POST "${apiEndpoint}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${project.apiKey}" \\
  -d '{"email": "user@example.com"}'`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Embeddable Form</CardTitle>
              <CardDescription>HTML form code to embed on your website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <pre className="flex-1 p-2 bg-muted rounded text-sm overflow-x-auto">{embedCode}</pre>
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" asChild>
                <a href={`/preview/${project.id}`} target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Preview Form
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>Latest emails collected for this project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.recentSubmissions.map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <p className="font-medium">{submission.email}</p>
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
                  <Button asChild>
                    <Link href={`/dashboard/projects/${project.id}/emails`}>
                      View All Emails
                    </Link>
                  </Button>
                </div>
              )}
              {project.recentSubmissions.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No emails collected yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}