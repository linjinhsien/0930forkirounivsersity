<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
  ariaLabel: undefined,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const variantClasses: Record<NonNullable<Props['variant']>, string> = {
  primary:
    'bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600',
  secondary:
    'bg-gray-100 hover:bg-gray-200 text-gray-900 focus-visible:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100',
  danger:
    'bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600',
  ghost:
    'bg-transparent hover:bg-gray-100 text-gray-700 focus-visible:ring-gray-400 dark:hover:bg-gray-800 dark:text-gray-300',
}

const sizeClasses: Record<NonNullable<Props['size']>, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

const baseClasses =
  'rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2'

const buttonClasses = computed(
  () => `${baseClasses} ${variantClasses[props.variant!]} ${sizeClasses[props.size!]}`
)

function handleClick(event: MouseEvent): void {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="disabled || loading"
    :aria-label="ariaLabel"
    :aria-busy="loading ? 'true' : undefined"
    @click="handleClick"
  >
    <!-- Loading spinner -->
    <svg
      v-if="loading"
      class="animate-spin h-4 w-4 shrink-0"
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

    <slot />
  </button>
</template>
