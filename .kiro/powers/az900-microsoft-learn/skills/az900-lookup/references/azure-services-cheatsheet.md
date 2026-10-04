# Azure 服務速查表（AZ-900 Card Clash 卡牌參考）

> 此文件為 Card Clash 遊戲卡牌設計速查用途。
> 所有描述不超過 280 字元（符合 `az900ExamTip` 欄位限制）。

---

## Compute 計算類

| 服務名稱 | 類型標籤 | cost 參考 | 速查說明（≤280字）|
|---------|---------|----------|-----------------|
| Azure Virtual Machines | iaas, compute | 8 | 完全可控的雲端 VM，支援 Windows/Linux。需自行管理 OS 和中介軟體，適合需要自訂環境的應用。 |
| Azure App Service | paas, compute | 5 | 全受管的 Web/API/行動後端平台，支援 .NET/Node/Python/Java，無需管理伺服器。 |
| Azure Functions | serverless, compute | 2 | 事件驅動的無伺服器運算，只在函式執行時計費。適合 HTTP 觸發、排程或訊息處理。 |
| Azure Container Instances | paas, container, compute | 3 | 最快速啟動容器的方式，無需管理叢集。適合短期工作或 burst 場景。 |
| Azure Kubernetes Service | paas, container, compute | 7 | 受管的 Kubernetes 叢集，自動化節點管理與升級。適合大規模容器化應用。 |
| Azure Virtual Desktop | paas, compute | 6 | 雲端桌面虛擬化服務，讓使用者透過瀏覽器存取 Windows 桌面環境。 |

---

## Storage 儲存類

| 服務名稱 | 類型標籤 | cost 參考 | 速查說明（≤280字）|
|---------|---------|----------|-----------------|
| Azure Blob Storage | storage, blob, paas | 2 | 非結構化資料的物件儲存，三種層：Hot（頻繁）、Cool（較少）、Archive（封存）。適合圖片、影片、備份。 |
| Azure Files | storage, files, paas | 3 | 完全受管的雲端檔案分享，支援 SMB 和 NFS 協定。可替換傳統 NAS，支援混合掛載。 |
| Azure Disk Storage | storage, disk, iaas | 4 | VM 使用的受管磁碟。Premium SSD 適合高效能需求，Standard 適合一般工作負載。 |
| Azure Queue Storage | storage, paas | 1 | 可儲存數百萬則訊息的佇列服務，用於非同步應用元件間的通訊。 |
| Azure Data Box | storage | 9 | 實體設備離線傳輸大量資料至 Azure，適合頻寬受限或大型遷移場景（最高 80TB）。 |

---

## Network 網路類

| 服務名稱 | 類型標籤 | cost 參考 | 速查說明（≤280字）|
|---------|---------|----------|-----------------|
| Azure Virtual Network | network, connectivity | 1 | Azure 的基礎網路隔離單元，可建立子網路、設定路由、與地端整合。所有 Azure 資源的基礎。 |
| Azure VPN Gateway | network, vpn | 5 | 建立站對站或點對站 VPN 連線，使地端網路安全連接至 Azure Virtual Network。 |
| Azure ExpressRoute | network, connectivity | 10 | 不經公網的私有專線連接，提供更穩定的頻寬和更低延遲，適合企業級混合雲。 |
| Azure Load Balancer | network, load-balancer | 3 | L4 (TCP/UDP) 負載平衡器，將流量分散至多個 VM，提供高可用性和水平擴展能力。 |
| Azure Application Gateway | network, load-balancer | 5 | L7 HTTP/HTTPS 負載平衡器，內建 WAF 防護，支援 URL 路由和 SSL 終止。 |
| Azure Front Door | network, multi-region | 6 | 全球性 CDN + L7 負載平衡，實現跨區域流量路由、Anycast 加速和 DDoS 防護。 |
| Azure DNS | network | 1 | 在 Azure 託管 DNS 網域，提供高可用性和快速 DNS 解析，支援私有 DNS 區域。 |

---

## Security 安全類

| 服務名稱 | 類型標籤 | cost 參考 | 速查說明（≤280字）|
|---------|---------|----------|-----------------|
| Microsoft Entra ID | identity, entra, security | 3 | Azure 的身份識別與存取管理服務（前身 Azure AD），支援 SSO、MFA 和條件式存取。 |
| Azure Key Vault | encryption, security | 2 | 集中管理密鑰、密碼和憑證，支援 HSM 硬體加密。確保敏感資訊不存於程式碼中。 |
| Microsoft Defender for Cloud | monitoring, security | 5 | 統一的雲端安全態勢管理，評估安全分數、偵測威脅，並提供修補建議。 |
| Azure Firewall | firewall, network, security | 6 | 全受管的雲端原生防火牆，支援應用程式 FQDN 過濾、網路規則和威脅情報整合。 |
| Azure DDoS Protection | network, security | 8 | 自動偵測並緩解 DDoS 攻擊，Standard 層提供自適應調整和攻擊分析報告。 |

---

## Governance 治理類

| 服務名稱 | 類型標籤 | cost 參考 | 速查說明（≤280字）|
|---------|---------|----------|-----------------|
| Azure Policy | governance, policy, compliance | 1 | 定義和強制執行組織資源標準，自動評估合規性，可拒絕不符合政策的部署。 |
| Azure RBAC | governance, identity | 1 | 角色型存取控制，依最低權限原則指派內建或自訂角色，精細管控資源存取。 |
| Resource Locks | governance | 0 | 防止資源被意外刪除或修改，CanNotDelete 或 ReadOnly 兩種鎖定類型。 |
| Azure Cost Management | governance | 0 | 監控、分析和最佳化 Azure 支出，設定預算警示，產生費用報告。 |
| Microsoft Purview | governance, compliance | 4 | 跨雲端和地端的資料治理平台，提供資料目錄、資料分類和資料歷程追蹤。 |

---

## Monitoring 監控類

| 服務名稱 | 類型標籤 | cost 參考 | 速查說明（≤280字）|
|---------|---------|----------|-----------------|
| Azure Monitor | monitoring | 2 | 全面的監控平台，收集指標和日誌，設定警示，並提供 Insights 分析儀表板。 |
| Azure Advisor | monitoring, governance | 0 | 個人化的最佳化建議引擎，提供高可用性、安全性、效能和成本四個面向的建議。 |
| Azure Service Health | monitoring | 0 | 即時 Azure 服務狀態通知，包含計劃性維護、服務中斷和健康建議。 |

---

## 高可用性（HA）組合模式

| 模式 | 所需服務標籤組合 | 預計 HA 分數 |
|------|----------------|-------------|
| 基礎 HA | `ha` + `load-balancer` | 23 分 |
| 區域 HA | `availability-zone` × 2 + `load-balancer` | 38 分 |
| 跨區域 HA | `multi-region` + `load-balancer` + `backup` | 53 分 |
| 企業 HA | `multi-region` + `ha` × 2 + `backup` + `recovery` | 75 分+ |
