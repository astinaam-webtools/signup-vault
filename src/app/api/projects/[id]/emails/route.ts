import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const ITEMS_PER_PAGE = 50

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""
    const country = searchParams.get("country") || ""
    const sortBy = searchParams.get("sortBy") || "timestamp"
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc"

    const isAdmin = session.user.role === "ADMIN"

    // Check if user has access to this project
    const project = await prisma.project.findFirst({
      where: isAdmin ? { id } : { id, userId: session.user.id },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const where = {
      projectId: id,
      ...(search && {
        OR: [
          { email: { contains: search, mode: "insensitive" as const } },
          { ip: { contains: search } },
          { userAgent: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(country && { country }),
    }

    const [emails, totalCount] = await Promise.all([
      prisma.emailSubmission.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
      }),
      prisma.emailSubmission.count({ where }),
    ])

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

    return NextResponse.json({
      emails,
      totalCount,
      totalPages,
      currentPage: page,
    })
  } catch (error) {
    console.error("Get emails error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const body = await req.json()
    const { emailIds } = body

    if (!Array.isArray(emailIds) || emailIds.length === 0) {
      return NextResponse.json({ error: "Invalid email IDs" }, { status: 400 })
    }

    const isAdmin = session.user.role === "ADMIN"

    // Check if user has access to this project
    const project = await prisma.project.findFirst({
      where: isAdmin ? { id } : { id, userId: session.user.id },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Delete only emails that belong to this project
    const result = await prisma.emailSubmission.deleteMany({
      where: {
        id: { in: emailIds },
        projectId: id,
      },
    })

    return NextResponse.json({ deletedCount: result.count })
  } catch (error) {
    console.error("Delete emails error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}