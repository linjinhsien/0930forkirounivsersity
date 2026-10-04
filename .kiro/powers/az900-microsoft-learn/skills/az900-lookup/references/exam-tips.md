# AZ-900 高頻考點整理

> 來源彙整自 Microsoft Learn AZ-900 學習路徑
> 更新日期：2026-10

---

## 🔥 必考概念 Top 15

1. **共同責任模型** — IaaS/PaaS/SaaS 各自的責任範圍
2. **CapEx vs OpEx** — 雲端採用消費型模型（OpEx）
3. **SLA 計算** — 串聯服務 SLA = 各 SLA 相乘（例：99.9% × 99.9% = 99.8%）
4. **可用性區域（Availability Zones）** — 同區域內實體隔離的資料中心
5. **Azure 資源階層** — Management Group > Subscription > Resource Group > Resource
6. **Blob 存取層** — Hot、Cool、Archive（越冷越便宜但存取費越高）
7. **Entra ID vs Active Directory** — 雲端 vs 地端身份服務，不完全相同
8. **Azure RBAC 最小權限** — 只授予完成工作所需的最低權限
9. **Azure Policy vs RBAC** — Policy 控制資源「能做什麼」；RBAC 控制「誰能做」
10. **ExpressRoute vs VPN** — ExpressRoute 不走公網；VPN 走加密公網
11. **ARM Template vs Bicep** — 兩者都是基礎設施即程式碼（IaC），Bicep 是 ARM 的語法糖
12. **Azure Advisor** — 四個建議面向：高可用、安全、效能、成本（+ Sustainability）
13. **Resource Locks** — CanNotDelete 或 ReadOnly，繼承自父級
14. **Azure Arc** — 統一管理多雲和地端資源的控制平面
15. **TCO Calculator** — 估算從地端遷移至 Azure 的**總成本節省**

---

## 容易混淆的服務對

| 服務 A | 服務 B | 差異關鍵 |
|--------|--------|---------|
| Azure Load Balancer | Application Gateway | L4 TCP/UDP vs L7 HTTP/HTTPS |
| VPN Gateway | ExpressRoute | 加密公網 vs 私有專線 |
| Azure Monitor | Azure Advisor | 監控現況 vs 提供建議 |
| Entra ID | Azure AD DS | 現代雲端身份 vs 傳統 LDAP/Kerberos |
| Azure Policy | Azure Blueprints | 持續合規 vs 一次性環境佈建 |
| Container Instances | AKS | 單容器快速 vs 大規模編排 |
| Azure Functions | Logic Apps | 程式碼驅動 vs 視覺化工作流程 |

---

## 考試陷阱題模式

### 陷阱 1：SLA 疊加計算
> Q: VM A (99.9%) 和 VM B (99.9%) 組成服務，SLA 是多少？
> A: **99.8%**（= 0.999 × 0.999），不是 99.9%！

### 陷阱 2：Availability Zones 不保證 99.99%
> 單 VM + Availability Zones = **99.99%** SLA
> 但跨區域（Region Pairs）才能防止區域級災難

### 陷阱 3：Azure AD 已更名
> **Microsoft Entra ID**（2023 年更名）是 AZ-900 考試的正確用語

### 陷阱 4：免費服務
> Azure Advisor、Azure Service Health、Resource Locks、
> Cost Management（基礎）都是**免費**的！

### 陷阱 5：Tags 不繼承
> Resource Group 的 Tags **不會**自動繼承到子資源
> （需要 Azure Policy 強制套用）

---

## Microsoft Learn 學習路徑連結

| 模組名稱 | 時間 | 連結 |
|---------|------|------|
| Cloud Concepts | 約 1.5 小時 | https://learn.microsoft.com/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/ |
| Azure Architecture & Services | 約 3.5 小時 | https://learn.microsoft.com/training/paths/azure-fundamentals-describe-azure-architecture-services/ |
| Azure Management & Governance | 約 2 小時 | https://learn.microsoft.com/training/paths/describe-azure-management-governance/ |
| AZ-900 練習考試 | — | https://learn.microsoft.com/certifications/exams/az-900/practice/assessment?assessmentId=23 |
