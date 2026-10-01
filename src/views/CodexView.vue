<script setup lang="ts">
import { onMounted, ref } from 'vue'
import CodexBrowser from '@/components/codex/CodexBrowser.vue'
import CodexEntry from '@/components/codex/CodexEntry.vue'
import StudyDeck from '@/components/codex/StudyDeck.vue'
import { useCodexStore } from '@/stores/codex'

const codexStore = useCodexStore()
const activeTab = ref<'library' | 'study'>('library')
const selectedCardId = ref<string | null>(null)
const statusMessage = ref('')
const errorMessage = ref('')

onMounted(async () => {
  try {
    await codexStore.loadCardLibrary()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to load the Azure Codex.'
  }
})

function openEntry(cardId: string): void {
  selectedCardId.value = cardId
}

function closeEntry(): void {
  selectedCardId.value = null
}

function addedToStudyDeck(): void {
  statusMessage.value = 'Card added to your Study Deck.'
}
</script>

<template>
  <section data-testid="codex-browser" aria-labelledby="codex-title">
    <div class="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="text-sm font-semibold uppercase tracking-wide text-blue-700">Learn Azure</p>
        <h1 id="codex-title" class="mt-1 text-3xl font-bold">Azure Architecture Codex</h1>
        <p class="mt-2 text-gray-600">Browse service cards and save concepts to your study deck.</p>
      </div>
      <div class="flex gap-2" role="tablist" aria-label="Codex sections">
        <button
          id="library-tab"
          type="button"
          role="tab"
          :aria-selected="activeTab === 'library'"
          aria-controls="library-panel"
          class="rounded-lg px-4 py-2 text-sm font-semibold"
          :class="activeTab === 'library' ? 'bg-blue-700 text-white' : 'border bg-white'"
          @click="activeTab = 'library'"
        >
          Card Library
        </button>
        <button
          id="study-tab"
          type="button"
          role="tab"
          :aria-selected="activeTab === 'study'"
          aria-controls="study-panel"
          class="rounded-lg px-4 py-2 text-sm font-semibold"
          :class="activeTab === 'study' ? 'bg-blue-700 text-white' : 'border bg-white'"
          @click="activeTab = 'study'"
        >
          Study Deck
        </button>
      </div>
    </div>

    <p
      v-if="errorMessage"
      role="alert"
      class="mb-4 rounded-lg border border-red-300 bg-red-50 p-4 text-red-800"
    >
      {{ errorMessage }}
    </p>
    <p v-if="statusMessage" role="status" class="sr-only">{{ statusMessage }}</p>

    <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div
        v-if="activeTab === 'library'"
        id="library-panel"
        role="tabpanel"
        aria-labelledby="library-tab"
        class="min-h-[32rem]"
      >
        <CodexBrowser @entry-selected="openEntry" />
      </div>
      <div
        v-else
        id="study-panel"
        role="tabpanel"
        aria-labelledby="study-tab"
        class="min-h-[32rem]"
      >
        <StudyDeck @card-selected="openEntry" />
      </div>
    </div>

    <div
      v-if="selectedCardId"
      class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4"
      role="presentation"
      @click.self="closeEntry"
      @keydown.esc="closeEntry"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="codex-dialog-title"
        class="my-6 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div class="sticky top-0 z-10 flex justify-end border-b bg-white p-3">
          <button
            type="button"
            aria-label="Close card details"
            class="rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-gray-50"
            @click="closeEntry"
          >
            Close
          </button>
        </div>
        <h2 id="codex-dialog-title" class="sr-only">Card details</h2>
        <CodexEntry
          :key="selectedCardId"
          :card-id="selectedCardId"
          @back="closeEntry"
          @add-to-study-deck="addedToStudyDeck"
        />
      </section>
    </div>
  </section>
</template>
