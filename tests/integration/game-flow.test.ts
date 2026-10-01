import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { ScoringEngine } from '@/engine/scoring'
import { ValidationEngine } from '@/engine/validator'
import { useGameStore } from '@/stores/game'
import { usePlayerStore } from '@/stores/player'
import { useSessionStore } from '@/stores/session'
import { loadAllScenarios } from '@/utils/dataLoader'

describe('quick-match game flow integration', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('plays through three scenarios and calculates each score', async () => {
    const gameStore = useGameStore()
    const scoringEngine = new ScoringEngine()
    const scenarios = (await loadAllScenarios())
      .filter((scenario) => scenario.difficulty === 'beginner')
      .slice(0, 3)

    expect(scenarios).toHaveLength(3)

    const totals: number[] = []
    for (const scenario of scenarios) {
      const game = await gameStore.initializeGame(scenario.id)
      expect(game.status).toBe('playing')
      expect(game.currentScenario.id).toBe(scenario.id)

      const card = game.hand[0]
      expect(gameStore.placeCard(card.id, 'any-1')).toBe(true)
      const score = scoringEngine.calculateScore(gameStore.placedCards, scenario)
      gameStore.updateScore(score)
      gameStore.submitSolution()

      expect(gameStore.gameState?.status).toBe('complete')
      expect(gameStore.currentScore.total).toBeGreaterThanOrEqual(0)
      expect(gameStore.currentScore.total).toBeLessThanOrEqual(300)
      totals.push(gameStore.currentScore.total)
    }

    expect(totals).toHaveLength(3)
  })

  it('validates a placed card and scores the resulting architecture', async () => {
    const gameStore = useGameStore()
    const scenario = (await loadAllScenarios()).find(
      (candidate) => candidate.difficulty === 'beginner'
    )
    expect(scenario).toBeDefined()
    const game = await gameStore.initializeGame(scenario!.id)
    const card = game.hand[0]
    const slot = game.slots.find((candidate) => candidate.id === 'any-1')
    expect(slot).toBeDefined()

    const validation = new ValidationEngine(game.deck).validatePlacement(
      card,
      slot!,
      game.slots,
      scenario!
    )
    expect(validation).toEqual(
      expect.objectContaining({
        isValid: expect.any(Boolean),
        timestamp: expect.any(Number),
        violations: expect.any(Array),
      })
    )

    expect(gameStore.placeCard(card.id, slot!.id)).toBe(true)
    const score = new ScoringEngine().calculateScore(gameStore.placedCards, scenario!)
    gameStore.updateScore(score)
    expect(gameStore.currentScore.total).toBe(score.total)
  })

  it('adjusts difficulty after three consecutive wins and losses', () => {
    const playerStore = usePlayerStore()
    playerStore.initializeProfile()

    playerStore.recordMatchResult(true)
    playerStore.recordMatchResult(true)
    expect(playerStore.currentDifficulty).toBe('beginner')
    playerStore.recordMatchResult(true)
    expect(playerStore.currentDifficulty).toBe('intermediate')

    playerStore.recordMatchResult(false)
    playerStore.recordMatchResult(false)
    playerStore.recordMatchResult(false)
    expect(playerStore.currentDifficulty).toBe('beginner')
  })

  it('saves and resumes a game session across store instances', async () => {
    const firstGameStore = useGameStore()
    const firstSessionStore = useSessionStore()
    const game = await firstGameStore.initializeGame()
    const placedCardId = game.hand[0].id
    expect(firstGameStore.placeCard(placedCardId, 'any-1')).toBe(true)
    firstSessionStore.saveSession(game)

    setActivePinia(createPinia())
    const resumedSessionStore = useSessionStore()
    const savedSession = resumedSessionStore.loadSession()
    expect(savedSession?.gameState.slots.find((slot) => slot.id === 'any-1')?.card).not.toBeNull()

    const resumedGameStore = useGameStore()
    resumedGameStore.restoreGame(savedSession!.gameState)
    expect(resumedGameStore.currentScenario?.id).toBe(game.currentScenario.id)
    expect(resumedGameStore.placedCards.map((card) => card.id)).toContain(placedCardId)
  })
})
