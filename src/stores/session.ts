import { computed, ref, toRaw } from 'vue'
import { defineStore } from 'pinia'
import type { GameState, SavedSession } from '@/types/game'

const STORAGE_KEY = 'az900-saved-session'
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

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
      expiresAt: now + SESSION_TTL_MS,
      gameState: JSON.parse(JSON.stringify(toRaw(gameState))) as GameState,
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
        parsed.expiresAt <= Date.now() ||
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
