<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { usePlayerStore } from '@/stores/player'
import { isSupportedLocale, setLocale } from '@/i18n'

const playerStore = usePlayerStore()

watch(
  () => playerStore.profile?.accessibility,
  (preferences) => {
    if (!preferences) return
    document.documentElement.classList.toggle('high-contrast', preferences.highContrast)
    document.documentElement.classList.toggle('keyboard-only', preferences.keyboardOnly)
    document.documentElement.classList.toggle('reduced-motion', preferences.reducedMotion)
  },
  { deep: true, immediate: true }
)

watch(
  () => playerStore.profile?.language,
  async (language) => {
    if (language && isSupportedLocale(language)) await setLocale(language)
  },
  { immediate: true }
)

onMounted(() => {
  if (!playerStore.profile) playerStore.initializeProfile()
})
</script>

<template>
  <div id="app" class="flex min-h-screen flex-col bg-gray-50 text-gray-900">
    <AppHeader />
    <main
      id="main-content"
      data-testid="main-content"
      class="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8"
    >
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>
