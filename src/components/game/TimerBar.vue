<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Props {
  timeRemaining: number
  totalTime: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  timeExpired: []
  warningTriggered: []
}>()

const liveAnnouncement = ref('')
const warningEmitted = ref(false)

const percentage = computed(() =>
  Math.max(0, Math.min(100, (props.timeRemaining / props.totalTime) * 100))
)

const minutes = computed(() =>
  Math.floor(props.timeRemaining / 60)
    .toString()
    .padStart(2, '0')
)
const seconds = computed(() => (props.timeRemaining % 60).toString().padStart(2, '0'))

const barColorClass = computed(() => {
  if (percentage.value > 50) return 'bg-green-500'
  if (percentage.value > 25) return 'bg-amber-500'
  return 'bg-red-500 animate-pulse'
})

const timeColorClass = computed(() => {
  if (percentage.value > 50) return 'text-green-600'
  if (percentage.value > 25) return 'text-amber-600'
  return 'text-red-600'
})

watch(
  () => props.timeRemaining,
  (val) => {
    if (val <= 0) {
      liveAnnouncement.value = 'Time expired!'
      emit('timeExpired')
    } else if (val <= 10 && !warningEmitted.value) {
      warningEmitted.value = true
      liveAnnouncement.value = '10 seconds remaining!'
      emit('warningTriggered')
    }
  }
)
</script>

<template>
  <div class="space-y-1">
    <!-- Screen-reader live region -->
    <div aria-live="polite" class="sr-only">{{ liveAnnouncement }}</div>

    <div class="flex justify-between text-sm">
      <span class="font-medium text-gray-700 dark:text-gray-300">Time Remaining</span>
      <span :class="timeColorClass" class="font-mono font-bold">{{ minutes }}:{{ seconds }}</span>
    </div>

    <div class="w-full overflow-hidden rounded-full bg-gray-200 h-3 dark:bg-gray-700">
      <div
        role="progressbar"
        :aria-valuenow="timeRemaining"
        :aria-valuemin="0"
        :aria-valuemax="totalTime"
        aria-label="Time remaining"
        :class="barColorClass"
        :style="{ width: percentage + '%' }"
        class="h-3 rounded-full transition-all duration-1000"
      ></div>
    </div>
  </div>
</template>
