import { NextResponse } from "next/server"

function isValidEmail(email: unknown) {
  return typeof email === "string" && /^\S+@\S+\.\S+$/.test(email)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = body?.email

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 })
    }

    // Temporary action: log the email. Later we'll store this in the DB.
    // Keep this endpoint minimal so the landing form works now.
    // (If you want to persist submissions, we'll attach this to Project and Prisma.)
    console.log("Landing signup received:", email)

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
