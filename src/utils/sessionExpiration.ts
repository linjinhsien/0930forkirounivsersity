import type { SavedSession } from '@/types/game'

export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Calculates the expiration timestamp for a saved session.
 * The default lifetime is seven days.
 */
export function calculateExpirationTime(
  savedAt: number = Date.now(),
  ttlMs: number = SESSION_TTL_MS
): number {
  if (!Number.isFinite(savedAt) || !Number.isFinite(ttlMs) || ttlMs < 0) {
    throw new Error('savedAt and ttlMs must be finite numbers, and ttlMs must be non-negative')
  }

  return savedAt + ttlMs
}

/**
 * Returns true when a session has expired at the supplied point in time.
 */
export function isSessionExpired(
  session: Pick<SavedSession, 'expiresAt'> | number,
  now: number = Date.now()
): boolean {
  const expiresAt = typeof session === 'number' ? session : session.expiresAt

  if (!Number.isFinite(expiresAt) || !Number.isFinite(now)) {
    return true
  }

  return now >= expiresAt
}

/**
 * Removes an expired session from storage when a storage adapter is supplied.
 * The function is intentionally side-effect free when no storage is supplied.
 */
export function cleanupExpiredSessions(
  session: SavedSession | null | undefined,
  remove: () => void = () => undefined,
  now: number = Date.now()
): boolean {
  if (!session || !isSessionExpired(session, now)) return false

  remove()
  return true
}
