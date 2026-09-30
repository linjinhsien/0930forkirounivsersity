import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AZ900Domain, AzureCard, CodexEntry, Scenario } from '@/types/game'
import { loadAllCards, loadAllCodexEntries, loadAllScenarios } from '@/utils/dataLoader'

export const useCodexStore = defineStore('codex', () => {
  const cardLibrary = ref<AzureCard[]>([])
  const scenarioLibrary = ref<Scenario[]>([])
  const codexEntries = ref<Record<string, CodexEntry>>({})
  const searchResults = ref<AzureCard[]>([])

  const cardsByDomain = computed(() => {
    const grouped: Record<AZ900Domain, AzureCard[]> = {
      'cloud-concepts': [],
      'azure-services': [],
      'management-governance': [],
    }
    for (const card of cardLibrary.value) grouped[card.domain].push(card)
    return grouped
  })

  const cardsByDifficulty = computed(() => {
    const grouped: Record<Scenario['difficulty'], Scenario[]> = {
      beginner: [],
      intermediate: [],
      advanced: [],
    }
    for (const scenario of scenarioLibrary.value) grouped[scenario.difficulty].push(scenario)
    return grouped
  })

  async function loadCardLibrary(): Promise<AzureCard[]> {
    const [cards, scenarios, entries] = await Promise.all([
      loadAllCards(),
      loadAllScenarios(),
      loadAllCodexEntries(),
    ])
    cardLibrary.value = cards
    scenarioLibrary.value = scenarios
    codexEntries.value = entries
    searchResults.value = [...cards]
    return cards
  }

  async function searchCards(query: string): Promise<AzureCard[]> {
    if (cardLibrary.value.length === 0) await loadCardLibrary()
    const normalized = query.trim().toLowerCase()
    if (!normalized) {
      searchResults.value = [...cardLibrary.value]
      return searchResults.value
    }

    searchResults.value = cardLibrary.value.filter((card) =>
      [card.name, card.description, card.az900ExamTip, ...card.synergyTags]
        .join(' ')
        .toLowerCase()
        .includes(normalized)
    )
    return searchResults.value
  }

  function getCodexEntry(cardId: string): CodexEntry | null {
    return codexEntries.value[cardId] ?? null
  }

  async function filterByDomain(
    domain?: AZ900Domain,
    options?: { maxCost?: number; synergyTag?: string }
  ): Promise<AzureCard[]> {
    if (cardLibrary.value.length === 0) await loadCardLibrary()
    const tag = options?.synergyTag?.trim().toLowerCase()
    const results = cardLibrary.value.filter((card) => {
      if (domain && card.domain !== domain) return false
      if (options?.maxCost !== undefined && card.cost > options.maxCost) return false
      if (tag && !card.synergyTags.some((item) => item.toLowerCase() === tag)) return false
      return true
    })
    searchResults.value = results
    return results
  }

  return {
    cardLibrary,
    scenarioLibrary,
    codexEntries,
    searchResults,
    cardsByDomain,
    cardsByDifficulty,
    loadCardLibrary,
    searchCards,
    getCodexEntry,
    filterByDomain,
  }
})
