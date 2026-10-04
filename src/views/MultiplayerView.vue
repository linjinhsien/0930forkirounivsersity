<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import MultiplayerBoard from '@/components/game/MultiplayerBoard.vue'
import { EvaluatorEngine } from '@/engine/evaluator'
import { usePlayerStore } from '@/stores/player'
import type { ArchitectureScore, Scenario } from '@/types/game'
import { loadAllScenarios } from '@/utils/dataLoader'

const playerStore = usePlayerStore()
const evaluator = new EvaluatorEngine()
const scenarios = ref<Scenario[]>([])
const scenarioIndex = ref(0)
const playerOneName = ref(playerStore.profile?.displayName ?? 'Player 1')
const playerTwoName = ref('Player 2')
const matchStarted = ref(false)
const matchKey = ref(0)
const scores = ref<Partial<Record<1 | 2, ArchitectureScore>>>({})
const xpAwards = ref<{ player1: number; player2: number } | null>(null)
const errorMessage = ref('')
const currentScenario = computed(() => scenarios.value[scenarioIndex.value] ?? null)
const matchComplete = computed(() => Boolean(scores.value[1] && scores.value[2]))
const winner = computed(() => {
  const first = scores.value[1]?.total
  const second = scores.value[2]?.total
  if (first === undefined || second === undefined) return null
  return first === second ? 'tie' : first > second ? 'player1' : 'player2'
})

onMounted(async () => {
  try {
    scenarios.value = await loadAllScenarios()
    const tier = playerStore.profile?.difficultyTier ?? 'beginner'
    const matching = scenarios.value.filter((scenario) => scenario.difficulty === tier)
    if (matching.length) scenarios.value = matching
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Unable to load multiplayer scenarios.'
  }
})

function handlePlayerComplete(playerNumber: 1 | 2, score: ArchitectureScore): void {
  if (scores.value[playerNumber]) return
  scores.value = { ...scores.value, [playerNumber]: score }
  if (scores.value[1] && scores.value[2] && currentScenario.value) {
    const result = winner.value
    const playerOneWon = result === 'player1'
    xpAwards.value = {
      player1: evaluator.calculateXPAward(
        scores.value[1],
        playerOneWon,
        currentScenario.value.difficulty
      ),
      player2: evaluator.calculateXPAward(
        scores.value[2],
        result === 'player2',
        currentScenario.value.difficulty
      ),
    }
    if (playerStore.profile) {
      playerStore.recordMatchResult(playerOneWon)
      playerStore.awardExperience(xpAwards.value.player1)
    }
  }
}

function startMatch(): void {
  if (!currentScenario.value) return
  scores.value = {}
  xpAwards.value = null
  matchKey.value += 1
  matchStarted.value = true
}

function playAgain(): void {
  if (scenarios.value.length > 1)
    scenarioIndex.value = (scenarioIndex.value + 1) % scenarios.value.length
  startMatch()
}
</script>

<template>
  <section aria-labelledby="multiplayer-title">
    <div class="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="text-sm font-semibold uppercase tracking-wide text-purple-700">
          Two-player challenge
        </p>
        <h1 id="multiplayer-title" class="mt-1 text-3xl font-bold">Multiplayer Challenge</h1>
      </div>
      <RouterLink to="/" class="text-sm font-medium text-blue-700 hover:underline"
        >Main menu</RouterLink
      >
    </div>

    <p
      v-if="errorMessage"
      role="alert"
      class="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800"
    >
      {{ errorMessage }}
    </p>
    <div v-else-if="!currentScenario" role="status" class="rounded-lg bg-white p-5 text-gray-600">
      Loading match scenario…
    </div>
    <template v-else>
      <section class="mb-5 rounded-xl border bg-white p-5" aria-label="Match setup">
        <h2 class="text-lg font-bold">Match setup</h2>
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <label class="flex flex-col gap-1 text-sm font-medium">
            Player 1
            <input
              v-model="playerOneName"
              maxlength="32"
              class="rounded-lg border px-3 py-2"
              :disabled="matchStarted"
            />
          </label>
          <label class="flex flex-col gap-1 text-sm font-medium">
            Player 2
            <input
              v-model="playerTwoName"
              maxlength="32"
              class="rounded-lg border px-3 py-2"
              :disabled="matchStarted"
            />
          </label>
        </div>
        <h3 class="mt-4 font-semibold">{{ currentScenario.title }}</h3>
        <p class="mt-1 text-sm text-gray-600">{{ currentScenario.description }}</p>
        <button
          v-if="!matchStarted"
          type="button"
          class="mt-4 rounded-lg bg-purple-700 px-4 py-2 font-semibold text-white hover:bg-purple-800"
          @click="startMatch"
        >
          Start Clash
        </button>
      </section>

      <div v-if="matchStarted" class="grid items-start gap-5 md:grid-cols-2">
        <MultiplayerBoard
          :key="`${matchKey}-player-1`"
          :player-number="1"
          :player-name="playerOneName || 'Player 1'"
          :scenario="currentScenario"
          :match-key="matchKey"
          @complete="handlePlayerComplete"
        />
        <MultiplayerBoard
          :key="`${matchKey}-player-2`"
          :player-number="2"
          :player-name="playerTwoName || 'Player 2'"
          :scenario="currentScenario"
          :match-key="matchKey"
          @complete="handlePlayerComplete"
        />
      </div>

      <section
        v-if="matchComplete"
        aria-labelledby="clash-results-title"
        aria-live="polite"
        class="mt-5 rounded-xl border bg-white p-5"
      >
        <h2 id="clash-results-title" class="text-xl font-bold">Clash results</h2>
        <p class="mt-2 text-lg font-semibold">
          {{
            winner === 'tie'
              ? 'It’s a tie!'
              : `${winner === 'player1' ? playerOneName : playerTwoName} wins!`
          }}
        </p>
        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <p class="rounded-lg bg-gray-50 p-3">
            {{ playerOneName }}: {{ scores[1]?.total }} / 300 · {{ xpAwards?.player1 }} XP
          </p>
          <p class="rounded-lg bg-gray-50 p-3">
            {{ playerTwoName }}: {{ scores[2]?.total }} / 300 · {{ xpAwards?.player2 }} XP
          </p>
        </div>
        <button
          type="button"
          class="mt-4 rounded-lg bg-purple-700 px-4 py-2 font-semibold text-white hover:bg-purple-800"
          @click="playAgain"
        >
          Play Again
        </button>
        <RouterLink
          to="/"
          class="ml-3 inline-block rounded-lg border px-4 py-2 font-semibold hover:bg-gray-50"
        >
          Main Menu
        </RouterLink>
      </section>
    </template>
  </section>
</template>
