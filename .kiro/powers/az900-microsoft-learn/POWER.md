# ☁️ AZ-900 Microsoft Learn Power

**Package:** `az900-microsoft-learn`  
**Version:** `1.0.0`  
**Author:** [linjinhsien](https://github.com/linjinhsien)  
**License:** MIT  
**Repository:** [linjinhsien/0930forkirounivsersity](https://github.com/linjinhsien/0930forkirounivsersity) · `.kiro/powers/az900-microsoft-learn/`

---

## Overview

This Kiro Power integrates the **Microsoft Learn AZ-900 certification catalog** directly into your development workflow. It activates when you mention Azure services, AZ-900 exam topics, or Microsoft Learn content — providing instant, authoritative answers from the official Microsoft Learn API.

Built for developers learning Azure fundamentals and for teams building AZ-900 educational tools.

---

## What's Included

### 🛠️ MCP Server — `ms-learn`

A stdio MCP server that queries the [Microsoft Learn Catalog API](https://learn.microsoft.com/api/catalog/) in real time.

| Tool | Description |
|------|-------------|
| `search_modules` | Search AZ-900 learning modules by keyword |
| `get_az900_domains` | Get official exam domains with weightings (25-30% / 35-40% / 30-35%) |
| `search_services` | Look up Azure service documentation links |
| `get_learning_path` | Get the full AZ-900 learning path or by domain |

**Locale support:** `zh-tw` (default) with `en-us` fallback.

### 📚 Agent Skills

| Skill | Trigger | Purpose |
|-------|---------|---------|
| `az900-lookup` | `az-900`, `azure service`, `microsoft learn` | On-demand lookup of AZ-900 topics and Azure services |
| `az900-card-assistant` | `create card`, `generate card`, `validate card` | Generate and validate AZ-900 Card Clash game cards |
| `az900-scenario-designer` | `create scenario`, `design scenario` | Design balanced AZ-900 architecture scenarios |

---

## Quick Start

### In Kiro IDE

1. Enable this power from the Powers panel.
2. Start a chat and ask about any Azure service:

```
"What is Azure Blob Storage? Give me the AZ-900 exam tip."
"Create a card for Azure Functions."
"Design a beginner startup-scaling scenario."
```

### MCP Tools Direct Usage

```
get_az900_domains          → Returns all 3 exam domains with weightings
search_modules "RBAC"      → Returns top 5 MS Learn modules for RBAC
search_services "Azure Key Vault"  → Returns docs URL + related modules
get_learning_path "cloud-concepts" → Returns the learning path URL
```

---

## Configuration

The MCP server uses these environment variables (set in `mcp.json`):

| Variable | Default | Description |
|----------|---------|-------------|
| `MS_LEARN_LOCALE` | `zh-tw` | Primary locale for API queries |
| `MS_LEARN_FALLBACK_LOCALE` | `en-us` | Fallback if primary locale returns no results |

---

## File Structure

```
az900-microsoft-learn/
├── plugin.json                    # Power manifest ($schema compliant)
├── mcp.json                       # MCP server configuration
├── POWER.md                       # This file — registry submission doc
├── README.md                      # Developer documentation
├── mcp-server/
│   └── index.cjs                  # Microsoft Learn Catalog API MCP server
└── skills/
    ├── az900-lookup/
    │   ├── SKILL.md
    │   └── references/
    │       ├── az900-domains.md           # Official exam domains & weights
    │       ├── azure-services-cheatsheet.md  # Core Azure services reference
    │       └── exam-tips.md               # High-frequency exam tips
    ├── az900-card-assistant/
    │   └── SKILL.md               # Card schema, tag pool, balance guidelines
    └── az900-scenario-designer/
        └── SKILL.md               # Scenario schema, difficulty guidelines
```

---

## Requirements

- **Node.js** 18+ (for MCP server)
- **Kiro IDE** with MCP support
- Internet access to `learn.microsoft.com` (Microsoft Learn Catalog API)

---

## Technical Notes

- The MCP server is implemented as a CommonJS module (`index.cjs`) to avoid ESM/CJS conflicts with projects that use `"type": "module"` in `package.json`.
- The server implements [MCP Protocol 2024-11-05](https://spec.modelcontextprotocol.io/) over stdio.
- `notifications/initialized` messages are silently ignored (no response sent).
- Service documentation URLs include overrides for services whose docs path doesn't follow the standard slug pattern (e.g. `Microsoft Entra ID` → `/azure/entra/identity/`).

---

## License

MIT — Educational use. Microsoft Learn content is copyright Microsoft Corporation.  
AZ-900 exam objectives sourced from the [official Microsoft certification page](https://learn.microsoft.com/certifications/azure-fundamentals/).
