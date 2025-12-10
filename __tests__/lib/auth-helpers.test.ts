import { describe, expect, it } from 'vitest'
import { normalizeEmail } from '@/lib/auth-helpers'

describe('normalizeEmail', () => {
  it('trims whitespace and lowercases email', () => {
    expect(normalizeEmail('  User@Example.COM  ')).toBe('user@example.com')
  })

  it('handles already normalized email', () => {
    expect(normalizeEmail('user@example.com')).toBe('user@example.com')
  })
})
