/**
 * Game Store (Pinia) — Task 13
 *
 * Manages active match state: scenario, deck, hand, slots, score, and validation.
 * The engine classes (ValidationEngine / ScoringEngine) are lazy-imported so the
 * store compiles even before Phase 4 engine files exist.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  GameState,
  AzureCard,
  ArchitectureSlot,
  Scenario,
  ValidationResult,
  ArchitectureScore,
  ScoreBreakdown,
} from '@/types/game'

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Build a zero-value ArchitectureScore */
function buildEmptyScore(scenario: Scenario): ArchitectureScore {
  const breakdown: ScoreBreakdown = {
    requirementsMet: 0,
    totalRequirements: scenario.requirements.length,
    costUtilization: 0,
    synergyBonuses: [],
    penalties: [],
  }
  return {
    highAvailability: 0,
    costEffectiveness: 0,
    securityCompliance: 0,
    total: 0,
    breakdown,
  }
}

/** Generate architecture slots from a scenario */
function generateSlots(scenario: Scenario): ArchitectureSlot[] {
  const slots: ArchitectureSlot[] = []

  // Required slot per requirement
  scenario.requirements.forEach((req, index) => {
    // Map requirement type to slot type
    const slotTypeMap: Record<string, ArchitectureSlot['type']> = {
      service: 'compute',
      concept: 'any',
      governance: 'governance',
    }
    slots.push({
      id: `slot-req-${index}`,
      position: { x: index * 160, y: 80 },
      type: slotTypeMap[req.type] ?? 'any',
      card: null,
      required: true,
    })
  })

  // Three optional slots
  const optTypes: ArchitectureSlot['type'][] = ['storage', 'network', 'security']
  for (let i = 0; i < 3; i++) {
    slots.push({
      id: `slot-opt-${i}`,
      position: { x: i * 160, y: 260 },
      type: optTypes[i],
      card: null,
      required: false,
    })
  }

  return slots
}

/**
 * Basic in-store scoring when Phase 4 ScoringEngine is not yet available.
 * Evaluates placed cards against scenario requirements and produces an
 * ArchitectureScore.
 */
function computeScore(placed: AzureCard[], scenario: Scenario): ArchitectureScore {
  const totalReqs = scenario.requirements.length
  let reqsMet = 0

  // Match cards against requirements by synergy tag / domain
  const usedCardIds = new Set<string>()
  scenario.requirements.forEach((req) => {
    const match = placed.find(
      (c) =>
        !usedCardIds.has(c.id) &&
        (c.synergyTags.includes(req.value) ||
          c.domain.includes(req.type) ||
          c.name.toLowerCase().includes(req.value.toLowerCase()))
    )
    if (match) {
      usedCardIds.add(match.id)
      reqsMet++
    }
  })

  const completionRatio = totalReqs > 0 ? reqsMet / totalReqs : 0

  // High Availability: bonus for redundancy / HA tags
  const haTags = ['ha', 'redundancy', 'availability-zone', 'load-balancer', 'backup']
  const haCards = placed.filter((c) => c.synergyTags.some((t) => haTags.includes(t)))
  const highAvailability = Math.min(100, Math.round(completionRatio * 60 + haCards.length * 8))

  // Cost Effectiveness: optimal if total cost 60-90 % of budget
  const totalCost = placed.reduce((s, c) => s + c.cost, 0)
  const maxCost = scenario.constraints.maxCost ?? 100
  const utilRatio = maxCost > 0 ? totalCost / maxCost : 0
  let costScore = 0
  if (utilRatio >= 0.6 && utilRatio <= 0.9) costScore = 100
  else if (utilRatio > 0.9) costScore = Math.max(0, Math.round(100 - (utilRatio - 0.9) * 500))
  else costScore = Math.round(utilRatio * 100)
  const costEffectiveness = Math.min(100, costScore)

  // Security Compliance: bonus for security-related cards
  const secTags = ['security', 'identity', 'encryption', 'governance', 'monitoring', 'compliance']
  const secCards = placed.filter((c) => c.synergyTags.some((t) => secTags.includes(t)))
  const securityCompliance = Math.min(100, Math.round(completionRatio * 50 + secCards.length * 10))

  // Synergy bonuses
  const synergyBonuses: string[] = []
  const tagFreq: Record<string, number> = {}
  placed.forEach((c) => c.synergyTags.forEach((t) => (tagFreq[t] = (tagFreq[t] ?? 0) + 1)))
  Object.entries(tagFreq).forEach(([tag, count]) => {
    if (count >= 2) synergyBonuses.push(`${tag} synergy (×${count})`)
  })

  const breakdown: ScoreBreakdown = {
    requirementsMet: reqsMet,
    totalRequirements: totalReqs,
    costUtilization: Math.round(utilRatio * 100),
    synergyBonuses,
    penalties: [],
  }

  return {
    highAvailability,
    costEffectiveness,
    securityCompliance,
    total: highAvailability + costEffectiveness + securityCompliance,
    breakdown,
  }
}

/**
 * Basic in-store validation when Phase 4 ValidationEngine is not yet available.
 */
function runLocalValidation(
  card: AzureCard,
  slot: ArchitectureSlot,
  allSlots: ArchitectureSlot[],
  scenario: Scenario
): ValidationResult {
  const violations: ValidationResult['violations'] = []

  // 1. Slot compatibility
  if (slot.type !== 'any') {
    const compatible = card.synergyTags.includes(slot.type) || card.domain.includes(slot.type)
    if (!compatible) {
      violations.push({
        type: 'requirement-unmet',
        message: `Card "${card.name}" is not compatible with a ${slot.type} slot`,
        principle: 'Slot Type Compatibility',
      })
    }
  }

  // 2. Cost constraint
  const placedCost = allSlots
    .filter((s) => s.card !== null)
    .reduce((sum, s) => sum + (s.card?.cost ?? 0), 0)
  const maxCost = scenario.constraints.maxCost ?? Infinity
  if (placedCost + card.cost > maxCost) {
    violations.push({
      type: 'cost-exceeded',
      message: `Adding "${card.name}" would exceed budget (${placedCost + card.cost} > ${maxCost})`,
      principle: 'Budget Constraint',
      numericDetail: placedCost + card.cost - maxCost,
    })
  }

  // 3. Conflicts
  const placedCardIds = allSlots.filter((s) => s.card !== null).map((s) => s.card!.id)
  if (card.conflicts) {
    card.conflicts.forEach((conflictId) => {
      if (placedCardIds.includes(conflictId)) {
        violations.push({
          type: 'conflict-detected',
          message: `"${card.name}" conflicts with already-placed card ${conflictId}`,
          principle: 'Anti-Pattern Avoidance',
        })
      }
    })
  }

  return {
    isValid: violations.length === 0,
    timestamp: Date.now(),
    violations,
    suggestions: [],
  }
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useGameStore = defineStore('game', () => {
  // ── State ────────────────────────────────────────────────────────────────
  const gameState = ref<GameState | null>(null)
  const validationResult = ref<ValidationResult | null>(null)
  const isValidating = ref(false)

  // ── Computed ─────────────────────────────────────────────────────────────
  /** Active scenario or undefined */
  const currentScenario = computed(() => gameState.value?.currentScenario)

  /** All cards currently placed on the board */
  const placedCards = computed(
    () => gameState.value?.slots.filter((s) => s.card !== null).map((s) => s.card!) ?? []
  )

  /** Current architecture score */
  const currentScore = computed(() => gameState.value?.score)

  /** True while match is in progress */
  const isGameActive = computed(
    () => gameState.value?.status === 'playing' || gameState.value?.status === 'evaluating'
  )

  // ── Actions ──────────────────────────────────────────────────────────────

  /**
   * Initialise a new match from a Scenario and game mode.
   * Deals the first hand from the provided deck cards.
   */
  function initializeGame(
    scenario: Scenario,
    mode: 'quick-match' | 'multiplayer',
    deckCards: AzureCard[] = []
  ): void {
    const shuffled = [...deckCards].sort(() => Math.random() - 0.5)
    const handSize = 7
    const hand = shuffled.slice(0, handSize)
    const deck = shuffled.slice(handSize)

    gameState.value = {
      currentScenario: scenario,
      deck,
      hand,
      slots: generateSlots(scenario),
      round: 1,
      score: buildEmptyScore(scenario),
      mode,
      timeRemaining: mode === 'quick-match' ? 45 : 120,
      status: 'playing',
    }
    validationResult.value = null
    isValidating.value = false
  }

  /**
   * Attempt to place a card into a slot.
   * Returns true on success (placement is valid), false otherwise.
   */
  async function placeCard(card: AzureCard, slot: ArchitectureSlot): Promise<boolean> {
    if (!gameState.value) return false
    if (slot.card !== null) return false // slot already occupied

    isValidating.value = true

    // Try to use the real ValidationEngine if Phase 4 is available
    let result: ValidationResult
    try {
      // @ts-expect-error — validator module will be added in Phase 4
      const { ValidationEngine } = await import('@/engine/validator')
      const engine = new ValidationEngine()
      result = engine.validatePlacement(
        card,
        slot,
        gameState.value.slots,
        gameState.value.currentScenario
      )
    } catch {
      // Phase 4 not yet implemented — use local fallback
      result = runLocalValidation(
        card,
        slot,
        gameState.value.slots,
        gameState.value.currentScenario
      )
    }

    validationResult.value = result
    isValidating.value = false

    if (result.isValid) {
      const slotIndex = gameState.value.slots.findIndex((s) => s.id === slot.id)
      if (slotIndex !== -1) {
        gameState.value.slots[slotIndex].card = card
      }
      const handIndex = gameState.value.hand.findIndex((c) => c.id === card.id)
      if (handIndex !== -1) {
        gameState.value.hand.splice(handIndex, 1)
      }
      updateScore()
      return true
    }

    return false
  }

  /**
   * Remove a card from a slot and return it to the player's hand.
   */
  function removeCard(slotId: string): void {
    if (!gameState.value) return

    const slot = gameState.value.slots.find((s) => s.id === slotId)
    if (slot?.card) {
      gameState.value.hand.push(slot.card)
      slot.card = null
      updateScore()
    }
  }

  /**
   * Recalculate the architecture score for the current board state.
   * Falls back to the built-in scorer if ScoringEngine is not yet available.
   */
  function updateScore(): void {
    if (!gameState.value) return
    const placed = placedCards.value
    const scenario = gameState.value.currentScenario
    gameState.value.score = computeScore(placed, scenario)
  }

  /**
   * Submit the current solution, triggering final evaluation.
   */
  function submitSolution(): void {
    if (!gameState.value) return
    gameState.value.status = 'evaluating'
    updateScore()
    setTimeout(() => {
      if (gameState.value) {
        gameState.value.status = 'complete'
      }
    }, 1000)
  }

  /**
   * Draw one card from the deck to the hand (if deck is non-empty).
   */
  function drawCard(): AzureCard | null {
    if (!gameState.value || gameState.value.deck.length === 0) return null
    const drawn = gameState.value.deck.shift()!
    gameState.value.hand.push(drawn)
    return drawn
  }

  /**
   * Advance to the next round.
   */
  function nextRound(): void {
    if (!gameState.value) return
    gameState.value.round++
    drawCard()
  }

  /**
   * Reset to initial state (e.g., after returning to lobby).
   */
  function resetGame(): void {
    gameState.value = null
    validationResult.value = null
    isValidating.value = false
  }

  return {
    // State
    gameState,
    validationResult,
    isValidating,
    // Computed
    currentScenario,
    placedCards,
    currentScore,
    isGameActive,
    // Actions
    initializeGame,
    placeCard,
    removeCard,
    updateScore,
    submitSolution,
    drawCard,
    nextRound,
    resetGame,
  }
})
