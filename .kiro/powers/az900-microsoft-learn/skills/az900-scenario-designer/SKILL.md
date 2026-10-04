# AZ-900 Scenario Designer Skill

---
name: az900-scenario-designer
description: >
  Designs balanced AZ-900 Card Clash game scenarios with proper constraints,
  requirements, and difficulty scaling. Triggers when the user asks to create
  or improve game scenarios.
triggers:
  - "create scenario"
  - "new scenario"
  - "design scenario"
  - "scenario for"
  - "add scenario"
  - "game scenario"
  - "architecture scenario"
---

## Overview

This skill creates **educationally sound and mechanically balanced** scenarios
for AZ-900 Card Clash, aligned with real Azure architecture patterns.

## Scenario Schema Reference

```typescript
interface Scenario {
  id: string
  title: string
  description: string
  requirements: ScenarioRequirement[]   // 2-5 requirements
  constraints: {
    maxCost?: number                    // Budget cap (sum of card costs)
    minAvailability?: number            // 99.0 | 99.9 | 99.99
    securityLevel?: 'basic' | 'standard' | 'premium'
    region?: string
  }
  maxRounds: number                     // 3-8 recommended
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: 'startup-scaling' | 'enterprise-migration' | 'high-compliance' | 'real-time-analytics'
}
```

## Difficulty Design Guidelines

### Beginner
- maxCost: 25-35 (loose budget)
- minAvailability: 99.0 or none
- securityLevel: 'basic' or none
- requirements: 2-3 simple service requirements
- Optimal solution: 3-4 cards

### Intermediate
- maxCost: 20-30 (moderate constraint)
- minAvailability: 99.9
- securityLevel: 'standard'
- requirements: 3-4 requirements with some specificity
- Optimal solution: 4-5 cards

### Advanced
- maxCost: 18-25 (tight budget forcing tradeoffs)
- minAvailability: 99.99
- securityLevel: 'premium'
- requirements: 4-5 requirements with conflicting constraints
- Optimal solution: 5-6 carefully chosen cards

## AZ-900 Aligned Scenario Archetypes

### 1. Startup Scaling
```
Story: 新創公司需要快速上線且省成本
Best cards: serverless, paas, container
Learning objective: IaaS vs PaaS vs Serverless 選擇
```

### 2. Enterprise Migration
```
Story: 傳統企業將地端工作負載遷移到 Azure
Best cards: ha, multi-region, backup, identity
Learning objective: 混合雲架構、高可用性設計
```

### 3. High Compliance
```
Story: 金融或醫療行業的嚴格合規需求
Best cards: encryption, governance, policy, monitoring
Learning objective: 安全與合規服務
```

### 4. Real-Time Analytics
```
Story: 需要即時處理大量串流資料
Best cards: serverless, paas, storage, monitoring
Learning objective: 資料服務和無伺服器運算
```

## Scenario Generation Template

```json
{
  "id": "startup-api-launch",
  "title": "API 快速上市挑戰",
  "description": "一家新創公司需要在 30 天內上線 REST API，預算有限但需支援突發流量。選擇最具成本效益的 Azure 架構。",
  "requirements": [
    {
      "type": "concept",
      "value": "serverless",
      "weight": 40,
      "description": "採用無伺服器架構降低運維成本"
    },
    {
      "type": "service",
      "value": "storage",
      "weight": 30,
      "description": "需要持久化儲存 API 資料"
    },
    {
      "type": "concept",
      "value": "monitoring",
      "weight": 30,
      "description": "監控 API 效能和錯誤率"
    }
  ],
  "constraints": {
    "maxCost": 12,
    "securityLevel": "basic"
  },
  "maxRounds": 5,
  "difficulty": "beginner",
  "category": "startup-scaling"
}
```

## Validation Checklist

- [ ] `maxCost` is achievable with the optimal card combination
- [ ] Scenario has a clear "best answer" (not too open-ended)
- [ ] Requirements reference tags that exist in the card pool
- [ ] Description clearly communicates the Azure real-world scenario
- [ ] Learning objective maps to a specific AZ-900 exam domain
- [ ] Difficulty constraints are consistently applied
