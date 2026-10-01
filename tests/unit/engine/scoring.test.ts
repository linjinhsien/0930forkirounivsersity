/**
 * Property-based tests for ScoringEngine
 *
 * Each property is exercised through multiple explicit parameterised cases
 * (it.each) without relying on external property-testing libraries.
 */

import { describe, it, expect } from 'vitest'
import { ScoringEngine } from '@/engine/scoring'
import type { AzureCard, Scenario } from '@/types/game'

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

// ─── Property 1: All score components are in [0, 100] ────────────────────────

describe('ScoringEngine', () => {
  describe('Property 1: every individual component score is clamped to [0, 100]', () => {
    it.each([
      // No cards → all zeros
      { cards: [], label: 'empty board' },
      // HA-heavy
      {
        cards: [
          makeCard({ id: 'c1', synergyTags: ['ha', 'availability-zone'] }),
          makeCard({ id: 'c2', synergyTags: ['multi-region', 'load-balancer'] }),
          makeCard({ id: 'c3', synergyTags: ['backup', 'recovery'] }),
          makeCard({ id: 'c4', synergyTags: ['paas', 'serverless'] }),
          makeCard({ id: 'c5', synergyTags: ['ha'] }),
        ],
        label: 'many HA cards',
      },
      // Security-heavy
      {
        cards: [
          makeCard({ id: 's1', synergyTags: ['identity', 'entra'] }),
          makeCard({ id: 's2', synergyTags: ['encryption'] }),
          makeCard({ id: 's3', synergyTags: ['nsg', 'firewall'] }),
          makeCard({ id: 's4', synergyTags: ['governance', 'policy'] }),
          makeCard({ id: 's5', synergyTags: ['monitoring', 'backup'] }),
        ],
        label: 'all security tags',
      },
      // Premium scenario, no security → penalty applied
      {
        cards: [makeCard({ id: 'p1', synergyTags: ['compute'] })],
        label: 'premium scenario no security',
      },
      // Single cheap card far under budget
      {
        cards: [makeCard({ id: 'u1', cost: 1, synergyTags: ['compute'] })],
        label: 'single cheap card',
      },
    ])('$label', ({ cards }) => {
      const engine = new ScoringEngine()
      const scenario = makeScenario({
        constraints: { maxCost: 100, securityLevel: cards.length === 1 && cards[0]?.synergyTags.includes('compute') ? 'premium' : undefined },
      })

      const { score: ha } = engine.calculateHighAvailabilityScore(cards, scenario)
      const { score: cost } = engine.calculateCostEffectivenessScore(cards, scenario)
      const { score: sec } = engine.calculateSecurityComplianceScore(cards, scenario)

      expect(ha).toBeGreaterThanOrEqual(0)
      expect(ha).toBeLessThanOrEqual(100)
      expect(cost).toBeGreaterThanOrEqual(0)
      expect(cost).toBeLessThanOrEqual(100)
      expect(sec).toBeGreaterThanOrEqual(0)
      expect(sec).toBeLessThanOrEqual(100)
    })
  })

  // ─── Property 2: Total equals sum of three components ──────────────────────

  describe('Property 2: total score equals sum of the three components', () => {
    it.each([
      {
        cards: [],
        label: 'empty board',
      },
      {
        cards: [
          makeCard({ id: 'c1', cost: 70, synergyTags: ['ha', 'paas'] }),
          makeCard({ id: 'c2', cost: 10, synergyTags: ['identity', 'encryption'] }),
        ],
        label: 'HA + security cards',
      },
      {
        cards: [
          makeCard({ id: 'c3', cost: 80, synergyTags: ['compute', 'paas'] }),
          makeCard({ id: 'c4', cost: 5, synergyTags: ['governance', 'monitoring'] }),
          makeCard({ id: 'c5', cost: 5, synergyTags: ['multi-region', 'backup'] }),
        ],
        label: 'mixed cards',
      },
    ])('$label', ({ cards }) => {
      const engine = new ScoringEngine()
      const scenario = makeScenario({ constraints: { maxCost: 100 } })

      const result = engine.calculateScore(cards, scenario)

      expect(result.total).toBe(
        result.highAvailability + result.costEffectiveness + result.securityCompliance,
      )
    })
  })

  // ─── Property 3: Empty board scores all zeros ───────────────────────────────

  describe('Property 3: empty board produces all-zero scores', () => {
    it('returns 0 for all components and total on empty board', () => {
      const engine = new ScoringEngine()
      const scenario = makeScenario()

      const result = engine.calculateScore([], scenario)

      expect(result.highAvailability).toBe(0)
      expect(result.costEffectiveness).toBe(0)
      expect(result.securityCompliance).toBe(0)
      expect(result.total).toBe(0)
    })

    it.each([
      makeScenario({ difficulty: 'beginner' }),
      makeScenario({ difficulty: 'intermediate' }),
      makeScenario({ difficulty: 'advanced' }),
      makeScenario({ constraints: { maxCost: 50 } }),
      makeScenario({ constraints: { minAvailability: 99.9 } }),
    ])('empty board on various scenarios', (scenario) => {
      const engine = new ScoringEngine()
      const result = engine.calculateScore([], scenario)
      expect(result.total).toBe(0)
    })
  })

  // ─── Property 4: HA cards increase HA score ─────────────────────────────────

  describe('Property 4: adding HA-tagged cards raises highAvailability score', () => {
    it.each([
      { tag: 'ha', label: 'ha tag' },
      { tag: 'availability-zone', label: 'availability-zone tag' },
      { tag: 'multi-region', label: 'multi-region tag' },
      { tag: 'load-balancer', label: 'load-balancer tag' },
      { tag: 'backup', label: 'backup tag' },
      { tag: 'recovery', label: 'recovery tag' },
      { tag: 'paas', label: 'paas managed service' },
      { tag: 'serverless', label: 'serverless managed service' },
    ])('$label increases HA score above 0', ({ tag }) => {
      const engine = new ScoringEngine()
      const scenario = makeScenario()

      const { score: baseline } = engine.calculateHighAvailabilityScore([], scenario)
      const { score: withCard } = engine.calculateHighAvailabilityScore(
        [makeCard({ synergyTags: [tag] })],
        scenario,
      )

      expect(withCard).toBeGreaterThan(baseline)
    })
  })

  // ─── Property 5: Cost in optimal range (70-90%) gives max cost score ─────────

  describe('Property 5: cost utilisation in [70%, 90%] yields maximum cost score of 100', () => {
    it.each([
      { maxCost: 100, cost: 70, label: '70% utilisation' },
      { maxCost: 100, cost: 80, label: '80% utilisation (sweet spot)' },
      { maxCost: 100, cost: 90, label: '90% utilisation' },
      { maxCost: 200, cost: 140, label: '70% of 200' },
      { maxCost: 200, cost: 180, label: '90% of 200' },
      { maxCost: 50, cost: 35, label: '70% of 50' },
      { maxCost: 50, cost: 45, label: '90% of 50' },
    ])('$label', ({ maxCost, cost }) => {
      const engine = new ScoringEngine()
      const scenario = makeScenario({ constraints: { maxCost } })
      const cards = [makeCard({ cost, synergyTags: [] })]

      const { score } = engine.calculateCostEffectivenessScore(cards, scenario)

      // Base is 100; bonuses can push it higher but clamp at 100
      expect(score).toBe(100)
    })
  })

  // ─── Property 6: Security cards increase security score ──────────────────────

  describe('Property 6: security-tagged cards raise securityCompliance score', () => {
    it.each([
      { tags: ['identity'], label: 'identity tag' },
      { tags: ['entra'], label: 'entra tag' },
      { tags: ['encryption'], label: 'encryption tag' },
      { tags: ['nsg'], label: 'nsg tag' },
      { tags: ['firewall'], label: 'firewall tag' },
      { tags: ['governance'], label: 'governance tag' },
      { tags: ['policy'], label: 'policy tag' },
      { tags: ['monitoring'], label: 'monitoring tag' },
      { tags: ['backup'], label: 'backup tag' },
    ])('$label increases security score', ({ tags }) => {
      const engine = new ScoringEngine()
      const scenario = makeScenario()

      const { score: baseline } = engine.calculateSecurityComplianceScore([], scenario)
      const { score: withCard } = engine.calculateSecurityComplianceScore(
        [makeCard({ synergyTags: tags })],
        scenario,
      )

      expect(withCard).toBeGreaterThan(baseline)
    })
  })

  // ─── Property 7: requirementsMet ≤ totalRequirements in breakdown ────────────

  describe('Property 7: breakdown.requirementsMet never exceeds totalRequirements', () => {
    it.each([
      {
        requirementValues: [],
        cardTags: ['compute'],
        label: 'no requirements',
      },
      {
        requirementValues: ['compute'],
        cardTags: ['compute'],
        label: 'single requirement met',
      },
      {
        requirementValues: ['compute', 'storage'],
        cardTags: ['compute'],
        label: 'one of two met',
      },
      {
        requirementValues: ['compute', 'storage', 'network'],
        cardTags: ['compute', 'storage', 'network'],
        label: 'all three met',
      },
      {
        requirementValues: ['compute'],
        cardTags: ['compute', 'storage', 'network', 'security'],
        label: 'more card tags than requirements',
      },
    ])('$label', ({ requirementValues, cardTags }) => {
      const engine = new ScoringEngine()
      const requirements = requirementValues.map((value, idx) => ({
        type: 'service' as const,
        value,
        weight: 1,
        description: `req-${idx}`,
      }))
      const scenario = makeScenario({ requirements })
      const cards = [makeCard({ synergyTags: cardTags })]

      const result = engine.calculateScore(cards, scenario)

      expect(result.breakdown.requirementsMet).toBeLessThanOrEqual(
        result.breakdown.totalRequirements,
      )
      expect(result.breakdown.requirementsMet).toBeGreaterThanOrEqual(0)
    })
  })

  // ─── Property 8: PaaS/serverless cards add cost bonus ───────────────────────

  describe('Property 8: paas/serverless tag adds cost-effectiveness bonus over identical cost without it', () => {
    it.each([
      { tag: 'paas', label: 'paas tag' },
      { tag: 'serverless', label: 'serverless tag' },
    ])('$label bonus is reflected in cost score', ({ tag }) => {
      const engine = new ScoringEngine()
      const scenario = makeScenario({ constraints: { maxCost: 100 } })

      // Both cards at 70% utilisation (optimal base = 100) to isolate the bonus
      const cardWithBonus = makeCard({ cost: 70, synergyTags: [tag] })
      const cardWithoutBonus = makeCard({ cost: 70, synergyTags: ['some-other-tag'] })

      const { score: withBonus } = engine.calculateCostEffectivenessScore(
        [cardWithBonus],
        scenario,
      )
      const { score: withoutBonus } = engine.calculateCostEffectivenessScore(
        [cardWithoutBonus],
        scenario,
      )

      // The bonus card should score >= the non-bonus card
      // (clamped to 100, so they may be equal when base is already at ceiling)
      expect(withBonus).toBeGreaterThanOrEqual(withoutBonus)
    })

    it('paas card at under-budget utilisation scores higher than same-cost non-paas card', () => {
      const engine = new ScoringEngine()
      const scenario = makeScenario({ constraints: { maxCost: 100 } })

      // 30% utilisation — under-budget base is proportional and < 100, so bonus matters
      const paasCard = makeCard({ cost: 30, synergyTags: ['paas'] })
      const plainCard = makeCard({ cost: 30, synergyTags: ['compute'] })

      const { score: paasScore } = engine.calculateCostEffectivenessScore([paasCard], scenario)
      const { score: plainScore } = engine.calculateCostEffectivenessScore([plainCard], scenario)

      expect(paasScore).toBeGreaterThan(plainScore)
    })
  })

  // ─── Property 9: Synergy bonuses detected for repeated tags ─────────────────

  describe('Property 9: synergyBonuses lists tags that appear on two or more cards', () => {
    it('shared tag across two cards appears in synergyBonuses', () => {
      const engine = new ScoringEngine()
      const scenario = makeScenario()
      const cards = [
        makeCard({ id: 'c1', synergyTags: ['compute', 'ha'] }),
        makeCard({ id: 'c2', synergyTags: ['compute', 'storage'] }),
      ]

      const result = engine.calculateScore(cards, scenario)

      expect(result.breakdown.synergyBonuses).toContain('compute')
    })

    it('tag on only one card does NOT appear in synergyBonuses', () => {
      const engine = new ScoringEngine()
      const scenario = makeScenario()
      const cards = [
        makeCard({ id: 'c1', synergyTags: ['compute'] }),
        makeCard({ id: 'c2', synergyTags: ['storage'] }),
      ]

      const result = engine.calculateScore(cards, scenario)

      expect(result.breakdown.synergyBonuses).not.toContain('compute')
      expect(result.breakdown.synergyBonuses).not.toContain('storage')
    })

    it.each([
      {
        cards: [
          makeCard({ id: 'a', synergyTags: ['ha', 'paas'] }),
          makeCard({ id: 'b', synergyTags: ['ha', 'serverless'] }),
          makeCard({ id: 'c', synergyTags: ['ha', 'storage'] }),
        ],
        expectedSharedTag: 'ha',
        label: 'ha shared across 3 cards',
      },
      {
        cards: [
          makeCard({ id: 'x', synergyTags: ['identity', 'encryption'] }),
          makeCard({ id: 'y', synergyTags: ['identity', 'governance'] }),
        ],
        expectedSharedTag: 'identity',
        label: 'identity shared across 2 cards',
      },
    ])('$label', ({ cards, expectedSharedTag }) => {
      const engine = new ScoringEngine()
      const scenario = makeScenario()

      const result = engine.calculateScore(cards, scenario)

      expect(result.breakdown.synergyBonuses).toContain(expectedSharedTag)
    })
  })
})
