<script setup lang="ts">
import { computed } from 'vue'
import type { ArchitectureSlot as ArchitectureSlotType } from '@/types/game'
import AzureCard from '@/components/cards/AzureCard.vue'

interface Props {
  architectureSlot: ArchitectureSlotType
  isValid?: boolean
  isHighlighted?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isValid: undefined,
  isHighlighted: false,
})

const emit = defineEmits<{
  cardDropped: [slotId: string, cardId: string]
  cardRemoved: [slotId: string]
  slotClicked: [slotId: string]
}>()

const SLOT_ICONS: Record<ArchitectureSlotType['type'], string> = {
  compute: '⚙️',
  storage: '💾',
  network: '🌐',
  security: '🔒',
  governance: '📋',
  any: '✨',
}

const slotIcon = computed<string>(() => SLOT_ICONS[props.architectureSlot.type] ?? '✨')

const ariaLabel = computed<string>(() => {
  const occupied = props.architectureSlot.card
    ? `occupied by ${props.architectureSlot.card.name}`
    : 'empty'
  return `${props.architectureSlot.type} slot, ${occupied}`
})

const slotClasses = computed<string>(() => {
  const base =
    'relative rounded-xl border-2 border-dashed w-44 min-h-32 flex flex-col items-center justify-center transition-all'

  if (props.architectureSlot.card) {
    // Occupied — neutral wrapper; AzureCard inside handles its own border/ring
    return `${base} border-transparent bg-transparent p-0`
  }

  if (props.isHighlighted) {
    return `${base} border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]`
  }

  if (props.isValid === true) {
    return `${base} border-green-400 bg-green-50 dark:bg-green-900/20`
  }

  if (props.isValid === false) {
    return `${base} border-red-400 bg-red-50 dark:bg-red-900/20`
  }

  // Default empty state
  return `${base} border-gray-300 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20`
})

function handleDrop(event: DragEvent): void {
  const cardId = event.dataTransfer?.getData('cardId')
  if (cardId) {
    emit('cardDropped', props.architectureSlot.id, cardId)
  }
}

function handleClick(): void {
  emit('slotClicked', props.architectureSlot.id)
}

function handleKeyActivate(event: KeyboardEvent): void {
  if (event.key === 'Enter') {
    event.preventDefault()
    emit('slotClicked', props.architectureSlot.id)
  }
}
</script>

<template>
  <div
    :class="slotClasses"
    role="button"
    :tabindex="0"
    :aria-label="ariaLabel"
    @dragover.prevent
    @drop="handleDrop"
    @click="handleClick"
    @keydown="handleKeyActivate"
  >
    <!-- Empty state -->
    <template v-if="!architectureSlot.card">
      <span class="text-3xl mb-1" aria-hidden="true">{{ slotIcon }}</span>
      <span class="text-xs text-gray-500 dark:text-gray-400 capitalize">{{
        architectureSlot.type
      }}</span>
      <span v-if="architectureSlot.required" class="text-xs text-red-400 mt-1">Required</span>
    </template>

    <!-- Occupied: render AzureCard -->
    <AzureCard
      v-else
      :card="architectureSlot.card"
      :is-placed="true"
      :is-valid="isValid"
      :is-draggable="false"
      @click="emit('cardRemoved', architectureSlot.id)"
    />
  </div>
</template>
