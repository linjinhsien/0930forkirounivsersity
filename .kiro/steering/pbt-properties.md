---
inclusion: always
---

# Property-Based Testing (PBT) — Kiro IDE Spec Correctness Guide

> Aligned with [Kiro Spec Correctness (`https://kiro.dev/docs/specs/correctness/`)](https://kiro.dev/docs/specs/correctness/).

## How Property-Based Testing Works in Kiro IDE

Property-based testing (PBT) is a **Kiro IDE Spec feature** that increases confidence in AI-generated code by moving away from example-based tests and enforcing universal rules (**Correctness Properties**) that must always hold across the entire input space:

1. **Requirements Phase (`.kiro/specs/azure-az900-card-clash-engine/requirements.md`)**
   - Requirements are authored using **EARS** (`WHEN ... THE Game_Engine SHALL ...`).
2. **Design Phase (`.kiro/specs/azure-az900-card-clash-engine/design.md` → `## Correctness Properties`)**
   - Kiro extracts testable universal invariants (`*For any* ... SHALL ...`) from the requirements and links each property back via `**Validates: Requirements X.Y**`.
3. **Tasks Phase (`.kiro/specs/azure-az900-card-clash-engine/tasks.md`)**
   - Kiro generates **optional (`*`) property test tasks** (e.g., `14.1*`, `15.1*`, `18.*`, `20.*`, `22.*`, `48.*`, `53.1*`). Because PBTs are optional by default (`*`), you can build the core implementation first and then run property checks in Kiro IDE to verify the implementation matches your spec intent.
4. **Execution & Shrinking (`fast-check` + `vitest`)**
   - Each property test runs hundreds of randomized inputs (`numRuns >= 100`) and includes Kiro's traceability tag:
     ```ts
     // Feature: azure-az900-card-clash-engine, Property N: <Property Title>
     // Validates: Requirements X.Y
     ```
   - When a property fails, `fast-check` shrinks the failure to a minimal counterexample so Kiro IDE can either fix the code or refine the specification.

---

## 1. 計分引擎不變性（Requirement 1.3, 1.4, 4.1–4.3）

Source: `src/engine/scoring.ts` — `ScoringEngine`  
Spec Design Properties: **Property 3, Property 4, Property 9, Property 10, Property 11**

### Property S-1（對應 Design Property 4 & Property 9）：子分數範圍
> *For any* valid card deck and scenario, `highAvailability`, `costEffectiveness`, and `securityCompliance` SHALL each fall within the closed interval **`[0, 100]`**.  
> **Validates: Requirements 1.4, 4.1**

### Property S-2（對應 Design Property 4 & Property 9）：總分等於三項之和
> *For any* valid card deck and scenario, `total === highAvailability + costEffectiveness + securityCompliance` (`[0, 300]`).  
> **Validates: Requirements 1.4, 4.1**

### Property S-3（對應 Design Property 3）：空牌組不產生負分
> *For any* scenario, when `placedCards` is empty (`[]`), all component scores SHALL be `>= 0` and `total >= 0`.  
> **Validates: Requirements 1.3**

### Property S-4（對應 Design Property 10）：多人勝負一致性
> *For any* two player solutions with different `total` scores on the same scenario, the player with the higher `total` score SHALL be declared the winner.  
> **Validates: Requirements 4.2**

### Property S-5（對應 Design Property 9 & Property 11）：平局對稱性與計算確定性
> *For any* card deck and scenario, evaluating the same solution twice SHALL produce identical scores (`totalA === totalB`), and identical scores SHALL result in a `'tie'`.  
> **Validates: Requirements 4.1, 4.3**

---

## 2. 難度系統不變性（Requirement 6.1–6.6）

Source: `src/stores/player.ts` — `recordMatchResult` / `adjustDifficulty`  
Spec Design Properties: **Property 17, Property 18, Property 19**

### Property D-1（對應 Design Property 17 & 18）：難度值域限制
> *For any* sequence of match outcomes, `difficultyTier` SHALL always be one of `'beginner' | 'intermediate' | 'advanced'`.  
> **Validates: Requirements 6.3**

### Property D-2（對應 Design Property 18）：Beginner 底部邊界
> *For any* loss streak starting at `'beginner'`, `difficultyTier` SHALL remain `'beginner'` without decreasing further.  
> **Validates: Requirements 6.2, 6.5**

### Property D-3（對應 Design Property 17）：Advanced 頂部邊界
> *For any* win streak starting at `'advanced'`, `difficultyTier` SHALL remain `'advanced'` without increasing further.  
> **Validates: Requirements 6.1, 6.6**

### Property D-4（對應 Design Property 17 & 18）：升降一次最多一級
> *For any* single match result, `difficultyTier` SHALL change by at most 1 level (`|afterIndex - beforeIndex| <= 1`).  
> **Validates: Requirements 6.1, 6.2**

---

## 3. Study Deck 不變性（Requirement 5.5–5.6）

Source: `src/stores/player.ts` & `src/stores/codex.ts` — Study Deck 操作  
Spec Design Properties: **Property 15, Property 16**

### Property SD-1（對應 Design Property 16）：加入重複牌後長度不增加
> *For any* study deck already containing card `X`, adding card `X` again SHALL NOT increase `studyDeck.length`.  
> **Validates: Requirements 5.6**

### Property SD-2（對應 Design Property 15）：加入新牌後長度恰好 +1
> *For any* study deck not containing card `X`, adding card `X` SHALL increase `studyDeck.length` by exactly `1`.  
> **Validates: Requirements 5.5**

### Property SD-3（對應 Design Property 16）：Study Deck 無重複項目
> *For any* sequence of card additions, all card IDs in `studyDeck` SHALL be unique (`new Set(deck).size === deck.length`).  
> **Validates: Requirements 5.6**

---

## 4. Session 到期不變性（Requirement 7.1–7.3）

Source: `src/utils/sessionExpiration.ts`  
Spec Design Properties: **Property 20, Property 21**

### Property SE-1（對應 Design Property 21）：7 天內不過期
> *For any* save timestamp `savedAt` and current time `now`, if `now - savedAt < 7 * 24 * 60 * 60 * 1000` (`604,800,000 ms`), `isSessionExpired` SHALL return `false`.  
> **Validates: Requirements 7.3**

### Property SE-2（對應 Design Property 21）：超過 7 天必過期
> *For any* save timestamp `savedAt` and current time `now`, if `now - savedAt >= 7 * 24 * 60 * 60 * 1000` (`604,800,000 ms`), `isSessionExpired` SHALL return `true`.  
> **Validates: Requirements 7.3**

### Property SE-3（對應 Design Property 21）：邊界對稱性
> *For any* save timestamp `savedAt` and current time `now`, `SE-1` (valid) and `SE-2` (expired) SHALL be mutually exclusive and exhaustive.  
> **Validates: Requirements 7.3**

---

## 5. Kiro IDE Spec Tasks 與測試檔案對應表

| Kiro `tasks.md` Task | `design.md` Correctness Properties | Steering ID | Vitest + `fast-check` 測試檔案 |
|---|---|---|---|
| `18.*` ValidationEngine PBT | Property 1, 2, 5 | — | `tests/unit/engine/validator.test.ts` |
| `20.*` ScoringEngine PBT | Property 3, 4, 6, 9 | `S-1` ~ `S-5` | `src/__tests__/pbt/scoring.pbt.test.ts`, `tests/unit/engine/scoring.test.ts` |
| `22.*` EvaluatorEngine PBT | Property 10, 11, 12 | `S-4`, `S-5` | `tests/unit/engine/evaluator.test.ts`, `src/__tests__/pbt/scoring.pbt.test.ts` |
| `14.1*` Difficulty Scaling PBT | Property 17, 18, 19 | `D-1` ~ `D-4` | `src/__tests__/pbt/difficulty.pbt.test.ts` |
| `15.1*` Study Deck PBT | Property 13, 14, 15, 16 | `SD-1` ~ `SD-3` | `src/__tests__/pbt/studyDeck.pbt.test.ts` |
| `48.*` I18n Completeness PBT | Property 22, 23 | — | `tests/unit/i18n/translations.test.ts` |
| `53.1*` Session Expiration PBT | Property 20, 21 | `SE-1` ~ `SE-3` | `src/__tests__/pbt/sessionExpiration.pbt.test.ts` |
