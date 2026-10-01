<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue'
import type { AzureCard } from '@/types/game'

interface Props {
  card: AzureCard
  visible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const MAX_TIP_LENGTH = 280

const truncatedExamTip = computed<string>(() => {
  const tip = props.card.az900ExamTip ?? ''
  if (tip.length <= MAX_TIP_LENGTH) return tip
  return tip.slice(0, MAX_TIP_LENGTH - 1) + '…'
})

function handleKeyDown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <Transition name="fade">
    <div
      v-if="visible"
      role="tooltip"
      aria-live="polite"
      class="absolute z-50 max-w-[280px] w-max bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3"
    >
      <!-- Card name -->
      <p class="font-bold text-sm text-gray-900 dark:text-gray-100 mb-2">
        {{ card.name }}
      </p>

      <!-- AZ-900 Exam Tip -->
      <p class="text-xs text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">
        {{ truncatedExamTip }}
      </p>

      <!-- Synergy tags -->
      <div v-if="card.synergyTags.length > 0" class="flex flex-wrap">
        <span
          v-for="tag in card.synergyTags"
          :key="tag"
          class="inline-block text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded px-1.5 py-0.5 mr-1 mb-1"
        >
          {{ tag }}
        </span>
      </div>

      <!-- Close hint -->
      <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Press Esc to close</p>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.97);
}
</style>
