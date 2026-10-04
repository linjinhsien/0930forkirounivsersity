/**
 * Property-Based Tests — 難度系統
 *
 * 對應 steering/pbt-properties.md 的 Property D-1 ~ D-4
 * 對應 requirements.md Requirement 6.1 ~ 6.6
 *
 * 直接測試 player store 的 adjustDifficulty 邏輯（純邏輯，不依賴 localStorage）
 */

import { describe, it, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { setActivePinia, createPinia } from 'pinia'
import { usePlayerStore } from '@/stores/player'
import type { PlayerProfile } from '@/types/game'

const VALID_TIERS: PlayerProfile['difficultyTier'][] = ['beginner', 'intermediate', 'advanced']

describe('PBT / 難度系統', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  /**
   * Property D-1：難度值域限制
   * 任意勝負序列後，difficulty 只能是三種合法值之一
   */
  it('D-1: 難度永遠是合法的三種值之一', () => {
    fc.assert(
      fc.property(
        // 產生一組隨機勝負序列（true=勝, false=敗），長度 1~20
        fc.array(fc.boolean(), { minLength: 1, maxLength: 20 }),
        (results) => {
          const store = usePlayerStore()
          store.initializeProfile()

          for (const won of results) {
            store.recordMatchResult(won)
          }

          return VALID_TIERS.includes(store.profile!.difficultyTier)
        }
      ),
      { numRuns: 300 }
    )
  })

  /**
   * Property D-2：Beginner 底部邊界
   * 從 beginner 開始，任意次連敗後不會低於 beginner
   */
  it('D-2: Beginner 連敗後仍維持 beginner（不往下降）', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 30 }), (lossCount) => {
        const store = usePlayerStore()
        store.initializeProfile({ difficultyTier: 'beginner' })

        for (let i = 0; i < lossCount; i++) {
          store.recordMatchResult(false)
        }

        return store.profile!.difficultyTier === 'beginner'
      }),
      { numRuns: 200 }
    )
  })

  /**
   * Property D-3：Advanced 頂部邊界
   * 從 advanced 開始，任意次連勝後不會超過 advanced
   */
  it('D-3: Advanced 連勝後仍維持 advanced（不往上升）', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 30 }), (winCount) => {
        const store = usePlayerStore()
        store.initializeProfile({ difficultyTier: 'advanced' })

        for (let i = 0; i < winCount; i++) {
          store.recordMatchResult(true)
        }

        return store.profile!.difficultyTier === 'advanced'
      }),
      { numRuns: 200 }
    )
  })

  /**
   * Property D-4：升降一次最多一級
   * 每次 recordMatchResult 後，難度等級變化幅度不超過 1
   */
  it('D-4: 每場比賽難度最多變化一級', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_TIERS),
        // 連勝/連敗數（0~4），超過3才觸發升降
        fc.integer({ min: 0, max: 4 }),
        fc.boolean(),
        (startTier, consecutiveCount, nextResult) => {
          const store = usePlayerStore()

          // 模擬已有 consecutiveCount 次相同結果的狀態
          const stats = {
            matchesPlayed: consecutiveCount,
            matchesWon: nextResult ? consecutiveCount : 0,
            consecutiveWins: nextResult ? consecutiveCount : 0,
            consecutiveLosses: nextResult ? 0 : consecutiveCount,
          }
          store.initializeProfile({ difficultyTier: startTier, stats })

          const beforeIndex = VALID_TIERS.indexOf(store.profile!.difficultyTier)
          store.recordMatchResult(nextResult)
          const afterIndex = VALID_TIERS.indexOf(store.profile!.difficultyTier)

          // 最多移動一級
          return Math.abs(afterIndex - beforeIndex) <= 1
        }
      ),
      { numRuns: 400 }
    )
  })
})
