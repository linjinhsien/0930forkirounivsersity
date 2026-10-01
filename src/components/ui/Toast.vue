<script setup lang="ts">
import { computed, watch } from 'vue'

interface Props {
  modelValue: boolean
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 3000,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

let dismissTimer: ReturnType<typeof setTimeout> | null = null

function close(): void {
  emit('update:modelValue', false)
}

function clearTimer(): void {
  if (dismissTimer !== null) {
    clearTimeout(dismissTimer)
    dismissTimer = null
  }
}

function startTimer(): void {
  clearTimer()
  if (props.duration > 0) {
    dismissTimer = setTimeout(() => {
      close()
    }, props.duration)
  }
}

// Start/clear the auto-dismiss timer whenever modelValue changes
watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      startTimer()
    } else {
      clearTimer()
    }
  },
  { immediate: true }
)

// ── Styling ──────────────────────────────────────────────────────────────────

type ToastType = NonNullable<Props['type']>

const typeClasses: Record<ToastType, string> = {
  success:
    'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300',
  error:
    'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300',
  warning:
    'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300',
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300',
}

const toastClass = computed(
  () =>
    `flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg min-w-64 max-w-sm ${typeClasses[props.type!]}`
)

// ── Icons (inline SVG paths) ──────────────────────────────────────────────────

const icons: Record<ToastType, string> = {
  success:
    'M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z',
  error:
    'M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z',
  warning:
    'M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z',
  info: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z',
}

const iconAriaLabels: Record<ToastType, string> = {
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Info',
}
</script>

<template>
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="modelValue"
        :class="toastClass"
        role="alert"
        aria-live="polite"
        aria-atomic="true"
        class="fixed bottom-4 right-4 z-50"
      >
        <!-- Icon -->
        <svg
          class="h-5 w-5 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          :aria-label="iconAriaLabels[type!]"
          role="img"
        >
          <path fill-rule="evenodd" :d="icons[type!]" clip-rule="evenodd" />
        </svg>

        <!-- Message -->
        <span class="flex-1 text-sm font-medium">{{ message }}</span>

        <!-- Close button -->
        <button
          type="button"
          aria-label="Dismiss notification"
          class="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current transition-opacity"
          @click="close"
        >
          <svg
            class="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
            />
          </svg>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.toast-enter-active {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}
.toast-leave-active {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}
.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
