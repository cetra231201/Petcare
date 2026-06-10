import { describe, expect, it } from 'vitest'
import { assertRole, getTokenUserId, normalizeRole } from '@/lib/api-auth'

describe('api-auth helpers', () => {
  it('normalizes valid roles and rejects invalid roles', () => {
    expect(normalizeRole('ADMIN')).toBe('ADMIN')
    expect(normalizeRole('CLIENT')).toBe('CLIENT')
    expect(normalizeRole('invalid')).toBeUndefined()
    expect(normalizeRole(undefined)).toBeUndefined()
  })

  it('assertRole returns true when token has allowed role', () => {
    const token = { id: '1', role: 'STAFF' as const }
    expect(assertRole(token, ['ADMIN', 'STAFF'])).toBe(true)
    expect(assertRole(token, ['ADMIN'])).toBe(false)
  })

  it('getTokenUserId falls back to sub when id is missing', () => {
    expect(getTokenUserId({ id: '123' })).toBe('123')
    expect(getTokenUserId({ sub: '456' })).toBe('456')
    expect(getTokenUserId(null)).toBe('')
  })
})
