<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { useI18n } from 'vue-i18n'

const playerStore = usePlayerStore()
const { t } = useI18n()
const menuOpen = ref(false)
const languageNames = {
  en: 'English',
  'zh-CN': '简体中文',
  ja: '日本語',
  es: 'Español',
  de: 'Deutsch',
  fr: 'Français',
} as const
const currentLanguage = computed(() => languageNames[playerStore.profile?.language ?? 'en'])

const navigation = [
  { labelKey: 'app.home', to: '/' },
  { labelKey: 'app.game', to: '/quick-match' },
  { labelKey: 'app.codex', to: '/codex' },
  { labelKey: 'app.settings', to: '/settings' },
]
</script>

<template>
  <header data-testid="app-header" class="border-b border-gray-200 bg-white">
    <a href="#main-content" class="skip-link">{{ t('app.skipToContent') }}</a>
    <nav
      aria-label="Main navigation"
      class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8"
    >
      <RouterLink
        to="/"
        class="font-bold tracking-tight text-blue-900"
        :aria-label="`${t('app.title')} home`"
      >
        Azure AZ-900 Card Clash
      </RouterLink>
      <button
        type="button"
        class="rounded-md border border-gray-300 px-3 py-2 text-sm md:hidden"
        :aria-expanded="menuOpen"
        aria-controls="primary-navigation"
        @click="menuOpen = !menuOpen"
      >
        {{ menuOpen ? 'Close menu' : 'Open menu' }}
      </button>
      <div
        id="primary-navigation"
        class="w-full flex-col gap-2 md:flex md:w-auto md:flex-row md:items-center md:gap-5"
        :class="menuOpen ? 'flex' : 'hidden md:flex'"
      >
        <RouterLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          :data-testid="
            item.to === '/'
              ? 'nav-home'
              : item.to === '/codex'
                ? 'nav-codex'
                : item.to === '/settings'
                  ? 'nav-settings'
                  : undefined
          "
          role="link"
          :aria-label="t(item.labelKey)"
          class="rounded px-2 py-1 text-sm font-medium text-gray-700 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
          active-class="text-blue-700 underline underline-offset-4"
          @click="menuOpen = false"
        >
          {{ t(item.labelKey) }}
        </RouterLink>
        <span class="border-t border-gray-200 pt-2 text-sm text-gray-600 md:border-0 md:pt-0">
          {{ playerStore.profile?.displayName ?? 'Azure Learner' }} ·
          {{ playerStore.profile?.xp ?? 0 }} XP · {{ currentLanguage }}
        </span>
      </div>
    </nav>
  </header>
</template>
