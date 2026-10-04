import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { ValidationEngine } from '@/engine/validator'
import { ScoringEngine } from '@/engine/scoring'
import { EvaluatorEngine } from '@/engine/evaluator'
import { useGameStore } from '@/stores/game'
import type { AzureCard, ArchitectureSlot, Scenario, GameState } from '@/types/game'

// ─── Fixture Helpers ─────────────────────────────────────────────────────────

function createMockCard(overrides: Partial<AzureCard> = {}): AzureCard {
  return {
    id: 'mock-card-1',
    name: 'Mock Compute Service',
    domain: 'azure-services',
    cost: 15,
    power: 50,
    description: 'A mock Azure service for card mechanics testing',
    az900ExamTip: 'Essential cloud service for testing',
    synergyTags: ['compute', 'ha'],
    requirements: [],
    conflicts: [],
    ...overrides,
  }
}

function createMockSlot(overrides: Partial<ArchitectureSlot> = {}): ArchitectureSlot {
  return {
    id: 'slot-compute-1',
    position: { x: 0, y: 0 },
    type: 'compute',
    card: null,
    required: true,
    ...overrides,
  }
}

function createMockScenario(overrides: Partial<Scenario> = {}): Scenario {
  return {
    id: 'scenario-test-1',
    title: 'Test Scenario',
    description: 'Scenario designed for test assertion stability',
    category: 'startup-scaling',
    difficulty: 'beginner',
    maxRounds: 5,
    requirements: [
      { type: 'service', value: 'compute', weight: 50, description: 'Requires compute' },
    ],
    constraints: {
      maxCost: 100,
    },
    ...overrides,
  }
}

describe('Core Game Logic — Card Mechanics Test Suite', () => {
  let validator: ValidationEngine
  let scorer: ScoringEngine
  let evaluator: EvaluatorEngine

  beforeEach(() => {
    setActivePinia(createPinia())
    validator = new ValidationEngine()
    scorer = new ScoringEngine()
    evaluator = new EvaluatorEngine()
  })

  // ─── 1. Slot Compatibility & Placement Mechanics ──────────────────────────

  describe('Slot Compatibility & Placement Mechanics', () => {
    it('accepts a compute card placed into a compute slot', () => {
      const card = createMockCard({ synergyTags: ['compute'] })
      const slot = createMockSlot({ type: 'compute' })
      const scenario = createMockScenario()

      const result = validator.validatePlacement(card, slot, [slot], scenario)
      expect(result.isValid).toBe(true)
      expect(result.violations).toHaveLength(0)
    })

    it('rejects a storage card placed into a compute slot', () => {
      const storageCard = createMockCard({
        id: 'blob-storage',
        name: 'Azure Blob Storage',
        synergyTags: ['storage', 'blob'],
      })
      const computeSlot = createMockSlot({ type: 'compute' })
      const scenario = createMockScenario()

      const result = validator.validatePlacement(storageCard, computeSlot, [computeSlot], scenario)
      expect(result.isValid).toBe(false)
      expect(result.violations.some((v) => v.type === 'requirement-unmet')).toBe(true)
    })

    it('accepts any card in an "any" slot type', () => {
      const securityCard = createMockCard({
        id: 'entra-id',
        name: 'Microsoft Entra ID',
        synergyTags: ['security', 'identity'],
      })
      const anySlot = createMockSlot({ id: 'slot-any-1', type: 'any' })
      const scenario = createMockScenario()

      const result = validator.validatePlacement(securityCard, anySlot, [anySlot], scenario)
      expect(result.isValid).toBe(true)
    })
  })

  // ─── 2. Budget and Cost Constraints ───────────────────────────────────────

  describe('Budget & Cost Constraints', () => {
    it('rejects placement when card cost exceeds the scenario budget', () => {
      const scenario = createMockScenario({ constraints: { maxCost: 30 } })
      const expensiveCard = createMockCard({ cost: 35 })
      const slot = createMockSlot()

      const result = validator.validatePlacement(expensiveCard, slot, [slot], scenario)
      expect(result.isValid).toBe(false)
      const costViolation = result.violations.find((v) => v.type === 'cost-exceeded')
      expect(costViolation).toBeDefined()
      expect(costViolation?.numericDetail).toBe(5)
    })

    it('considers already placed card costs when evaluating budget overflow', () => {
      const scenario = createMockScenario({ constraints: { maxCost: 50 } })
      const card1 = createMockCard({ id: 'c1', cost: 30, synergyTags: ['compute'] })
      const card2 = createMockCard({ id: 'c2', cost: 25, synergyTags: ['storage'] })

      const slot1 = createMockSlot({ id: 's1', type: 'compute', card: card1 })
      const slot2 = createMockSlot({ id: 's2', type: 'storage', card: null })

      const result = validator.validatePlacement(card2, slot2, [slot1, slot2], scenario)
      expect(result.isValid).toBe(false)
      const costViolation = result.violations.find((v) => v.type === 'cost-exceeded')
      expect(costViolation?.numericDetail).toBe(5) // (30 + 25) - 50 = 5
    })
  })

  // ─── 3. Card Prerequisites & Conflicts ────────────────────────────────────

  describe('Card Prerequisites & Conflicts', () => {
    it('fails validation when a card has unmet prerequisite requirements', () => {
      const cardWithRequirement = createMockCard({
        id: 'aks-cluster',
        name: 'Azure Kubernetes Service',
        requirements: ['vnet-required'],
      })
      const slot = createMockSlot()
      const scenario = createMockScenario()

      const result = validator.validatePlacement(cardWithRequirement, slot, [slot], scenario)
      expect(result.isValid).toBe(false)
      expect(result.violations.some((v) => v.type === 'requirement-unmet')).toBe(true)
    })

    it('passes validation when card requirements are fulfilled by a placed card', () => {
      const vnetCard = createMockCard({
        id: 'vnet-required',
        name: 'Virtual Network',
        synergyTags: ['network'],
      })
      const aksCard = createMockCard({
        id: 'aks-cluster',
        name: 'Azure Kubernetes Service',
        requirements: ['vnet-required'],
        synergyTags: ['compute'],
      })

      const slot1 = createMockSlot({ id: 's1', type: 'network', card: vnetCard })
      const slot2 = createMockSlot({ id: 's2', type: 'compute', card: null })
      const scenario = createMockScenario()

      const result = validator.validatePlacement(aksCard, slot2, [slot1, slot2], scenario)
      expect(result.isValid).toBe(true)
    })

    it('detects conflict when placing a card incompatible with an existing card', () => {
      const basicCard = createMockCard({
        id: 'basic-sku',
        name: 'Basic SKU',
        conflicts: ['premium-sku'],
        synergyTags: ['compute'],
      })
      const premiumCard = createMockCard({
        id: 'premium-sku',
        name: 'Premium SKU',
        conflicts: ['basic-sku'],
        synergyTags: ['compute'],
      })

      const slot1 = createMockSlot({ id: 's1', type: 'compute', card: basicCard })
      const slot2 = createMockSlot({ id: 's2', type: 'any', card: null })
      const scenario = createMockScenario()

      const result = validator.validatePlacement(premiumCard, slot2, [slot1, slot2], scenario)
      expect(result.isValid).toBe(false)
      expect(result.violations.some((v) => v.type === 'conflict-detected')).toBe(true)
    })
  })

  // ─── 4. Hand, Deck & Slot State Mechanics ─────────────────────────────────

  describe('Hand, Deck & Slot State Management', () => {
    it('moves a card from hand to the target slot and increments round count', () => {
      const store = useGameStore()
      const scenario = createMockScenario()
      const testCards = [
        createMockCard({ id: 'card-1', name: 'Card 1', synergyTags: ['compute'] }),
        createMockCard({ id: 'card-2', name: 'Card 2', synergyTags: ['storage'] }),
        createMockCard({ id: 'card-3', name: 'Card 3', synergyTags: ['network'] }),
      ]

      const slots: ArchitectureSlot[] = [
        createMockSlot({ id: 'compute-1', type: 'compute' }),
        createMockSlot({ id: 'storage-1', type: 'storage' }),
      ]

      const initialState: GameState = {
        currentScenario: scenario,
        deck: [testCards[2]],
        hand: [testCards[0], testCards[1]],
        slots,
        round: 1,
        score: {
          highAvailability: 0,
          costEffectiveness: 0,
          securityCompliance: 0,
          total: 0,
          breakdown: {
            requirementsMet: 0,
            totalRequirements: 1,
            costUtilization: 0,
            synergyBonuses: [],
            penalties: [],
          },
        },
        mode: 'quick-match',
        timeRemaining: 45,
        status: 'playing',
      }

      store.restoreGame(initialState)

      const success = store.placeCard('card-1', 'compute-1')
      expect(success).toBe(true)
      expect(store.gameState?.slots.find((s) => s.id === 'compute-1')?.card?.id).toBe('card-1')
      expect(store.gameState?.round).toBe(2)
      // In quick-match mode, drawing from deck replenishes hand
      expect(store.gameState?.hand.some((c) => c.id === 'card-3')).toBe(true)
    })

    it('prevents placing a card into an already occupied slot', () => {
      const store = useGameStore()
      const scenario = createMockScenario()
      const card1 = createMockCard({ id: 'card-1' })
      const card2 = createMockCard({ id: 'card-2' })

      const initialState: GameState = {
        currentScenario: scenario,
        deck: [],
        hand: [card2],
        slots: [createMockSlot({ id: 'slot-1', card: card1 })],
        round: 1,
        score: {
          highAvailability: 0,
          costEffectiveness: 0,
          securityCompliance: 0,
          total: 0,
          breakdown: {
            requirementsMet: 0,
            totalRequirements: 1,
            costUtilization: 0,
            synergyBonuses: [],
            penalties: [],
          },
        },
        mode: 'multiplayer',
        timeRemaining: 90,
        status: 'playing',
      }

      store.restoreGame(initialState)

      const result = store.placeCard('card-2', 'slot-1')
      expect(result).toBe(false)
      expect(store.gameState?.slots[0].card?.id).toBe('card-1')
    })

    it('returns card to hand when removing it from a slot', () => {
      const store = useGameStore()
      const scenario = createMockScenario()
      const placedCard = createMockCard({ id: 'card-remove-test' })

      const initialState: GameState = {
        currentScenario: scenario,
        deck: [],
        hand: [],
        slots: [createMockSlot({ id: 'slot-target', card: placedCard })],
        round: 2,
        score: {
          highAvailability: 0,
          costEffectiveness: 0,
          securityCompliance: 0,
          total: 0,
          breakdown: {
            requirementsMet: 0,
            totalRequirements: 1,
            costUtilization: 0,
            synergyBonuses: [],
            penalties: [],
          },
        },
        mode: 'multiplayer',
        timeRemaining: 90,
        status: 'playing',
      }

      store.restoreGame(initialState)

      const removed = store.removeCard('slot-target')
      expect(removed?.id).toBe('card-remove-test')
      expect(store.gameState?.slots[0].card).toBeNull()
      expect(store.gameState?.hand).toHaveLength(1)
      expect(store.gameState?.hand[0].id).toBe('card-remove-test')
    })
  })

  // ─── 5. Scoring & Synergy Mechanics ───────────────────────────────────────

  describe('Scoring & Synergy Mechanics', () => {
    it('calculates architecture score with HA and security bonuses', () => {
      const scenario = createMockScenario()
      const cards = [
        createMockCard({ id: 'vm', name: 'Virtual Machine', synergyTags: ['compute', 'ha'] }),
        createMockCard({
          id: 'entra',
          name: 'Entra ID',
          domain: 'azure-services',
          synergyTags: ['security', 'identity'],
        }),
      ]

      const score = scorer.calculateScore(cards, scenario)
      expect(score.total).toBeGreaterThan(0)
      expect(score.highAvailability).toBeGreaterThan(0)
      expect(score.securityCompliance).toBeGreaterThan(0)
      expect(score.breakdown.totalRequirements).toBe(scenario.requirements.length)
    })

    it('detects synergy bonuses when multiple cards share tags', () => {
      const scenario = createMockScenario()
      const cards = [
        createMockCard({ id: 'c1', synergyTags: ['compute', 'serverless'] }),
        createMockCard({ id: 'c2', synergyTags: ['event-driven', 'serverless'] }),
      ]

      const score = scorer.calculateScore(cards, scenario)
      expect(score.breakdown.synergyBonuses).toContain('serverless')
    })
  })

  // ─── 6. Clash Evaluation & XP Awards ──────────────────────────────────────

  describe('Clash Evaluation & XP Awards', () => {
    it('determines winner correctly based on architecture score total', () => {
      const scenario = createMockScenario()
      const winningSolution = [
        createMockCard({ id: 'w1', synergyTags: ['ha', 'compute', 'serverless'] }),
        createMockCard({ id: 'w2', synergyTags: ['identity', 'encryption', 'serverless'] }),
      ]
      const losingSolution = [createMockCard({ id: 'l1', cost: 90, synergyTags: ['compute'] })]

      const clashResult = evaluator.evaluateClash(winningSolution, losingSolution, scenario)
      expect(clashResult.winner).toBe('player1')
      expect(clashResult.marginOfVictory).toBe(
        clashResult.player1Score.total - clashResult.player2Score.total
      )
    })

    it('correctly reports tie when score totals match', () => {
      const scenario = createMockScenario()
      const solution = [createMockCard({ id: 'c1', synergyTags: ['compute'] })]

      const clashResult = evaluator.evaluateClash(solution, solution, scenario)
      expect(clashResult.winner).toBe('tie')
      expect(clashResult.marginOfVictory).toBe(0)
    })

    it('applies difficulty multipliers and guarantees minimum XP', () => {
      const dummyScore = {
        highAvailability: 10,
        costEffectiveness: 10,
        securityCompliance: 10,
        total: 30,
        breakdown: {
          requirementsMet: 1,
          totalRequirements: 1,
          costUtilization: 20,
          synergyBonuses: [],
          penalties: [],
        },
      }

      const beginnerXP = evaluator.calculateXPAward(dummyScore, true, 'beginner')
      const advancedXP = evaluator.calculateXPAward(dummyScore, true, 'advanced')

      expect(advancedXP).toBeGreaterThan(beginnerXP)

      // Even with 0 score and loss, minimum XP is guaranteed (MIN_XP = 10)
      const zeroScore = { ...dummyScore, total: 0 }
      const minLossXP = evaluator.calculateXPAward(zeroScore, false, 'beginner')
      expect(minLossXP).toBeGreaterThanOrEqual(10)
    })
  })
})
