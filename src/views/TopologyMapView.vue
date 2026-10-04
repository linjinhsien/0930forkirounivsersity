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
        label: '監控與成本治理',
        subtitle: 'Monitor · Advisor · Budgets',
        detail:
          'Monitor 蒐集遙測；Advisor 提供改善建議；Cost Management 與 Budget 協助追蹤支出和發出通知。',
        examTip: 'Budget 可發出支出通知，但本身不會自動停止資源或限制消費。',
      },
    ],
  },
]

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
        AZ-900 · Day 28–30 Review
      </p>
      <h1 id="topology-title" class="mt-1 text-3xl font-bold sm:text-4xl">AZ-900 知識拓樸圖</h1>
      <p class="mt-3 max-w-3xl text-gray-700">
        從三大考綱領域出發，把雲端概念、Azure
        架構服務與治理考點串成可追蹤的知識路徑。選取節點查看考試辨識重點。
      </p>
      <RouterLink
        to="/codex"
        class="mt-4 inline-flex text-sm font-semibold text-blue-700 underline"
      >
        前往 Azure 架構圖鑑查看服務卡牌
      </RouterLink>
    </header>

    <div class="mb-8 rounded-2xl border border-blue-200 bg-blue-950 p-5 text-center text-white">
      <p class="text-xs font-semibold uppercase tracking-widest text-sky-200">Knowledge Graph</p>
      <p class="mt-1 text-xl font-bold">Azure 雲端工作負載</p>
      <p class="mt-1 text-sm text-blue-100">用題目中的限制條件，沿關係找到適合的控制層與服務</p>
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

        <ol class="flex flex-col gap-3 md:flex-row md:items-stretch">
          <li
            v-for="(node, index) in path.nodes"
            :key="node.id"
            class="flex min-w-0 flex-1 items-stretch gap-3 md:items-center"
          >
            <span
              v-if="index > 0"
              class="hidden shrink-0 text-center text-xs font-semibold text-gray-500 md:block md:w-16"
              aria-label="relates to"
              >relates to →</span
            >
            <span
              v-if="index > 0"
              class="text-center text-xs font-semibold text-gray-500 md:hidden"
              aria-hidden="true"
              >↓ relates to</span
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

    <section class="mt-8 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <h2 class="text-xl font-bold">Day 28–30 跨域解題路徑</h2>
      <div class="mt-4 grid gap-3 md:grid-cols-2">
        <p class="rounded-lg bg-gray-50 p-4 text-sm text-gray-800">
          <strong>跨訂用帳戶合規：</strong>Management Group 定義治理範圍 → Azure Policy 評估規則 →
          Resource 符合 Allowed Locations。
        </p>
        <p class="rounded-lg bg-gray-50 p-4 text-sm text-gray-800">
          <strong>最小權限：</strong>Microsoft Entra ID 識別主體 → RBAC 指派角色與 Scope →
          主體只取得所需操作權限。
        </p>
        <p class="rounded-lg bg-gray-50 p-4 text-sm text-gray-800">
          <strong>區域故障復原：</strong>Availability Zones 防範單一資料中心故障 → Region Pair /
          備份策略處理更大範圍的中斷。
        </p>
        <p class="rounded-lg bg-gray-50 p-4 text-sm text-gray-800">
          <strong>考題作答：</strong>找出限制條件 → 判斷所屬領域與 Scope → 排除功能不同的相似服務 →
          選符合需求且管理負擔最低的方案。
        </p>
      </div>
    </section>

    <footer class="mt-8 border-t border-gray-200 pt-5 text-sm text-gray-600">
      參考教材：
      <a
        href="https://github.com/linjinhsien/ithome_az-900/blob/master/ithome_az900_day28.md"
        target="_blank"
        rel="noreferrer"
        class="font-medium text-blue-700 underline"
        >Day 28 知識圖譜與陷阱拓樸</a
      >、
      <a
        href="https://github.com/linjinhsien/ithome_az-900/blob/master/ithome_az900_day29.md"
        target="_blank"
        rel="noreferrer"
        class="font-medium text-blue-700 underline"
        >Day 29 情境模考</a
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
