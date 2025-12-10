import { vi } from 'vitest'
import { Session } from 'next-auth'

// Mock next-auth
export const mockSession = (session: Partial<Session> = {}): Session => ({
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'USER',
    ...session.user,
  },
  expires: '2025-12-31T00:00:00.000Z',
  ...session,
})

export const mockAuth = () => {
  vi.mock('next-auth', () => ({
    getServerSession: vi.fn().mockResolvedValue(mockSession()),
    default: vi.fn(),
  }))
}

export const mockNoAuth = () => {
  vi.mock('next-auth', () => ({
    getServerSession: vi.fn().mockResolvedValue(null),
    default: vi.fn(),
  }))
}