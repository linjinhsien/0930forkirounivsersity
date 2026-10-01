<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useCodexStore } from '@/stores/codex'
import type { AZ900Domain, AzureCard } from '@/types/game'
import AzureCardComponent from '@/components/cards/AzureCard.vue'

// ── Emits ──────────────────────────────────────────────────────────────────
const emit = defineEmits<{
  entrySelected: [cardId: string]
}>()

// ── Store ──────────────────────────────────────────────────────────────────
const codexStore = useCodexStore()

// ── Local state ────────────────────────────────────────────────────────────
const searchQuery = ref<string>('')
const selectedDomain = ref<AZ900Domain | null>(null)
const sortBy = ref<'name' | 'cost' | 'domain'>('domain')

// ── Domain config ──────────────────────────────────────────────────────────
const domains: ReadonlyArray<{ value: AZ900Domain; label: string }> = [
  { value: 'cloud-concepts', label: 'Cloud Concepts' },
  { value: 'azure-services', label: 'Azure Services' },
  { value: 'management-governance', label: 'Governance' },
]

// ── Domain button helpers ──────────────────────────────────────────────────
function toggleDomain(domain: AZ900Domain): void {
  selectedDomain.value = selectedDomain.value === domain ? null : domain
}

function domainButtonClass(domain: AZ900Domain): string {
  const isSelected = selectedDomain.value === domain
  if (isSelected) {
    const filled: Record<AZ900Domain, string> = {
      'cloud-concepts': 'bg-sky-600 text-white border-sky-600',
      'azure-services': 'bg-blue-600 text-white border-blue-600',
      'management-governance': 'bg-purple-600 text-white border-purple-600',
    }
    return filled[domain]
  }
  const outline: Record<AZ900Domain, string> = {
    'cloud-concepts': 'bg-white text-sky-700 border-sky-400 hover:bg-sky-50',
    'azure-services': 'bg-white text-blue-700 border-blue-400 hover:bg-blue-50',
    'management-governance': 'bg-white text-purple-700 border-purple-400 hover:bg-purple-50',
  }
  return outline[domain]
}

// ── Sorting ────────────────────────────────────────────────────────────────
const domainOrder: Record<AZ900Domain, number> = {
  'cloud-concepts': 0,
  'azure-services': 1,
  'management-governance': 2,
}

function sortCards(cards: AzureCard[]): AzureCard[] {
  return [...cards].sort((a, b) => {
    if (sortBy.value === 'name') return a.name.localeCompare(b.name)
    if (sortBy.value === 'cost') return a.cost - b.cost
    return domainOrder[a.domain] - domainOrder[b.domain]
  })
}

// ── Computed display list ──────────────────────────────────────────────────
// Re-sorts whenever searchResults or sortBy changes.
const displayCards = computed<AzureCard[]>(() => sortCards(codexStore.searchResults))

// ── Filter logic: combine filterByDomain + text search ────────────────────
async function applyFilters(): Promise<void> {
  const domain = selectedDomain.value ?? undefined
  // filterByDomain narrows by domain and sets searchResults on the store
  await codexStore.filterByDomain(domain)

  // If a text query is present, further narrow the already domain-filtered results
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    codexStore.searchResults = codexStore.searchResults.filter((card) =>
      [card.name, card.description, card.az900ExamTip, ...card.synergyTags]
        .join(' ')
        .toLowerCase()
        .includes(q)
    )
  }
}

// ── Debounced watch ────────────────────────────────────────────────────────
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch([searchQuery, selectedDomain], () => {
  if (debounceTimer !== null) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    void applyFilters()
  }, 300)
})

// ── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(() => {
  void codexStore.loadCardLibrary()
})
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- ── Search + Filter toolbar ── -->
    <div class="flex flex-wrap gap-3 p-4 bg-white border-b dark:bg-gray-900 dark:border-gray-700">
      <!-- Search input -->
      <input
        v-model="searchQuery"
        type="search"
        placeholder="Search cards..."
        aria-label="Search cards"
        class="flex-1 min-w-48 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
      />

      <!-- Domain filter buttons -->
      <div class="flex gap-2 flex-wrap" role="group" aria-label="Filter by domain">
        <button
          v-for="d in domains"
          :key="d.value"
          class="rounded-full px-3 py-1 text-xs font-medium border transition-colors"
          :class="domainButtonClass(d.value)"
          :aria-pressed="selectedDomain === d.value"
          @click="toggleDomain(d.value)"
        >
          {{ d.label }}
        </button>
      </div>

      <!-- Sort select -->
      <select
        v-model="sortBy"
        aria-label="Sort cards by"
        class="rounded-lg border border-gray-300 px-2 py-2 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
      >
        <option value="domain">Sort: Domain</option>
        <option value="name">Sort: Name</option>
        <option value="cost">Sort: Cost</option>
      </select>
    </div>

    <!-- Results count -->
    <div
      class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ displayCards.length }} card{{ displayCards.length !== 1 ? 's' : '' }}
    </div>

    <!-- ── Card grid area ── -->
    <div class="flex-1 overflow-y-auto p-4">
      <!-- Initial loading state: library empty and no results yet -->
      <div
        v-if="codexStore.cardLibrary.length === 0"
        class="text-center py-12 text-gray-400 dark:text-gray-500"
        aria-live="polite"
      >
        Loading...
      </div>

      <!-- Empty results after filter/search -->
      <div
        v-else-if="displayCards.length === 0"
        class="text-center py-12 text-gray-400 dark:text-gray-500"
      >
        No cards match your search.
      </div>

      <!-- Card grid -->
      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" role="list">
        <div v-for="card in displayCards" :key="card.id" role="listitem">
          <button
            class="w-full text-left rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            @click="emit('entrySelected', card.id)"
          >
            <AzureCardComponent :card="card" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
