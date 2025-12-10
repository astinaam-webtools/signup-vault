import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeEmail } from '@/lib/auth-helpers'
import { z } from 'zod'
import crypto from 'crypto'
import { sendResetEmail } from '@/lib/email'

const requestSchema = z.object({
  email: z.string().email()
})

export async function POST(req: Request) {
  try {
    const { email } = requestSchema.parse(await req.json())
    const normalizedEmail = normalizeEmail(email)
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (!user) {
      // Always return success to prevent user enumeration
      return NextResponse.json({ success: true })
    }
    // Generate token and expiry (1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000)
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry }
    })
    await sendResetEmail(user.email, resetToken)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
