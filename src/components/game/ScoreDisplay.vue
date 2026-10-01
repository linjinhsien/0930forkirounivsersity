<script setup lang="ts">
import { computed } from 'vue'
import type { ArchitectureScore } from '@/types/game'

const props = defineProps<{
  score: ArchitectureScore
}>()

const haBarColor = computed((): string => {
  if (props.score.highAvailability >= 75) return 'bg-blue-500'
  if (props.score.highAvailability >= 50) return 'bg-amber-400'
  return 'bg-red-400'
})

const costBarColor = computed((): string => {
  if (props.score.costEffectiveness >= 75) return 'bg-green-400'
  if (props.score.costEffectiveness >= 50) return 'bg-amber-400'
  return 'bg-red-400'
})

const secBarColor = computed((): string => {
  if (props.score.securityCompliance >= 75) return 'bg-purple-500'
  if (props.score.securityCompliance >= 50) return 'bg-amber-400'
  return 'bg-red-400'
})

const totalColor = computed((): string => {
  const ratio = props.score.total / 300
  if (ratio >= 0.75) return 'text-green-600 dark:text-green-400'
  if (ratio >= 0.5) return 'text-amber-500 dark:text-amber-400'
  return 'text-red-500 dark:text-red-400'
})

const costUtilizationDisplay = computed((): string => {
  return `${Math.round(props.score.breakdown.costUtilization)}%`
})
</script>

<template>
  <div
    class="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
  >
    <!-- Total score -->
    <div class="flex items-baseline justify-between mb-4">
      <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        Architecture Score
      </h2>
      <div class="flex items-baseline gap-1">
        <span
          :class="['text-4xl font-extrabold tabular-nums', totalColor]"
          :aria-label="`Total score: ${score.total} out of 300`"
        >
          {{ score.total }}
        </span>
        <span class="text-sm text-gray-400 dark:text-gray-500">/ 300</span>
      </div>
    </div>

    <!-- Individual score components -->
    <div class="space-y-3 mb-4">
      <!-- High Availability -->
      <div>
        <div class="flex justify-between items-center mb-1">
          <span class="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
            🔄 <span>High Availability</span>
          </span>
          <span class="text-sm font-semibold text-gray-800 dark:text-gray-200 tabular-nums">
            {{ score.highAvailability }}
          </span>
        </div>
        <div
          role="progressbar"
          :aria-valuenow="score.highAvailability"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-label="`High Availability: ${score.highAvailability} out of 100`"
          class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden"
        >
          <div
            :class="[haBarColor, 'h-2 rounded-full transition-all duration-500']"
            :style="{ width: score.highAvailability + '%' }"
          />
        </div>
      </div>

      <!-- Cost Effectiveness -->
      <div>
        <div class="flex justify-between items-center mb-1">
          <span class="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
            💰 <span>Cost Effectiveness</span>
          </span>
          <span class="text-sm font-semibold text-gray-800 dark:text-gray-200 tabular-nums">
            {{ score.costEffectiveness }}
          </span>
        </div>
        <div
          role="progressbar"
          :aria-valuenow="score.costEffectiveness"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-label="`Cost Effectiveness: ${score.costEffectiveness} out of 100`"
          class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden"
        >
          <div
            :class="[costBarColor, 'h-2 rounded-full transition-all duration-500']"
            :style="{ width: score.costEffectiveness + '%' }"
          />
        </div>
      </div>

      <!-- Security Compliance -->
      <div>
        <div class="flex justify-between items-center mb-1">
          <span class="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
            🔒 <span>Security Compliance</span>
          </span>
          <span class="text-sm font-semibold text-gray-800 dark:text-gray-200 tabular-nums">
            {{ score.securityCompliance }}
          </span>
        </div>
        <div
          role="progressbar"
          :aria-valuenow="score.securityCompliance"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-label="`Security Compliance: ${score.securityCompliance} out of 100`"
          class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden"
        >
          <div
            :class="[secBarColor, 'h-2 rounded-full transition-all duration-500']"
            :style="{ width: score.securityCompliance + '%' }"
          />
        </div>
      </div>
    </div>

    <!-- Collapsible breakdown -->
    <details class="group">
      <summary
        class="cursor-pointer text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide select-none hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      >
        Score Breakdown ▾
      </summary>

      <div class="mt-3 space-y-2 text-sm">
        <!-- Requirements met -->
        <div class="flex justify-between text-gray-600 dark:text-gray-300">
          <span>Requirements met</span>
          <span class="font-medium tabular-nums">
            {{ score.breakdown.requirementsMet }} / {{ score.breakdown.totalRequirements }}
          </span>
        </div>

        <!-- Cost utilization -->
        <div class="flex justify-between text-gray-600 dark:text-gray-300">
          <span>Cost utilization</span>
          <span class="font-medium tabular-nums">{{ costUtilizationDisplay }}</span>
        </div>

        <!-- Synergy bonuses -->
        <div v-if="score.breakdown.synergyBonuses.length > 0">
          <p class="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">
            Synergy Bonuses
          </p>
          <ul class="space-y-0.5">
            <li
              v-for="bonus in score.breakdown.synergyBonuses"
              :key="bonus"
              class="text-xs text-green-700 dark:text-green-300 flex items-center gap-1"
            >
              <span aria-hidden="true">✨</span> {{ bonus }}
            </li>
          </ul>
        </div>

        <!-- Penalties -->
        <div v-if="score.breakdown.penalties.length > 0">
          <p class="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">Penalties</p>
          <ul class="space-y-0.5">
            <li
              v-for="penalty in score.breakdown.penalties"
              :key="penalty"
              class="text-xs text-red-700 dark:text-red-300 flex items-center gap-1"
            >
              <span aria-hidden="true">⚠️</span> {{ penalty }}
            </li>
          </ul>
        </div>

        <!-- Empty state for bonuses and penalties -->
        <p
          v-if="
            score.breakdown.synergyBonuses.length === 0 && score.breakdown.penalties.length === 0
          "
          class="text-xs text-gray-400 dark:text-gray-500 italic"
        >
          No synergies or penalties applied.
        </p>
      </div>
    </details>
  </div>
</template>
