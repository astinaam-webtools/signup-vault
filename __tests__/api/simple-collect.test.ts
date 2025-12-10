import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/collect/route'

describe('/api/collect', () => {
  it('should accept valid email', async () => {
    const req = new NextRequest('http://localhost:3000/api/collect', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@example.com' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.success).toBe(true)
  })

  it('should reject invalid email', async () => {
    const req = new NextRequest('http://localhost:3000/api/collect', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ email: 'invalid-email' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)

    const data = await res.json()
    expect(data.error).toBe('Invalid email')
  })

  it('should reject missing email', async () => {
    const req = new NextRequest('http://localhost:3000/api/collect', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)

    const data = await res.json()
    expect(data.error).toBe('Invalid email')
  })

  it('should handle invalid JSON', async () => {
    const req = new NextRequest('http://localhost:3000/api/collect', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: 'invalid json',
    })

    const res = await POST(req)
    expect(res.status).toBe(400)

    const data = await res.json()
    expect(data.error).toBe('Invalid request')
  })
})