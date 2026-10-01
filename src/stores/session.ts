/**
 * Session Store (Pinia) — Task 16
 *
 * Provides save / load / clear functionality backed by localStorage.
 * Sessions expire after 7 days; expired sessions are automatically cleared.
 *
 * Requirements: 7.1, 7.2, 7.3
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SavedSession, GameState } from '@/types/game'

// ─── Constants ───────────────────────────────────────────────────────────────

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
const STORAGE_KEY = 'az900-card-clash-session'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Check if a session's expiration timestamp has passed.
 */
function isExpired(session: SavedSession): boolean {
  return Date.now() > session.expiresAt
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useSessionStore = defineStore('session', () => {
  // ── State ────────────────────────────────────────────────────────────────
  const savedSession = ref<SavedSession | null>(null)

  // ── Computed ─────────────────────────────────────────────────────────────

  /** Time remaining until session expiry in milliseconds (0 if no session or expired) */
  const timeUntilExpiry = computed<number>(() => {
    if (!savedSession.value) return 0
    const remaining = savedSession.value.expiresAt - Date.now()
    return Math.max(0, remaining)
  })

  /** Human-readable days remaining label */
  const daysUntilExpiry = computed<number>(() => {
    return Math.floor(timeUntilExpiry.value / (24 * 60 * 60 * 1000))
  })

  /** Whether there is a non-expired session available */
  const hasSavedSession = computed<boolean>(
    () => savedSession.value !== null && !isExpired(savedSession.value)
  )

  // ── Actions ──────────────────────────────────────────────────────────────

  /**
   * Persist the current game state to localStorage.
   *
   * @param gameState  The active GameState to save
   * @param playerId   ID of the player who owns the session
   * @returns true if save succeeded, false on error (e.g. storage quota exceeded)
   */
  function saveSession(gameState: GameState, playerId: string): boolean {
    try {
      const now = Date.now()
      const session: SavedSession = {
        id: `session-${now}-${playerId}`,
        timestamp: now,
        expiresAt: now + SEVEN_DAYS_MS,
        gameState,
        playerId,
      }

      const serialised = JSON.stringify(session)
      localStorage.setItem(STORAGE_KEY, serialised)
      savedSession.value = session

      return true
    } catch (error) {
      // Possible causes: QuotaExceededError, JSON serialisation failure
      console.error('[SessionStore] saveSession failed:', error)
      return false
    }
  }

  /**
   * Load a session from localStorage.
   * If the session is missing or expired it is cleared automatically.
   *
   * @returns The SavedSession or null
   */
  function loadSession(): SavedSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null

      const session = JSON.parse(raw) as SavedSession

      if (isExpired(session)) {
        clearSession()
        return null
      }

      savedSession.value = session
      return session
    } catch (error) {
      console.error('[SessionStore] loadSession failed:', error)
      clearSession()
      return null
    }
  }

  /**
   * Remove the session from localStorage and reset the store state.
   */
  function clearSession(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Ignore removal errors (e.g. private browsing restrictions)
    }
    savedSession.value = null
  }

  /**
   * Checks whether a non-expired session exists in localStorage.
   * Loads it into the store as a side effect if found.
   *
   * @returns true if a valid session was found
   */
  function hasValidSession(): boolean {
    const session = loadSession()
    return session !== null
  }

  /**
   * Extend the current session's expiry by another 7 days.
   * Useful on user activity to keep the session alive.
   *
   * @returns true if the session was successfully extended
   */
  function extendSession(): boolean {
    if (!savedSession.value) return false
    const extended: SavedSession = {
      ...savedSession.value,
      expiresAt: Date.now() + SEVEN_DAYS_MS,
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(extended))
      savedSession.value = extended
      return true
    } catch (error) {
      console.error('[SessionStore] extendSession failed:', error)
      return false
    }
  }

  /**
   * Update only the gameState within an existing session (avoids a full re-save).
   */
  function updateSessionGameState(gameState: GameState): boolean {
    if (!savedSession.value) return false
    return saveSession(gameState, savedSession.value.playerId)
  }

  return {
    // State
    savedSession,
    // Computed
    timeUntilExpiry,
    daysUntilExpiry,
    hasSavedSession,
    // Actions
    saveSession,
    loadSession,
    clearSession,
    hasValidSession,
    extendSession,
    updateSessionGameState,
  }
})
