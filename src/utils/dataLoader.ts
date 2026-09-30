/**
 * Data Loader Utility
 *
 * Provides lazy loading, schema validation, and retrieval methods for
 * AZ-900 cards, scenarios, and architecture codex learning entries.
 */

import type { AzureCard, Scenario, CodexEntry, AZ900Domain } from '@/types/game'

// Cached in-memory stores for lazy loading
let cachedCards: AzureCard[] | null = null
let cachedScenarios: Scenario[] | null = null
const cachedCodexEntries = new Map<string, CodexEntry>()

/**
 * Validate that an object adheres strictly to the AzureCard interface
 */
export function validateCardSchema(card: unknown): card is AzureCard {
  if (typeof card !== 'object' || card === null) return false
  const c = card as Record<string, unknown>

  const validDomains: AZ900Domain[] = ['cloud-concepts', 'azure-services', 'management-governance']

  return (
    typeof c.id === 'string' &&
    typeof c.name === 'string' &&
    typeof c.domain === 'string' &&
    validDomains.includes(c.domain as AZ900Domain) &&
    typeof c.cost === 'number' &&
    Array.isArray(c.synergyTags) &&
    typeof c.az900ExamTip === 'string' &&
    typeof c.description === 'string' &&
    typeof c.power === 'number'
  )
}

/**
 * Validate that an object adheres strictly to the Scenario interface
 */
export function validateScenarioSchema(scenario: unknown): scenario is Scenario {
  if (typeof scenario !== 'object' || scenario === null) return false
  const s = scenario as Record<string, unknown>

  return (
    typeof s.id === 'string' &&
    typeof s.title === 'string' &&
    typeof s.description === 'string' &&
    Array.isArray(s.requirements) &&
    typeof s.constraints === 'object' &&
    s.constraints !== null &&
    typeof s.maxRounds === 'number' &&
    typeof s.difficulty === 'string' &&
    typeof s.category === 'string'
  )
}

/**
 * Validate that an object adheres strictly to the CodexEntry interface
 */
export function validateCodexSchema(entry: unknown): entry is CodexEntry {
  if (typeof entry !== 'object' || entry === null) return false
  const e = entry as Record<string, unknown>

  return (
    typeof e.cardId === 'string' &&
    typeof e.examDefinition === 'string' &&
    Array.isArray(e.useCases) &&
    Array.isArray(e.bestPractices) &&
    Array.isArray(e.relatedServices) &&
    Array.isArray(e.resources)
  )
}

/**
 * Lazy load all AZ-900 cards across all domains
 */
export async function loadAllCards(): Promise<AzureCard[]> {
  if (cachedCards) {
    return cachedCards
  }

  const [conceptsModule, servicesModule, governanceModule] = await Promise.all([
    import('@/data/cards/cloud-concepts.json'),
    import('@/data/cards/azure-services.json'),
    import('@/data/cards/management-governance.json'),
  ])

  const loaded: AzureCard[] = [
    ...conceptsModule.default.cards,
    ...servicesModule.default.cards,
    ...governanceModule.default.cards,
  ] as AzureCard[]

  for (const card of loaded) {
    if (!validateCardSchema(card)) {
      throw new Error(`Invalid card schema detected: ${JSON.stringify(card)}`)
    }
  }

  cachedCards = loaded
  return loaded
}

/**
 * Get cards filtered by domain
 */
export async function loadCardsByDomain(domain: AZ900Domain): Promise<AzureCard[]> {
  const cards = await loadAllCards()
  return cards.filter((card) => card.domain === domain)
}

/**
 * Find a specific card by its ID
 */
export async function loadCardById(id: string): Promise<AzureCard | null> {
  const cards = await loadAllCards()
  return cards.find((card) => card.id === id) || null
}

/**
 * Lazy load all scenarios across all categories
 */
export async function loadAllScenarios(): Promise<Scenario[]> {
  if (cachedScenarios) {
    return cachedScenarios
  }

  const [startupModule, migrationModule, complianceModule, analyticsModule] = await Promise.all([
    import('@/data/scenarios/startup-scaling.json'),
    import('@/data/scenarios/enterprise-migration.json'),
    import('@/data/scenarios/high-compliance.json'),
    import('@/data/scenarios/real-time-analytics.json'),
  ])

  const loaded: Scenario[] = [
    ...(startupModule.default.scenarios as Scenario[]),
    ...(migrationModule.default.scenarios as Scenario[]),
    ...(complianceModule.default.scenarios as Scenario[]),
    ...(analyticsModule.default.scenarios as Scenario[]),
  ]

  for (const scenario of loaded) {
    if (!validateScenarioSchema(scenario)) {
      throw new Error(`Invalid scenario schema detected: ${JSON.stringify(scenario)}`)
    }
  }

  cachedScenarios = loaded
  return loaded
}

/**
 * Load scenarios by category
 */
export async function loadScenariosByCategory(category: Scenario['category']): Promise<Scenario[]> {
  const scenarios = await loadAllScenarios()
  return scenarios.filter((s) => s.category === category)
}

/**
 * Find a specific scenario by its ID
 */
export async function loadScenarioById(id: string): Promise<Scenario | null> {
  const scenarios = await loadAllScenarios()
  return scenarios.find((s) => s.id === id) || null
}

/**
 * Lazy load a specific codex entry by card ID
 */
export async function loadCodexEntry(cardId: string): Promise<CodexEntry | null> {
  if (cachedCodexEntries.has(cardId)) {
    return cachedCodexEntries.get(cardId)!
  }

  try {
    const entryModule = await import(`../data/codex/${cardId}.json`)
    const entry = entryModule.default as CodexEntry

    if (!validateCodexSchema(entry)) {
      throw new Error(`Invalid codex entry schema for ${cardId}`)
    }

    cachedCodexEntries.set(cardId, entry)
    return entry
  } catch {
    return null
  }
}

/**
 * Pre-cache all codex entries for offline study
 */
export async function loadAllCodexEntries(): Promise<Record<string, CodexEntry>> {
  const cards = await loadAllCards()
  const entries: Record<string, CodexEntry> = {}

  await Promise.all(
    cards.map(async (card) => {
      const entry = await loadCodexEntry(card.id)
      if (entry) {
        entries[card.id] = entry
      }
    })
  )

  return entries
}
