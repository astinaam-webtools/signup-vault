import { NextResponse } from "next/server"
import { Parser } from "json2csv"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { emails } = body

    if (!Array.isArray(emails)) {
      return NextResponse.json({ error: "Invalid emails data" }, { status: 400 })
    }

    // Transform data for CSV
    const csvData = emails.map(email => ({
      Email: email.email,
      Country: email.country || "",
      "IP Address": email.ip || "",
      "User Agent": email.userAgent || "",
      "Submission Date": email.timestamp,
    }))

    const fields = ["Email", "Country", "IP Address", "User Agent", "Submission Date"]
    const opts = { fields }

    const parser = new Parser(opts)
    const csv = parser.parse(csvData)

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=emails.csv",
      },
    })
  } catch (error) {
    console.error("CSV export error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}