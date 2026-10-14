<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { useI18n } from 'vue-i18n'

const playerStore = usePlayerStore()
const { t } = useI18n()
const profile = computed(() => playerStore.profile)
</script>

<template>
  <section data-testid="home-view" class="mx-auto max-w-5xl">
    <div
      class="rounded-3xl bg-gradient-to-br from-blue-950 via-blue-800 to-sky-600 px-6 py-12 text-white shadow-lg sm:px-10 sm:py-16"
    >
      <p class="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-sky-200">
        {{ t('home.eyebrow') }}
      </p>
      <h1 class="max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">
        {{ t('app.title') }}
      </h1>
      <p class="mt-5 max-w-2xl text-base text-blue-100 sm:text-lg">
        {{ t('home.subtitle') }}
      </p>
      <p v-if="profile" class="mt-5 text-sm text-blue-100">
        {{ t('home.welcome', { name: profile.displayName }) }}
        <span aria-hidden="true"> · </span>{{ t('home.xp', { xp: profile.xp }) }}
      </p>
      <div class="mt-8 flex flex-wrap gap-3">
        <RouterLink
          to="/quick-match"
          data-testid="quick-match-cta"
          class="rounded-lg bg-white px-5 py-3 font-semibold text-blue-900 shadow hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {{ t('home.quickMatch') }}
        </RouterLink>
        <RouterLink
          to="/multiplayer"
          data-testid="multiplayer-cta"
          class="rounded-lg border border-white/70 px-5 py-3 font-semibold text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {{ t('home.multiplayer') }}
        </RouterLink>
      </div>
      <a
        href="#how-to-play"
        class="mt-4 inline-block text-sm font-semibold text-blue-100 underline underline-offset-4"
      >
        {{ t('home.firstTime') }}
      </a>
    </div>

    <div class="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      <RouterLink
        to="/codex"
        class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-blue-400"
      >
        <h2 class="font-bold text-gray-900">{{ t('home.exploreCodex') }}</h2>
        <p class="mt-2 text-sm text-gray-600">{{ t('home.exploreCodexDesc') }}</p>
      </RouterLink>
      <RouterLink
        to="/topology"
        data-testid="home-topology-map"
        class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-blue-400"
      >
        <h2 class="font-bold text-gray-900">{{ t('app.topology') }}</h2>
        <p class="mt-2 text-sm text-gray-600">{{ t('home.topologyDesc') }}</p>
      </RouterLink>
      <RouterLink
        to="/settings"
        class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-blue-400"
      >
        <h2 class="font-bold text-gray-900">{{ t('home.personalize') }}</h2>
        <p class="mt-2 text-sm text-gray-600">
          {{ t('home.personalizeDesc') }}
        </p>
      </RouterLink>
      <section
        class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        aria-labelledby="how-to-play"
      >
        <h2 id="how-to-play" class="font-bold text-gray-900">{{ t('home.howToPlay') }}</h2>
        <p class="mt-2 text-sm text-gray-600">
          {{ t('home.howToPlayDesc') }}
        </p>
      </section>
    </div>
  </section>
</template>
