---
name: az900-card-assistant
description: >
  Generates, validates, and improves AZ-900 Card Clash game cards from Azure service
  information. Triggers when the user asks to create, edit, or validate game cards.
---

# AZ-900 Card Assistant

Generates **accurate and balanced** AZ-900 Card Clash game cards by combining Microsoft Learn data with the game's card schema.

## Card Schema Reference

```typescript
interface AzureCard {
  id: string               // kebab-case, e.g. "azure-blob-storage"
  name: string             // Official Azure service name
  domain: AZ900Domain      // 'cloud-concepts' | 'azure-services' | 'management-governance'
  cost: number             // 0-20
  synergyTags: string[]    // From approved tag pool below
  az900ExamTip: string     // MAX 280 characters
  description: string      // Gameplay description (max 200 chars)
  power: number            // 0-100
  requirements?: string[]
  conflicts?: string[]
}
```

## Step 1: Fetch service info

Call `search_services` with the Azure service name. Then call `search_modules` for related learning modules to inform the exam tip.

## Step 2: Map domain and tags

**Approved synergyTag pool only:**

| Category | Tags |
|----------|------|
| Compute  | `compute`, `serverless`, `container`, `iaas`, `paas` |
| Storage  | `storage`, `blob`, `disk`, `files` |
| Network  | `network`, `connectivity`, `vpn`, `load-balancer`, `multi-region` |
| Security | `security`, `identity`, `entra`, `encryption`, `nsg`, `firewall` |
| Govern   | `governance`, `compliance`, `policy` |
| HA       | `ha`, `availability-zone`, `backup`, `recovery`, `reserved` |
| Monitor  | `monitoring` |

## Step 3: Write az900ExamTip (≤ 280 chars)

Focus on what the AZ-900 exam tests — the exam distinction, not just the feature description. Count characters before finalizing.

## Step 4: Assign cost and power

| Cost Range | Examples | Power Range |
|-----------|---------|------------|
| 0–2 | Queue Storage, DNS, Resource Locks | 20–40 |
| 3–5 | App Service, ACI, Load Balancer | 40–60 |
| 6–8 | AKS, VPN Gateway, Defender | 55–75 |
| 9–10 | ExpressRoute, Data Box | 70–90 |

## Step 5: Validate

- ❌ `az900ExamTip` > 280 chars → trim
- ❌ unapproved `synergyTags` → replace with approved equivalents
- ❌ `cost` outside 0–20 or `power` outside 0–100 → correct
- ✅ `id` unique across `src/data/cards/**`
- ✅ Output matching `src/data/codex/{card-id}.json` entry

## Output Template

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
