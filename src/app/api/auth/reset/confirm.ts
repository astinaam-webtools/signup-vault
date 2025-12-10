import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const confirmSchema = z.object({
  token: z.string(),
  password: z.string().min(6)
})

export async function POST(req: Request) {
  try {
    const { token, password } = confirmSchema.parse(await req.json())
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gte: new Date() }
      }
    })
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }
    const hashed = await bcrypt.hash(password, 10)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExpiry: null
      }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
