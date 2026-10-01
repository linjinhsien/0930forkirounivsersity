/**
 * Codex Store (Pinia) — Task 15
 *
 * Manages the card library, scenario library, per-card codex entries,
 * and search/filter functionality.
 *
 * All data is loaded lazily via the dataLoader utility.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AzureCard, Scenario, CodexEntry, AZ900Domain } from '@/types/game'
import {
  loadAllCards,
  loadCardsByDomain,
  loadAllScenarios,
  loadCodexEntry,
} from '@/utils/dataLoader'

// ─── Store ───────────────────────────────────────────────────────────────────

export const useCodexStore = defineStore('codex', () => {
  // ── State ────────────────────────────────────────────────────────────────
  const cardLibrary = ref<AzureCard[]>([])
  const scenarioLibrary = ref<Scenario[]>([])
  const codexEntries = ref<Record<string, CodexEntry>>({})
  const searchResults = ref<AzureCard[]>([])
  const isLoading = ref(false)
  const loadError = ref<string | null>(null)

  // ── Computed ─────────────────────────────────────────────────────────────

  /** Cards grouped by AZ-900 domain */
  const cardsByDomain = computed<Record<AZ900Domain, AzureCard[]>>(() => {
    const map: Record<AZ900Domain, AzureCard[]> = {
      'cloud-concepts': [],
      'azure-services': [],
      'management-governance': [],
    }
    cardLibrary.value.forEach((card) => {
      map[card.domain].push(card)
    })
    return map
  })

  /** Cards grouped by difficulty level (derived from power rating) */
  const cardsByDifficulty = computed<Record<'beginner' | 'intermediate' | 'advanced', AzureCard[]>>(
    () => {
      const map = {
        beginner: [] as AzureCard[],
        intermediate: [] as AzureCard[],
        advanced: [] as AzureCard[],
      }
      cardLibrary.value.forEach((card) => {
        if (card.power <= 33) map.beginner.push(card)
        else if (card.power <= 66) map.intermediate.push(card)
        else map.advanced.push(card)
      })
      return map
    }
  )

  /** Total number of cards across all domains */
  const totalCards = computed<number>(() => cardLibrary.value.length)

  /** Total number of scenarios */
  const totalScenarios = computed<number>(() => scenarioLibrary.value.length)

  // ── Actions ──────────────────────────────────────────────────────────────

  /**
   * Load all card data from JSON files into the store.
   * Idempotent — skips reload if already populated.
   */
  async function loadCardLibrary(): Promise<void> {
    if (cardLibrary.value.length > 0) return
    isLoading.value = true
    loadError.value = null
    try {
      cardLibrary.value = await loadAllCards()
      // Reset search results to the full library
      searchResults.value = [...cardLibrary.value]
    } catch (err) {
      loadError.value = err instanceof Error ? err.message : 'Failed to load card library'
      console.error('[CodexStore] loadCardLibrary error:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load only cards from a specific AZ-900 domain.
   * Useful for targeted browsing without loading the full library.
   */
  async function loadCardsByDomainFilter(domain: AZ900Domain): Promise<AzureCard[]> {
    isLoading.value = true
    loadError.value = null
    try {
      const cards = await loadCardsByDomain(domain)
      return cards
    } catch (err) {
      loadError.value = err instanceof Error ? err.message : 'Failed to load domain cards'
      console.error('[CodexStore] loadCardsByDomainFilter error:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load all scenarios.
   * Idempotent — skips reload if already populated.
   */
  async function loadScenarioLibrary(): Promise<void> {
    if (scenarioLibrary.value.length > 0) return
    isLoading.value = true
    loadError.value = null
    try {
      scenarioLibrary.value = await loadAllScenarios()
    } catch (err) {
      loadError.value = err instanceof Error ? err.message : 'Failed to load scenarios'
      console.error('[CodexStore] loadScenarioLibrary error:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load scenarios filtered by category.
   */
  async function loadScenariosByCategory(category: Scenario['category']): Promise<Scenario[]> {
    isLoading.value = true
    loadError.value = null
    try {
      return await loadScenariosByCategory(category)
    } catch (err) {
      loadError.value = err instanceof Error ? err.message : 'Failed to load scenarios'
      console.error('[CodexStore] loadScenariosByCategory error:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Full-text search across card names, descriptions, synergy tags, and exam tips.
   * Populates `searchResults` and returns the matched subset.
   *
   * @param query Search string (case-insensitive)
   */
  function searchCards(query: string): AzureCard[] {
    const q = query.trim().toLowerCase()
    if (q.length === 0) {
      searchResults.value = [...cardLibrary.value]
      return searchResults.value
    }
    searchResults.value = cardLibrary.value.filter(
      (card) =>
        card.name.toLowerCase().includes(q) ||
        card.description.toLowerCase().includes(q) ||
        card.az900ExamTip.toLowerCase().includes(q) ||
        card.synergyTags.some((t) => t.toLowerCase().includes(q))
    )
    return searchResults.value
  }

  /**
   * Filter cards by domain (and optionally also apply the current search query).
   * Updates `searchResults`.
   *
   * @param domain AZ-900 domain to filter by, or null to show all
   * @param query  Optional additional text search
   */
  function filterByDomain(domain: AZ900Domain | null, query = ''): AzureCard[] {
    let base = domain ? cardsByDomain.value[domain] : [...cardLibrary.value]

    if (query.trim().length > 0) {
      const q = query.trim().toLowerCase()
      base = base.filter(
        (card) =>
          card.name.toLowerCase().includes(q) ||
          card.description.toLowerCase().includes(q) ||
          card.synergyTags.some((t) => t.toLowerCase().includes(q))
      )
    }

    searchResults.value = base
    return searchResults.value
  }

  /**
   * Filter cards by synergy tag.
   * Updates `searchResults`.
   */
  function filterByTag(tag: string): AzureCard[] {
    const t = tag.toLowerCase()
    searchResults.value = cardLibrary.value.filter((card) =>
      card.synergyTags.some((s) => s.toLowerCase() === t)
    )
    return searchResults.value
  }

  /**
   * Filter cards by cost range (inclusive).
   */
  function filterByCost(min: number, max: number): AzureCard[] {
    searchResults.value = cardLibrary.value.filter((card) => card.cost >= min && card.cost <= max)
    return searchResults.value
  }

  /**
   * Reset search results to the full library.
   */
  function clearFilters(): void {
    searchResults.value = [...cardLibrary.value]
  }

  /**
   * Retrieve a single CodexEntry for a card.
   * Caches entries in `codexEntries` to avoid repeated loads.
   *
   * @param cardId Card ID to look up
   * @returns The CodexEntry or null if not found
   */
  async function getCodexEntry(cardId: string): Promise<CodexEntry | null> {
    if (codexEntries.value[cardId]) return codexEntries.value[cardId]

    try {
      const entry = await loadCodexEntry(cardId)
      if (entry) {
        codexEntries.value[cardId] = entry
      }
      return entry
    } catch (err) {
      console.error(`[CodexStore] getCodexEntry(${cardId}) error:`, err)
      return null
    }
  }

  /**
   * Pre-warm the codex entry cache for a set of cards.
   * Useful after a match to eagerly load entries for reviewed cards.
   */
  async function preloadCodexEntries(cardIds: string[]): Promise<void> {
    await Promise.allSettled(cardIds.map((id) => getCodexEntry(id)))
  }

  return {
    // State
    cardLibrary,
    scenarioLibrary,
    codexEntries,
    searchResults,
    isLoading,
    loadError,
    // Computed
    cardsByDomain,
    cardsByDifficulty,
    totalCards,
    totalScenarios,
    // Actions
    loadCardLibrary,
    loadCardsByDomainFilter,
    loadScenarioLibrary,
    loadScenariosByCategory,
    searchCards,
    filterByDomain,
    filterByTag,
    filterByCost,
    clearFilters,
    getCodexEntry,
    preloadCodexEntries,
  }
})
