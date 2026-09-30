import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type {
  ArchitectureScore,
  ArchitectureSlot,
  AzureCard,
  GameState,
  Scenario,
  ValidationResult,
} from '@/types/game'
import { loadAllCards, loadAllScenarios } from '@/utils/dataLoader'
import { useSessionStore } from '@/stores/session'

const EMPTY_SCORE: ArchitectureScore = {
  highAvailability: 0,
  costEffectiveness: 0,
  securityCompliance: 0,
  total: 0,
  breakdown: {
    requirementsMet: 0,
    totalRequirements: 0,
    costUtilization: 0,
    synergyBonuses: [],
    penalties: [],
  },
}

function createSlots(): ArchitectureSlot[] {
  return [
    { id: 'compute-1', position: { x: 0, y: 0 }, type: 'compute', card: null, required: true },
    { id: 'storage-1', position: { x: 1, y: 0 }, type: 'storage', card: null, required: true },
    { id: 'network-1', position: { x: 2, y: 0 }, type: 'network', card: null, required: true },
    { id: 'security-1', position: { x: 0, y: 1 }, type: 'security', card: null, required: true },
    { id: 'governance-1', position: { x: 1, y: 1 }, type: 'governance', card: null, required: false },
    { id: 'any-1', position: { x: 2, y: 1 }, type: 'any', card: null, required: false },
  ]
}

function cloneScore(score: ArchitectureScore): ArchitectureScore {
  return {
    ...score,
    breakdown: {
      ...score.breakdown,
      synergyBonuses: [...score.breakdown.synergyBonuses],
      penalties: [...score.breakdown.penalties],
    },
  }
}

function createInitialState(scenario: Scenario, cards: AzureCard[], mode: GameState['mode']): GameState {
  return {
    currentScenario: scenario,
    deck: cards,
    hand: cards.slice(0, 8),
    slots: createSlots(),
    round: 1,
    score: {
      ...cloneScore(EMPTY_SCORE),
      breakdown: {
        ...EMPTY_SCORE.breakdown,
        totalRequirements: scenario.requirements.length,
      },
    },
    mode,
    timeRemaining: mode === 'quick-match' ? 45 : 90,
    status: 'playing',
  }
}

export const useGameStore = defineStore('game', () => {
  const gameState = ref<GameState | null>(null)
  const validationResult = ref<ValidationResult | null>(null)
  const isValidating = ref(false)

  const currentScenario = computed(() => gameState.value?.currentScenario ?? null)
  const placedCards = computed(
    () => gameState.value?.slots.flatMap((slot) => (slot.card ? [slot.card] : [])) ?? []
  )
  const currentScore = computed(() => gameState.value?.score ?? EMPTY_SCORE)
  const isGameActive = computed(
    () => gameState.value?.status === 'playing' || gameState.value?.status === 'evaluating'
  )

  let stopPersistence: (() => void) | undefined

  function persistOnChange(): void {
    stopPersistence?.()
    stopPersistence = watch(
      gameState,
      (state) => {
        if (state) useSessionStore().saveSession(state)
      },
      { deep: true, immediate: true }
    )
  }

  async function initializeGame(
    scenarioId?: string,
    mode: GameState['mode'] = 'quick-match'
  ): Promise<GameState> {
    const [scenarios, cards] = await Promise.all([loadAllScenarios(), loadAllCards()])
    const scenario = scenarioId ? scenarios.find((item) => item.id === scenarioId) : scenarios[0]

    if (!scenario) throw new Error(`Scenario not found: ${scenarioId}`)

    gameState.value = createInitialState(scenario, cards, mode)
    validationResult.value = null
    isValidating.value = false
    persistOnChange()
    return gameState.value
  }

  function placeCard(cardId: string, slotId: string): boolean {
    if (!gameState.value || gameState.value.status !== 'playing') return false

    const slot = gameState.value.slots.find((item) => item.id === slotId)
    const cardIndex = gameState.value.hand.findIndex((item) => item.id === cardId)
    if (!slot || cardIndex < 0 || slot.card) return false

    const [card] = gameState.value.hand.splice(cardIndex, 1)
    slot.card = card
    gameState.value.round += 1
    validationResult.value = { isValid: true, timestamp: Date.now(), violations: [] }
    return true
  }

  function removeCard(slotId: string): AzureCard | null {
    if (!gameState.value || gameState.value.status !== 'playing') return null

    const slot = gameState.value.slots.find((item) => item.id === slotId)
    if (!slot?.card) return null

    const card = slot.card
    slot.card = null
    gameState.value.hand.push(card)
    return card
  }

  function updateScore(score: ArchitectureScore): void {
    if (gameState.value) gameState.value.score = cloneScore(score)
  }

  function submitSolution(): GameState | null {
    if (!gameState.value) return null
    gameState.value.status = 'evaluating'
    gameState.value.status = 'complete'
    return gameState.value
  }

  function setValidationState(result: ValidationResult | null, validating = false): void {
    validationResult.value = result
    isValidating.value = validating
  }

  return {
    gameState,
    validationResult,
    isValidating,
    currentScenario,
    placedCards,
    currentScore,
    isGameActive,
    initializeGame,
    placeCard,
    removeCard,
    updateScore,
    submitSolution,
    setValidationState,
  }
})
