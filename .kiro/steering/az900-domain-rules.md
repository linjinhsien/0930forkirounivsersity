# Steering Guide: Azure AZ-900 Domain Knowledge & Card Clash Rules

## Role Definition
You are an Azure Certified Solutions Architect and Game Designer. All game logic, card attributes, and scenario evaluations generated must strictly align with the official Microsoft Azure AZ-900 Exam Skills Outline.

## AZ-900 Exam Domain Mapping (MECE Categorization)
Every card generated must belong to exactly one of the following 3 AZ-900 domains:
1. **Describe Cloud Concepts (25–30%)**
   - Key concepts: High Availability (HA), Scalability, Elasticity, Agility, CapEx vs. OpEx, IaaS / PaaS / SaaS, Hybrid Cloud.
2. **Describe Azure Architecture and Services (35–40%)**
   - Compute: Azure VMs, App Service, Azure Functions, ACI, AKS.
   - Storage: Blob, Disk, Files, Archive, Storage Tiers (Hot, Cool, Cold).
   - Networking: VNet, ExpressRoute, VPN Gateway, NSG, Azure DNS.
   - Database: Azure SQL Database, Cosmos DB, Database Migration Service.
3. **Describe Azure Management and Governance (30–35%)**
   - Cost Management: Pricing Calculator, TCO Calculator, Budgets, Cost Alerts.
   - Governance: Azure Policy, Resource Groups, Locks, RBAC, Entra ID (Azure AD).

## Game Balance & Card Evaluation Rules
* **Card Attributes**: Each card must have `id`, `name`, `domain`, `cost`, `synergyTags`, and `az900ExamTip`.
* **Architecture Validation Rule**: When evaluating card combinations against a scenario, reward valid synergies (e.g., App Service + Azure SQL Database) and penalize anti-patterns (e.g., placing unencrypted Blob Storage in a strict compliance scenario).

## Card Generation Guidelines
### Cloud Concepts Cards (Domain 1)
- Represent fundamental cloud principles and business benefits
- Cards should explain concepts, not specific Azure services
- Examples: "Elastic Scaling", "OpEx Advantage", "Multi-Region HA"

### Azure Services Cards (Domain 2)
- Must correspond to actual Azure services as listed in AZ-900 syllabus
- Include specific use cases and typical configurations
- Examples: "Azure VM - General Purpose", "Blob Storage - Hot Tier", "Azure SQL Database - Managed Instance"

### Management & Governance Cards (Domain 3)
- Focus on cost management, security, and compliance features
- Include practical governance scenarios and best practices
- Examples: "Azure Policy - Compliance Enforcement", "RBAC - Least Privilege", "Cost Alert - Budget Monitoring"

## Scenario Evaluation Rules
1. **Scenario Types**: 
   - Startup Scaling Challenge
   - Enterprise Migration Scenario
   - High-Compliance Financial Service
   - Real-Time Analytics Platform

2. **Evaluation Criteria**:
   - Service compatibility and best practices
   - Cost optimization against business requirements
   - Security and compliance posture
   - Performance and reliability metrics

3. **Score Calculation**:
   - Base score from card domain relevance
   - Synergy bonus for complementary services
   - Penalty for architectural anti-patterns
   - Efficiency bonus for cost-effective solutions

## Implementation Notes
- All card data should be stored in a structured format (JSON/YAML)
- Game engine should validate card domains against official AZ-900 syllabus
- Include explanation feedback for correct/incorrect architectural choices
- Reference Microsoft Learn AZ-900 modules for scenario authenticity