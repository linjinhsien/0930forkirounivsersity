import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useSessionStore } from '@/stores/session'
import { createMockGameState } from '@/fixtures/gameState'

describe('session store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('saves and loads a session roundtrip', () => {
    const store = useSessionStore()
    const gameState = createMockGameState()

    const saved = store.saveSession(gameState, 'player-1')
    expect(saved.playerId).toBe('player-1')
    expect(store.hasValidSession).toBe(true)

    const secondPinia = createPinia()
    setActivePinia(secondPinia)
    const restored = useSessionStore().loadSession()

    expect(restored?.id).toBe(saved.id)
    expect(restored?.playerId).toBe('player-1')
    expect(restored?.gameState).toEqual(gameState)
  })

  it('rejects an expired persisted session', () => {
    const store = useSessionStore()
    store.saveSession(createMockGameState(), 'player-1')

    const raw = JSON.parse(localStorage.getItem('az900-saved-session') ?? '{}')
    raw.expiresAt = Date.now() - 1
    localStorage.setItem('az900-saved-session', JSON.stringify(raw))

    expect(store.loadSession()).toBeNull()
    expect(localStorage.getItem('az900-saved-session')).toBeNull()
    expect(store.hasValidSession).toBe(false)
  })

  it('clears corrupted persisted JSON', () => {
    const store = useSessionStore()
    localStorage.setItem('az900-saved-session', '{not-json')

    expect(store.loadSession()).toBeNull()
    expect(localStorage.getItem('az900-saved-session')).toBeNull()
  })

  it('clears sessions explicitly', () => {
    const store = useSessionStore()
    store.saveSession(createMockGameState())

    store.clearSession()

    expect(store.savedSession).toBeNull()
    expect(localStorage.getItem('az900-saved-session')).toBeNull()
  })
})
