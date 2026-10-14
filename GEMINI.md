# GEMINI.md - 專案指引與設定 (zh-TW)

## 專案簡介
本專案為 **Azure AZ-900 Card Clash** 互動卡牌遊戲，基於 Vue 3 + TypeScript + Vite + Tailwind CSS + Vitest + Playwright 建構。專案亦支援 Kiro AI IDE / CLI 相關自動化設定。

---

## Kiro 配置說明

### 1. Hooks (自動化掛鉤)
- **目錄路徑**: `.kiro/hooks/`
- **設定檔**: [lint-on-save.json](file:///C:/Users/iven8/Downloads/0930forkirounivsersity/.kiro/hooks/lint-on-save.json)
- **功能 (Lesson 3 增強版 - 方案 A)**:
  - 觸發時機 (`trigger`): `PostFileSave`（檔案儲存後自動觸發）
  - 比對模式 (`matcher`): `\.(ts|tsx|vue)$`（涵蓋 TypeScript 與 Vue 單檔案元件）
  - 執行動作 (`action`): `npx eslint --fix {{filePath}}` 採用增量修正，大幅提升單檔存檔效能

```json
{
  "version": "v1",
  "hooks": [
    {
      "name": "Lint on save",
      "trigger": "PostFileSave",
      "matcher": "\\.(ts|tsx|vue)$",
      "action": {
        "type": "command",
        "command": "npx eslint --fix {{filePath}}"
      }
    }
  ]
}
```

### 2. Spec Correctness & PBT (Lesson 4 屬性測試 — Kiro IDE 規範)
- **Kiro IDE Spec 來源 (`https://kiro.dev/docs/specs/correctness/`)**:
  - `.kiro/specs/azure-az900-card-clash-engine/requirements.md`（EARS 需求規格）
  - `.kiro/specs/azure-az900-card-clash-engine/design.md`（`## Correctness Properties`：Property 1 ~ Property 23）
  - `.kiro/specs/azure-az900-card-clash-engine/tasks.md`（選用 `*` 屬性測試任務：`14.1*`、`15.1*`、`18.*`、`20.*`、`22.*`、`48.*`、`53.1*`）
- **Steering 參考規範**: [.kiro/steering/pbt-properties.md](file:///C:/Users/iven8/Downloads/0930forkirounivsersity/.kiro/steering/pbt-properties.md)、[.kiro/steering/az900-domain-rules.md](file:///C:/Users/iven8/Downloads/0930forkirounivsersity/.kiro/steering/az900-domain-rules.md)
- **測試路徑与對應 Property (`fast-check`)**:
  - `src/__tests__/pbt/scoring.pbt.test.ts`: 計分引擎不變性 (`S-1 ~ S-5` / Property 3, 4, 9, 10, 11)
  - `src/__tests__/pbt/difficulty.pbt.test.ts`: 難度等級調整邊界 (`D-1 ~ D-4` / Property 17, 18)
  - `src/__tests__/pbt/studyDeck.pbt.test.ts`: Study Deck 集合唯一性 (`SD-1 ~ SD-3` / Property 15, 16)
  - `src/__tests__/pbt/sessionExpiration.pbt.test.ts`: 7 天會話過期判定 (`SE-1 ~ SE-3` / Property 21)
  - `tests/unit/engine/{validator,scoring,evaluator}.test.ts` 與 `tests/unit/i18n/translations.test.ts` (Property 1, 2, 5, 10, 11, 12, 22)

### 3. Kiro Powers (Lesson 5 - az900-microsoft-learn)
- **目錄結構**: [.kiro/powers/az900-microsoft-learn/](file:///C:/Users/iven8/Downloads/0930forkirounivsersity/.kiro/powers/az900-microsoft-learn/)
- **Manifest**: [plugin.json](file:///C:/Users/iven8/Downloads/0930forkirounivsersity/.kiro/powers/az900-microsoft-learn/plugin.json)
- **MCP 伺服器**: 整合 Microsoft Learn Catalog API ([index.js](file:///C:/Users/iven8/Downloads/0930forkirounivsersity/.kiro/powers/az900-microsoft-learn/mcp-server/index.js))，並已註冊至 [.kiro/settings/mcp.json](file:///C:/Users/iven8/Downloads/0930forkirounivsersity/.kiro/settings/mcp.json)
- **內建技能 (Skills)**:
  - `az900-lookup`: 查詢微軟官方 AZ-900 學習模組、考試領域比重與高頻考點
  - `az900-card-assistant`: 依據微軟官方規範與遊戲卡牌 schema 生成與驗證服務卡牌
  - `az900-scenario-designer`: 依據 AZ-900 架構最佳實踐設計具挑戰性且平衡的遊戲場景

---

## 常用指令

| 任務 | 指令 |
| :--- | :--- |
| 啟動開發伺服器 | `npm run dev` |
| 程式碼檢查與修正 | `npm run lint` |
| 程式碼格式化 | `npm run format` |
| 型別檢查 | `npm run type-check` |
| 單元與 PBT 測試 | `npm run test:unit` |
| 僅執行 PBT 測試 | `npx vitest run src/__tests__/pbt/` |
| E2E 測試 | `npm run test:e2e` |

---

## 常見問題排除
- **Gemini CLI 登入錯誤 (PowerShell)**: 如果遇到 `UnauthorizedAccess` 或腳本無法載入的錯誤，請執行：
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```
