<script setup lang="ts">
import type { Scenario } from '@/types/game'

const props = defineProps<{
  scenario: Scenario
  placedCardCount?: number
}>()

// A requirement is "met" if there are enough placed cards to cover its index
function isMet(index: number): boolean {
  return (props.placedCardCount ?? 0) > index
}

function isMetClass(index: number): string {
  return isMet(index) ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800/50'
}

const difficultyBadge: Record<Scenario['difficulty'], string> = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  intermediate: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

const categoryLabel: Record<Scenario['category'], string> = {
  'startup-scaling': 'Startup Scaling',
  'enterprise-migration': 'Enterprise Migration',
  'high-compliance': 'High Compliance',
  'real-time-analytics': 'Real-Time Analytics',
}

const categoryBadge: Record<Scenario['category'], string> = {
  'startup-scaling': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  'enterprise-migration': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  'high-compliance': 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
  'real-time-analytics': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
}

const securityBadge: Record<NonNullable<Scenario['constraints']['securityLevel']>, string> = {
  basic: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  standard: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  premium: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
}
</script>

<template>
  <div
    class="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
  >
    <!-- Header -->
    <div class="flex flex-wrap items-start justify-between gap-2 mb-3">
      <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">
        {{ scenario.title }}
      </h2>

      <!-- Badges -->
      <div class="flex flex-wrap gap-1.5">
        <span
          :class="[
            'text-xs font-medium px-2 py-0.5 rounded-full capitalize',
            difficultyBadge[scenario.difficulty],
          ]"
          :aria-label="`Difficulty: ${scenario.difficulty}`"
        >
          {{ scenario.difficulty }}
        </span>
        <span
          :class="[
            'text-xs font-medium px-2 py-0.5 rounded-full',
            categoryBadge[scenario.category],
          ]"
          :aria-label="`Category: ${categoryLabel[scenario.category]}`"
        >
          {{ categoryLabel[scenario.category] }}
        </span>
      </div>
    </div>

    <!-- Description -->
    <p class="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
      {{ scenario.description }}
    </p>

    <!-- Requirements -->
    <div class="mb-4">
      <h3
        class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2"
      >
        Requirements
      </h3>
      <ul aria-label="Scenario requirements" class="space-y-0">
        <li
          v-for="(req, i) in scenario.requirements"
          :key="i"
          :class="[isMetClass(i), 'flex items-start gap-2 p-2 rounded-lg mb-1 text-sm']"
        >
          <span
            :aria-label="isMet(i) ? 'Requirement met' : 'Requirement not met'"
            class="flex-shrink-0 mt-0.5"
          >
            {{ isMet(i) ? '✅' : '⬜' }}
          </span>
          <div>
            <span class="font-medium text-gray-800 dark:text-gray-200">{{ req.description }}</span>
            <span class="text-xs ml-2 opacity-60">weight: {{ req.weight }}</span>
          </div>
        </li>
      </ul>
    </div>

    <!-- Constraints -->
    <div>
      <h3
        class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2"
      >
        Constraints
      </h3>
      <div class="flex flex-wrap gap-2 text-sm">
        <!-- Max cost -->
        <span class="flex items-center gap-1 text-gray-600 dark:text-gray-300">
          💰 Budget:
          <span class="font-medium">{{ scenario.constraints.maxCost ?? 'Unlimited' }} pts</span>
        </span>

        <!-- Min availability -->
        <span
          v-if="scenario.constraints.minAvailability !== undefined"
          class="flex items-center gap-1 text-gray-600 dark:text-gray-300"
        >
          🔄 Min SLA:
          <span class="font-medium">{{ scenario.constraints.minAvailability }}%</span>
        </span>

        <!-- Security level -->
        <span
          v-if="scenario.constraints.securityLevel"
          :class="[
            'text-xs font-medium px-2 py-0.5 rounded-full capitalize',
            securityBadge[scenario.constraints.securityLevel],
          ]"
          :aria-label="`Security level: ${scenario.constraints.securityLevel}`"
        >
          🔒 {{ scenario.constraints.securityLevel }}
        </span>
      </div>
    </div>

    <!-- Max rounds indicator -->
    <div
      class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500"
    >
      Max rounds: {{ scenario.maxRounds }}
    </div>
  </div>
</template>
