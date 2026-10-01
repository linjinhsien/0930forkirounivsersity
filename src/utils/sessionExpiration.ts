import type { SavedSession } from '@/types/game'

export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000
export const SESSION_STORAGE_KEY = 'az900-saved-session'

export function calculateExpirationTime(timestamp: number, ttlMs = SESSION_TTL_MS): number {
  if (!Number.isFinite(timestamp) || timestamp < 0) {
    throw new RangeError('Session timestamp must be a non-negative finite number.')
  }
  if (!Number.isFinite(ttlMs) || ttlMs < 0) {
    throw new RangeError('Session TTL must be a non-negative finite number.')
  }
  return timestamp + ttlMs
}

export function isSessionExpired(
  session: Pick<SavedSession, 'expiresAt'>,
  now = Date.now()
): boolean {
  return !Number.isFinite(session.expiresAt) || session.expiresAt <= now
}

export function cleanupExpiredSessions(
  storage: Storage | null =
    typeof localStorage === 'undefined' ? null : localStorage,
  key = SESSION_STORAGE_KEY,
  now = Date.now()
): boolean {
  if (!storage) return false

  const raw = storage.getItem(key)
  if (!raw) return false

  try {
    const session = JSON.parse(raw) as Partial<SavedSession>
    if (typeof session.expiresAt === 'number' && isSessionExpired(session, now)) {
      storage.removeItem(key)
      return true
    }
  } catch {
    storage.removeItem(key)
    return true
  }

  return false
}
