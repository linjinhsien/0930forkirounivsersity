import { computed, ref, toRaw } from 'vue'
import { defineStore } from 'pinia'
import type { GameState, SavedSession } from '@/types/game'
import {
  SESSION_STORAGE_KEY,
  isValidSavedSession,
  loadFromLocalStorage,
  saveToLocalStorage,
  clearFromLocalStorage,
} from '@/utils/storageAdapter'
import {
  SESSION_TTL_MS,
  calculateExpirationTime,
  cleanupExpiredSessions,
  isSessionExpired,
} from '@/utils/sessionExpiration'

function createSessionId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `session-${Date.now()}`
}

export const useSessionStore = defineStore('session', () => {
  const savedSession = ref<SavedSession | null>(null)

  const hasValidSession = computed(() => {
    const session = savedSession.value
    return Boolean(session && !isSessionExpired(session))
  })

  function saveSession(gameState: GameState, playerId = 'local-player'): SavedSession {
    const now = Date.now()
    const session: SavedSession = {
      id: createSessionId(),
      timestamp: now,
      expiresAt: calculateExpirationTime(now, SESSION_TTL_MS),
      gameState: JSON.parse(JSON.stringify(toRaw(gameState))) as GameState,
      playerId,
    }

    savedSession.value = session
    saveToLocalStorage(SESSION_STORAGE_KEY, session, isValidSavedSession)
    return session
  }

  function loadSession(): SavedSession | null {
    cleanupExpiredSessions()

    try {
      const parsed = loadFromLocalStorage(SESSION_STORAGE_KEY, isValidSavedSession)
      if (!parsed || isSessionExpired(parsed)) {
        savedSession.value = null
        if (parsed) clearFromLocalStorage(SESSION_STORAGE_KEY)
        return null
      }

      savedSession.value = parsed
      return parsed
    } catch {
      savedSession.value = null
      return null
    }
  }

  function clearSession(): void {
    savedSession.value = null
    clearFromLocalStorage(SESSION_STORAGE_KEY)
  }

  return { savedSession, hasValidSession, saveSession, loadSession, clearSession }
})
