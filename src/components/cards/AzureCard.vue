<script setup lang="ts">
import type { AzureCard } from '@/types/game'

const props = defineProps<{
  card: AzureCard
  isSelected?: boolean
}>()

const emit = defineEmits<{
  click: [card: AzureCard]
  dragStart: [card: AzureCard]
}>()

const domainLabel: Record<AzureCard['domain'], string> = {
  'cloud-concepts': 'Cloud Concepts',
  'azure-services': 'Azure Services',
  'management-governance': 'Management & Governance',
}

const domainColor: Record<AzureCard['domain'], string> = {
  'cloud-concepts': 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
  'azure-services': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'management-governance': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
}

const domainBorder: Record<AzureCard['domain'], string> = {
  'cloud-concepts': 'border-sky-400',
  'azure-services': 'border-blue-400',
  'management-governance': 'border-purple-400',
}

function handleDragStart(event: DragEvent): void {
  event.dataTransfer?.setData('cardId', props.card.id)
  emit('dragStart', props.card)
}
</script>

<template>
  <div
    :class="[
      'relative flex flex-col w-36 min-h-48 rounded-xl border-2 p-3 cursor-pointer select-none',
      'bg-white dark:bg-gray-800 shadow-sm',
      'transition-all duration-150',
      domainBorder[card.domain],
      isSelected
        ? 'ring-2 ring-offset-2 ring-blue-500 -translate-y-1 shadow-md'
        : 'hover:-translate-y-0.5 hover:shadow-md',
    ]"
    draggable="true"
    :aria-selected="isSelected"
    :aria-label="`${card.name}, ${domainLabel[card.domain]}, power ${card.power}, cost ${card.cost}`"
    role="button"
    tabindex="0"
    @click="emit('click', card)"
    @keydown.enter="emit('click', card)"
    @keydown.space.prevent="emit('click', card)"
    @dragstart="handleDragStart"
  >
    <!-- Domain badge -->
    <span
      :class="[
        'self-start text-xs font-medium px-1.5 py-0.5 rounded mb-2',
        domainColor[card.domain],
      ]"
    >
      {{ domainLabel[card.domain] }}
    </span>

    <!-- Card name -->
    <p class="font-bold text-sm text-gray-900 dark:text-gray-100 leading-tight mb-1">
      {{ card.name }}
    </p>

    <!-- Description -->
    <p class="text-xs text-gray-500 dark:text-gray-400 leading-snug line-clamp-3 flex-1">
      {{ card.description }}
    </p>

    <!-- Stats row -->
    <div
      class="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-700"
    >
      <span class="text-xs text-gray-500 dark:text-gray-400" :aria-label="`Cost: ${card.cost}`">
        💰 {{ card.cost }}
      </span>
      <span class="text-xs text-gray-500 dark:text-gray-400" :aria-label="`Power: ${card.power}`">
        ⚡ {{ card.power }}
      </span>
    </div>

    <!-- Synergy tags -->
    <div v-if="card.synergyTags.length > 0" class="flex flex-wrap gap-1 mt-2">
      <span
        v-for="tag in card.synergyTags.slice(0, 2)"
        :key="tag"
        class="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded px-1"
      >
        {{ tag }}
      </span>
    </div>
  </div>
</template>
