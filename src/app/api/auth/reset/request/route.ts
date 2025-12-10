import crypto from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { normalizeEmail } from "@/lib/auth-helpers";
import { sendResetEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const requestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: Request) {
  try {
    const { email } = requestSchema.parse(await req.json());
    const normalizedEmail = normalizeEmail(email);
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      // Always return success to prevent user enumeration
      return NextResponse.json({ success: true });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    await sendResetEmail(user.email, resetToken);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 422 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
