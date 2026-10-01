<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

interface Props {
  modelValue: boolean
  title: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const dialogRef = ref<HTMLElement | null>(null)
const titleId = `modal-title-${crypto.randomUUID().slice(0, 8)}`

const sizeClasses: Record<NonNullable<Props['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

const dialogSizeClass = computed(() => sizeClasses[props.size!])

function close(): void {
  emit('update:modelValue', false)
}

function handleBackdropClick(event: MouseEvent): void {
  // Only close if the click was directly on the backdrop, not inside the dialog
  if (event.target === event.currentTarget) {
    close()
  }
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  // Focus the dialog element for accessibility
  dialogRef.value?.focus()
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
        @click="handleBackdropClick"
      >
        <!-- Dialog -->
        <div
          ref="dialogRef"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :class="[
            'relative w-full bg-white dark:bg-gray-900 rounded-xl shadow-xl z-50 focus:outline-none',
            dialogSizeClass,
          ]"
          tabindex="-1"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700"
          >
            <h2 :id="titleId" class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {{ title }}
            </h2>
            <button
              type="button"
              aria-label="Close"
              class="rounded-md p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
              @click="close"
            >
              <svg
                class="h-5 w-5"
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

          <!-- Body -->
          <div class="px-6 py-4 text-gray-700 dark:text-gray-300">
            <slot />
          </div>

          <!-- Footer -->
          <div
            v-if="$slots.footer"
            class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active {
  transition: opacity 0.2s ease;
}
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
