import { describe, expect, it, vi } from 'vitest'
import {
  SESSION_TTL_MS,
  calculateExpirationTime,
  cleanupExpiredSessions,
  isSessionExpired,
} from '@/utils/sessionExpiration'
import { mockGameState } from '../../fixtures/gameState'
import type { SavedSession } from '@/types/game'

describe('sessionExpiration', () => {
  it('calculates a seven-day expiration by default', () => {
    const savedAt = 1_700_000_000_000
    expect(calculateExpirationTime(savedAt)).toBe(savedAt + SESSION_TTL_MS)
  })

  it('supports a custom TTL', () => {
    expect(calculateExpirationTime(1000, 5000)).toBe(6000)
  })

  it.each([
    { now: 1000, expiresAt: 2000, expired: false },
    { now: 1999, expiresAt: 2000, expired: false },
    { now: 2000, expiresAt: 2000, expired: true },
    { now: 2001, expiresAt: 2000, expired: true },
  ])('checks the expiration boundary correctly', ({ now, expiresAt, expired }) => {
    expect(isSessionExpired(expiresAt, now)).toBe(expired)
  })

  it('accepts a SavedSession object', () => {
    const session = {
      id: 'session-1',
      timestamp: 1000,
      expiresAt: 2000,
      gameState: mockGameState,
      playerId: 'player-1',
    } satisfies SavedSession

    expect(isSessionExpired(session, 1500)).toBe(false)
    expect(isSessionExpired(session, 2000)).toBe(true)
  })

  it('treats non-finite timestamps as expired', () => {
    expect(isSessionExpired(Number.NaN, 1000)).toBe(true)
    expect(isSessionExpired(Infinity, 1000)).toBe(true)
  })

  it('rejects invalid expiration inputs', () => {
    expect(() => calculateExpirationTime(Number.NaN)).toThrow()
    expect(() => calculateExpirationTime(1000, -1)).toThrow()
  })

  it('cleans up an expired session exactly once', () => {
    const remove = vi.fn()
    const session = {
      id: 'session-1',
      timestamp: 1000,
      expiresAt: 2000,
      gameState: mockGameState,
      playerId: 'player-1',
    } satisfies SavedSession

    expect(cleanupExpiredSessions(session, remove, 2000)).toBe(true)
    expect(remove).toHaveBeenCalledTimes(1)
  })

  it('does not clean up an active or missing session', () => {
    const remove = vi.fn()
    expect(cleanupExpiredSessions(null, remove, 2000)).toBe(false)
    expect(cleanupExpiredSessions(undefined, remove, 2000)).toBe(false)
    expect(
      cleanupExpiredSessions(
        {
          id: 'session-1',
          timestamp: 1000,
          expiresAt: 3000,
          gameState: mockGameState,
          playerId: 'player-1',
        },
        remove,
        2000,
      ),
    ).toBe(false)
    expect(remove).not.toHaveBeenCalled()
  })
})
