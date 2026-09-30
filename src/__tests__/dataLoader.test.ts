import { describe, it, expect } from 'vitest'
import {
  loadAllCards,
  loadCardsByDomain,
  loadCardById,
  loadAllScenarios,
  loadScenariosByCategory,
  loadScenarioById,
  loadCodexEntry,
  validateCardSchema,
  validateScenarioSchema,
  validateCodexSchema,
} from '@/utils/dataLoader'

describe('DataLoader Utility', () => {
  it('loads all 62 cards across domains', async () => {
    const cards = await loadAllCards()
    expect(cards.length).toBe(62)
    expect(cards.every((c) => validateCardSchema(c))).toBe(true)
  })

  it('filters cards by domain', async () => {
    const concepts = await loadCardsByDomain('cloud-concepts')
    const services = await loadCardsByDomain('azure-services')
    const governance = await loadCardsByDomain('management-governance')

    expect(concepts.length).toBe(18)
    expect(services.length).toBe(26)
    expect(governance.length).toBe(18)
  })

  it('loads specific card by ID', async () => {
    const appService = await loadCardById('as-app-service')
    expect(appService).not.toBeNull()
    expect(appService?.name).toBe('Azure App Service')
    expect(appService?.cost).toBe(5)
  })

  it('loads all 15 scenarios across categories', async () => {
    const scenarios = await loadAllScenarios()
    expect(scenarios.length).toBe(15)
    expect(scenarios.every((s) => validateScenarioSchema(s))).toBe(true)
  })

  it('filters scenarios by category', async () => {
    const startup = await loadScenariosByCategory('startup-scaling')
    const enterprise = await loadScenariosByCategory('enterprise-migration')
    const compliance = await loadScenariosByCategory('high-compliance')
    const analytics = await loadScenariosByCategory('real-time-analytics')

    expect(startup.length).toBe(4)
    expect(enterprise.length).toBe(4)
    expect(compliance.length).toBe(4)
    expect(analytics.length).toBe(3)
  })

  it('loads specific scenario by ID', async () => {
    const scenario = await loadScenarioById('startup-mvp')
    expect(scenario).not.toBeNull()
    expect(scenario?.title).toBe('Startup MVP Launch')
    expect(scenario?.difficulty).toBe('beginner')
  })

  it('loads codex entry for a valid card ID', async () => {
    const entry = await loadCodexEntry('as-app-service')
    expect(entry).not.toBeNull()
    expect(entry?.cardId).toBe('as-app-service')
    expect(entry?.examDefinition).toContain('Azure App Service')
    expect(validateCodexSchema(entry)).toBe(true)
  })

  it('returns null for unknown codex entry', async () => {
    const entry = await loadCodexEntry('non-existent-card-id')
    expect(entry).toBeNull()
  })
})
