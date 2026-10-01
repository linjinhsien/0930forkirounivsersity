<script setup lang="ts">
import type { ValidationResult, ValidationViolation } from '@/types/game'

defineProps<{
  result: ValidationResult | null
  isValidating?: boolean
}>()

function violationIcon(type: ValidationViolation['type']): string {
  const icons: Record<ValidationViolation['type'], string> = {
    'cost-exceeded': '💸',
    'requirement-unmet': '❌',
    'conflict-detected': '⚡',
    'anti-pattern': '⚠️',
  }
  return icons[type]
}
</script>

<template>
  <div>
    <!-- Loading / validating state -->
    <div
      v-if="isValidating || result === null"
      class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
      aria-busy="true"
      aria-live="polite"
    >
      <!-- Spinner -->
      <svg
        class="animate-spin h-5 w-5 text-blue-500 flex-shrink-0"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <span class="text-sm text-gray-600 dark:text-gray-300">Validating...</span>
    </div>

    <!-- Valid state -->
    <div
      v-else-if="result.isValid"
      role="alert"
      class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3 flex items-center gap-2"
    >
      <span aria-hidden="true">✅</span>
      <span class="text-green-800 dark:text-green-300 font-medium">Valid placement!</span>
    </div>

    <!-- Violation state -->
    <div v-else role="alert" aria-live="assertive" class="space-y-2">
      <!-- Individual violations -->
      <div
        v-for="(v, i) in result.violations"
        :key="i"
        class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3"
      >
        <div class="flex items-start gap-2">
          <span class="flex-shrink-0 mt-0.5" :aria-label="`Violation: ${v.type}`">
            {{ violationIcon(v.type) }}
          </span>
          <div>
            <p class="text-red-800 dark:text-red-300 text-sm font-medium">{{ v.message }}</p>
            <p v-if="v.principle" class="text-red-600 dark:text-red-400 text-xs mt-0.5">
              Principle: {{ v.principle }}
            </p>
          </div>
        </div>
      </div>

      <!-- Suggestions -->
      <div v-if="result.suggestions && result.suggestions.length > 0" class="mt-2">
        <p class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Suggestions:</p>
        <div class="flex flex-wrap gap-1">
          <span
            v-for="s in result.suggestions"
            :key="s.id"
            class="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 rounded px-2 py-1"
          >
            {{ s.name }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
