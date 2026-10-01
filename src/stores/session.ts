import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { GameState, SavedSession } from '@/types/game'
import { calculateExpirationTime, isSessionExpired } from '@/utils/sessionExpiration'

const STORAGE_KEY = 'az900-saved-session'

function isBrowser(): boolean {
  return typeof localStorage !== 'undefined'
}

function createSessionId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `session-${Date.now()}`
}

export const useSessionStore = defineStore('session', () => {
  const savedSession = ref<SavedSession | null>(null)

  const hasValidSession = computed(() => {
    const session = savedSession.value
    return Boolean(session && session.expiresAt > Date.now())
  })

  function saveSession(gameState: GameState, playerId = 'local-player'): SavedSession {
    const now = Date.now()
    const session: SavedSession = {
      id: createSessionId(),
      timestamp: now,
      expiresAt: calculateExpirationTime(now),
      gameState: structuredClone(gameState),
      playerId,
    }

    savedSession.value = session
    if (isBrowser()) localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    return session
  }

  function loadSession(): SavedSession | null {
    if (!isBrowser()) return savedSession.value

    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      savedSession.value = null
      return null
    }

    try {
      const parsed = JSON.parse(raw) as SavedSession
      if (
        !parsed ||
        typeof parsed.id !== 'string' ||
        typeof parsed.playerId !== 'string' ||
        typeof parsed.timestamp !== 'number' ||
        typeof parsed.expiresAt !== 'number' ||
        isSessionExpired(parsed) ||
        !parsed.gameState ||
        typeof parsed.gameState !== 'object'
      ) {
        clearSession()
        return null
      }
      savedSession.value = parsed
      return parsed
    } catch {
      clearSession()
      return null
    }
  }

  function clearSession(): void {
    savedSession.value = null
    if (isBrowser()) localStorage.removeItem(STORAGE_KEY)
  }

  return { savedSession, hasValidSession, saveSession, loadSession, clearSession }
})
