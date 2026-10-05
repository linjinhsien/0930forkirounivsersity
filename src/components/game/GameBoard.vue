<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { ArchitectureScore, AzureCard } from '@/types/game'
import { useGameStore } from '@/stores/game'
import { useCodexStore } from '@/stores/codex'
import ArchitectureSlotComponent from '@/components/board/ArchitectureSlot.vue'
import CardDeck from '@/components/game/CardDeck.vue'
import ScenarioPanel from '@/components/game/ScenarioPanel.vue'
import ScoreDisplay from '@/components/game/ScoreDisplay.vue'
import ValidationFeedback from '@/components/game/ValidationFeedback.vue'
import TimerBar from '@/components/game/TimerBar.vue'

// ---------------------------------------------------------------------------
// Props & emits
// ---------------------------------------------------------------------------

interface Props {
  mode: 'quick-match' | 'multiplayer'
  timeLimit?: number
  compact?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  cardPlaced: [cardId: string, slotId: string]
  solutionSubmitted: [score: ArchitectureScore]
  matchComplete: []
}>()

// ---------------------------------------------------------------------------
// Stores
// ---------------------------------------------------------------------------

const gameStore = useGameStore()
const codexStore = useCodexStore()

// ---------------------------------------------------------------------------
// Local state
// ---------------------------------------------------------------------------

const selectedCard = ref<AzureCard | null>(null)

const timeRemaining = ref<number>(props.timeLimit ?? (props.mode === 'quick-match' ? 45 : 120))

/** Total time for the bar percentage calculation — captured once on mount */
const totalTime = ref<number>(timeRemaining.value)

const timerActive = ref<boolean>(false)
const timerInterval = ref<ReturnType<typeof setInterval> | null>(null)
let completionEmitted = false

watch(timeRemaining, (time) => {
  if (gameStore.gameState?.status === 'playing') {
    gameStore.gameState.timeRemaining = time
  }
})

// ---------------------------------------------------------------------------
// Derived game state
// ---------------------------------------------------------------------------

const currentScenario = computed(() => gameStore.currentScenario)
const slots = computed(() => gameStore.gameState?.slots ?? [])
const hand = computed(() => gameStore.gameState?.hand ?? [])
const currentScore = computed(() => gameStore.currentScore)
const validationResult = computed(() => gameStore.validationResult)
const isValidating = computed(() => gameStore.isValidating)
const placedCardCount = computed(() => gameStore.placedCards.length)

/** Highlight all empty slots when a card is selected (drag or click). */
const isSlotHighlighted = computed(() => selectedCard.value !== null)

// ---------------------------------------------------------------------------
// Timer helpers
// ---------------------------------------------------------------------------

function startTimer(): void {
  if (timerActive.value) return
  timerActive.value = true
  timerInterval.value = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value -= 1
    } else {
      handleTimeExpired()
    }
  }, 1_000)
}

function stopTimer(): void {
  if (timerInterval.value !== null) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
  timerActive.value = false
}

function handleTimeExpired(): void {
  if (completionEmitted) return
  completionEmitted = true
  stopTimer()
  gameStore.submitSolution()
  emit('solutionSubmitted', currentScore.value)
  emit('matchComplete')
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

onMounted(async () => {
  // 1. Load card library
  const cards = await codexStore.loadCardLibrary()

  // 2. Initialize game if none is active
  if (!gameStore.isGameActive) {
    const firstScenario = codexStore.scenarioLibrary[0]
    if (firstScenario) {
      await gameStore.initializeGame(firstScenario.id, props.mode)
    }
  }

  // Sync timeRemaining from store if it was just initialised
  if (gameStore.gameState) {
    // Prefer the prop/default; keep them in sync only if gameState already
    // carries a more relevant value (e.g. a resumed session).
    // We intentionally keep the prop-derived value as the source of truth here.
    totalTime.value = timeRemaining.value
  }

  // 3. Start timer when game is in 'playing' status
  if (gameStore.gameState?.status === 'playing') {
    startTimer()
  }

  // Silence unused-variable warning for `cards` — we just needed the side-effect
  void cards
})

onUnmounted(() => {
  stopTimer()
})

// ---------------------------------------------------------------------------
// Card interaction handlers
// ---------------------------------------------------------------------------

function handleCardSelected(card: AzureCard): void {
  selectedCard.value = selectedCard.value?.id === card.id ? null : card
}

function handleCardDragStart(card: AzureCard): void {
  selectedCard.value = card
}

async function handleSlotDrop(slotId: string, cardId: string): Promise<void> {
  const success = gameStore.placeCard(cardId, slotId)
  if (success) {
    selectedCard.value = null
    emit('cardPlaced', cardId, slotId)
  }
}

async function handleSlotClick(slotId: string): Promise<void> {
  if (selectedCard.value) {
    const cardId = selectedCard.value.id
    const slot = gameStore.gameState?.slots.find((item) => item.id === slotId)
    const success = slot?.card
      ? gameStore.replaceCard(cardId, slotId)
      : gameStore.placeCard(cardId, slotId)

    if (success) {
      selectedCard.value = null
      emit('cardPlaced', cardId, slotId)
    }
    return
  }

  gameStore.removeCard(slotId)
  selectedCard.value = null
}

// ---------------------------------------------------------------------------
// Submit handler
// ---------------------------------------------------------------------------

function handleSubmit(): void {
  if (completionEmitted) return
  completionEmitted = true
  stopTimer()
  gameStore.submitSolution()
  emit('solutionSubmitted', currentScore.value)
  emit('matchComplete')
}
</script>

<template>
  <div
    class="grid grid-cols-1 gap-4 bg-gray-50 p-4 dark:bg-gray-950"
    :class="compact ? 'min-h-0' : 'min-h-screen lg:grid-cols-[280px_1fr_260px]'"
  >
    <!-- ------------------------------------------------------------------ -->
    <!-- Left: Scenario panel                                                -->
    <!-- ------------------------------------------------------------------ -->
    <aside aria-label="Scenario details">
      <ScenarioPanel
        v-if="currentScenario"
        :scenario="currentScenario"
        :placed-card-count="placedCardCount"
      />

      <!-- Loading placeholder while scenario is unavailable -->
      <div
        v-else
        class="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse"
        aria-busy="true"
        aria-label="Loading scenario…"
      >
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
      </div>
    </aside>

    <!-- ------------------------------------------------------------------ -->
    <!-- Center: Timer + Board + Deck                                        -->
    <!-- ------------------------------------------------------------------ -->
    <div class="flex flex-col gap-4" role="region" aria-label="Game board">
      <!-- Timer bar -->
      <TimerBar
        :time-remaining="timeRemaining"
        :total-time="totalTime"
        @time-expired="handleTimeExpired"
      />

      <!-- Architecture slots grid -->
      <section
        aria-label="Architecture slots"
        class="grid grid-cols-2 md:grid-cols-3 gap-4 justify-items-center"
      >
        <ArchitectureSlotComponent
          v-for="slot in slots"
          :key="slot.id"
          :architecture-slot="slot"
          :is-highlighted="isSlotHighlighted && !slot.card"
          @card-dropped="handleSlotDrop"
          @slot-clicked="handleSlotClick"
        />

        <!-- Empty-board placeholder when no slots are loaded yet -->
        <div
          v-if="slots.length === 0"
          class="col-span-2 md:col-span-3 text-center text-gray-400 dark:text-gray-500 py-12"
          aria-live="polite"
        >
          Loading board…
        </div>
      </section>

      <!-- Submit solution button -->
      <div class="flex justify-center mt-2">
        <button
          v-if="gameStore.isGameActive"
          type="button"
          class="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="placedCardCount === 0"
          :aria-disabled="placedCardCount === 0"
          @click="handleSubmit"
        >
          Submit Solution
        </button>
      </div>

      <!-- Card deck -->
      <section aria-label="Cards in hand" class="mt-auto">
        <CardDeck
          :cards="hand"
          :selected-card-id="selectedCard?.id"
          @card-selected="handleCardSelected"
          @card-drag-start="handleCardDragStart"
        />
      </section>
    </div>

    <!-- ------------------------------------------------------------------ -->
    <!-- Right: Score + Validation                                           -->
    <!-- ------------------------------------------------------------------ -->
    <aside class="flex flex-col gap-4" aria-label="Score and validation">
      <ScoreDisplay :score="currentScore" />

      <ValidationFeedback :result="validationResult" :is-validating="isValidating" />
    </aside>
  </div>
</template>
