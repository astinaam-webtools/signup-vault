import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmails}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentSubmissions.length}</div>
            <p className="text-xs text-muted-foreground">Last 10 submissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Project</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalProjects > 0 ? Math.round(stats.totalEmails / stats.totalProjects) : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Email Collection Trend</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <EmailChart data={stats.emailStats} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>Latest email collections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentSubmissions.map((submission) => (
                <div key={submission.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{submission.email}</p>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}