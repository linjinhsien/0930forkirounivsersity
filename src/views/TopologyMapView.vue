<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

interface TopologyNode {
  id: string
  label: string
  subtitle: string
  detail: string
  examTip: string
}

interface TopologyPath {
  id: string
  title: string
  domain: string
  color: string
  nodes: TopologyNode[]
}

const paths: TopologyPath[] = [
  {
    id: 'cloud',
    title: '雲端概念',
    domain: 'Domain 1 · Cloud concepts',
    color: 'border-sky-300 bg-sky-50',
    nodes: [
      {
        id: 'deployment',
        label: '部署模型',
        subtitle: 'Public · Private · Hybrid',
        detail: '先判斷工作負載部署在公有雲、私有雲，或同時連接地端與公有雲。',
        examTip: 'Hybrid 描述部署方式，不等同於某個服務模型。',
      },
      {
        id: 'service-model',
        label: '服務模型',
        subtitle: 'IaaS · PaaS · SaaS',
        detail: '由 IaaS 到 SaaS，雲端供應者管理的層面逐漸增加。',
        examTip: 'VM 常考 IaaS；App Service 常考 PaaS；Microsoft 365 常考 SaaS。',
      },
      {
        id: 'responsibility',
        label: '共同責任',
        subtitle: 'Customer ↔ Provider',
        detail: '責任會隨服務模型改變；資料、身分與端點等責任仍需由客戶妥善管理。',
        examTip: '不要把「雲端代管」誤解為客戶不再負責安全。',
      },
      {
        id: 'cloud-value',
        label: '雲端效益',
        subtitle: '彈性 · 可用性 · OpEx',
        detail: '隨需求調整資源、依使用量付費，並透過冗餘設計提升可用性。',
        examTip: 'CapEx 是前期資本投入；OpEx 是持續營運支出。',
      },
    ],
  },
  {
    id: 'scope',
    title: '資源管理階層',
    domain: 'Domain 2 · Architecture and services',
    color: 'border-indigo-300 bg-indigo-50',
    nodes: [
      {
        id: 'root-mg',
        label: 'Root Management Group',
        subtitle: '組織治理根節點',
        detail: '管理群組可組織多個訂用帳戶，並在較高範圍套用治理設定。',
        examTip: '先辨識題目要管理的是跨多個 Subscription 的範圍。',
      },
      {
        id: 'management-group',
        label: 'Management Group',
        subtitle: '跨訂用帳戶治理',
        detail: '管理群組包含子管理群組或訂用帳戶；支援在較高層集中治理。',
        examTip: '跨 Subscription 統一 Policy，常以 Management Group 作為 Scope。',
      },
      {
        id: 'subscription',
        label: 'Subscription',
        subtitle: '帳務與資源界線',
        detail: '訂用帳戶提供帳務與配額等管理界線，也是資源群組的上層。',
        examTip: '部門要分開帳務或配額時，評估使用不同 Subscription。',
      },
      {
        id: 'resource-group',
        label: 'Resource Group',
        subtitle: '資源生命週期容器',
        detail: '資源群組是單一 Subscription 內的邏輯容器，可依共同生命週期組織資源。',
        examTip: '資源群組不是帳務邊界；群組內資源可位於不同 Region。',
      },
      {
        id: 'resource',
        label: 'Resource',
        subtitle: 'VM · Storage · VNet',
        detail: 'Azure 資源是實際部署及管理的服務實例；一個資源只屬於一個資源群組。',
        examTip: '刪除 Resource Group 會連帶刪除其中資源，操作前要確認影響範圍。',
      },
    ],
  },
  {
    id: 'global',
    title: '全球基礎設施',
    domain: 'Domain 2 · Architecture and services',
    color: 'border-cyan-300 bg-cyan-50',
    nodes: [
      {
        id: 'geography',
        label: 'Geography',
        subtitle: '資料主權與地理邊界',
        detail: '地理位置可能包含多個 Region，並與資料駐留及合規要求相關。',
        examTip: '有資料所在地限制時，先確認可用的 Geography 與 Region。',
      },
      {
        id: 'region',
        label: 'Region',
        subtitle: '服務部署位置',
        detail: 'Azure Region 是一組資料中心所在的地理區域，服務可用性依 Region 而異。',
        examTip: '不是每個 Azure Region 都支援 Availability Zones。',
      },
      {
        id: 'availability-zone',
        label: 'Availability Zone',
        subtitle: '同一 Region 內的隔離位置',
        detail: '可用性區域位於同一 Region，透過獨立的資料中心基礎設施提升區域內容錯能力。',
        examTip: '跨 Zone 著重抵禦單一資料中心故障；不是跨 Region 災難復原。',
      },
      {
        id: 'region-pair',
        label: 'Region Pair',
        subtitle: '不同 Region 的復原關係',
        detail: '部分 Azure 區域依服務設計有配對區域；資料複寫與故障移轉仍需確認服務設定。',
        examTip: 'Region Pair 不代表所有服務都會自動複寫或自動故障移轉。',
      },
    ],
  },
  {
    id: 'workload',
    title: '工作負載與流量路徑',
    domain: 'Domain 2 · Architecture and services',
    color: 'border-violet-300 bg-violet-50',
    nodes: [
      {
        id: 'user',
        label: '使用者',
        subtitle: 'Web / API 請求',
        detail: '先依工作負載需求判斷入口、網路邊界、運算和資料服務。',
        examTip: '按題目限制選服務，不要只看服務名稱或「最新」技術。',
      },
      {
        id: 'traffic',
        label: 'DNS / 流量入口',
        subtitle: '名稱解析與導流',
        detail: 'DNS 解析名稱；應用程式閘道可處理區域內 HTTP(S) 第 7 層流量與 WAF。',
        examTip: '跨全球 DNS 導流與區域內 Layer 7 負載平衡是不同層次。',
      },
      {
        id: 'network',
        label: 'VNet · NSG · Private Endpoint',
        subtitle: '網路隔離與存取控制',
        detail:
          'VNet 建立私有網路範圍；NSG 篩選網路流量；Private Endpoint 讓服務透過私有 IP 存取。',
        examTip: 'NSG 控制網路流量，不取代身分驗證或 Azure RBAC。',
      },
      {
        id: 'compute',
        label: 'Compute',
        subtitle: 'VM · App Service · Functions · AKS',
        detail:
          'VM 提供 OS 控制；App Service 適合受控 Web 應用；Functions 適合事件觸發程式；AKS 用於 Kubernetes 編排。',
        examTip: 'ACI 適合快速執行獨立容器；複雜容器協調才考慮 AKS。',
      },
      {
        id: 'data',
        label: '資料服務',
        subtitle: 'Azure SQL · Cosmos DB · Blob',
        detail: '依資料形態和存取模式挑選關聯式、全球分散式 NoSQL 或非結構化物件儲存。',
        examTip: '全球多區域低延遲寫入常指向 Cosmos DB；檔案、物件與區塊儲存用途不同。',
      },
    ],
  },
  {
    id: 'governance',
    title: '身分、安全與治理',
    domain: 'Domain 3 · Management and governance',
    color: 'border-amber-300 bg-amber-50',
    nodes: [
      {
        id: 'identity',
        label: 'Microsoft Entra ID',
        subtitle: '身分驗證',
        detail: '管理使用者、群組及工作負載身分，提供身分驗證與相關功能。',
        examTip: '先確認「誰是使用者／主體」，再判斷授權方式。',
      },
      {
        id: 'rbac',
        label: 'Azure RBAC',
        subtitle: '主體 + 角色 + Scope',
        detail: '以角色指派決定主體可對特定 Scope 執行哪些管理操作。',
        examTip: 'RBAC 管理「誰可以做什麼」；權限可依 Scope 向下繼承。',
      },
      {
        id: 'policy',
        label: 'Azure Policy',
        subtitle: '評估與強制組態規則',
        detail: 'Policy 可在管理範圍評估資源是否符合規則，並使用適當效果稽核或限制部署。',
        examTip: 'Policy 管合規，不會授予使用者權限。',
      },
      {
        id: 'locks-tags',
        label: 'Locks · Tags',
        subtitle: '防誤刪 · 資源中繼資料',
        detail: 'Locks 防止刪除或修改；Tags 是分類中繼資料，可支援成本與資產管理。',
        examTip: 'Tags 不會自動繼承；RBAC、Policy、Lock 的目的不要混淆。',
      },
      {
        id: 'operations',
        label: '監控與可靠性',
        subtitle: 'Monitor · Advisor · Service Health',
        detail:
          'Monitor 蒐集遙測；Advisor 提供可靠性、安全性、效能與成本建議；Service Health 通知影響訂用帳戶的服務事件。',
        examTip: 'Monitor 看資源遙測；Service Health 看 Azure 服務事件；Advisor 提供最佳化建議。',
      },
    ],
  },
  {
    id: 'cost-governance',
    title: '成本治理與 FinOps',
    domain: 'Domain 3 · Day 27',
    color: 'border-emerald-300 bg-emerald-50',
    nodes: [
      {
        id: 'cost-drivers',
        label: '雲端成本驅動因素',
        subtitle: '用量 · SKU · 區域 · 流量',
        detail:
          '費用會受資源類型與層級、運作時間、儲存容量與冗餘選項、區域定價及資料傳輸等因素影響。估算時要把架構拆成服務與用量假設，不能只看單一 VM 的時薪。',
        examTip:
          '題目若提到大量跨區或對外傳輸，除了運算與儲存，也要檢查網路傳輸費；不同 SKU、區域和備援設定可能改變成本。',
      },
      {
        id: 'capex-opex',
        label: 'CapEx 與 OpEx',
        subtitle: '前期資本投入 · 持續營運支出',
        detail:
          'CapEx 通常代表先購置資料中心、硬體或授權等長期資產；OpEx 則是按期間或使用量支付服務費用。雲端計費常使組織降低部分前期投入，但不代表所有雲端支出都必然較低。',
        examTip: '按用量付費通常與 OpEx 有關；不要把 OpEx 解讀成「沒有成本」或「一定便宜」。',
      },
      {
        id: 'pricing-calculator',
        label: 'Azure Pricing Calculator',
        subtitle: '部署前 · 預估成本',
        detail:
          '在設計階段列出預計使用的 Azure 服務、SKU、區域、運作時數、容量與選用項目，建立預估成本並比較不同方案。估算結果依輸入假設而變，實際費用仍以部署後的用量、合約與計費條件為準。',
        examTip:
          '題目問部署前比較方案或預估服務費用，選 Pricing Calculator；這不是查詢既有消費或設定支出告警的工具。',
      },
      {
        id: 'cost-management',
        label: 'Cost Management · Cost Analysis',
        subtitle: '部署後 · 實際成本與趨勢',
        detail:
          '部署後使用 Cost Management 檢視已發生支出、趨勢與預測，並依可用範圍及維度（例如訂用帳戶、資源群組、服務或標籤）找出主要成本來源。發現差異後，再回到資源用量、設定與標記檢查原因。',
        examTip:
          '查詢過去花費、比較期間趨勢或按服務分析支出，使用 Cost Analysis；不要用部署前估算器回答實際帳單問題。',
      },
      {
        id: 'budgets',
        label: 'Azure Budgets · Cost Alerts',
        subtitle: '設定門檻 · 追蹤與通知',
        detail:
          '在特定管理範圍和期間設定預算，追蹤實際或預測支出是否接近門檻，並透過告警通知相關人員。預算適合用來及早發現超支風險；通知後仍需由負責人或明確設定的自動化採取後續措施。',
        examTip:
          'Budget 是成本監控和告警機制，不會預設自動關閉 VM、拒絕資源部署或形成硬性消費上限。',
      },
      {
        id: 'cost-tags',
        label: 'Tags · Cost Allocation',
        subtitle: '部門 · 專案 · 環境',
        detail:
          '以一致的名稱和值標記資源，例如部門、專案、成本中心或環境，再搭配成本分析分組和檢視歸屬。標籤策略要先定義命名規則；若要求部署時必須帶有特定標籤，可用 Azure Policy 評估或強制相關規則。',
        examTip:
          'Tags 是資源中繼資料，不是權限或保護控制；標籤不會自動向子資源或新資源繼承，需透過治理規則或流程補足。',
      },
      {
        id: 'cost-optimization',
        label: '承諾型用量折扣',
        subtitle: 'Reservations · Savings plans',
        detail:
          '對長期穩定且可預測的用量，先用帳單和使用資料確認基準，再評估適用的 Reservation 或 Savings plan。折扣通常伴隨期限、範圍、資源資格或用量承諾等條件，並非所有服務都能套用。',
        examTip:
          '穩定長期負載才評估承諾型折扣；避免在未掌握用量或工作負載可能大幅變動時，假設承諾一定能省錢。',
      },
      {
        id: 'hybrid-benefit',
        label: 'Azure Hybrid Benefit',
        subtitle: '合格既有授權的使用效益',
        detail:
          '符合條件的組織可評估將既有 Microsoft 授權權益用於特定 Azure 工作負載，以調整部分授權成本。適用產品、授權資格、使用規則及申報要求都要依目前條款確認。',
        examTip:
          '題目描述已持有合格授權且要降低特定 Azure 授權成本時，才考慮 Hybrid Benefit；它不是通用的雲端折扣。',
      },
      {
        id: 'tco-calculator',
        label: 'TCO 與遷移成本比較',
        subtitle: '現況成本 · 雲端方案假設',
        detail:
          '遷移評估要比較現有資料中心的硬體、維運、人力與授權等總體成本，以及遷移後方案的持續費用和一次性工作。計算結果取決於假設與資料完整度，應視為規劃輸入而非保證節省。',
        examTip:
          '先辨認題目是在比較現有環境與遷移方案的總體成本，還是在估算特定 Azure 服務；服務估價與整體遷移成本分析不是同一個問題。',
      },
      {
        id: 'finops-cycle',
        label: '成本治理閉環',
        subtitle: '估算 → 量測 → 解釋 → 行動',
        detail:
          '先用架構與用量假設估算，再於部署後量測實際成本；透過範圍、服務、資源與標籤定位變化，設定預算通知，最後調整容量、排程、架構或購買方案，並持續驗證效果。',
        examTip:
          '預算告警只是訊號，不是最佳化本身。看到超支時先找出成本來源，再選擇合適的技術或治理行動。',
      },
    ],
  },
  {
    id: 'day-7-review',
    title: 'Day 7 · 核心架構階段複習',
    domain: 'Day 7 · Cloud concepts, architecture, and governance',
    color: 'border-blue-300 bg-blue-50',
    nodes: [
      {
        id: 'day7-service-models',
        label: '服務模型與管理責任',
        subtitle: 'IaaS · PaaS · SaaS',
        detail:
          '沿著 IaaS、PaaS 到 SaaS，供應者管理的技術層面通常增加；客戶仍需依服務與情境管理資料、身分、存取和端點等責任。判斷題目時要先看客戶是否需要控制作業系統、執行階段或應用程式。',
        examTip:
          '若只要求部署自訂網站而不想維護作業系統，優先辨認 PaaS；SaaS 也不代表客戶完全不負責安全。',
      },
      {
        id: 'day7-deployment-models',
        label: '公有 · 私有 · 混合雲',
        subtitle: '部署位置與連線方式',
        detail:
          '公有雲使用雲端供應者提供的服務；私有雲供單一組織專用；混合雲把地端或私有環境與公有雲結合。混合雲描述部署組合，不是 IaaS、PaaS 或 SaaS 的另一種服務模型。',
        examTip:
          '若題目要求資料保留在地端、同時使用公有雲服務，先辨識混合雲需求；不要把混合雲直接等同私有雲。',
      },
      {
        id: 'day7-responsibility',
        label: '共同責任隨服務改變',
        subtitle: '實體層 · OS · 應用 · 資料',
        detail:
          '責任分界會隨部署方式與服務模型移動：雲端供應者負責雲端基礎設施；客戶對資料、帳戶和存取等仍有責任，IaaS 的 OS 管理工作也比受控 PaaS 多。SaaS、PaaS 或 IaaS 的責任表述要依具體控制項理解。',
        examTip: '不要只背「供應者管理更多」；依題目問的安全層、資料或設定，逐項確認由誰負責。',
      },
      {
        id: 'day7-resource-scope',
        label: '跨訂用帳戶治理階層',
        subtitle: 'Management Group → Subscription → Resource Group → Resource',
        detail:
          '管理群組可組織多個訂用帳戶；訂用帳戶再包含資源群組與資源。治理設定的範圍應對準需要涵蓋的資源集合，較高層的指派可依規則向下套用。',
        examTip:
          '題目若要跨多個訂用帳戶集中管理，辨認 Management Group；單一資源生命週期的組織則通常看 Resource Group。',
      },
      {
        id: 'day7-zone-region',
        label: '可用性區域與區域復原',
        subtitle: 'Zone ≠ Region Pair',
        detail:
          'Availability Zone 是同一 Azure Region 內具隔離性的資料中心位置，可協助應對區域內局部故障；跨 Region 的備援處理更廣範圍的中斷，但複寫、流量切換與復原仍取決於服務設定和設計。',
        examTip:
          '單一資料中心故障對應 Zone 層級；整個區域中斷要看跨 Region 設計。Region Pair 不代表所有服務都會自動故障移轉。',
      },
      {
        id: 'day7-operations',
        label: '監控、建議與服務事件',
        subtitle: 'Monitor · Advisor · Service Health',
        detail:
          'Azure Monitor 著重收集和分析資源遙測；Advisor 提供可靠性、效能、安全性或成本方面的建議；Service Health 說明可能影響訂用帳戶的 Azure 服務事件與維護資訊。依問題要找的資訊選工具。',
        examTip:
          '查資源指標和記錄、取得最佳化建議、了解 Azure 服務事件，是三種不同任務，別把工具名稱互換。',
      },
      {
        id: 'day7-audit',
        label: '管理操作與稽核軌跡',
        subtitle: 'Activity Log · 操作紀錄',
        detail:
          '調查誰對 Azure 訂用帳戶資源執行管理操作時，應查看可用的活動記錄與其事件細節，再依保留需求匯出或整合記錄。資源遙測、登入事件和 Azure 管理操作記錄代表不同的觀察面向。',
        examTip:
          '題目問「誰停止了 VM」或資源管理操作發生了什麼，先找 Activity Log，而不是只看效能指標。',
      },
      {
        id: 'day7-admin-tools',
        label: '入口網站與命令列工具',
        subtitle: 'Portal · CLI · Cloud Shell',
        detail:
          'Azure Portal 提供圖形化管理介面；Azure CLI 可用命令列跨平台管理資源；Cloud Shell 是可從瀏覽器使用的管理環境。選擇工具時要依題目限制，例如是否能安裝本機工具或是否只有瀏覽器可用。',
        examTip:
          '要求跨平台指令管理可辨認 Azure CLI；無法安裝本機工具但能使用瀏覽器時，考慮 Cloud Shell。',
      },
    ],
  },
  {
    id: 'day-28-reasoning',
    title: 'Day 28 · 題型與情境推理',
    domain: 'Day 28 · Question analysis and knowledge graph',
    color: 'border-fuchsia-300 bg-fuchsia-50',
    nodes: [
      {
        id: 'day28-question-shapes',
        label: '題型只是呈現介面',
        subtitle: '選擇 · 配對 · 排序 · 圖形判讀',
        detail:
          '先讀懂題目要求的輸出形式，再處理 Azure 概念。配對題要確認兩邊分類維度一致；排序題要確認方向與先後條件；圖形題要把文字限制對回畫面中的元件。',
        examTip:
          '不要因為介面看起來熟悉就直接拖放答案；先確認問題問的是服務、責任、範圍、順序還是限制。',
      },
      {
        id: 'day28-evidence',
        label: '官方資訊與練習設計分開',
        subtitle: '考綱事實 · 教材練習 · 社群題目',
        detail:
          '把官方技能大綱和 Microsoft Learn 用於確認目前考試範圍與服務行為；把社群整理的題型與模擬情境當作練習材料。題目格式或網路流傳的計分說法可能過時，不能直接推論為正式考試規則。',
        examTip:
          '遇到題數、時間、計分或「官方一定如此」的說法，先找官方當期說明，不把練習介面當成考試規格。',
      },
      {
        id: 'day28-constraints',
        label: '先抽出決策限制',
        subtitle: '管理負擔 · 私有連線 · 成本 · 範圍',
        detail:
          '把情境改寫成可判斷的條件：誰使用、資料放在哪裡、是否可公開連線、要保留多少作業系統控制、跨哪些資源範圍，以及限制的成本或可用性目標。再用限制排除不合適選項。',
        examTip: '只找產品名稱容易被干擾；先圈出「必須」「不得」「不需管理」等條件，再判斷服務。',
      },
      {
        id: 'day28-best-fit',
        label: '能做到不等於最符合',
        subtitle: '功能符合 · 約束符合 · 負擔適當',
        detail:
          '多個 Azure 方案可能都能實現某項功能；最佳答案還需符合題目明示的範圍、私有化、維運責任、可用性和成本限制。排除額外複雜或超出需求的方案。',
        examTip:
          '不要只問「這個服務能不能做到」；再問它是否符合全部限制，並是否把不需要的管理工作交給客戶。',
      },
      {
        id: 'day28-absolute-words',
        label: '檢查絕對化敘述',
        subtitle: 'Always · Never · Only · All',
        detail:
          '絕對詞會把適用範圍擴大到所有情況。檢查服務是否有例外、是否取決於設定或 SKU，以及題目有沒有提供足以支持這種絕對結論的條件。',
        examTip:
          '看到「永遠」「完全」「所有」先驗證範圍；不要只因為用詞絕對就自動判錯，也不要忽略題目中的限定條件。',
      },
      {
        id: 'day28-controls',
        label: 'Policy · Lock · RBAC · Tags',
        subtitle: '合規 · 防操作 · 授權 · 分類',
        detail:
          'RBAC 決定主體在指定範圍能執行哪些管理動作；Policy 評估或要求資源組態符合規則；Locks 限制刪除或修改等操作；Tags 提供分類中繼資料。這些機制可以互補，但目的不同。',
        examTip:
          '看到「誰可以做」選授權思維；「資源要符合組態」看 Policy；「避免誤刪」看 Lock；「依專案分類」看 Tags。',
      },
      {
        id: 'day28-sla',
        label: 'SLA 與組合可用性',
        subtitle: '服務承諾 · 架構相依性',
        detail:
          'SLA 說明服務承諾及其條件，不等同於工作負載端到端的保證。多個相依元件組成流程時，整體可用性還受架構、故障域、冗餘方式和共同依賴影響。',
        examTip:
          '不要把單一服務 SLA 直接當作整個應用程式的可用性，也不要把 Zone 或複寫功能視為不需設計的自動保證。',
      },
      {
        id: 'day28-graph',
        label: '以知識圖譜串起考點',
        subtitle: '需求 → 控制層 → 服務 → 驗證',
        detail:
          '把問題中的需求連到負責的控制層，再連到可用服務和操作範圍。例如先確認主體與權限，再判斷 RBAC Scope；或先定位成本來源，再連到預算、標籤與最佳化行動。',
        examTip: '遇到跨域情境，逐步走關係而非孤立背服務名；每一步都要能回扣題目明示的條件。',
      },
    ],
  },
  {
    id: 'day-29-practice',
    title: 'Day 29 · 隨機情境模擬（一）',
    domain: 'Day 29 · Scenario practice across AZ-900 domains',
    color: 'border-orange-300 bg-orange-50',
    nodes: [
      {
        id: 'day29-migration',
        label: '遷移評估與雲端財務',
        subtitle: '現況盤點 · 成本假設 · 遷移方式',
        detail:
          '遷移題要辨認現有工作負載、相依性、相容性與組織限制，再評估保留、調整或採用受控服務等路徑。財務比較需包含現況成本、雲端持續費用和遷移工作，不以單一服務報價代替完整評估。',
        examTip:
          '先看題目是在問遷移評估、現代化方式還是 Azure 服務估價；這些問題所需工具與答案層次不同。',
      },
      {
        id: 'day29-compute',
        label: '運算服務與管理程度',
        subtitle: 'VM · App Service · Functions · Containers',
        detail:
          '比較運算服務時，沿著作業系統控制、部署型態、事件觸發、執行時間與容器協調需求判斷。VM 提供較多主機控制；受控應用平台降低部分基礎設施工作；容器產品依是否需要協調多個工作負載而區分。',
        examTip:
          '不要把「容器」一律導向 Kubernetes，也不要因為工作負載可放在 VM 就忽略題目明示的維運限制。',
      },
      {
        id: 'day29-storage',
        label: '儲存類型與存取層',
        subtitle: '物件 · 檔案 · 磁碟 · 存取頻率',
        detail:
          '先判斷資料是物件、共享檔案或 VM 磁碟，再看存取頻率、延遲、冗餘及保留需求。存取層可以配合資料讀取模式管理儲存成本，但較低成本層可能有不同的存取費用或最短保留條件。',
        examTip: '先從資料型態與存取模式選儲存方案，再評估備援與層級；不要只比較每 GB 價格。',
      },
      {
        id: 'day29-network',
        label: '網路隔離與流量控制',
        subtitle: 'VNet · NSG · Private Link · WAF',
        detail:
          'VNet 提供網路範圍；NSG 根據規則篩選網路流量；Private Endpoint 可讓支援的服務透過私有 IP 連線；應用程式閘道與 WAF 著重區域內 HTTP(S) 流量及 Web 威脅防護。不同層次的控制需依流量路徑搭配。',
        examTip:
          '網路可達性不等於身分授權。先判斷題目要私有連線、封包篩選、Web 防護還是全球流量導向。',
      },
      {
        id: 'day29-governance',
        label: '治理階層與控制選擇',
        subtitle: 'Scope · Policy · RBAC · Lock',
        detail:
          '治理題通常同時測範圍與控制目的：先找出需涵蓋的訂用帳戶或資源，再決定是驗證組態、授與人員權限、阻止危險操作，或組織成本與資產資料。',
        examTip:
          '管理多個訂用帳戶時先想 Management Group Scope；不要把 Policy、RBAC 和 Resource Lock 當作可互換工具。',
      },
      {
        id: 'day29-resilience',
        label: '擴展、備份與災難復原',
        subtitle: '流量波動 · 保護資料 · RTO/RPO',
        detail:
          '流量成長情境要分清擴展運算與分散流量；誤刪或資料損毀要看備份與保留；重大區域中斷則需考慮跨區復原。Recovery Point Objective 關注可接受的資料損失量，Recovery Time Objective 關注可接受的復原時間。',
        examTip: '高可用性、備份與災難復原各自處理不同風險；先辨認故障類型和復原目標。',
      },
      {
        id: 'day29-identity',
        label: '身分與祕密管理',
        subtitle: 'Entra ID · MFA · Key Vault',
        detail:
          '身分題先識別人員、外部協作者或工作負載身分，再決定驗證、授權與條件式保護；應用程式機密應使用適當的祕密管理方式，避免寫入程式碼或以長期明文憑證傳遞。',
        examTip: '登入驗證與 Azure 資源授權是不同步驟；保存祕密也不等同於授予資源權限。',
      },
      {
        id: 'day29-data',
        label: '資料庫與資料分析',
        subtitle: '關聯式 · NoSQL · 分析工作負載',
        detail:
          '依資料結構、查詢模型、一致性、全球分散需求及既有應用相容性挑選資料服務。遷移傳統資料庫時，先判斷是否需保留相容性或可調整到受控資料平台；大量分析與交易處理也可能需要不同服務。',
        examTip:
          '全球分散且低延遲存取與傳統關聯式交易是不同需求；不要因為題目提到「資料」就選同一種資料庫。',
      },
      {
        id: 'day29-monitoring',
        label: '操作記錄、監控與服務狀態',
        subtitle: 'Activity Log · Monitor · Service Health',
        detail:
          '排查時先定位問題所在：管理操作查活動記錄，資源效能與遙測查監控資料，影響 Azure 平台或訂用帳戶的事件則看服務健康資訊。SLA 是承諾條件，不是事件排查介面。',
        examTip: '題目問「誰改了資源」「資源表現如何」「Azure 是否有服務事件」時，對應不同工具。',
      },
      {
        id: 'day29-cost',
        label: '預算、標籤與長期用量',
        subtitle: '分析支出 · 成本歸屬 · 折扣資格',
        detail:
          '先透過成本分析找出趨勢與主要支出，再用標籤支援部門或專案歸屬，並設定預算通知。對確認穩定的長期用量再檢視承諾型方案；可中斷工作負載則另評估合適的低成本運算選項。',
        examTip:
          '告警不會自然停止消費；承諾折扣也需要合格資源與穩定用量，不能只按「長期」二字選答案。',
      },
      {
        id: 'day29-devtools',
        label: '開發、部署與雲端工具',
        subtitle: 'CI/CD · IaC · CLI · SaaS',
        detail:
          '自動化題要區分程式碼部署流程、宣告式基礎設施定義及互動式管理工具；現成協作應用則屬於另一層服務消費方式。依需求選工具，而不是把所有管理任務都交給單一命令列介面。',
        examTip:
          'Infrastructure as Code 描述資源組態；CI/CD 管理建置與交付流程；SaaS 提供可直接使用的軟體。',
      },
    ],
  },
  {
    id: 'day-30-capstone',
    title: 'Day 30 · 跨域情境終局拓樸',
    domain: 'Day 30 · Integrated architecture and governance',
    color: 'border-rose-300 bg-rose-50',
    nodes: [
      {
        id: 'day30-landing-zone',
        label: '遷移、治理與 Landing Zone',
        subtitle: '評估 → 規劃 → 建置基礎治理',
        detail:
          '企業遷移要先掌握應用、資料、網路與法規相依，再逐步建立帳戶／訂用帳戶、身分、網路、政策、記錄及成本治理等基礎。Landing Zone 是可擴展的環境基線，不是單一 Azure 產品。',
        examTip: '題目若跨多個團隊或訂用帳戶，先找出治理範圍與共同基線，再挑單一服務解決局部需求。',
      },
      {
        id: 'day30-compliance',
        label: '合規、資料主權與區域限制',
        subtitle: '政策範圍 · 資料位置 · 服務可用性',
        detail:
          '合規情境要確認資料所在地、服務所在區域、組織政策和適用雲端環境。先驗證服務在目標區域和環境是否可用，再以治理規則限制允許的位置；不能只因服務名稱相同就假設功能或認證完全一致。',
        examTip: '地理位置要求不是單靠標籤即可保證；需把部署位置和可強制的政策規則一起核對。',
      },
      {
        id: 'day30-zero-trust',
        label: '零信任與身分治理',
        subtitle: '明確驗證 · 最低權限 · 假設已遭入侵',
        detail:
          '零信任要求依身分、裝置、位置與風險等訊號持續驗證存取，並以最低權限控制可執行的操作。身分生命週期、外部協作者、特權角色與工作負載憑證都需納入治理。',
        examTip:
          'MFA 強化驗證但不取代授權；RBAC 管 Azure 資源操作權限，身分治理則涵蓋更廣的身分生命週期與存取決策。',
      },
      {
        id: 'day30-security-layers',
        label: '分層安全控制',
        subtitle: '網路 · 身分 · 組態 · 威脅偵測',
        detail:
          '安全架構可同時使用網路隔離、身分驗證與授權、資源組態治理、祕密管理和威脅偵測。每層處理不同風險，安全分數或建議可協助找改善方向，但不等於已自動修復所有弱點。',
        examTip:
          '防火牆、NSG、Policy、RBAC 與安全監控不是同一種控制；依題目要限制流量、設定、操作或偵測威脅選擇。',
      },
      {
        id: 'day30-cost-automation',
        label: '成本分析與告警自動化',
        subtitle: '發現異常 · 通知 · 明確執行行動',
        detail:
          '針對成本異常，先由成本分析定位時間、服務與資源，再設定預算門檻和負責人通知。若要超支後停機，必須另外設計並測試明確的自動化流程、權限及例外處理；不可把預算告警視為自動斷電。',
        examTip: 'Budget 負責追蹤和通知；自動停機是額外工作流程，需考慮生產影響、觸發條件與授權。',
      },
      {
        id: 'day30-resilience',
        label: '高可用性、SLA 與復原目標',
        subtitle: 'Zone · Region · RTO · RPO',
        detail:
          '先界定故障範圍，再選擇可用性區域、跨區部署、資料複寫或備份等設計。RTO 是恢復服務的時間目標；RPO 是可接受的資料回復點／損失窗口。SLA 與服務配置提供輸入，不能替代端到端架構驗證。',
        examTip:
          '備援位置、複寫模式和故障切換要與 RTO/RPO 一起檢查；備份存在不代表服務能即時恢復。',
      },
      {
        id: 'day30-storage',
        label: '儲存隔離、生命週期與備援',
        subtitle: 'Private Endpoint · Access Tier · Lifecycle',
        detail:
          '儲存體情境要分開處理網路存取、資料層級、生命週期和冗餘：私有端點控制連線路徑；存取層反映讀取模式；生命週期規則可依條件轉層或刪除；備援方式則影響可用性與資料保護。',
        examTip: '私有連線不等於資料加密或授權；低頻存取層也不等於備份，需逐項對應需求。',
      },
      {
        id: 'day30-observability',
        label: '監控、記錄與相依性',
        subtitle: '指標 · 記錄 · 追蹤 · 服務事件',
        detail:
          '完整觀測需蒐集資源指標、記錄與應用程式追蹤，並將服務健康事件和管理操作記錄分別處理。跨服務相依性圖有助定位故障傳遞路徑，但須搭配可用的遙測與明確的告警條件。',
        examTip:
          '監控資源狀態、追蹤應用程式呼叫、查看平台服務事件和稽核管理操作，需選擇對應資料來源。',
      },
      {
        id: 'day30-data-pipeline',
        label: '資料、訊息與 IoT 管線',
        subtitle: '事件擷取 · 訊息處理 · 資料庫選型',
        detail:
          'IoT 或即時資料架構通常分成裝置連線與事件擷取、訊息緩衝或路由、計算處理及儲存分析等階段。全球多區域資料庫、交易訊息佇列與分析平台服務解決不同問題，需按一致性、順序、規模和延遲需求挑選。',
        examTip:
          '先找出題目問的是裝置管理、事件串流、可靠訊息傳遞、交易資料還是分析查詢，避免只用「大量資料」判斷產品。',
      },
      {
        id: 'day30-network-routing',
        label: '混合網路與全球流量導向',
        subtitle: 'VNet · 專用連線 · DNS · 負載平衡',
        detail:
          '混合環境需區分加密的網際網路隧道與專用連線需求；應用程式內部流量、區域入口和全球 DNS 導向也屬不同層次。設計需明確處理路由、可用性、備援路徑與服務範圍。',
        examTip:
          '跨全球端點的 DNS 導向與單一 Region 的第 7 層負載平衡不是相同功能；專線備援也要看題目對成本和可用性的要求。',
      },
      {
        id: 'day30-developer-platform',
        label: '開發平台與基礎設施自動化',
        subtitle: 'CI/CD · IaC · CLI · Cloud Shell',
        detail:
          '企業交付流程需要區分應用程式建置與部署、基礎設施宣告及日常資源管理。使用宣告式範本與版本控制可重複建立環境；部署流程仍需驗證權限、秘密管理與環境差異。',
        examTip:
          '題目問重複建立基礎設施時辨認 IaC；問瀏覽器中管理資源可辨認 Cloud Shell；問應用交付則看 CI/CD 平台。',
      },
      {
        id: 'day30-economics',
        label: '雲端經濟與部署模型',
        subtitle: '彈性 · 隨用付費 · 混合雲 · 私有雲',
        detail:
          '雲端的經濟效益取決於需求彈性、資源利用率、資本與營運支出、管理成本及合約條件。部署模型要依控制、專用性、連線和合規需求判斷；混合雲連接多種環境，私有雲則著重單一組織專用。',
        examTip: '雲端不保證任何工作負載都更便宜；把經濟假設、資源用量與部署模型分開判讀。',
      },
    ],
  },
]

// cxcxc-io 風格：特定 path 的 ASCII box diagram（FinOps、Day 27-30）
const asciiBoxDiagram: Record<string, string> = {
  'cost-governance': `┌──────────────────────────────────────────────────────────┐
│              💰 Titan FinOps 成本治理閉環                  │
├──────────────────────────────────────────────────────────┤
│  還沒部署                                                │
│      │                                                   │
│      ▼                                                   │
│  Pricing Calculator  ←── 估算架構費用（部署前）           │
│      │                                                   │
│  ─────────────── 部署 ──────────────────                  │
│      │                                                   │
│      ▼                                                   │
│  Cost Management + Cost Analysis                         │
│      │  「實際花了多少？哪個 Scope 在增加？」              │
│      │                                                   │
│      ├──────────────► Budgets / Cost Alerts              │
│      │                 「50% → 80% → 100% 通知」          │
│      ▼                                                   │
│  Tags / Cost Allocation                                  │
│      「部門 / 專案 / 環境 → 成本歸屬」                   │
│      │                                                   │
│      ▼                                                   │
│  Reservations / Savings Plan / Hybrid Benefit            │
│      「長期穩定用量 → 承諾型折扣」                        │
└──────────────────────────────────────────────────────────┘`,
  'day-28-reasoning': `┌──────────────────────────────────────────────────────────┐
│         🧭 Day 28 · 知識圖譜解題拓樸                      │
├──────────────────────────────────────────────────────────┤
│  題目情境                                                │
│      │                                                   │
│      ▼                                                   │
│  抽出決策限制 ────► 誰用 / 資料在哪 / 可否公開            │
│      │               管理負擔 / 成本 / 範圍               │
│      ▼                                                   │
│  控制層對照                                              │
│  ├─ 「誰可以做」    → RBAC (授權)                        │
│  ├─ 「資源要合規」  → Azure Policy (評估/強制)            │
│  ├─ 「避免誤刪」    → Resource Lock                      │
│  └─ 「依專案分類」  → Tags (中繼資料)                    │
│      │                                                   │
│      ▼                                                   │
│  Best-fit = 功能符合 + 限制符合 + 管理負擔最低            │
└──────────────────────────────────────────────────────────┘`,
  'day-30-capstone': `┌──────────────────────────────────────────────────────────┐
│         🏆 Day 30 · 跨域整合架構拓樸                      │
├──────────────────────────────────────────────────────────┤
│  Landing Zone (基礎治理基線)                             │
│  ├─ Management Group → Subscription → RG                 │
│  ├─ Azure Policy (Allowed Locations / Tags)               │
│  └─ Activity Log / Monitor / Cost Budgets                 │
│      │                                                   │
│      ▼                                                   │
│  Zero Trust (零信任)                                     │
│  Entra ID → MFA → Conditional Access → RBAC             │
│      │                                                   │
│      ▼                                                   │
│  分層安全                                                │
│  NSG → Private Endpoint → Policy → Key Vault → Defender │
│      │                                                   │
│      ▼                                                   │
│  可靠性 / 復原                                           │
│  Zone (單 DC 故障) → Region Pair (整區故障) → RTO/RPO    │
└──────────────────────────────────────────────────────────┘`,
}

// cxcxc-io 風格：每個 path 的單行 ASCII flow
const asciiFlow: Record<string, string> = {
  cloud: '☁️ 部署模型 → 服務模型 → 共同責任 → 雲端效益',
  scope: '🏗️ Root MG → MG → Subscription → RG → Resource',
  global: '🌏 Geography → Region → AZ → Region Pair',
  workload: '🚦 User → DNS → VNet/NSG → Compute → Data',
  governance: '🔐 Entra ID → RBAC → Policy → Locks/Tags → Monitor',
  'cost-governance': '💰 估算 → 部署 → Cost Analysis → Budgets → Tags → 折扣',
  'day-7-review': '📋 Day 7 · IaaS/PaaS/SaaS → 責任 → 階層 → AZ → 工具',
  'day-28-reasoning': '🧭 Day 28 · 題型 → 限制 → Best-fit → 控制對照',
  'day-29-practice': '🎯 Day 29 · 遷移 → 運算 → 儲存 → 網路 → 治理 → 身分',
  'day-30-capstone': '🏆 Day 30 · Landing Zone → 零信任 → 安全分層 → FinOps',
}

const selectedNodeId = ref(paths[0].nodes[0].id)
const selectedNode = computed(() =>
  paths.flatMap((path) => path.nodes).find((node) => node.id === selectedNodeId.value)!
)
const selectedPath = computed(() =>
  paths.find((path) => path.nodes.some((node) => node.id === selectedNodeId.value))
)
</script>

<template>
  <section data-testid="topology-map" aria-labelledby="topology-title" class="mx-auto max-w-7xl">
    <header class="mb-8">
      <p class="text-sm font-semibold uppercase tracking-wide text-blue-700">
        AZ-900 · Day 7, 27–30 Review
      </p>
      <h1 id="topology-title" class="mt-1 text-3xl font-bold sm:text-4xl">AZ-900 知識拓樸圖</h1>
      <p class="mt-3 max-w-3xl text-gray-700">
        從三大考綱領域出發，把雲端概念、Azure 架構服務、成本管理與治理考點串成可追蹤的知識路徑。Day
        7 與 Day 27–30 各自有獨立複習路徑；選取節點查看概念說明與考試辨識重點。
      </p>
      <RouterLink
        to="/codex"
        class="mt-4 inline-flex text-sm font-semibold text-blue-700 underline"
      >
        前往 Azure 架構圖鑑查看服務卡牌
      </RouterLink>
    </header>

    <!-- cxcxc-io 風格：跨域 ASCII 工作負載架構圖 -->
    <div class="mb-8 rounded-2xl border border-blue-400 bg-blue-950 p-5 text-white">
      <p class="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-sky-300">
        ☁️ Knowledge Graph · Azure 雲端工作負載拓樸
      </p>
      <pre class="overflow-x-auto font-mono text-xs leading-relaxed text-sky-100 sm:text-sm">
┌─────────────────────────────────────────────────────────────────┐
│              Azure 跨域工作負載架構拓樸 (AZ-900)                │
├─────────────────────────────────────────────────────────────────┤
│  [用戶端 / 外部]                                                │
│      │                                                          │
│      ▼                                                          │
│  DNS / 流量入口 ──► Application Gateway / WAF (L7)              │
│      │                                                          │
│      ▼                                                          │
│  ┌─────────────────── VNet (私有網路邊界) ──────────────────┐   │
│  │  NSG (封包篩選)    Private Endpoint (服務私有連線)       │   │
│  │      │                      │                            │   │
│  │      ▼                      ▼                            │   │
│  │  Compute Layer          Data Layer                       │   │
│  │  ├─ VM (IaaS)           ├─ Azure SQL (關聯式)            │   │
│  │  ├─ App Service (PaaS)  ├─ Cosmos DB (全球 NoSQL)        │   │
│  │  ├─ Functions (事件驅動) └─ Blob Storage (物件儲存)      │   │
│  │  └─ AKS (容器協調)                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│      │                                                          │
│      ▼                                                          │
│  治理 / 身分 / 成本                                             │
│  Entra ID → RBAC → Policy → Budgets → Cost Analysis → Tags     │
└─────────────────────────────────────────────────────────────────┘</pre>
      <p class="mt-2 text-center text-xs text-blue-200">
        💡 用題目限制條件，沿關係找到適合的控制層與服務
      </p>
    </div>

    <div class="space-y-8">
      <section
        v-for="path in paths"
        :key="path.id"
        class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
        :aria-labelledby="`${path.id}-title`"
      >
        <div class="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 :id="`${path.id}-title`" class="text-xl font-bold text-gray-900">{{ path.title }}</h2>
          <p class="text-sm font-medium text-gray-500">{{ path.domain }}</p>
        </div>
        <!-- cxcxc-io 風格：單行 ASCII flow -->
        <div
          v-if="asciiFlow[path.id]"
          class="mb-4 overflow-x-auto rounded-lg border border-gray-100 bg-gray-900 px-3 py-2"
        >
          <code class="whitespace-nowrap font-mono text-xs text-emerald-300">{{
            asciiFlow[path.id]
          }}</code>
        </div>

        <ol class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <li v-for="(node, index) in path.nodes" :key="node.id" class="min-w-0">
            <span v-if="index > 0" class="mb-1 block text-xs font-semibold text-gray-500"
              >延伸辨析 {{ index }} · relates to</span
            >
            <button
              type="button"
              class="min-w-0 flex-1 rounded-xl border-2 p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              :class="
                selectedNodeId === node.id
                  ? `${path.color} border-blue-700 shadow`
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
              "
              :aria-pressed="selectedNodeId === node.id"
              @click="selectedNodeId = node.id"
            >
              <span class="block text-sm font-bold text-gray-900">{{ node.label }}</span>
              <span class="mt-1 block text-xs text-gray-600">{{ node.subtitle }}</span>
            </button>
          </li>
        </ol>

        <!-- cxcxc-io 風格：特定 path 的 ASCII box diagram（FinOps、Day 28、Day 30） -->
        <div
          v-if="asciiBoxDiagram[path.id]"
          class="mt-5 overflow-x-auto rounded-xl border border-emerald-800 bg-gray-950 px-4 py-4"
        >
          <p class="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-400">
            📐 架構拓樸速查
          </p>
          <pre class="font-mono text-xs leading-relaxed text-emerald-200">{{
            asciiBoxDiagram[path.id]
          }}</pre>
        </div>
      </section>
    </div>

    <section
      class="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:p-6"
      aria-live="polite"
      aria-labelledby="node-detail-title"
      data-testid="topology-node-detail"
    >
      <p class="text-xs font-semibold uppercase tracking-wide text-blue-700">
        {{ selectedPath?.title }} · 節點說明
      </p>
      <h2 id="node-detail-title" class="mt-1 text-xl font-bold">{{ selectedNode.label }}</h2>
      <p class="mt-2 text-gray-800">{{ selectedNode.detail }}</p>
      <p class="mt-3 rounded-lg bg-white/80 p-3 text-sm text-gray-800">
        <strong>考點提示：</strong>{{ selectedNode.examTip }}
      </p>
    </section>

    <!-- cxcxc-io 風格：跨域解題路徑 ASCII tree -->
    <section class="mt-8 rounded-2xl border border-gray-800 bg-gray-950 p-5 sm:p-6">
      <h2 class="text-base font-semibold uppercase tracking-widest text-emerald-400">
        🗺️ Day 7、27–30 跨域解題路徑
      </h2>
      <p class="mt-1 text-xs text-gray-400">依情境類型展開對應的知識樹</p>
      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <div class="overflow-x-auto rounded-xl border border-gray-700 bg-gray-900 p-4">
          <p class="mb-2 text-xs font-semibold text-amber-400">💰 成本治理路徑</p>
          <pre class="font-mono text-xs leading-relaxed text-gray-200">
成本治理
├─ 部署前
│   └─ Pricing Calculator ← 估算架構費用
├─ 部署後
│   ├─ Cost Management / Cost Analysis
│   │   └─ 查實際支出、趨勢、服務分組
│   ├─ Budgets + Cost Alerts
│   │   └─ 50% / 80% / 100% 門檻通知
│   └─ Tags → Cost Allocation
│       └─ 部門 / 專案 / 環境歸屬
└─ 長期優化
    ├─ Reservations（穩定用量承諾）
    ├─ Savings Plan
    └─ Azure Hybrid Benefit（合格授權）</pre>
        </div>

        <div class="overflow-x-auto rounded-xl border border-gray-700 bg-gray-900 p-4">
          <p class="mb-2 text-xs font-semibold text-sky-400">🏗️ 跨訂用帳戶合規路徑</p>
          <pre class="font-mono text-xs leading-relaxed text-gray-200">
合規治理
├─ 範圍界定
│   └─ Management Group → Subscription
├─ 規則設定
│   └─ Azure Policy
│       ├─ Allowed Locations（地區限制）
│       ├─ Require Tags（標籤強制）
│       └─ 稽核 vs 拒絕效果
└─ 驗證
    └─ Compliance 報表 + Activity Log</pre>
        </div>

        <div class="overflow-x-auto rounded-xl border border-gray-700 bg-gray-900 p-4">
          <p class="mb-2 text-xs font-semibold text-violet-400">🔐 最小權限路徑</p>
          <pre class="font-mono text-xs leading-relaxed text-gray-200">
身分與授權
├─ 識別主體
│   └─ Microsoft Entra ID
│       ├─ 使用者 / 群組
│       └─ Managed Identity（工作負載）
├─ 授權
│   └─ Azure RBAC
│       ├─ Role（角色定義）
│       ├─ Scope（MG / Sub / RG / Resource）
│       └─ Assignment（指派）
└─ 強化
    ├─ MFA + Conditional Access
    └─ PIM（特權存取管理）</pre>
        </div>

        <div class="overflow-x-auto rounded-xl border border-gray-700 bg-gray-900 p-4">
          <p class="mb-2 text-xs font-semibold text-rose-400">🛡️ 區域故障復原路徑</p>
          <pre class="font-mono text-xs leading-relaxed text-gray-200">
可靠性設計
├─ 單一 DC 故障
│   └─ Availability Zone (Zone 1/2/3)
│       └─ 同 Region 內隔離基礎設施
├─ 整個 Region 故障
│   ├─ Region Pair（部分服務可複寫）
│   └─ 跨區備份 + 流量切換設計
└─ 復原目標
    ├─ RTO（可接受的復原時間）
    └─ RPO（可接受的資料損失窗口）</pre>
        </div>

        <div
          class="overflow-x-auto rounded-xl border border-gray-700 bg-gray-900 md:col-span-2 p-4"
        >
          <p class="mb-2 text-xs font-semibold text-emerald-400">🎯 考題作答決策樹</p>
          <pre class="font-mono text-xs leading-relaxed text-gray-200">
讀題
├─ Step 1：找出決策限制
│   ├─ 誰用？（使用者 / 工作負載 / 跨部門）
│   ├─ 資料在哪？（地區限制 / 私有連線）
│   ├─ 管理負擔？（不維護 OS → PaaS 方向）
│   └─ 成本 / 範圍限制？
├─ Step 2：判斷所屬控制層
│   ├─ 授權問題    → RBAC + Scope
│   ├─ 合規/強制   → Azure Policy
│   ├─ 防誤刪     → Resource Lock
│   └─ 成本歸屬   → Tags + Cost Analysis
├─ Step 3：排除相似服務
│   ├─ Monitor ≠ Service Health ≠ Advisor
│   ├─ Pricing Calc ≠ Cost Analysis ≠ Budgets
│   └─ Zone ≠ Region Pair ≠ 跨 Region 備援
└─ Step 4：選符合全部限制且管理負擔最低的方案</pre>
        </div>
      </div>
    </section>

    <footer class="mt-8 border-t border-gray-200 pt-5 text-sm text-gray-600">
      參考教材與原始練習頁：
      <a
        href="https://github.com/linjinhsien/linjinhsien.github.io/blob/main/day7.html"
        target="_blank"
        rel="noreferrer"
        class="font-medium text-blue-700 underline"
        >Day 7 練習頁原始碼</a
      >、
      <a
        href="https://github.com/linjinhsien/ithome_az-900/blob/master/ithome_az900_day7.md"
        target="_blank"
        rel="noreferrer"
        class="font-medium text-blue-700 underline"
        >Day 7 Markdown 教材</a
      >、
      <a
        href="https://github.com/linjinhsien/linjinhsien.github.io/blob/main/day27.html"
        target="_blank"
        rel="noreferrer"
        class="font-medium text-blue-700 underline"
        >Day 27 練習頁原始碼</a
      >、
      <a
        href="https://github.com/linjinhsien/ithome_az-900/blob/master/ithome_az900_day27.md"
        target="_blank"
        rel="noreferrer"
        class="font-medium text-blue-700 underline"
        >Day 27 成本治理拓樸</a
      >、
      <a
        href="https://github.com/linjinhsien/linjinhsien.github.io/blob/main/day28.html"
        target="_blank"
        rel="noreferrer"
        class="font-medium text-blue-700 underline"
        >Day 28 練習頁原始碼</a
      >、
      <a
        href="https://github.com/linjinhsien/ithome_az-900/blob/master/ithome_az900_day28.md"
        target="_blank"
        rel="noreferrer"
        class="font-medium text-blue-700 underline"
        >Day 28 知識圖譜與陷阱拓樸</a
      >、
      <a
        href="https://github.com/linjinhsien/linjinhsien.github.io/blob/main/day29.html"
        target="_blank"
        rel="noreferrer"
        class="font-medium text-blue-700 underline"
        >Day 29 練習頁原始碼</a
      >、
      <a
        href="https://github.com/linjinhsien/ithome_az-900/blob/master/ithome_az900_day29.md"
        target="_blank"
        rel="noreferrer"
        class="font-medium text-blue-700 underline"
        >Day 29 情境模考</a
      >、
      <a
        href="https://github.com/linjinhsien/linjinhsien.github.io/blob/main/day30.html"
        target="_blank"
        rel="noreferrer"
        class="font-medium text-blue-700 underline"
        >Day 30 練習頁原始碼</a
      >、
      <a
        href="https://github.com/linjinhsien/ithome_az-900/blob/master/ithome_az900_day30.md"
        target="_blank"
        rel="noreferrer"
        class="font-medium text-blue-700 underline"
        >Day 30 跨域拓樸</a
      >。
    </footer>
  </section>
</template>
