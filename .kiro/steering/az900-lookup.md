---
name: az900-lookup
description: Look up AZ-900 certification topics, Azure service definitions, and Microsoft Learn modules on demand. Triggers when the user asks about Azure services, AZ-900 exam topics, or requests Microsoft Learn content.
inclusion: auto
---

# AZ-900 Microsoft Learn Lookup Skill

## Overview

This skill provides instant access to the **Microsoft Learn AZ-900 catalog** and
Azure service knowledge. Use it to:

- 查詢特定 Azure 服務的官方定義
- 找到對應的 Microsoft Learn 學習模組
- 取得 AZ-900 考試重點整理
- 驗證卡牌描述的準確性

## How to Use This Skill

When the user mentions any AZ-900 topic or Azure service, this skill activates
and uses the `ms-learn` MCP server to fetch real-time data from Microsoft Learn.

### Lookup Pattern

1. **Identify the topic** from the user's message
2. **Call `ms-learn` MCP tool** with the appropriate query
3. **Present results** in a structured format with:
   - Official Microsoft definition
   - AZ-900 exam relevance
   - Recommended learning modules (with URLs)
   - Estimated study time

### Example Responses

When asked about "Azure Blob Storage":

```
📦 Azure Blob Storage

官方定義: Massively scalable object storage for unstructured data.
AZ-900 考試域: Azure Architecture and Services (35-40%)
考試重點: 
  • Blob 支援三種存取層：Hot、Cool、Archive
  • 適用於非結構化資料（圖片、影片、文件）

📚 Microsoft Learn 模組:
  1. "Explore Azure Storage services" — 27 分鐘
     https://learn.microsoft.com/training/modules/describe-azure-storage-infrastructure/
  2. "Choose a data storage approach" — 30 分鐘
     https://learn.microsoft.com/training/modules/choose-storage-approach-in-azure/

🎮 Card Clash 建議標籤: storage, blob, paas
```

## MCP Tools Available

Use these `ms-learn` MCP tools:

- `ms-learn::get_az900_domains` — Get official exam domains and weightings
- `ms-learn::search_modules` — Search for learning modules by keyword
- `ms-learn::get_learning_path` — Get the full AZ-900 learning path
- `ms-learn::search_services` — Look up Azure service documentation

## Notes

- Always verify information against the official Microsoft Learn catalog via MCP
- Card descriptions must stay within 280 characters (AZ-900 exam tip field)
- Prefer current Microsoft Learn content over historical or third-party sources
