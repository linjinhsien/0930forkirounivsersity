<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCodexStore } from '@/stores/codex'
import { usePlayerStore } from '@/stores/player'
import type { AZ900Domain, AzureCard } from '@/types/game'
import AzureCardComponent from '@/components/cards/AzureCard.vue'

// ── Emits ──────────────────────────────────────────────────────────────────
const emit = defineEmits<{
  cardSelected: [cardId: string]
}>()

// ── Stores ─────────────────────────────────────────────────────────────────
const playerStore = usePlayerStore()
const codexStore = useCodexStore()

// ── Local state ────────────────────────────────────────────────────────────
const sortBy = ref<'name' | 'cost' | 'domain'>('domain')
const filterDomain = ref<AZ900Domain | null>(null)

// ── Domain config ──────────────────────────────────────────────────────────
const domains: ReadonlyArray<{ value: AZ900Domain; label: string }> = [
  { value: 'cloud-concepts', label: 'Cloud Concepts' },
  { value: 'azure-services', label: 'Azure Services' },
  { value: 'management-governance', label: 'Governance' },
]

// ── Domain sort order ──────────────────────────────────────────────────────
const domainOrder: Record<AZ900Domain, number> = {
  'cloud-concepts': 0,
  'azure-services': 1,
  'management-governance': 2,
}

// ── Study deck cards ───────────────────────────────────────────────────────
const studyCards = computed<AzureCard[]>(() => {
  const ids = playerStore.profile?.studyDeck ?? []
  return codexStore.cardLibrary.filter((c) => ids.includes(c.id))
})

// ── Progress ───────────────────────────────────────────────────────────────
const progress = computed(() => {
  const total = codexStore.cardLibrary.length
  const collected = studyCards.value.length
  return {
    collected,
    total,
    pct: total > 0 ? Math.round((collected / total) * 100) : 0,
  }
})

// ── Filtered + sorted display cards ───────────────────────────────────────
const displayCards = computed<AzureCard[]>(() => {
  let cards = studyCards.value

  if (filterDomain.value !== null) {
    cards = cards.filter((c) => c.domain === filterDomain.value)
  }

  return [...cards].sort((a, b) => {
    if (sortBy.value === 'name') return a.name.localeCompare(b.name)
    if (sortBy.value === 'cost') return a.cost - b.cost
    return domainOrder[a.domain] - domainOrder[b.domain]
  })
})
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- ── Header with progress ── -->
    <div class="p-4 bg-white dark:bg-gray-900 border-b dark:border-gray-700">
      <div class="flex justify-between items-center mb-2">
        <h2 class="font-bold text-gray-900 dark:text-gray-100">Study Deck</h2>
        <span class="text-sm text-gray-500 dark:text-gray-400">
          {{ progress.collected }} / {{ progress.total }}
        </span>
      </div>

      <!-- Progress bar -->
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          class="bg-blue-500 h-2 rounded-full transition-all"
          :style="{ width: `${progress.pct}%` }"
          role="progressbar"
          :aria-valuenow="progress.pct"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-label="`${progress.pct}% of cards collected`"
        />
      </div>
    </div>

    <!-- ── Filters ── -->
    <div class="flex gap-2 p-3 border-b dark:border-gray-700 flex-wrap bg-gray-50 dark:bg-gray-900">
      <!-- Sort select -->
      <select
        v-model="sortBy"
        aria-label="Sort study deck by"
        class="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-800 dark:text-gray-100"
      >
        <option value="domain">Domain</option>
        <option value="name">Name</option>
        <option value="cost">Cost</option>
      </select>

      <!-- Domain filter buttons -->
      <button
        v-for="d in domains"
        :key="d.value"
        :aria-pressed="filterDomain === d.value"
        class="text-xs px-2 py-1 rounded-full border transition-colors"
        :class="
          filterDomain === d.value
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:text-blue-600'
        "
        @click="filterDomain = filterDomain === d.value ? null : d.value"
      >
        {{ d.label }}
      </button>
    </div>

    <!-- ── Empty state ── -->
    <div v-if="displayCards.length === 0" class="flex-1 flex items-center justify-center">
      <div class="text-center text-gray-400 dark:text-gray-500">
        <div class="text-4xl mb-2" aria-hidden="true">📚</div>
        <p class="text-sm">
          {{
            studyCards.length === 0
              ? 'No cards in your study deck yet.'
              : 'No cards match this filter.'
          }}
        </p>
        <p v-if="studyCards.length === 0" class="text-xs mt-1">Play games to collect cards!</p>
        <button
          v-else
          class="text-xs mt-2 text-blue-600 dark:text-blue-400 hover:underline"
          @click="filterDomain = null"
        >
          Clear filter
        </button>
      </div>
    </div>

    <!-- ── Card grid ── -->
    <div
      v-else
      class="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 gap-3"
      role="list"
    >
      <div v-for="card in displayCards" :key="card.id" role="listitem">
        <button
          class="w-full text-left rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          @click="emit('cardSelected', card.id)"
        >
          <AzureCardComponent :card="card" />
        </button>
      </div>
    </div>
  </div>
</template>
