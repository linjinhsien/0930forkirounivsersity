---
name: az900-scenario-designer
description: >
  Designs balanced AZ-900 Card Clash game scenarios with proper constraints,
  requirements, and difficulty scaling. Triggers when the user asks to create
  or improve game scenarios.
---

# AZ-900 Scenario Designer

Creates **educationally sound and mechanically balanced** scenarios for AZ-900 Card Clash, aligned with real Azure architecture patterns.

## Step 1: Choose category and difficulty

**Categories:** `startup-scaling` · `enterprise-migration` · `high-compliance` · `real-time-analytics`

| Difficulty | maxCost | minAvailability | securityLevel | Optimal cards |
|------------|---------|-----------------|---------------|---------------|
| beginner | 25–35 | 99.0 or none | basic or none | 3–4 |
| intermediate | 20–30 | 99.9 | standard | 4–5 |
| advanced | 18–25 | 99.99 | premium | 5–6 |

## Step 2: Verify card pool compatibility

Before writing requirements, check `src/data/cards/` to confirm:
- Cards with the required `synergyTags` exist
- The sum of optimal card costs fits within `maxCost`
- No required card has a conflicting `conflicts` entry with another required card

## Step 3: Write 2–5 requirements

Each requirement:
```typescript
{
  type: "concept" | "service",   // concept = tag-based, service = specific card
  value: string,                 // synergyTag or card id
  weight: number,                // weights must sum to 100
  description: string            // Chinese description of why this is needed
}
```

## Step 4: Map to AZ-900 exam domain

Verify the scenario aligns with at least one exam domain using `get_az900_domains`:
- Domain 1 (25–30%): Cloud concepts, IaaS/PaaS/SaaS
- Domain 2 (35–40%): Compute, storage, networking, identity
- Domain 3 (30–35%): Cost, governance, monitoring

## Step 5: Output scenario JSON

```json
{
  "id": "startup-api-launch",
  "title": "API 快速上市挑戰",
  "description": "一家新創公司需要在 30 天內上線 REST API，預算有限但需支援突發流量。",
  "requirements": [
    { "type": "concept", "value": "serverless", "weight": 40, "description": "採用無伺服器架構降低運維成本" },
    { "type": "service", "value": "storage", "weight": 30, "description": "需要持久化儲存 API 資料" },
    { "type": "concept", "value": "monitoring", "weight": 30, "description": "監控 API 效能和錯誤率" }
  ],
  "constraints": { "maxCost": 12, "securityLevel": "basic" },
  "maxRounds": 5,
  "difficulty": "beginner",
  "category": "startup-scaling"
}
```

## Validation Checklist

- [ ] `maxCost` achievable with optimal card combination
- [ ] All requirement `value` fields match existing `synergyTags` or card `id`s
- [ ] `category` is one of the four valid values
- [ ] Requirement weights sum to 100
- [ ] Learning objective maps to an AZ-900 exam domain
