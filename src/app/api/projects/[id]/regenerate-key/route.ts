import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const isAdmin = session.user.role === "ADMIN"

    const project = await prisma.project.updateMany({
      where: isAdmin ? { id } : { id, userId: session.user.id },
      data: {
        apiKey: crypto.randomUUID(),
      },
    })

    if (project.count === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Get the updated project to return the new key
    const updatedProject = await prisma.project.findUnique({
      where: { id },
      select: { apiKey: true },
    })

    return NextResponse.json({ apiKey: updatedProject?.apiKey })
  } catch (error) {
    console.error("Regenerate API key error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}