import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function seedDatabase() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@signupvault.com' },
    update: {},
    create: {
      email: 'admin@signupvault.com',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  })

  // Create a test user
  const testPassword = await bcrypt.hash('test123', 10)
  await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      id: 'test-user-id',
      email: 'test@example.com',
      password: testPassword,
      role: 'USER',
      isActive: true,
    },
  })

  // Create a test project
  const project = await prisma.project.upsert({
    where: { id: 'test-project-id' },
    update: {},
    create: {
      id: 'test-project-id',
      name: 'Test Project',
      description: 'A test project for testing',
      apiKey: 'test-api-key',
      userId: 'test-user-id', // test user
    },
  })

  // Create test email submissions
  await prisma.emailSubmission.createMany({
    data: [
      {
        email: 'test1@example.com',
        projectId: project.id,
        ip: '127.0.0.1',
        country: 'US',
        userAgent: 'Test Agent',
      },
      {
        email: 'test2@example.com',
        projectId: project.id,
        ip: '127.0.0.2',
        country: 'CA',
        userAgent: 'Test Agent 2',
      },
    ],
    skipDuplicates: true,
  })
}

export async function clearDatabase() {
  await prisma.emailSubmission.deleteMany()
  await prisma.project.deleteMany()
  await prisma.user.deleteMany()
  await prisma.settings.deleteMany()
}

export { prisma }