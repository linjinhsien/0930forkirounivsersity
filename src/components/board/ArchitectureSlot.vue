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
  slotClicked: [slotId: string]
  replaceRequested: [slotId: string]
  removeRequested: [slotId: string]
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

function handleReplace(): void {
  emit('replaceRequested', props.architectureSlot.id)
}

function handleRemove(): void {
  emit('removeRequested', props.architectureSlot.id)
}

function handleKeyActivate(event: KeyboardEvent): void {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    emit('slotClicked', props.architectureSlot.id)
  }
}
</script>

<template>
  <div
    :class="slotClasses"
    :role="architectureSlot.card ? undefined : 'button'"
    :tabindex="architectureSlot.card ? undefined : 0"
    :aria-label="ariaLabel"
    @dragover.prevent
    @drop="handleDrop"
    @click="!architectureSlot.card && handleClick()"
    @keydown="!architectureSlot.card && handleKeyActivate($event)"
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
    <template v-else>
      <AzureCard
        :card="architectureSlot.card"
        :is-placed="true"
        :is-valid="isValid"
        :is-draggable="false"
      />
      <div class="mt-2 flex gap-2" @click.stop>
        <button
          type="button"
          class="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          :aria-label="\`Replace \${architectureSlot.card.name}\`"
          @click="handleReplace"
        >
          更換卡片
        </button>
        <button
          type="button"
          class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
          :aria-label="\`Return \${architectureSlot.card.name} to hand\`"
          @click="handleRemove"
        >
          移回手牌
        </button>
      </div>
    </template>
  </div>
</template>
