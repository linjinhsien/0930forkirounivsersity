---
name: az900-card-assistant
description: Generates, validates, and improves AZ-900 Card Clash game cards from Azure service information. Triggers when the user asks to create, edit, or validate game cards.
inclusion: auto
---

# AZ-900 Card Assistant Skill

## Overview

This skill helps generate **accurate and balanced** AZ-900 Card Clash game cards
by combining Microsoft Learn data with the game's card schema.

## Card Schema Reference

```typescript
interface AzureCard {
  id: string               // kebab-case, e.g. "azure-blob-storage"
  name: string             // Official Azure service name
  domain: AZ900Domain      // 'cloud-concepts' | 'azure-services' | 'management-governance'
  cost: number             // 0-20 (use cheatsheet reference values)
  synergyTags: string[]    // From approved tag pool (see below)
  az900ExamTip: string     // MAX 280 characters — AZ-900 exam insight
  description: string      // Gameplay description (max 200 chars)
  power: number            // 0-100 (relative strength)
  requirements?: string[]  // Card IDs that must be present
  conflicts?: string[]     // Card IDs that conflict with this card
}
```

## Approved synergyTag Pool

```
Compute:  compute, serverless, container, iaas, paas
Storage:  storage, blob, disk, files
Network:  network, connectivity, vpn, load-balancer, multi-region
Security: security, identity, entra, encryption, nsg, firewall
Govern:   governance, compliance, policy
HA:       ha, availability-zone, backup, recovery, reserved
Monitor:  monitoring
```

## Card Generation Workflow

1. **Fetch** service info from Microsoft Learn via `ms-learn` MCP tool
2. **Map** the service to the appropriate `domain` and `synergyTags`
3. **Write** `az900ExamTip` — must be ≤280 chars and exam-focused
4. **Assign** `cost` (0–20) based on real Azure pricing tier
5. **Set** `power` (0–100) based on versatility in game scenarios
6. **Check** for logical `requirements` and `conflicts`
7. **Validate** against existing cards in `src/data/cards/`

## Card Generation Template

When asked to create a card, output JSON like this:

```json
{
  "id": "azure-key-vault",
  "name": "Azure Key Vault",
  "domain": "management-governance",
  "cost": 2,
  "synergyTags": ["encryption", "security", "governance"],
  "az900ExamTip": "Centrally manages secrets, keys, and certificates with HSM-backed security. Keeps sensitive data out of code and config files. Integrates with Entra ID for access control.",
  "description": "Secure vault for secrets, keys & certificates. Synergizes with Entra ID.",
  "power": 55,
  "requirements": [],
  "conflicts": []
}
```

## Validation Rules

- ❌ `az900ExamTip` must NOT exceed 280 characters
- ❌ `synergyTags` must ONLY use approved tags from the pool above
- ❌ `cost` must be 0–20 (integer)
- ❌ `power` must be 0–100 (integer)
- ✅ `id` must be unique across all existing cards
- ✅ Description must reflect real AZ-900 exam content

## Balance Guidelines

| Cost Range | Examples | Power Range |
|-----------|---------|------------|
| 0-2 | Queue Storage, DNS, Resource Locks | 20-40 |
| 3-5 | App Service, ACI, Load Balancer | 40-60 |
| 6-8 | AKS, VPN Gateway, Defender | 55-75 |
| 9-10 | ExpressRoute, Data Box | 70-90 |

## MCP Tools to Use

- `ms-learn::search_services` — Look up official Azure service definitions
- `ms-learn::search_modules` — Find related learning modules for exam tips
