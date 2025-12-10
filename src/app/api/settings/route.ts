import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateSettingsSchema = z.object({
  allowUserRegistration: z.boolean(),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const settings = await prisma.settings.findUnique({
      where: { id: "settings" },
    })

    return NextResponse.json({
      allowUserRegistration: settings?.allowUserRegistration ?? false,
    })
  } catch (error) {
    console.error("Get settings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const { allowUserRegistration } = updateSettingsSchema.parse(body)

    await prisma.settings.upsert({
      where: { id: "settings" },
      update: { allowUserRegistration },
      create: { id: "settings", allowUserRegistration },
    })

    return NextResponse.json({ allowUserRegistration })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.issues }, { status: 400 })
    }
    console.error("Update settings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}