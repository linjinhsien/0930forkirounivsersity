<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useCodexStore } from '@/stores/codex'
import { usePlayerStore } from '@/stores/player'
import type { AZ900Domain, AzureCard, CodexEntry } from '@/types/game'

// ── Props & Emits ──────────────────────────────────────────────────────────
interface Props {
  cardId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  back: []
  addToStudyDeck: [cardId: string]
}>()

// ── Stores ─────────────────────────────────────────────────────────────────
const codexStore = useCodexStore()
const playerStore = usePlayerStore()

// ── Local state ────────────────────────────────────────────────────────────
const entry = ref<CodexEntry | null>(null)
const card = ref<AzureCard | null>(null)
const isLoading = ref<boolean>(true)

// ── Domain display helpers ─────────────────────────────────────────────────
const domainLabel: Record<AZ900Domain, string> = {
  'cloud-concepts': 'Cloud Concepts',
  'azure-services': 'Azure Services',
  'management-governance': 'Management & Governance',
}

const domainBadgeClass: Record<AZ900Domain, string> = {
  'cloud-concepts': 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
  'azure-services': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  'management-governance':
    'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
}

// ── Computed ───────────────────────────────────────────────────────────────
const isInStudyDeck = computed<boolean>(
  () => playerStore.profile?.studyDeck.includes(props.cardId) ?? false
)

// ── Actions ────────────────────────────────────────────────────────────────
function handleAddToStudyDeck(): void {
  playerStore.addStudyCard(props.cardId)
  emit('addToStudyDeck', props.cardId)
}

// ── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(async () => {
  isLoading.value = true

  // Ensure the library is loaded before we look up the entry
  if (codexStore.cardLibrary.length === 0) {
    await codexStore.loadCardLibrary()
  }

  entry.value = codexStore.getCodexEntry(props.cardId)
  card.value = codexStore.cardLibrary.find((c) => c.id === props.cardId) ?? null

  isLoading.value = false
})
</script>

<template>
  <div class="max-w-2xl mx-auto p-4">
    <!-- Back button -->
    <button
      class="mb-4 flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
      @click="emit('back')"
    >
      ← Back to Library
    </button>

    <!-- Loading state -->
    <div
      v-if="isLoading"
      class="text-center py-12 text-gray-400 dark:text-gray-500"
      aria-busy="true"
      aria-live="polite"
    >
      Loading...
    </div>

    <!-- Not found -->
    <div v-else-if="!entry || !card">
      <p class="text-gray-500 dark:text-gray-400">Entry not found.</p>
    </div>

    <!-- Entry content -->
    <div v-else>
      <!-- ── Card header ── -->
      <div
        class="flex flex-wrap items-start gap-3 mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div class="flex-1 min-w-0">
          <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-2">
            {{ card.name }}
          </h1>
          <span
            class="inline-block text-xs font-medium px-2 py-1 rounded-full"
            :class="domainBadgeClass[card.domain]"
          >
            {{ domainLabel[card.domain] }}
          </span>
        </div>

        <!-- Cost & Power stats -->
        <div class="flex gap-4 text-sm text-gray-600 dark:text-gray-300 shrink-0">
          <div class="text-center">
            <p class="text-lg font-bold text-gray-900 dark:text-gray-100">{{ card.cost }}</p>
            <p class="text-xs text-gray-500">Cost</p>
          </div>
          <div class="text-center">
            <p class="text-lg font-bold text-gray-900 dark:text-gray-100">{{ card.power }}</p>
            <p class="text-xs text-gray-500">Power</p>
          </div>
        </div>

        <!-- Power bar -->
        <div class="w-full mt-2">
          <div class="flex justify-between text-xs text-gray-500 mb-1">
            <span>Power</span>
            <span>{{ card.power }} / 100</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              class="bg-amber-500 h-2 rounded-full transition-all"
              :style="{ width: `${card.power}%` }"
              role="progressbar"
              :aria-valuenow="card.power"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-label="`Power: ${card.power} out of 100`"
            />
          </div>
        </div>
      </div>

      <!-- ── AZ-900 Exam Definition ── -->
      <section aria-labelledby="exam-def-heading" class="mb-5">
        <h2 id="exam-def-heading" class="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">
          AZ-900 Exam Definition
        </h2>
        <p
          class="text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm leading-relaxed border border-blue-100 dark:border-blue-800"
        >
          {{ entry.examDefinition }}
        </p>
      </section>

      <!-- ── Use Cases ── -->
      <section aria-labelledby="use-cases-heading" class="mb-5">
        <h3 id="use-cases-heading" class="font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100">
          Use Cases
        </h3>
        <ul class="list-disc list-inside space-y-1">
          <li
            v-for="(uc, i) in entry.useCases"
            :key="i"
            class="text-sm text-gray-700 dark:text-gray-300"
          >
            {{ uc }}
          </li>
        </ul>
      </section>

      <!-- ── Best Practices ── -->
      <section aria-labelledby="best-practices-heading" class="mb-5">
        <h3
          id="best-practices-heading"
          class="font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100"
        >
          Best Practices
        </h3>
        <ul class="space-y-1">
          <li
            v-for="(bp, i) in entry.bestPractices"
            :key="i"
            class="text-sm flex items-start gap-2 text-gray-700 dark:text-gray-300"
          >
            <span class="text-green-500 mt-0.5 shrink-0" aria-hidden="true">✓</span>
            {{ bp }}
          </li>
        </ul>
      </section>

      <!-- ── Related Services ── -->
      <section
        v-if="entry.relatedServices.length > 0"
        aria-labelledby="related-services-heading"
        class="mb-5"
      >
        <h3
          id="related-services-heading"
          class="font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100"
        >
          Related Services
        </h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="s in entry.relatedServices"
            :key="s"
            class="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full px-3 py-1 border border-gray-200 dark:border-gray-700"
          >
            {{ s }}
          </span>
        </div>
      </section>

      <!-- ── Learning Resources ── -->
      <section v-if="entry.resources.length > 0" aria-labelledby="resources-heading" class="mb-5">
        <h3 id="resources-heading" class="font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100">
          Learning Resources
        </h3>
        <ul class="space-y-2">
          <li v-for="r in entry.resources" :key="r.url">
            <a
              :href="r.url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              {{ r.title }}
              <span aria-hidden="true">↗</span>
              <span class="sr-only">(opens in new tab)</span>
            </a>
          </li>
        </ul>
      </section>

      <!-- ── Add to Study Deck ── -->
      <div class="mt-6 flex gap-3">
        <button
          :disabled="isInStudyDeck"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          :class="
            isInStudyDeck
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-default'
              : 'bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-500'
          "
          :aria-pressed="isInStudyDeck"
          @click="handleAddToStudyDeck"
        >
          {{ isInStudyDeck ? '✓ In Study Deck' : '+ Add to Study Deck' }}
        </button>
      </div>
    </div>
  </div>
</template>
