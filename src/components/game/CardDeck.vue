<script setup lang="ts">
import type { AzureCard } from '@/types/game'
import AzureCardComponent from '@/components/cards/AzureCard.vue'

defineProps<{
  cards: AzureCard[]
  selectedCardId?: string
}>()

const emit = defineEmits<{
  cardSelected: [card: AzureCard]
  cardDragStart: [card: AzureCard]
}>()
</script>

<template>
  <div class="flex flex-col">
    <!-- Card count -->
    <div class="text-sm text-gray-500 mb-2">{{ cards.length }} cards in hand</div>

    <!-- Card list container -->
    <div
      role="list"
      aria-label="Cards in hand"
      tabindex="0"
      class="flex flex-wrap gap-3 p-3 min-h-40 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <!-- Empty state -->
      <div v-if="cards.length === 0" class="text-center text-gray-400 py-8 w-full">
        No cards available
      </div>

      <!-- Card items -->
      <div v-for="card in cards" :key="card.id" role="listitem">
        <AzureCardComponent
          :card="card"
          :is-selected="card.id === selectedCardId"
          @click="emit('cardSelected', card)"
          @drag-start="emit('cardDragStart', card)"
        />
      </div>
    </div>
  </div>
</template>
