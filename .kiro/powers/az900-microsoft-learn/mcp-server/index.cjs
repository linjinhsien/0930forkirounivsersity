#!/usr/bin/env node
/**
 * Microsoft Learn MCP Server
 * AZ-900 Microsoft Learn Power
 *
 * 實作 MCP (Model Context Protocol) stdio 伺服器
 * 整合 Microsoft Learn Catalog API，提供 AZ-900 內容查詢工具
 *
 * 工具：
 *   - search_modules     搜尋 AZ-900 學習模組
 *   - get_az900_domains  取得考試域資訊
 *   - search_services    搜尋 Azure 服務文件連結
 *   - get_learning_path  取得完整學習路徑
 */

const https = require('https')
const readline = require('readline')

// ─── Microsoft Learn API 設定 ───────────────────────────────────────────────

const MS_LEARN_API = 'learn.microsoft.com'
const LOCALE = process.env.MS_LEARN_LOCALE || 'zh-tw'
const FALLBACK_LOCALE = process.env.MS_LEARN_FALLBACK_LOCALE || 'en-us'

/**
 * 呼叫 Microsoft Learn Catalog API
 * @param {Object} params 查詢參數
 */
function fetchMsLearnCatalog(params = {}) {
  return new Promise((resolve, reject) => {
    const defaultParams = { locale: LOCALE }
    const merged = { ...defaultParams, ...params }
    const query = new URLSearchParams(merged).toString()
    const path = `/api/catalog/?${query}`

    const options = {
      hostname: MS_LEARN_API,
      path,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'az900-card-clash-power/1.0',
      },
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          resolve(JSON.parse(data))
        } catch {
          reject(new Error(`Failed to parse MS Learn response: ${data.slice(0, 200)}`))
        }
      })
    })

    req.on('error', reject)
    req.setTimeout(10000, () => {
      req.destroy()
      reject(new Error('MS Learn API timeout after 10s'))
    })
    req.end()
  })
}

/**
 * 格式化模組清單為簡潔輸出
 */
function formatModules(modules, maxCount = 5) {
  return modules.slice(0, maxCount).map(m => ({
    title: m.title,
    uid: m.uid,
    duration_minutes: m.duration_in_minutes,
    url: `https://learn.microsoft.com/training/modules/${m.uid.split('.').pop()}/`,
    levels: m.levels,
    roles: m.roles,
    summary: m.summary ? m.summary.slice(0, 150) + (m.summary.length > 150 ? '...' : '') : '',
  }))
}

// ─── MCP Tool 定義 ───────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: 'search_modules',
    description: 'Search Microsoft Learn for AZ-900 learning modules by keyword. Returns module titles, URLs, duration, and summaries.',
    inputSchema: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: 'Azure service name or AZ-900 topic to search (e.g. "blob storage", "virtual network", "RBAC")',
        },
        max_results: {
          type: 'number',
          description: 'Maximum number of results to return (1-10, default 5)',
          default: 5,
        },
      },
      required: ['keyword'],
    },
  },
  {
    name: 'get_az900_domains',
    description: 'Get the official AZ-900 certification exam domains with weightings and topic breakdown.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'search_services',
    description: 'Search for Azure service documentation links and AZ-900 exam relevance.',
    inputSchema: {
      type: 'object',
      properties: {
        service_name: {
          type: 'string',
          description: 'Azure service name (e.g. "Azure Key Vault", "Azure Load Balancer")',
        },
      },
      required: ['service_name'],
    },
  },
  {
    name: 'get_learning_path',
    description: 'Get the official Microsoft Learn AZ-900 learning path with all modules in order.',
    inputSchema: {
      type: 'object',
      properties: {
        domain: {
          type: 'string',
          description: 'Specific domain to focus on: "cloud-concepts", "architecture-services", or "management-governance". Leave empty for full path.',
          enum: ['cloud-concepts', 'architecture-services', 'management-governance', ''],
        },
      },
    },
  },
]

// ─── Tool 執行邏輯 ───────────────────────────────────────────────────────────

async function executeTool(name, args) {
  switch (name) {
    case 'search_modules': {
      const { keyword, max_results = 5 } = args

      let data
      try {
        data = await fetchMsLearnCatalog({
          search: keyword,
          certifications: 'az-900',
          locale: LOCALE,
        })
      } catch {
        // Fallback to English locale
        data = await fetchMsLearnCatalog({
          search: keyword,
          certifications: 'az-900',
          locale: FALLBACK_LOCALE,
        })
      }

      const modules = data.modules || []
      const formatted = formatModules(modules, Math.min(max_results, 10))

      if (formatted.length === 0) {
        return {
          content: [{
            type: 'text',
            text: `No AZ-900 modules found for "${keyword}". Try a broader search term or check the official catalog at https://learn.microsoft.com/certifications/azure-fundamentals/`,
          }],
        }
      }

      const result = [
        `## Microsoft Learn — AZ-900 Modules for "${keyword}"`,
        `Found ${modules.length} modules, showing top ${formatted.length}:`,
        '',
        ...formatted.map((m, i) => [
          `### ${i + 1}. ${m.title}`,
          `⏱️ ${m.duration_minutes} minutes | 📊 ${m.levels || 'beginner'}`,
          `🔗 ${m.url}`,
          m.summary ? `> ${m.summary}` : '',
          '',
        ].join('\n')),
      ].join('\n')

      return { content: [{ type: 'text', text: result }] }
    }

    case 'get_az900_domains': {
      const result = `## AZ-900 Exam Domains (Official)

| Domain | Topic | Weight |
|--------|-------|--------|
| 1 | Describe cloud concepts | 25–30% |
| 2 | Describe Azure architecture and services | 35–40% |
| 3 | Describe Azure management and governance | 30–35% |

### Domain 1: Cloud Concepts (25–30%)
- Cloud computing definition & shared responsibility model
- Cloud models: Public, Private, Hybrid
- Benefits: HA, Scalability, Reliability, Security, Manageability
- Service types: IaaS, PaaS, SaaS

### Domain 2: Architecture & Services (35–40%)
- Core architectural components (Regions, AZs, Resource Groups)
- Compute: VMs, App Service, Functions, AKS, ACI
- Storage: Blob, Files, Queue, Disk, Data Box
- Networking: VNet, VPN Gateway, ExpressRoute, Load Balancer, DNS
- Identity & Security: Entra ID, Key Vault, Defender for Cloud

### Domain 3: Management & Governance (30–35%)
- Cost management: Pricing/TCO Calculator, Cost Management
- Governance: Azure Policy, RBAC, Resource Locks, Purview
- Deployment: Portal, CLI, ARM, Bicep, Arc
- Monitoring: Monitor, Advisor, Service Health

📚 Full study guide: https://learn.microsoft.com/certifications/azure-fundamentals/
🎯 Practice assessment: https://learn.microsoft.com/certifications/exams/az-900/practice/assessment?assessmentId=23`

      return { content: [{ type: 'text', text: result }] }
    }

    case 'search_services': {
      const { service_name } = args

      let data
      try {
        data = await fetchMsLearnCatalog({
          search: service_name,
          products: 'azure',
          locale: LOCALE,
        })
      } catch {
        data = await fetchMsLearnCatalog({
          search: service_name,
          products: 'azure',
          locale: FALLBACK_LOCALE,
        })
      }

      const modules = (data.modules || []).slice(0, 3)
      const serviceSlug = service_name.toLowerCase().replace(/\s+/g, '-').replace(/^azure-/, '')

      // Known URL overrides for services whose docs path doesn't follow the slug pattern
      const slugOverrides = {
        'microsoft-entra-id': 'entra/identity',
        'entra-id': 'entra/identity',
        'microsoft-entra': 'entra/identity',
        'azure-active-directory': 'active-directory',
        'azure-kubernetes-service': 'aks',
        'azure-container-instances': 'container-instances',
        'azure-container-apps': 'container-apps',
        'azure-devops': 'devops',
        'azure-monitor': 'azure-monitor',
        'azure-policy': 'governance/policy',
        'azure-advisor': 'advisor',
        'azure-service-health': 'service-health',
        'azure-cost-management': 'cost-management-billing',
        'azure-arc': 'azure-arc',
      }
      const resolvedSlug = slugOverrides[serviceSlug] ?? serviceSlug
      const docsUrl = `https://learn.microsoft.com/azure/${resolvedSlug}/`

      const result = [
        `## Azure Service: ${service_name}`,
        '',
        `📖 Documentation: ${docsUrl}`,
        `🔍 Search MS Learn: https://learn.microsoft.com/search/?terms=${encodeURIComponent(service_name)}&category=Learn`,
        '',
        modules.length > 0 ? '### Related Learning Modules' : '### No directly matched modules found',
        ...modules.map(m => `- **${m.title}** (${m.duration_in_minutes}min)\n  ${m.url || `https://learn.microsoft.com/training/modules/${m.uid.split('.').pop()}/`}`),
      ].join('\n')

      return { content: [{ type: 'text', text: result }] }
    }

    case 'get_learning_path': {
      const { domain = '' } = args

      const paths = {
        'cloud-concepts': {
          name: 'Cloud Concepts',
          url: 'https://learn.microsoft.com/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/',
          duration: '~1.5 hours',
        },
        'architecture-services': {
          name: 'Azure Architecture & Services',
          url: 'https://learn.microsoft.com/training/paths/azure-fundamentals-describe-azure-architecture-services/',
          duration: '~3.5 hours',
        },
        'management-governance': {
          name: 'Azure Management & Governance',
          url: 'https://learn.microsoft.com/training/paths/describe-azure-management-governance/',
          duration: '~2 hours',
        },
      }

      if (domain && paths[domain]) {
        const p = paths[domain]
        return {
          content: [{
            type: 'text',
            text: `## Microsoft Learn: ${p.name}\n⏱️ Estimated: ${p.duration}\n🔗 ${p.url}`,
          }],
        }
      }

      const result = [
        '## AZ-900 Complete Learning Path on Microsoft Learn',
        '',
        ...Object.values(paths).map(p => `### ${p.name}\n⏱️ ${p.duration}\n🔗 ${p.url}`),
        '',
        '### Quick Links',
        '- Practice Assessment: https://learn.microsoft.com/certifications/exams/az-900/practice/assessment?assessmentId=23',
        '- Certification Overview: https://learn.microsoft.com/certifications/azure-fundamentals/',
        '- Schedule Exam: https://learn.microsoft.com/certifications/exams/az-900/',
      ].join('\n')

      return { content: [{ type: 'text', text: result }] }
    }

    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}

// ─── MCP stdio 訊息處理 ───────────────────────────────────────────────────────

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
})

function sendResponse(response) {
  process.stdout.write(JSON.stringify(response) + '\n')
}

rl.on('line', async (line) => {
  let request
  try {
    request = JSON.parse(line.trim())
  } catch {
    return
  }

  const { id, method, params } = request

  try {
    switch (method) {
      case 'initialize':
        sendResponse({
          jsonrpc: '2.0', id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {} },
            serverInfo: {
              name: 'ms-learn',
              version: '1.0.0',
              description: 'Microsoft Learn AZ-900 content fetcher',
            },
          },
        })
        break

      case 'tools/list':
        sendResponse({ jsonrpc: '2.0', id, result: { tools: TOOLS } })
        break

      case 'tools/call': {
        const { name, arguments: args = {} } = params
        const result = await executeTool(name, args)
        sendResponse({ jsonrpc: '2.0', id, result })
        break
      }

      default:
        // notifications (no id) should be silently ignored
        if (id === undefined || id === null) return
        sendResponse({
          jsonrpc: '2.0', id,
          error: { code: -32601, message: `Method not found: ${method}` },
        })
    }
  } catch (err) {
    sendResponse({
      jsonrpc: '2.0', id,
      error: { code: -32603, message: err.message || 'Internal error' },
    })
  }
})

process.on('SIGTERM', () => process.exit(0))
process.on('SIGINT', () => process.exit(0))
