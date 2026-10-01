/**
 * Property-based tests for ValidationEngine
 *
 * Properties are exercised through multiple explicit parameterised cases
 * (it.each) without relying on external property-testing libraries.
 */

import { describe, it, expect } from 'vitest'
import { ValidationEngine } from '@/engine/validator'
import type { AzureCard, ArchitectureSlot, Scenario } from '@/types/game'

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
    synergyTags: ['compute'],
    requirements: [],
    conflicts: [],
    ...overrides,
  }
}

function makeSlot(overrides: Partial<ArchitectureSlot> = {}): ArchitectureSlot {
  return {
    id: 'slot-1',
    position: { x: 0, y: 0 },
    type: 'compute',
    card: null,
    required: false,
    ...overrides,
  }
}

function makeScenario(overrides: Partial<Scenario> = {}): Scenario {
  return {
    id: 'scen-1',
    title: 'Test',
    description: 'desc',
    category: 'startup-scaling',
    difficulty: 'beginner',
    maxRounds: 5,
    requirements: [],
    constraints: {},
    ...overrides,
  }
}

// ─── Property 1: Validation completes within 500 ms ──────────────────────────

describe('ValidationEngine', () => {
  describe('Property 1: validation completes within 500 ms', () => {
    it('runs validatePlacement 100 times and each call finishes in under 500 ms', () => {
      const engine = new ValidationEngine()
      const card = makeCard()
      const slot = makeSlot()
      const scenario = makeScenario({ constraints: { maxCost: 1000 } })

      for (let i = 0; i < 100; i++) {
        const start = performance.now()
        engine.validatePlacement(card, slot, [], scenario)
        const elapsed = performance.now() - start
        expect(elapsed).toBeLessThan(500)
      }
    })
  })

  // ─── Property 2: Valid placement returns isValid:true ───────────────────────

  describe('Property 2: compatible card + matching slot + no budget violation → isValid:true', () => {
    it.each([
      { tags: ['compute'], slotType: 'compute' as const, cost: 10, maxCost: 100 },
      { tags: ['storage', 'blob'], slotType: 'storage' as const, cost: 5, maxCost: 50 },
      { tags: ['network', 'vpn'], slotType: 'network' as const, cost: 8, maxCost: 80 },
      { tags: ['security', 'identity'], slotType: 'security' as const, cost: 15, maxCost: 200 },
      { tags: ['governance', 'policy'], slotType: 'governance' as const, cost: 3, maxCost: 30 },
    ])(
      'tags=$tags slotType=$slotType cost=$cost maxCost=$maxCost',
      ({ tags, slotType, cost, maxCost }) => {
        const engine = new ValidationEngine()
        const card = makeCard({ synergyTags: tags, cost })
        const slot = makeSlot({ type: slotType })
        const scenario = makeScenario({ constraints: { maxCost } })

        const result = engine.validatePlacement(card, slot, [], scenario)

        expect(result.isValid).toBe(true)
        expect(result.violations).toHaveLength(0)
      },
    )
  })

  // ─── Property 3: Incompatible slot type returns a violation ──────────────────

  describe('Property 3: card with storage tags placed in compute slot → requirement-unmet violation', () => {
    it.each([
      { cardTags: ['storage'], slotType: 'compute' as const },
      { cardTags: ['blob', 'disk'], slotType: 'network' as const },
      { cardTags: ['compute', 'serverless'], slotType: 'storage' as const },
      { cardTags: ['governance'], slotType: 'compute' as const },
      { cardTags: ['network'], slotType: 'security' as const },
    ])('cardTags=$cardTags in $slotType slot → violation', ({ cardTags, slotType }) => {
      const engine = new ValidationEngine()
      const card = makeCard({ synergyTags: cardTags })
      const slot = makeSlot({ type: slotType })
      const scenario = makeScenario()

      const result = engine.validatePlacement(card, slot, [], scenario)

      expect(result.isValid).toBe(false)
      const types = result.violations.map((v) => v.type)
      expect(types).toContain('requirement-unmet')
    })
  })

  // ─── Property 4: Budget exceeded returns cost-exceeded violation ─────────────

  describe('Property 4: budget exceeded → cost-exceeded violation', () => {
    it.each([
      { maxCost: 10, cardCost: 20 },
      { maxCost: 0, cardCost: 1 },
      { maxCost: 50, cardCost: 51 },
      { maxCost: 100, cardCost: 101 },
      { maxCost: 5, cardCost: 100 },
    ])('maxCost=$maxCost cardCost=$cardCost', ({ maxCost, cardCost }) => {
      const engine = new ValidationEngine()
      // Use an 'any' slot so slot-type mismatch doesn't interfere
      const card = makeCard({ cost: cardCost, synergyTags: ['compute'] })
      const slot = makeSlot({ type: 'any' })
      const scenario = makeScenario({ constraints: { maxCost } })

      const result = engine.validatePlacement(card, slot, [], scenario)

      expect(result.isValid).toBe(false)
      const costViolation = result.violations.find((v) => v.type === 'cost-exceeded')
      expect(costViolation).toBeDefined()
    })
  })

  // ─── Property 5: Budget violations carry correct numericDetail ───────────────

  describe('Property 5: cost-exceeded violation numericDetail equals the actual overrun', () => {
    it.each([
      { maxCost: 10, cardCost: 20, expectedOverrun: 10 },
      { maxCost: 50, cardCost: 75, expectedOverrun: 25 },
      { maxCost: 100, cardCost: 150, expectedOverrun: 50 },
      { maxCost: 0, cardCost: 5, expectedOverrun: 5 },
      { maxCost: 30, cardCost: 31, expectedOverrun: 1 },
    ])(
      'maxCost=$maxCost cardCost=$cardCost overrun=$expectedOverrun',
      ({ maxCost, cardCost, expectedOverrun }) => {
        const engine = new ValidationEngine()
        const card = makeCard({ cost: cardCost, synergyTags: ['compute'] })
        const slot = makeSlot({ type: 'any' })
        const scenario = makeScenario({ constraints: { maxCost } })

        const result = engine.validatePlacement(card, slot, [], scenario)

        const costViolation = result.violations.find((v) => v.type === 'cost-exceeded')
        expect(costViolation).toBeDefined()
        expect(costViolation!.numericDetail).toBe(expectedOverrun)
      },
    )
  })

  // ─── Property 6: Conflict detection is symmetric ─────────────────────────────

  describe('Property 6: conflict detection is symmetric — A declares conflict with B ≡ B declares conflict with A', () => {
    it.each([
      { aId: 'card-a', bId: 'card-b', declarer: 'a' as const },
      { aId: 'card-x', bId: 'card-y', declarer: 'b' as const },
      { aId: 'svc-1', bId: 'svc-2', declarer: 'a' as const },
      { aId: 'foo', bId: 'bar', declarer: 'b' as const },
    ])('$aId conflicts $bId (declared by $declarer)', ({ aId, bId, declarer }) => {
      const engine = new ValidationEngine()

      // Build cards where only one side declares the conflict
      const cardA = makeCard({
        id: aId,
        synergyTags: ['compute'],
        conflicts: declarer === 'a' ? [bId] : [],
      })
      const cardB = makeCard({
        id: bId,
        synergyTags: ['compute'],
        conflicts: declarer === 'b' ? [aId] : [],
      })

      // Place cardA on the board, then try to place cardB
      const slotWithA = makeSlot({ id: 'slot-a', card: cardA })
      const slot = makeSlot({ id: 'slot-b', type: 'any' })
      const scenario = makeScenario()

      const result = engine.validatePlacement(cardB, slot, [slotWithA], scenario)

      expect(result.violations.some((v) => v.type === 'conflict-detected')).toBe(true)
    })
  })

  // ─── Property 7: Missing requirements trigger a violation ────────────────────

  describe('Property 7: unmet requirements → requirement-unmet violation', () => {
    it.each([
      { requiredIds: ['req-card'], placedIds: [] },
      { requiredIds: ['card-a', 'card-b'], placedIds: ['card-a'] },
      { requiredIds: ['dep-1', 'dep-2', 'dep-3'], placedIds: [] },
      { requiredIds: ['only-one'], placedIds: ['wrong-id'] },
    ])('requires=$requiredIds placed=$placedIds', ({ requiredIds, placedIds }) => {
      const engine = new ValidationEngine()
      const card = makeCard({ id: 'main-card', requirements: requiredIds, synergyTags: ['compute'] })

      // Build current slots from placedIds
      const currentSlots: ArchitectureSlot[] = placedIds.map((pid, idx) =>
        makeSlot({
          id: `existing-slot-${idx}`,
          card: makeCard({ id: pid, synergyTags: ['compute'] }),
        }),
      )

      const slot = makeSlot({ type: 'any' })
      const scenario = makeScenario()

      const result = engine.validatePlacement(card, slot, currentSlots, scenario)

      expect(result.isValid).toBe(false)
      expect(result.violations.some((v) => v.type === 'requirement-unmet')).toBe(true)
    })
  })

  // ─── Property 8: Anti-pattern in premium security scenario ───────────────────

  describe('Property 8: storage card without security in premium scenario → anti-pattern violation', () => {
    it.each([
      { cardTags: ['storage'], placedTags: [] },
      { cardTags: ['storage', 'blob'], placedTags: ['compute'] },
      { cardTags: ['storage', 'disk'], placedTags: ['network'] },
      { cardTags: ['storage', 'files'], placedTags: ['governance'] },
    ])(
      'cardTags=$cardTags, placed (no security)=$placedTags → anti-pattern',
      ({ cardTags, placedTags }) => {
        const engine = new ValidationEngine()
        const card = makeCard({ synergyTags: cardTags })
        const slot = makeSlot({ type: 'any' })
        const scenario = makeScenario({ constraints: { securityLevel: 'premium' } })

        // Board has cards without 'security' tags
        const currentSlots: ArchitectureSlot[] = placedTags.map((tag, idx) =>
          makeSlot({
            id: `placed-slot-${idx}`,
            card: makeCard({ id: `placed-${idx}`, synergyTags: [tag] }),
          }),
        )

        const result = engine.validatePlacement(card, slot, currentSlots, scenario)

        expect(result.violations.some((v) => v.type === 'anti-pattern')).toBe(true)
      },
    )

    it('does NOT flag anti-pattern when security card already on board', () => {
      const engine = new ValidationEngine()
      const storageCard = makeCard({ synergyTags: ['storage'] })
      const slot = makeSlot({ type: 'any' })
      const scenario = makeScenario({ constraints: { securityLevel: 'premium' } })

      const securitySlot = makeSlot({
        id: 'security-slot',
        card: makeCard({ id: 'sec-card', synergyTags: ['security', 'encryption'] }),
      })

      const result = engine.validatePlacement(storageCard, slot, [securitySlot], scenario)

      const antiPatterns = result.violations.filter((v) => v.type === 'anti-pattern')
      expect(antiPatterns).toHaveLength(0)
    })
  })

  // ─── Property 9: 'any' slot accepts any card type ────────────────────────────

  describe("Property 9: 'any' slot accepts any card regardless of synergyTags", () => {
    it.each([
      [['compute']],
      [['storage', 'blob']],
      [['network', 'vpn']],
      [['security', 'identity']],
      [['governance', 'policy']],
      [['serverless']],
      [['paas']],
      [['some-unknown-tag']],
    ])('card with tags %o in any slot has no slot-type violation', (tags: string[]) => {
      const engine = new ValidationEngine()
      const card = makeCard({ synergyTags: tags, cost: 1 })
      const slot = makeSlot({ type: 'any' })
      const scenario = makeScenario({ constraints: { maxCost: 1000 } })

      const result = engine.validatePlacement(card, slot, [], scenario)

      // No slot-mismatch violation (there may be other violations from other rules
      // but we only care that the 'any' slot itself never causes a rejection)
      const slotViolations = result.violations.filter(
        (v) => v.type === 'requirement-unmet' && v.message.includes('slot'),
      )
      expect(slotViolations).toHaveLength(0)
    })
  })

  // ─── Property 10: Empty board always allows valid placement ──────────────────

  describe('Property 10: empty board (no prior cards) allows valid placement when no constraints violated', () => {
    it.each([
      { tags: ['compute'], slotType: 'compute' as const, maxCost: 100, cost: 10 },
      { tags: ['storage'], slotType: 'storage' as const, maxCost: 50, cost: 5 },
      { tags: ['network'], slotType: 'network' as const, maxCost: 200, cost: 20 },
      { tags: ['security'], slotType: 'security' as const, maxCost: 500, cost: 15 },
    ])('$tags in $slotType slot on empty board', ({ tags, slotType, maxCost, cost }) => {
      const engine = new ValidationEngine()
      const card = makeCard({ synergyTags: tags, cost })
      const slot = makeSlot({ type: slotType })
      const scenario = makeScenario({ constraints: { maxCost } })

      // currentSlots is empty — no prior cards
      const result = engine.validatePlacement(card, slot, [], scenario)

      expect(result.isValid).toBe(true)
      expect(result.violations).toHaveLength(0)
    })
  })
})
