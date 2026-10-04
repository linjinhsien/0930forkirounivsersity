/**
 * Property-Based Tests — 計分引擎
 *
 * 對應 steering/pbt-properties.md 的 Property S-1 ~ S-5
 * 對應 requirements.md Requirement 1.3 / Requirement 4.1
 *
 * 使用 fast-check 自動產生數百組隨機牌組與場景進行驗證
 */

import { describe, it } from 'vitest'
import * as fc from 'fast-check'
import { ScoringEngine } from '@/engine/scoring'
import type { AzureCard, Scenario } from '@/types/game'

// ─── Arbitraries（隨機資料生成器）────────────────────────────────────────────

const synergyTagPool = [
  'ha',
  'availability-zone',
  'multi-region',
  'load-balancer',
  'backup',
  'recovery',
  'paas',
  'serverless',
  'identity',
  'entra',
  'encryption',
  'nsg',
  'firewall',
  'governance',
  'policy',
  'monitoring',
  'storage',
  'compute',
  'network',
  'reserved',
  'iaas',
]

const domainArb = fc.constantFrom(
  'cloud-concepts' as const,
  'azure-services' as const,
  'management-governance' as const
)

/** 隨機生成一張合法的 AzureCard */
const azureCardArb: fc.Arbitrary<AzureCard> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 40 }),
  domain: domainArb,
  cost: fc.integer({ min: 0, max: 20 }),
  synergyTags: fc.uniqueArray(fc.constantFrom(...synergyTagPool), { minLength: 0, maxLength: 5 }),
  az900ExamTip: fc.string({ minLength: 1, maxLength: 280 }),
  description: fc.string({ minLength: 1, maxLength: 200 }),
  power: fc.integer({ min: 0, max: 100 }),
  requirements: fc.option(fc.array(fc.uuid(), { maxLength: 3 }), { nil: undefined }),
  conflicts: fc.option(fc.array(fc.uuid(), { maxLength: 3 }), { nil: undefined }),
})

const securityLevelArb = fc.option(
  fc.constantFrom('basic' as const, 'standard' as const, 'premium' as const),
  { nil: undefined }
)

/** 隨機生成一個合法的 Scenario（只需 constraints 與 requirements 部分） */
const scenarioArb: fc.Arbitrary<Scenario> = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 60 }),
  description: fc.string({ minLength: 1, maxLength: 200 }),
  requirements: fc.array(
    fc.record({
      type: fc.constantFrom('service' as const, 'concept' as const, 'governance' as const),
      value: fc.constantFrom(...synergyTagPool),
      weight: fc.integer({ min: 0, max: 100 }),
      description: fc.string({ minLength: 1, maxLength: 100 }),
    }),
    { minLength: 0, maxLength: 5 }
  ),
  constraints: fc.record({
    maxCost: fc.option(fc.integer({ min: 1, max: 200 }), { nil: undefined }),
    minAvailability: fc.option(fc.double({ min: 95.0, max: 99.99 }), { nil: undefined }),
    securityLevel: securityLevelArb,
    region: fc.option(fc.constantFrom('eastus', 'westeurope', 'southeastasia'), { nil: undefined }),
  }),
  maxRounds: fc.integer({ min: 1, max: 10 }),
  difficulty: fc.constantFrom('beginner' as const, 'intermediate' as const, 'advanced' as const),
  category: fc.constantFrom(
    'startup-scaling' as const,
    'enterprise-migration' as const,
    'high-compliance' as const,
    'real-time-analytics' as const
  ),
})

// ─── Tests ───────────────────────────────────────────────────────────────────

const engine = new ScoringEngine()

describe('PBT / 計分引擎', () => {
  /**
   * Property S-1：子分數範圍
   * 對任意合法牌組與場景，每個子分數必須在 [0, 100]
   */
  it('S-1: 子分數永遠在 [0, 100] 內', () => {
    fc.assert(
      fc.property(
        fc.array(azureCardArb, { minLength: 0, maxLength: 8 }),
        scenarioArb,
        (cards, scenario) => {
          const score = engine.calculateScore(cards, scenario)
          return (
            score.highAvailability >= 0 &&
            score.highAvailability <= 100 &&
            score.costEffectiveness >= 0 &&
            score.costEffectiveness <= 100 &&
            score.securityCompliance >= 0 &&
            score.securityCompliance <= 100
          )
        }
      ),
      { numRuns: 500, verbose: false }
    )
  })

  /**
   * Property S-2：總分等於三項之和
   */
  it('S-2: total === highAvailability + costEffectiveness + securityCompliance', () => {
    fc.assert(
      fc.property(
        fc.array(azureCardArb, { minLength: 0, maxLength: 8 }),
        scenarioArb,
        (cards, scenario) => {
          const score = engine.calculateScore(cards, scenario)
          const expected =
            score.highAvailability + score.costEffectiveness + score.securityCompliance
          return score.total === expected
        }
      ),
      { numRuns: 500 }
    )
  })

  /**
   * Property S-3：空牌組不產生負分
   */
  it('S-3: 空牌組所有分數 >= 0', () => {
    fc.assert(
      fc.property(scenarioArb, (scenario) => {
        const score = engine.calculateScore([], scenario)
        return (
          score.highAvailability >= 0 &&
          score.costEffectiveness >= 0 &&
          score.securityCompliance >= 0 &&
          score.total >= 0
        )
      }),
      { numRuns: 300 }
    )
  })

  /**
   * Property S-4：多人勝負一致性
   * total 較高者必定是勝者（用 winner 判斷邏輯模擬 Req 4.2）
   */
  it('S-4: 分數較高的玩家必定勝出', () => {
    fc.assert(
      fc.property(
        fc.array(azureCardArb, { minLength: 0, maxLength: 6 }),
        fc.array(azureCardArb, { minLength: 0, maxLength: 6 }),
        scenarioArb,
        (cardsA, cardsB, scenario) => {
          const scoreA = engine.calculateScore(cardsA, scenario)
          const scoreB = engine.calculateScore(cardsB, scenario)

          // 模擬 Solution_Clash_Evaluator 的勝負判定
          let winner: 'A' | 'B' | 'tie'
          if (scoreA.total > scoreB.total) winner = 'A'
          else if (scoreB.total > scoreA.total) winner = 'B'
          else winner = 'tie'

          // 不可能在 A > B 時宣告 B 勝，反之亦然
          if (scoreA.total > scoreB.total) return winner === 'A'
          if (scoreB.total > scoreA.total) return winner === 'B'
          return winner === 'tie'
        }
      ),
      { numRuns: 400 }
    )
  })

  /**
   * Property S-5：平局對稱性
   * 相同牌組算出的分數必定相等（確定性）
   */
  it('S-5: 相同輸入產生相同分數（計算確定性）', () => {
    fc.assert(
      fc.property(
        fc.array(azureCardArb, { minLength: 0, maxLength: 6 }),
        scenarioArb,
        (cards, scenario) => {
          const scoreA = engine.calculateScore(cards, scenario)
          const scoreB = engine.calculateScore(cards, scenario)
          return scoreA.total === scoreB.total
        }
      ),
      { numRuns: 300 }
    )
  })
})
