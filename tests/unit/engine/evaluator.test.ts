/**
 * Property-based tests for EvaluatorEngine
 *
 * Each property is exercised through multiple explicit parameterised cases
 * (it.each) without relying on external property-testing libraries.
 */

import { describe, it, expect } from 'vitest'
import { EvaluatorEngine } from '@/engine/evaluator'
import type { AzureCard, Scenario, ArchitectureScore } from '@/types/game'

// ─── Helper factories ─────────────────────────────────────────────────────────

function makeCard(overrides: Partial<AzureCard> = {}): AzureCard {
  return {
    id: 'card-1',
    name: 'Test Card',
    domain: 'azure-services',
    cost: 10,
    power: 50,
    description: 'desc',
    az900ExamTip: 'tip',
    synergyTags: [],
    requirements: [],
    conflicts: [],
    ...overrides,
  }
}

function makeScenario(overrides: Partial<Scenario> = {}): Scenario {
  return {
    id: 'scen-1',
    title: 'Test Scenario',
    description: 'desc',
    category: 'startup-scaling',
    difficulty: 'beginner',
    maxRounds: 5,
    requirements: [],
    constraints: { maxCost: 100 },
    ...overrides,
  }
}

/**
 * Constructs a synthetic ArchitectureScore for use in XP tests.
 * The breakdown is minimal since XP only reads `total`.
 */
function makeScore(total: number): ArchitectureScore {
  const third = Math.floor(total / 3)
  return {
    highAvailability: third,
    costEffectiveness: third,
    securityCompliance: total - third * 2,
    total,
    breakdown: {
      requirementsMet: 0,
      totalRequirements: 0,
      costUtilization: 0,
      synergyBonuses: [],
      penalties: [],
    },
  }
}

// ─── Property 1: Higher total score wins ─────────────────────────────────────

describe('EvaluatorEngine', () => {
  describe('Property 1: player with higher total score wins the clash', () => {
    it.each([
      // [p1 card cost, p2 card cost, expected winner]
      // p1 has better cost utilisation (80% vs 0%)
      { p1Cost: 80, p2Cost: 0, expected: 'player1' as const, label: 'p1 80% vs p2 0%' },
      // p2 has better utilisation
      { p1Cost: 0, p2Cost: 80, expected: 'player2' as const, label: 'p1 0% vs p2 80%' },
      // p1 uses HA tags, p2 does not
      {
        p1Tags: ['ha', 'availability-zone', 'multi-region'],
        p2Tags: [] as string[],
        expected: 'player1' as const,
        label: 'p1 all HA tags vs p2 none',
      },
    ] as Array<{
      p1Cost?: number
      p2Cost?: number
      p1Tags?: string[]
      p2Tags?: string[]
      expected: 'player1' | 'player2'
      label: string
    }>)(
      '$label',
      ({ p1Cost = 80, p2Cost = 0, p1Tags = [], p2Tags = [], expected }) => {
        const engine = new EvaluatorEngine()
        const scenario = makeScenario({ constraints: { maxCost: 100 } })

        const p1Solution = [makeCard({ id: 'p1', cost: p1Cost, synergyTags: p1Tags })]
        const p2Solution = [makeCard({ id: 'p2', cost: p2Cost, synergyTags: p2Tags })]

        const result = engine.evaluateClash(p1Solution, p2Solution, scenario)

        expect(result.winner).toBe(expected)
        if (expected === 'player1') {
          expect(result.player1Score.total).toBeGreaterThan(result.player2Score.total)
        } else {
          expect(result.player2Score.total).toBeGreaterThan(result.player1Score.total)
        }
      },
    )
  })

  // ─── Property 2: Equal scores result in a tie ────────────────────────────────

  describe('Property 2: identical solutions produce a tie', () => {
    it.each([
      { cards: [], label: 'both empty' },
      {
        cards: [makeCard({ id: 'shared', cost: 50, synergyTags: ['ha'] })],
        label: 'same single HA card',
      },
      {
        cards: [
          makeCard({ id: 'c1', cost: 40, synergyTags: ['ha', 'paas'] }),
          makeCard({ id: 'c2', cost: 30, synergyTags: ['identity', 'encryption'] }),
        ],
        label: 'identical two-card solution',
      },
    ])('$label → tie', ({ cards }) => {
      const engine = new EvaluatorEngine()
      const scenario = makeScenario({ constraints: { maxCost: 100 } })

      // Both players play the exact same solution
      const result = engine.evaluateClash(cards, [...cards], scenario)

      expect(result.winner).toBe('tie')
      expect(result.player1Score.total).toBe(result.player2Score.total)
    })
  })

  // ─── Property 3: marginOfVictory = |score1 - score2| ────────────────────────

  describe('Property 3: marginOfVictory equals the absolute difference between totals', () => {
    it.each([
      {
        p1Cards: [makeCard({ id: 'p1', cost: 80, synergyTags: ['ha', 'paas'] })],
        p2Cards: [makeCard({ id: 'p2', cost: 5, synergyTags: [] })],
        label: 'large margin',
      },
      {
        p1Cards: [makeCard({ id: 'p1b', cost: 50, synergyTags: [] })],
        p2Cards: [makeCard({ id: 'p2b', cost: 45, synergyTags: [] })],
        label: 'small margin',
      },
      {
        p1Cards: [],
        p2Cards: [],
        label: 'both empty (margin = 0)',
      },
      {
        p1Cards: [
          makeCard({ id: 'a1', cost: 70, synergyTags: ['ha', 'multi-region'] }),
          makeCard({ id: 'a2', cost: 10, synergyTags: ['identity'] }),
        ],
        p2Cards: [
          makeCard({ id: 'b1', cost: 70, synergyTags: ['ha'] }),
          makeCard({ id: 'b2', cost: 10, synergyTags: [] }),
        ],
        label: 'multi-card solutions',
      },
    ])('$label', ({ p1Cards, p2Cards }) => {
      const engine = new EvaluatorEngine()
      const scenario = makeScenario({ constraints: { maxCost: 100 } })

      const result = engine.evaluateClash(p1Cards, p2Cards, scenario)

      const expectedMargin = Math.abs(result.player1Score.total - result.player2Score.total)
      expect(result.marginOfVictory).toBe(expectedMargin)
    })
  })

  // ─── Property 4: XP winner >= XP loser always ───────────────────────────────

  describe('Property 4: XP awarded to winner is always >= XP awarded to loser', () => {
    it.each([
      { total: 0, difficulty: 'beginner' as const },
      { total: 50, difficulty: 'beginner' as const },
      { total: 150, difficulty: 'intermediate' as const },
      { total: 200, difficulty: 'advanced' as const },
      { total: 300, difficulty: 'advanced' as const },
      { total: 10, difficulty: 'intermediate' as const },
      { total: 99, difficulty: 'beginner' as const },
    ])('total=$total difficulty=$difficulty', ({ total, difficulty }) => {
      const engine = new EvaluatorEngine()
      const score = makeScore(total)

      const winnerXP = engine.calculateXPAward(score, true, difficulty)
      const loserXP = engine.calculateXPAward(score, false, difficulty)

      expect(winnerXP).toBeGreaterThanOrEqual(loserXP)
    })
  })

  // ─── Property 5: XP minimum is always 10 ────────────────────────────────────

  describe('Property 5: calculateXPAward always returns at least 10 XP', () => {
    it.each([
      { total: 0, isWinner: true, difficulty: 'beginner' as const },
      { total: 0, isWinner: false, difficulty: 'beginner' as const },
      { total: 0, isWinner: false, difficulty: 'intermediate' as const },
      { total: 0, isWinner: false, difficulty: 'advanced' as const },
      { total: 1, isWinner: false, difficulty: 'beginner' as const },
      { total: 300, isWinner: false, difficulty: 'beginner' as const },
    ])('total=$total isWinner=$isWinner difficulty=$difficulty → xp >= 10', ({ total, isWinner, difficulty }) => {
      const engine = new EvaluatorEngine()
      const score = makeScore(total)

      const xp = engine.calculateXPAward(score, isWinner, difficulty)

      expect(xp).toBeGreaterThanOrEqual(10)
    })
  })

  // ─── Property 6: Advanced difficulty XP is 2× beginner XP ───────────────────

  describe('Property 6: advanced difficulty multiplier is exactly 2× beginner multiplier', () => {
    it.each([
      { total: 0, isWinner: true },
      { total: 50, isWinner: true },
      { total: 150, isWinner: true },
      { total: 300, isWinner: true },
      { total: 0, isWinner: false },
      { total: 100, isWinner: false },
    ])('total=$total isWinner=$isWinner', ({ total, isWinner }) => {
      const engine = new EvaluatorEngine()
      const score = makeScore(total)

      const beginnerXP = engine.calculateXPAward(score, isWinner, 'beginner')
      const advancedXP = engine.calculateXPAward(score, isWinner, 'advanced')

      // advanced multiplier = 2.0, beginner = 1.0 → ratio should be 2×
      // (both floored to Math.round and clamped to MIN_XP = 10,
      //  so only verify when beginner exceeds the minimum)
      if (beginnerXP > 10) {
        expect(advancedXP).toBe(beginnerXP * 2)
      } else {
        // Both are clamped to minimum — advanced is at least as large
        expect(advancedXP).toBeGreaterThanOrEqual(beginnerXP)
      }
    })
  })

  // ─── Property 7: XP is always a positive integer ─────────────────────────────

  describe('Property 7: calculateXPAward always returns a positive integer', () => {
    it.each([
      { total: 0, isWinner: true, difficulty: 'beginner' as const },
      { total: 0, isWinner: false, difficulty: 'beginner' as const },
      { total: 50, isWinner: true, difficulty: 'beginner' as const },
      { total: 50, isWinner: false, difficulty: 'intermediate' as const },
      { total: 150, isWinner: true, difficulty: 'intermediate' as const },
      { total: 200, isWinner: false, difficulty: 'advanced' as const },
      { total: 300, isWinner: true, difficulty: 'advanced' as const },
      { total: 300, isWinner: false, difficulty: 'advanced' as const },
      { total: 1, isWinner: false, difficulty: 'beginner' as const },
      { total: 99, isWinner: true, difficulty: 'intermediate' as const },
    ])(
      'total=$total isWinner=$isWinner difficulty=$difficulty',
      ({ total, isWinner, difficulty }) => {
        const engine = new EvaluatorEngine()
        const score = makeScore(total)

        const xp = engine.calculateXPAward(score, isWinner, difficulty)

        // Must be a positive integer
        expect(xp).toBeGreaterThan(0)
        expect(Number.isInteger(xp)).toBe(true)
      },
    )
  })
})
