import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST, OPTIONS } from '@/app/api/public/collect/[projectId]/route'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
      findUnique: vi.fn(),
    },
    emailSubmission: {
      create: vi.fn(),
    },
  },
}))

describe('/api/public/collect/[projectId]', () => {
  it('should handle OPTIONS request', async () => {
    const req = new NextRequest('http://localhost:3000/api/public/collect/test-project-id', {
      method: 'OPTIONS',
    })

    const res = await OPTIONS()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
  })

  it('should accept valid email submission', async () => {
    // Mock successful project lookup
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.project.findUnique).mockResolvedValue({
      id: 'test-project-id',
      apiKey: 'test-api-key',
      name: 'Test Project',
      description: 'Test',
      userId: 'user-id',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any)
    vi.mocked(prisma.emailSubmission.create).mockResolvedValue({
      id: 'email-id',
      email: 'new@example.com',
      projectId: 'test-project-id',
      ip: '127.0.0.1',
      country: 'US',
      userAgent: 'Test',
      timestamp: new Date(),
    } as any)

    const req = new NextRequest('http://localhost:3000/api/public/collect/test-project-id', {
      method: 'POST',
      headers: {
        'x-api-key': 'test-api-key',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ email: 'new@example.com' }),
    })

    const res = await POST(req, { params: Promise.resolve({ projectId: 'test-project-id' }) })
    expect(res.status).toBe(201)

    const data = await res.json()
    expect(data.success).toBe(true)
  })

  it('should reject missing API key', async () => {
    const req = new NextRequest('http://localhost:3000/api/public/collect/test-project-id', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ email: 'new@example.com' }),
    })

    const res = await POST(req, { params: Promise.resolve({ projectId: 'test-project-id' }) })
    expect(res.status).toBe(401)

    const data = await res.json()
    expect(data.error).toBe('Missing API key')
  })

  it('should reject invalid API key', async () => {
    // Mock project not found
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.project.findUnique).mockResolvedValue(null)

    const req = new NextRequest('http://localhost:3000/api/public/collect/test-project-id', {
      method: 'POST',
      headers: {
        'x-api-key': 'invalid-key',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ email: 'new@example.com' }),
    })

    const res = await POST(req, { params: Promise.resolve({ projectId: 'test-project-id' }) })
    expect(res.status).toBe(401)
  })

  it('should reject invalid email', async () => {
    // Mock successful project lookup
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.project.findUnique).mockResolvedValue({
      id: 'test-project-id',
      apiKey: 'test-api-key',
      name: 'Test Project',
      description: 'Test',
      userId: 'user-id',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any)

    const req = new NextRequest('http://localhost:3000/api/public/collect/test-project-id', {
      method: 'POST',
      headers: {
        'x-api-key': 'test-api-key',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ email: 'invalid-email' }),
    })

    const res = await POST(req, { params: Promise.resolve({ projectId: 'test-project-id' }) })
    expect(res.status).toBe(400)
  })

  it('should handle internal server error', async () => {
    // Mock project lookup to throw error
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.project.findUnique).mockRejectedValue(new Error('DB error'))

    const req = new NextRequest('http://localhost:3000/api/public/collect/test-project-id', {
      method: 'POST',
      headers: {
        'x-api-key': 'test-api-key',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@example.com' }),
    })

    const res = await POST(req, { params: Promise.resolve({ projectId: 'test-project-id' }) })
    expect(res.status).toBe(400)

    const data = await res.json()
    expect(data.error).toBe('Invalid request')
  })
})