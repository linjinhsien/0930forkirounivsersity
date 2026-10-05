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
    {
      id: 'governance-1',
      position: { x: 1, y: 1 },
      type: 'governance',
      card: null,
      required: false,
    },
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

const INITIAL_HAND_SIZE = 8

function shuffleCards(cards: AzureCard[]): AzureCard[] {
  const shuffled = [...cards]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const current = shuffled[index]
    shuffled[index] = shuffled[swapIndex]
    shuffled[swapIndex] = current
  }
  return shuffled
}

function dealScenarioHand(scenario: Scenario, cards: AzureCard[]): AzureCard[] {
  const shuffled = shuffleCards(cards)
  const hand: AzureCard[] = []

  for (const requirement of scenario.requirements) {
    const match = cards.find(
      (card) => !hand.includes(card) && card.synergyTags.includes(requirement.value)
    )
    if (match && hand.length < INITIAL_HAND_SIZE) hand.push(match)
  }

  for (const card of shuffled) {
    if (hand.length >= INITIAL_HAND_SIZE) break
    if (!hand.includes(card)) hand.push(card)
  }

  return hand
}

function createInitialState(
  scenario: Scenario,
  cards: AzureCard[],
  mode: GameState['mode']
): GameState {
  // All modes use dealScenarioHand for randomized, scenario-relevant hands
  const hand = dealScenarioHand(scenario, cards)
  const handIds = new Set(hand.map((card) => card.id))

  return {
    currentScenario: scenario,
    deck: shuffleCards(cards.filter((card) => !handIds.has(card.id))),
    hand,
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
  const sessionStore = useSessionStore()

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
        if (state?.mode !== 'quick-match') return
        if (state.status === 'playing') sessionStore.saveSession(state)
        else if (state.status === 'complete') sessionStore.clearSession()
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

  function restoreGame(state: GameState): void {
    gameState.value = structuredClone(state)
    validationResult.value = null
    isValidating.value = false
    persistOnChange()
  }

  function placeCard(cardId: string, slotId: string): boolean {
    if (!gameState.value || gameState.value.status !== 'playing') return false

    const slot = gameState.value.slots.find((item) => item.id === slotId)
    const cardIndex = gameState.value.hand.findIndex((item) => item.id === cardId)
    if (!slot || cardIndex < 0 || slot.card) return false

    const [card] = gameState.value.hand.splice(cardIndex, 1)
    slot.card = card
    if (gameState.value.mode === 'quick-match') {
      const nextCard = gameState.value.deck.shift()
      if (nextCard) gameState.value.hand.push(nextCard)
    }
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

  /**
   * Replace the card in an occupied slot without drawing a new card.
   * The previous card returns to the hand and the selected hand card takes its place.
   */
  function replaceCard(cardId: string, slotId: string): boolean {
    if (!gameState.value || gameState.value.status !== 'playing') return false

    const slot = gameState.value.slots.find((item) => item.id === slotId)
    const cardIndex = gameState.value.hand.findIndex((item) => item.id === cardId)
    if (!slot || !slot.card || cardIndex < 0) return false

    const [replacement] = gameState.value.hand.splice(cardIndex, 1)
    const previousCard = slot.card
    slot.card = replacement
    gameState.value.hand.push(previousCard)
    gameState.value.round += 1
    validationResult.value = { isValid: true, timestamp: Date.now(), violations: [] }
    return true
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
    restoreGame,
    placeCard,
    removeCard,
    replaceCard,
    updateScore,
    submitSolution,
    setValidationState,
  }
})
