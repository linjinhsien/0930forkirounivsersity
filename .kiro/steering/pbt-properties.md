# Property-Based Testing Properties

This document defines the universal properties (invariants) extracted from the
`azure-az900-card-clash-engine` spec requirements. Use this as a reference when
Kiro IDE generates PBTs, and as the canonical source for the equivalent
`fast-check` Vitest tests in `src/__tests__/pbt/`.

---

## 1. 計分引擎不變性（Requirement 1.3 / Requirement 4.1）

Source: `src/engine/scoring.ts` — `ScoringEngine`

### Property S-1：子分數範圍
> 對任意合法牌組與場景，`highAvailability`、`costEffectiveness`、`securityCompliance`
> 三個子分數必須各自落在 **[0, 100]** 的閉區間內。

### Property S-2：總分等於三項之和
> 對任意合法牌組與場景，`total === highAvailability + costEffectiveness + securityCompliance`。

### Property S-3：空牌組不產生負分
> 當 `placedCards` 為空陣列時，所有子分數 ≥ 0，`total` ≥ 0。

### Property S-4：多人勝負一致性
> 若玩家 A 的 `total` > 玩家 B 的 `total`，則勝者必定是 A（無例外）。

### Property S-5：平局對稱性
> 若 `totalA === totalB`，則兩人均不應被宣告為單方勝者。

---

## 2. 難度系統不變性（Requirement 6.1–6.6）

Source: `src/stores/game.ts` — 難度調整邏輯

### Property D-1：難度值域限制
> 在任何遊戲狀態下，`difficulty` 只能為 `'beginner' | 'intermediate' | 'advanced'`，
> 不得出現其他字串或 `undefined`。

### Property D-2：Beginner 底部邊界
> 當 `difficulty === 'beginner'` 且玩家連敗任意次數，`difficulty` 仍為 `'beginner'`。

### Property D-3：Advanced 頂部邊界
> 當 `difficulty === 'advanced'` 且玩家連勝任意次數，`difficulty` 仍為 `'advanced'`。

### Property D-4：升降一次最多一級
> 任意一次勝負結果，`difficulty` 的變化幅度不超過一個等級。

---

## 3. Study Deck 不變性（Requirement 5.5–5.6）

Source: `src/stores/codex.ts` — Study Deck 操作

### Property SD-1：加入重複牌後長度不增加
> 若牌 X 已存在於 Study Deck，再次加入牌 X 後，`deck.length` 維持不變。

### Property SD-2：加入新牌後長度恰好 +1
> 若牌 X 不存在於 Study Deck，加入後 `deck.length` 恰好增加 1。

### Property SD-3：Study Deck 無重複項目
> 在任何操作序列後，Study Deck 中每張牌的 `id` 都是唯一的（無重複）。

---

## 4. Session 到期不變性（Requirement 7.3）

Source: `src/utils/sessionExpiration.ts`

### Property SE-1：7 天內不過期
> 對任意儲存時間戳 `savedAt`，若 `now - savedAt < 7 * 24 * 60 * 60 * 1000`，
> 則 session 狀態為 `valid`（非 expired）。

### Property SE-2：超過 7 天必過期
> 對任意儲存時間戳 `savedAt`，若 `now - savedAt >= 7 * 24 * 60 * 60 * 1000`，
> 則 session 狀態為 `expired`。

### Property SE-3：邊界對稱性
> SE-1 與 SE-2 的條件互斥且完備——不存在時間差使兩者同時成立或同時不成立。

---

## 測試檔案對應

| Property Group | Vitest PBT 檔案 |
|---|---|
| 計分引擎 (S-1 ~ S-5) | `src/__tests__/pbt/scoring.pbt.test.ts` |
| 難度系統 (D-1 ~ D-4) | `src/__tests__/pbt/difficulty.pbt.test.ts` |
| Study Deck (SD-1 ~ SD-3) | `src/__tests__/pbt/studyDeck.pbt.test.ts` |
| Session 到期 (SE-1 ~ SE-3) | `src/__tests__/pbt/sessionExpiration.pbt.test.ts` |
