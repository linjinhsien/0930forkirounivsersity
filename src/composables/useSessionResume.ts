import { onMounted, ref } from 'vue'
import { useGameStore } from '@/stores/game'
import { useSessionStore } from '@/stores/session'
import type { GameState, SavedSession } from '@/types/game'

export interface SessionResumeState {
  session: SavedSession | null
  available: boolean
  expired: boolean
  corrupted: boolean
  restored: boolean
  error: string | null
}

export function useSessionResume() {
  const gameStore = useGameStore()
  const sessionStore = useSessionStore()
  const state = ref<SessionResumeState>({
    session: null,
    available: false,
    expired: false,
    corrupted: false,
    restored: false,
    error: null,
  })

  function checkForSavedSession(): SavedSession | null {
    try {
      const session = sessionStore.loadSession()
      state.value = {
        session,
        available: Boolean(session),
        expired: false,
        corrupted: false,
        restored: false,
        error: null,
      }
      return session
    } catch (error) {
      state.value.error = error instanceof Error ? error.message : 'Unable to read saved session.'
      state.value.corrupted = true
      return null
    }
  }

  async function resumeSession(session = state.value.session): Promise<GameState | null> {
    if (!session) {
      state.value.error = 'No saved session is available.'
      return null
    }

    try {
      if (session.expiresAt <= Date.now()) {
        sessionStore.clearSession()
        state.value = {
          ...state.value,
          session: null,
          available: false,
          expired: true,
          restored: false,
          error: 'This saved session has expired. Start a new game to continue.',
        }
        return null
      }

      if (session.gameState.status !== 'playing' || session.gameState.mode !== 'quick-match') {
        throw new Error('The saved session is not resumable.')
      }

      gameStore.restoreGame(session.gameState)
      state.value = {
        ...state.value,
        restored: true,
        error: null,
      }
      return gameStore.gameState
    } catch (error) {
      state.value = {
        ...state.value,
        corrupted: true,
        restored: false,
        error: error instanceof Error ? error.message : 'Unable to restore the saved session.',
      }
      return null
    }
  }

  function discardSession(): void {
    sessionStore.clearSession()
    state.value = {
      session: null,
      available: false,
      expired: false,
      corrupted: false,
      restored: false,
      error: null,
    }
  }

  onMounted(() => {
    checkForSavedSession()
  })

  return {
    state,
    checkForSavedSession,
    resumeSession,
    discardSession,
  }
}
