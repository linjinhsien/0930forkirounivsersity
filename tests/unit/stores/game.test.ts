import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useGameStore } from '@/stores/game'
import { allMockCards } from '../../fixtures/cards'
import { mockStartupScenario } from '../../fixtures/scenarios'

vi.mock('@/utils/dataLoader', () => ({
  loadAllCards: vi.fn(async () => allMockCards),
  loadAllScenarios: vi.fn(async () => [mockStartupScenario]),
}))

describe('game store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('initializes game state with scenario, hand, slots, and timer', async () => {
    const store = useGameStore()
    const state = await store.initializeGame('fixture-startup', 'quick-match')

    expect(state.currentScenario.id).toBe('fixture-startup')
    expect(state.hand).toHaveLength(8)
    expect(state.slots).toHaveLength(6)
    expect(state.timeRemaining).toBe(45)
    expect(store.isGameActive).toBe(true)
  })

  it('places a card into an empty slot and removes it from the hand', async () => {
    const store = useGameStore()
    await store.initializeGame('fixture-startup')

    const card = store.gameState!.hand[0]
    const result = store.placeCard(card.id, 'compute-1')

    expect(result).toBe(true)
    expect(store.gameState!.slots.find((slot) => slot.id === 'compute-1')?.card?.id).toBe(card.id)
    expect(store.gameState!.hand.some((item) => item.id === card.id)).toBe(false)
    expect(store.gameState!.round).toBe(2)
  })

  it('rejects placement into an occupied slot or with an unknown card', async () => {
    const store = useGameStore()
    await store.initializeGame('fixture-startup')

    const card = store.gameState!.hand[0]
    expect(store.placeCard(card.id, 'compute-1')).toBe(true)
    expect(store.placeCard(store.gameState!.hand[0].id, 'compute-1')).toBe(false)
    expect(store.placeCard('missing-card', 'storage-1')).toBe(false)
  })

  it('removes a placed card back to the hand', async () => {
    const store = useGameStore()
    await store.initializeGame('fixture-startup')

    const card = store.gameState!.hand[0]
    store.placeCard(card.id, 'compute-1')

    expect(store.removeCard('compute-1')?.id).toBe(card.id)
    expect(store.gameState!.slots[0].card).toBeNull()
    expect(store.gameState!.hand.some((item) => item.id === card.id)).toBe(true)
  })

  it('updates score and transitions to complete on submission', async () => {
    const store = useGameStore()
    await store.initializeGame('fixture-startup')

    const score = {
      highAvailability: 20,
      costEffectiveness: 30,
      securityCompliance: 40,
      total: 90,
      breakdown: {
        requirementsMet: 1,
        totalRequirements: 2,
        costUtilization: 50,
        synergyBonuses: ['compute'],
        penalties: [],
      },
    }

    store.updateScore(score)
    expect(store.currentScore.total).toBe(90)

    expect(store.submitSolution()?.status).toBe('complete')
    expect(store.isGameActive).toBe(false)
  })
})
