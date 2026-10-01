<script setup lang="ts">
import { createPinia, piniaSymbol } from 'pinia'
import { onMounted, provide, ref } from 'vue'
import GameBoard from '@/components/game/GameBoard.vue'
import type { ArchitectureScore, Scenario } from '@/types/game'
import { useGameStore } from '@/stores/game'
import { useCodexStore } from '@/stores/codex'
import { ScoringEngine } from '@/engine/scoring'

const props = defineProps<{
  playerNumber: 1 | 2
  playerName: string
  scenario: Scenario
  matchKey: number
}>()

const emit = defineEmits<{
  complete: [playerNumber: 1 | 2, score: ArchitectureScore]
}>()

const pinia = createPinia()
provide(piniaSymbol, pinia)
const gameStore = useGameStore(pinia)
const codexStore = useCodexStore(pinia)
const scoringEngine = new ScoringEngine()
const ready = ref(false)

onMounted(async () => {
  await codexStore.loadCardLibrary()
  await gameStore.initializeGame(props.scenario.id, 'multiplayer')
  ready.value = true
})

function handleComplete(): void {
  if (!gameStore.gameState) return
  const score = scoringEngine.calculateScore(gameStore.placedCards, props.scenario)
  gameStore.updateScore(score)
  emit('complete', props.playerNumber, score)
}
</script>

<template>
  <section
    class="min-w-0 rounded-xl border border-gray-200 bg-gray-50 p-3"
    :aria-label="`${playerName}'s board`"
  >
    <h2 class="mb-3 text-lg font-bold">{{ playerName }}</h2>
    <div v-if="!ready" role="status" class="rounded-lg bg-white p-5 text-sm text-gray-600">
      Preparing player board…
    </div>
    <GameBoard
      v-else
      :key="matchKey"
      mode="multiplayer"
      compact
      :time-limit="120"
      @match-complete="handleComplete"
    />
  </section>
</template>
