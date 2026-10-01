<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import GameBoard from '@/components/game/GameBoard.vue'
import { ScoringEngine } from '@/engine/scoring'
import { useGameStore } from '@/stores/game'
import { usePlayerStore } from '@/stores/player'
import { useSessionStore } from '@/stores/session'
import type { ArchitectureScore, Scenario } from '@/types/game'
import { loadAllScenarios } from '@/utils/dataLoader'

const router = useRouter()
const route = useRoute()
const gameStore = useGameStore()
const playerStore = usePlayerStore()
const sessionStore = useSessionStore()
const scenarios = ref<Scenario[]>([])
const currentIndex = ref(0)
const roundFinished = ref(false)
const scores = ref<ArchitectureScore[]>([])
const loading = ref(true)
const errorMessage = ref('')
const saveMessage = ref('')
const scoringEngine = new ScoringEngine()
const currentScenario = computed(() => scenarios.value[currentIndex.value] ?? null)
const currentTimeLimit = computed(() => gameStore.gameState?.timeRemaining ?? 45)
const totalScore = computed(() => scores.value.reduce((sum, score) => sum + score.total, 0))
const isComplete = computed(() => scores.value.length === 3)

async function startGame(): Promise<void> {
  loading.value = true
  errorMessage.value = ''
  saveMessage.value = ''
  roundFinished.value = false
  scores.value = []
  currentIndex.value = 0

  try {
    const allScenarios = await loadAllScenarios()
    const tier = playerStore.profile?.difficultyTier ?? 'beginner'
    const atTier = allScenarios.filter((scenario) => scenario.difficulty === tier)
    scenarios.value = [...(atTier.length ? atTier : allScenarios)].slice(0, 3)
    if (scenarios.value.length === 0) throw new Error('No scenarios are available.')

    const savedSession = route.query.resume === '1' ? sessionStore.loadSession() : null
    if (
      savedSession?.gameState.mode === 'quick-match' &&
      savedSession.gameState.status === 'playing'
    ) {
      const savedScenario = savedSession.gameState.currentScenario
      scenarios.value = [
        savedScenario,
        ...scenarios.value.filter((item) => item.id !== savedScenario.id),
      ]
      await gameStore.restoreGame(savedSession.gameState)
    } else {
      await gameStore.initializeGame(scenarios.value[0].id, 'quick-match')
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to start a quick match.'
  } finally {
    loading.value = false
  }
}

function handleMatchComplete(): void {
  if (roundFinished.value || !gameStore.gameState || !currentScenario.value) return
  roundFinished.value = true
  const score = scoringEngine.calculateScore(gameStore.placedCards, currentScenario.value)
  gameStore.updateScore(score)
  scores.value.push(score)
  if (scores.value.length === 3) {
    playerStore.recordMatchResult(totalScore.value >= 450)
    playerStore.awardExperience(Math.max(10, Math.round(totalScore.value / 10)))
  }
}

async function continueMatch(): Promise<void> {
  if (!roundFinished.value) return
  if (currentIndex.value >= 2) return
  currentIndex.value += 1
  roundFinished.value = false
  const scenario = currentScenario.value
  if (scenario) await gameStore.initializeGame(scenario.id, 'quick-match')
}

function saveForLater(): void {
  if (!gameStore.gameState) return
  sessionStore.saveSession(gameStore.gameState, playerStore.profile?.id)
  saveMessage.value = 'Your game has been saved on this device for 7 days.'
}

function confirmExit(): void {
  if (window.confirm('Leave this match? Your current game is saved for later.')) {
    saveForLater()
    void router.push('/')
  }
}

onMounted(() => {
  void startGame()
})
</script>

<template>
  <section aria-labelledby="quick-match-title">
    <div class="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="text-sm font-semibold uppercase tracking-wide text-blue-700">Single player</p>
        <h1 id="quick-match-title" class="mt-1 text-3xl font-bold">3-Minute Commute Mode</h1>
      </div>
      <RouterLink to="/" class="text-sm font-medium text-blue-700 hover:underline"
        >Main menu</RouterLink
      >
    </div>

    <p v-if="loading" role="status" class="rounded-lg bg-white p-6 text-gray-600">
      Loading your scenarios…
    </p>
    <div
      v-else-if="errorMessage"
      role="alert"
      class="rounded-lg border border-red-300 bg-red-50 p-5 text-red-800"
    >
      {{ errorMessage }}
      <button class="ml-3 font-semibold underline" type="button" @click="startGame">
        Try again
      </button>
    </div>
    <section
      v-else-if="isComplete"
      aria-live="polite"
      class="rounded-2xl border bg-white p-6 shadow-sm"
    >
      <p class="text-sm font-semibold uppercase text-green-700">Match complete</p>
      <h2 class="mt-2 text-2xl font-bold">Your architecture score: {{ totalScore }} / 900</h2>
      <p class="mt-2 text-gray-600">
        You completed all three scenarios. Keep practicing to improve your score.
      </p>
      <div class="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          class="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800"
          @click="startGame"
        >
          New Game
        </button>
        <RouterLink to="/" class="rounded-lg border px-4 py-2 font-semibold hover:bg-gray-50"
          >Main Menu</RouterLink
        >
      </div>
    </section>
    <template v-else-if="currentScenario">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p class="font-semibold" aria-live="polite">Scenario {{ currentIndex + 1 }} of 3</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-if="!roundFinished"
            type="button"
            class="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-white"
            @click="saveForLater"
          >
            Save for Later
          </button>
          <button
            type="button"
            class="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-white"
            @click="confirmExit"
          >
            Exit Match
          </button>
        </div>
      </div>
      <p v-if="saveMessage" role="status" class="mb-3 text-sm text-green-700">{{ saveMessage }}</p>
      <GameBoard
        :key="`${currentIndex}-${currentScenario.id}`"
        mode="quick-match"
        :time-limit="currentTimeLimit"
        @match-complete="handleMatchComplete"
      />
      <div v-if="roundFinished" class="mt-4 rounded-lg border bg-white p-5">
        <p class="font-semibold">Scenario score: {{ scores[scores.length - 1]?.total }} / 300</p>
        <button
          type="button"
          class="mt-3 rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800"
          @click="continueMatch"
        >
          {{ currentIndex < 2 ? 'Next Scenario' : 'See Results' }}
        </button>
      </div>
    </template>
  </section>
</template>
