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

### 2. Steering & PBT (Lesson 4 屬性測試)
- **屬性規範**: [.kiro/steering/pbt-properties.md](file:///C:/Users/iven8/Downloads/0930forkirounivsersity/.kiro/steering/pbt-properties.md)
- **領域規範**: [.kiro/steering/az900-domain-rules.md](file:///C:/Users/iven8/Downloads/0930forkirounivsersity/.kiro/steering/az900-domain-rules.md)
- **測試路徑**: `src/__tests__/pbt/`
- **測試內容**:
  - `scoring.pbt.test.ts`: 計分引擎不變性 (S-1 ~ S-5)
  - `difficulty.pbt.test.ts`: 難度等級調整邊界 (D-1 ~ D-4)
  - `studyDeck.pbt.test.ts`: Study Deck 集合唯一性 (SD-1 ~ SD-3)
  - `sessionExpiration.pbt.test.ts`: 7 天會話過期判定 (SE-1 ~ SE-3)

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
