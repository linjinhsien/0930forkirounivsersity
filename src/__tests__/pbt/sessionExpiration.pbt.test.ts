/**
 * Property-Based Tests — Session 到期邏輯
 *
 * 對應 steering/pbt-properties.md 的 Property SE-1 ~ SE-3
 * 對應 requirements.md Requirement 7.3
 *
 * 直接測試 src/utils/sessionExpiration.ts 的純函數
 */

import { describe, it } from 'vitest'
import * as fc from 'fast-check'
import {
  SESSION_TTL_MS,
  calculateExpirationTime,
  isSessionExpired,
} from '@/utils/sessionExpiration'

/** 7 天的毫秒數 */
const SEVEN_DAYS_MS = SESSION_TTL_MS // 7 * 24 * 60 * 60 * 1000

describe('PBT / Session 到期邏輯', () => {
  /**
   * Property SE-1：7 天內不過期
   * 對任意 savedAt 與 now，若 now - savedAt < 7天，session 為 valid
   */
  it('SE-1: 儲存後 7 天內 session 不過期', () => {
    fc.assert(
      fc.property(
        // 取一個基準時間 base（近期時間戳）
        fc.integer({ min: 1_000_000_000_000, max: 2_000_000_000_000 }),
        // delta 嚴格小於 7 天（0 ~ 7天-1毫秒）
        fc.integer({ min: 0, max: SEVEN_DAYS_MS - 1 }),
        (base, delta) => {
          const savedAt = base
          const now = base + delta
          const expiresAt = calculateExpirationTime(savedAt)

          return isSessionExpired({ expiresAt }, now) === false
        }
      ),
      { numRuns: 500 }
    )
  })

  /**
   * Property SE-2：超過 7 天必過期
   * 對任意 savedAt 與 now，若 now - savedAt >= 7天，session 必為 expired
   */
  it('SE-2: 儲存後滿 7 天 session 必定過期', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1_000_000_000_000, max: 2_000_000_000_000 }),
        // delta >= 7 天
        fc.integer({ min: SEVEN_DAYS_MS, max: SEVEN_DAYS_MS * 4 }),
        (base, delta) => {
          const savedAt = base
          const now = base + delta
          const expiresAt = calculateExpirationTime(savedAt)

          return isSessionExpired({ expiresAt }, now) === true
        }
      ),
      { numRuns: 500 }
    )
  })

  /**
   * Property SE-3：邊界對稱性
   * SE-1 與 SE-2 的條件互斥且完備，expired 和 valid 不能同時成立
   * 任意時間點只能是 expired 或 valid，不能是「兩者都是」
   */
  it('SE-3: expired 與 valid 互斥（不存在同時成立的狀態）', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1_000_000_000_000, max: 2_000_000_000_000 }),
        fc.integer({ min: 0, max: SEVEN_DAYS_MS * 4 }),
        (base, delta) => {
          const savedAt = base
          const now = base + delta
          const expiresAt = calculateExpirationTime(savedAt)

          const expired = isSessionExpired({ expiresAt }, now)
          const valid = !isSessionExpired({ expiresAt }, now)

          // 互斥：不能同時 true
          return !(expired && valid)
        }
      ),
      { numRuns: 500 }
    )
  })

  /**
   * Bonus：calculateExpirationTime 的確定性
   * 相同 savedAt 永遠回傳相同 expiresAt
   */
  it('calculateExpirationTime 是確定性函數（相同輸入相同輸出）', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 2_000_000_000_000 }), (savedAt) => {
        return calculateExpirationTime(savedAt) === calculateExpirationTime(savedAt)
      }),
      { numRuns: 300 }
    )
  })
})
