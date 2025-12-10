import { Resend } from "resend"

export async function sendResetEmail(to: string, token: string) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM || "no-reply@signupvault.com"

  if (!apiKey) {
    console.warn("RESEND_API_KEY is not configured; skipping reset email send")
    return
  }

  const resend = new Resend(apiKey)
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const resetUrl = `${baseUrl}/login/reset/${token}`

  try {
    await resend.emails.send({
      from,
      to,
      subject: "Reset your SignupVault password",
      text: `You requested a password reset. Click the link below to set a new password. This link expires in 1 hour.\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
      html: `<p>You requested a password reset. Click the link below to set a new password. This link expires in 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, you can ignore this email.</p>`
    })
  } catch (error) {
    console.error("Failed to send reset email", error)
  }
}
