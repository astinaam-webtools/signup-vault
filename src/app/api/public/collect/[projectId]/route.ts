import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 30 // max submissions per IP per window

// Simple in-memory rate limiter keyed by `${projectId}:${ip}`.
// Note: this is an ephemeral in-memory store and will not persist across serverless invocations.
const rateLimiter = new Map<string, number[]>()

function isValidEmail(email: unknown) {
  return typeof email === "string" && /^\S+@\S+\.\S+$/.test(email)
}

function getClientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  const realIp = req.headers.get("x-real-ip")
  if (realIp) return realIp
  return "unknown"
}

function getCountryFromHeaders(req: Request) {
  return (
    req.headers.get("cf-ipcountry") ||
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("x-country") ||
    undefined
  )
}

function getUserAgent(req: Request) {
  return req.headers.get("user-agent") || undefined
}

function tooManyRequests(key: string) {
  const now = Date.now()
  const arr = rateLimiter.get(key) ?? []
  const windowStart = now - RATE_LIMIT_WINDOW_MS
  const filtered = arr.filter((t) => t > windowStart)
  filtered.push(now)
  rateLimiter.set(key, filtered)
  return filtered.length > RATE_LIMIT_MAX
}

export async function OPTIONS() {
  return NextResponse.json(
    { success: true },
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-API-KEY",
      },
    }
  )
}

export async function POST(
  req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const params = await context.params
    const { projectId } = params

    const body = await req.json()
    const email = body?.email

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email" },
        { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
      )
    }

    const apiKeyHeader = req.headers.get("x-api-key") || undefined
    if (!apiKeyHeader) {
      return NextResponse.json(
        { error: "Missing API key" },
        { status: 401, headers: { "Access-Control-Allow-Origin": "*" } }
      )
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project || project.apiKey !== apiKeyHeader) {
      return NextResponse.json(
        { error: "Invalid project or API key" },
        { status: 401, headers: { "Access-Control-Allow-Origin": "*" } }
      )
    }

    const ip = getClientIp(req)
    const country = getCountryFromHeaders(req)
    const userAgent = getUserAgent(req)

    const rlKey = `${projectId}:${ip}`
    if (tooManyRequests(rlKey)) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429, headers: { "Access-Control-Allow-Origin": "*" } }
      )
    }

    // store submission
    await prisma.emailSubmission.create({
      data: {
        email,
        ip: ip === "unknown" ? null : ip,
        country: country ?? null,
        userAgent: userAgent ?? null,
        projectId,
      },
    })

    return NextResponse.json(
      { success: true },
      { status: 201, headers: { "Access-Control-Allow-Origin": "*" } }
    )
  } catch (err) {
    console.error("Public collect error:", err)
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
    )
  }
}
