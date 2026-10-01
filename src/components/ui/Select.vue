<script setup lang="ts">
interface SelectOption {
  value: string
  label: string
}

interface Props {
  modelValue: string
  options: SelectOption[]
  label?: string
  disabled?: boolean
  placeholder?: string
}

withDefaults(defineProps<Props>(), {
  label: undefined,
  disabled: false,
  placeholder: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Generate a stable unique ID for the select element
const selectId = `select-${crypto.randomUUID().slice(0, 8)}`

function handleChange(event: Event): void {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="w-full">
    <label
      v-if="label"
      :for="selectId"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
    >
      {{ label }}
    </label>
    <select
      :id="selectId"
      :value="modelValue"
      :disabled="disabled"
      class="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      @change="handleChange"
    >
      <!-- Placeholder option -->
      <option v-if="placeholder" value="" disabled :selected="modelValue === ''">
        {{ placeholder }}
      </option>

      <!-- Options -->
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>
