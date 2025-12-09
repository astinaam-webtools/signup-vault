import "dotenv/config"
import { prisma } from "../src/lib/prisma"
import bcrypt from "bcryptjs"

async function seedAdmin() {
  const adminEmail = "admin@signupvault.com"
  const adminPassword = "admin123" // Change this to a secure password

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (existingAdmin) {
    console.log("Admin user already exists")
    return
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12)

  await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN"
    }
  })

  console.log("Admin user created successfully")
  console.log(`Email: ${adminEmail}`)
  console.log(`Password: ${adminPassword}`)
}

seedAdmin()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })