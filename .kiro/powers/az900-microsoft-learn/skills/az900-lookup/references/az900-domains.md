# AZ-900 考試域與比重（官方）

> 來源：Microsoft Learn — AZ-900: Microsoft Azure Fundamentals
> https://learn.microsoft.com/certifications/azure-fundamentals/

---

## 考試域分布

| 域 | 名稱 | 比重 |
|----|------|------|
| **Domain 1** | Describe cloud concepts | 25–30% |
| **Domain 2** | Describe Azure architecture and services | 35–40% |
| **Domain 3** | Describe Azure management and governance | 30–35% |

---

## Domain 1：Cloud Concepts（雲端概念）25–30%

### 1.1 Describe cloud computing
- 雲端運算的定義
- 共同責任模型（Shared Responsibility Model）
- 雲端模型：Public、Private、Hybrid
- 消費型模型（Consumption-based model）：CapEx vs OpEx

### 1.2 Describe the benefits of using cloud services
- High availability（高可用性）& Scalability（擴展性）
- Reliability（可靠性）& Predictability（可預測性）
- Security & Governance
- Manageability

### 1.3 Describe cloud service types
- IaaS（Infrastructure as a Service）
- PaaS（Platform as a Service）
- SaaS（Software as a Service）

---

## Domain 2：Azure Architecture and Services（架構與服務）35–40%

### 2.1 Describe the core architectural components
- Azure Regions & Availability Zones
- Azure Datacenters
- Azure Resources & Resource Groups
- Subscriptions & Management Groups
- Azure Hierarchy

### 2.2 Describe Azure compute and networking
| 服務 | 類型 | 考試重點 |
|------|------|----------|
| Azure VMs | IaaS | 最大彈性，需自管 OS |
| Azure App Service | PaaS | Web/API 快速部署 |
| Azure Container Instances | PaaS | 無需管理叢集 |
| Azure Kubernetes Service | PaaS | 容器編排 |
| Azure Functions | Serverless | 事件驅動，僅付執行費 |
| Azure Virtual Network | Network | 隔離、路由、VPN |
| Azure VPN Gateway | Network | 站對站/點對站 VPN |
| Azure ExpressRoute | Network | 私有專線連接 Azure |
| Azure DNS | Network | DNS 解析服務 |
| Azure Load Balancer | Network | L4 負載平衡 |
| Azure Application Gateway | Network | L7 + WAF |

### 2.3 Describe Azure storage services
| 服務 | 用途 | 存取層 |
|------|------|--------|
| Azure Blob Storage | 非結構化資料 | Hot / Cool / Archive |
| Azure Files | 雲端檔案共享（SMB/NFS） | — |
| Azure Queue Storage | 訊息佇列 | — |
| Azure Table Storage | NoSQL 鍵值 | — |
| Azure Disk Storage | VM 磁碟 | Premium / Standard |
| Azure Data Box | 離線資料傳輸 | — |

### 2.4 Describe Azure identity, access, and security
- Microsoft Entra ID（前身 Azure AD）
- Authentication vs Authorization
- Azure RBAC（Role-Based Access Control）
- Zero Trust 模型
- Microsoft Defender for Cloud
- Azure Key Vault
- Microsoft Entra External ID

---

## Domain 3：Azure Management and Governance（管理與治理）30–35%

### 3.1 Describe cost management
- 影響 Azure 成本的因素
- Azure Pricing Calculator
- Azure Total Cost of Ownership (TCO) Calculator
- Azure Cost Management + Billing
- Tags（標籤）的計費用途

### 3.2 Describe features and tools for governance
- Azure Blueprints（已整合至 Azure Policy）
- Azure Policy（政策定義、分配、合規）
- Resource Locks（防止誤刪）
- Microsoft Purview（資料治理）

### 3.3 Describe features and tools for deployment
- Azure Portal
- Azure Cloud Shell（Bash / PowerShell）
- Azure CLI & Azure PowerShell
- Azure Arc（混合雲管理）
- Azure Resource Manager（ARM）& ARM Templates
- Azure Bicep
- Terraform（第三方，常見考點）

### 3.4 Describe monitoring tools
- Azure Advisor（最佳化建議）
- Azure Service Health（服務狀態）
- Azure Monitor（指標與警示）
- Log Analytics（日誌查詢）
- Application Insights（應用程式效能）
