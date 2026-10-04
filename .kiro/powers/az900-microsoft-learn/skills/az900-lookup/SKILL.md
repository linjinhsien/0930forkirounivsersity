---
name: az900-lookup
description: >
  Look up AZ-900 certification topics, Azure service definitions, and Microsoft Learn
  modules on demand. Triggers when the user asks about Azure services, AZ-900 exam
  topics, or requests Microsoft Learn content.
---

# AZ-900 Microsoft Learn Lookup

Provides instant access to the **Microsoft Learn AZ-900 catalog** and Azure service knowledge.

## Step 0: Validate setup (first time only)

Run the validation script to confirm prerequisites:

```sh
sh .kiro/powers/az900-microsoft-learn/skills/az900-lookup/scripts/validate-setup.sh
```

This checks:
- Node.js 18+ is installed
- The MCP server file exists at the expected path
- Microsoft Learn API is reachable

## Step 1: Identify the topic

Extract the Azure service or AZ-900 concept from the user's message.

Examples:
- "What is Azure Blob Storage?" → topic: `Azure Blob Storage`
- "Explain RBAC in AZ-900" → topic: `Azure RBAC`
- "Which domain covers cost management?" → domain lookup

## Step 2: Call the appropriate MCP tool

| Goal | Tool | Key argument |
|------|------|-------------|
| Find learning modules | `search_modules` | `keyword` |
| Get exam domains & weightings | `get_az900_domains` | — |
| Look up service docs | `search_services` | `service_name` |
| Get full learning path | `get_learning_path` | `domain` (optional) |

## Step 3: Present structured results

Format the response with:
- 📋 Official Microsoft definition
- 🎯 AZ-900 exam relevance and domain (with %)
- 📚 Recommended Microsoft Learn modules (title, duration, URL)
- 💡 Key exam distinctions (what NOT to confuse this with)

### Example output format

```
📦 Azure Blob Storage

官方定義: Massively scalable object storage for unstructured data.
AZ-900 考試域: Azure Architecture and Services (35–40%)
考試重點:
  • 支援三種存取層：Hot、Cool、Archive
  • 適用於非結構化資料（圖片、影片、文件）
  • 與 Azure Files（共享檔案）和 Azure Disk（VM 磁碟）目的不同

📚 Microsoft Learn 模組:
  1. "Explore Azure Storage services" — 27 分鐘
     https://learn.microsoft.com/training/modules/describe-azure-storage-infrastructure/

🎮 Card Clash 建議標籤: storage, blob, paas
```

## Step 4: Fall back to references if MCP unavailable

If the MCP server is unreachable, consult:
- `references/az900-domains.md` — exam domains and weightings
- `references/azure-services-cheatsheet.md` — core services quick reference
- `references/exam-tips.md` — high-frequency exam tips and traps
