# ☁️ AZ-900 Microsoft Learn Power

> **Kiro Power** — 整合 Microsoft Learn 官方 AZ-900 認證內容

---

## 什麼是這個 Power？

當你在 Kiro 對話中提到 `az-900`、`azure`、`microsoft learn` 等關鍵字時，
此 Power 自動載入三種 Agent Skills 和一個 MCP 伺服器，讓你能即時：

- 🔍 查詢 Microsoft Learn 上的 AZ-900 模組
- 📋 取得 Azure 服務官方定義和考試重點
- 🎮 為 Card Clash 遊戲生成準確的卡牌和場景
- 📚 獲取完整的 AZ-900 學習路徑

---

## 安裝

此 Power 已預裝於 `.kiro/powers/az900-microsoft-learn/`。
在 Kiro IDE 中，於 Powers 面板中啟用 `az900-microsoft-learn`。

---

## 結構說明

```
az900-microsoft-learn/
├── plugin.json                          # Power 主要 manifest
├── mcp.json                             # MCP 伺服器設定
├── mcp-server/
│   └── index.cjs                        # Microsoft Learn API 伺服器
└── skills/
    ├── az900-lookup/                    # AZ-900 查詢技能
    │   ├── SKILL.md
    │   └── references/
    │       ├── az900-domains.md         # 考試域與比重（官方）
    │       ├── azure-services-cheatsheet.md  # 服務速查表
    │       └── exam-tips.md             # 高頻考點與陷阱題
    ├── az900-card-assistant/            # 卡牌生成技能
    │   └── SKILL.md
    └── az900-scenario-designer/         # 場景設計技能
        └── SKILL.md
```

---

## MCP 工具

`ms-learn` MCP 伺服器提供 4 個工具：

| 工具 | 說明 | 範例 |
|------|------|------|
| `search_modules` | 搜尋 AZ-900 學習模組 | `搜尋 "blob storage" 相關模組` |
| `get_az900_domains` | 取得考試域資訊 | `顯示 AZ-900 考試範圍` |
| `search_services` | 查詢 Azure 服務文件連結 | `搜尋 Azure Key Vault 文件` |
| `get_learning_path` | 取得完整學習路徑 | `取得 management-governance 學習路徑` |

---

## 觸發關鍵字

Power 在以下關鍵字出現時自動啟用：

```
az-900, az900, AZ-900, azure, Azure, microsoft learn, Microsoft Learn,
cloud concepts, azure services, azure management, azure governance,
azure networking, azure security, azure storage, azure compute,
certification, exam
```

---

## 版權聲明

- 此 Power 使用 [Microsoft Learn Catalog API](https://learn.microsoft.com/api/catalog/)
- Microsoft Learn 內容版權屬 Microsoft Corporation
- 遊戲卡牌內容為教育用途之二次創作，參考官方 AZ-900 考試目標

Licensed under MIT — For educational use only.
