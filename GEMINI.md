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

---

## 常用指令

| 任務 | 指令 |
| :--- | :--- |
| 啟動開發伺服器 | `npm run dev` |
| 程式碼檢查與修正 | `npm run lint` |
| 程式碼格式化 | `npm run format` |
| 型別檢查 | `npm run type-check` |
| 單元測試 | `npm run test:unit` |
| E2E 測試 | `npm run test:e2e` |

---

## 常見問題排除
- **Gemini CLI 登入錯誤 (PowerShell)**: 如果遇到 `UnauthorizedAccess` 或腳本無法載入的錯誤，請執行：
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```
