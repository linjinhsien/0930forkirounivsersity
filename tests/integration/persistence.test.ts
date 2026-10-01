import { beforeEach, describe, expect, it } from 'vitest'
import { useSessionStore } from '@/stores/session'
import { createPinia, setActivePinia } from 'pinia'
import type { GameState } from '@/types/game'
import {
  calculateExpirationTime,
  isSessionExpired,
} from '@/utils/sessionExpiration'
import {
  SESSION_STORAGE_KEY,
  loadFromLocalStorage,
  saveToLocalStorage,
} from '@/utils/storageAdapter'

function createGameState(): GameState {
  return {
    currentScenario: {
      id: 'test-scenario',
      title: 'Persistence Test',
      description: 'Test scenario',
      requirements: [],
      constraints: { maxCost: 20 },
      maxRounds: 5,
      difficulty: 'beginner',
      category: 'startup-scaling',
    },
    deck: [],
    hand: [],
    slots: [],
    round: 1,
    score: {
      highAvailability: 10,
      costEffectiveness: 20,
      securityCompliance: 30,
      total: 60,
      breakdown: {
        requirementsMet: 0,
        totalRequirements: 0,
        costUtilization: 0,
        synergyBonuses: [],
        penalties: [],
      },
    },
    mode: 'quick-match',
    timeRemaining: 45,
    status: 'playing',
  }
}

describe('Phase 9 persistence', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('saves and restores a session roundtrip', () => {
    const store = useSessionStore()
    const saved = store.saveSession(createGameState(), 'player-1')

    expect(saved.playerId).toBe('player-1')
    expect(saved.gameState.timeRemaining).toBe(45)

    const restored = store.loadSession()
    expect(restored?.id).toBe(saved.id)
    expect(restored?.gameState.score.total).toBe(60)
    expect(store.hasValidSession).toBe(true)
  })

  it('calculates the seven-day expiration boundary deterministically', () => {
    const timestamp = Date.UTC(2026, 0, 1)
    const expiresAt = calculateExpirationTime(timestamp)
    expect(expiresAt - timestamp).toBe(7 * 24 * 60 * 60 * 1000)
    expect(isSessionExpired({ expiresAt }, expiresAt - 1)).toBe(false)
    expect(isSessionExpired({ expiresAt }, expiresAt)).toBe(true)
  })

  it('removes corrupted JSON and reports it as invalid storage', () => {
    localStorage.setItem(SESSION_STORAGE_KEY, '{invalid-json')

    expect(() =>
      loadFromLocalStorage(SESSION_STORAGE_KEY, (value): value is object => Boolean(value))
    ).toThrowError(/not valid JSON/i)
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
  })

  it('rejects invalid structured session data', () => {
    expect(() =>
      saveToLocalStorage(SESSION_STORAGE_KEY, { expiresAt: 123 }, () => false)
    ).toThrowError(/failed validation/i)
  })

  it('reports LocalStorage quota errors', () => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = () => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError')
    }

    try {
      expect(() =>
        saveToLocalStorage(SESSION_STORAGE_KEY, { ok: true })
      ).toThrowError(/quota exceeded/i)
    } finally {
      Storage.prototype.setItem = original
    }
  })
})
