<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { useSessionStore } from '@/stores/session'
import type { PlayerProfile } from '@/types/game'

const playerStore = usePlayerStore()
const sessionStore = useSessionStore()
const profile = computed(() => playerStore.profile)
const playerName = ref('')
const clearConfirmationOpen = ref(false)
const statusMessage = ref('')
const languageOptions: Array<{ value: PlayerProfile['language']; label: string }> = [
  { value: 'en', label: 'English' },
  { value: 'zh-CN', label: '简体中文' },
  { value: 'ja', label: '日本語' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
]
const languageName = computed(
  () =>
    languageOptions.find((option) => option.value === profile.value?.language)?.label ?? 'English'
)

onMounted(() => {
  if (!playerStore.profile) playerStore.initializeProfile()
  playerName.value = playerStore.profile?.displayName ?? ''
  sessionStore.loadSession()
})

watch(
  () => profile.value?.accessibility,
  (preferences) => {
    if (!preferences) return
    document.documentElement.classList.toggle('high-contrast', preferences.highContrast)
    document.documentElement.classList.toggle('keyboard-only', preferences.keyboardOnly)
    document.documentElement.classList.toggle('reduced-motion', preferences.reducedMotion)
  },
  { deep: true, immediate: true }
)

function setLanguage(value: string): void {
  const language = languageOptions.find((option) => option.value === value)?.value
  if (!language) return
  playerStore.setLanguage(language)
  try {
    localStorage.setItem('az900-language', language)
  } catch (error) {
    statusMessage.value =
      error instanceof Error ? error.message : 'Could not save the language preference.'
    return
  }
  statusMessage.value = `Language preference saved: ${languageName.value}.`
}

function savePlayerName(): void {
  const name = playerName.value.trim()
  if (!name || !playerStore.profile) {
    statusMessage.value = 'Enter a player name before saving.'
    return
  }
  playerStore.setDisplayName(name)
  statusMessage.value = 'Player name saved.'
}

function setAccessibility(preference: keyof PlayerProfile['accessibility'], event: Event): void {
  playerStore.updateAccessibilityPreference(preference, (event.target as HTMLInputElement).checked)
}

function clearGameData(): void {
  try {
    localStorage.clear()
  } catch (error) {
    statusMessage.value =
      error instanceof Error ? error.message : 'Could not clear browser storage.'
    return
  }
  sessionStore.clearSession()
  playerStore.initializeProfile()
  playerName.value = playerStore.profile?.displayName ?? ''
  clearConfirmationOpen.value = false
  statusMessage.value = 'Saved game data and preferences have been cleared.'
}
</script>

<template>
  <section data-testid="settings-view" aria-labelledby="settings-title" class="mx-auto max-w-3xl">
    <div class="mb-6">
      <p class="text-sm font-semibold uppercase tracking-wide text-blue-700">Preferences</p>
      <h1 id="settings-title" class="mt-1 text-3xl font-bold">Settings</h1>
      <p class="mt-2 text-gray-600">Make the game comfortable and accessible for you.</p>
    </div>

    <p
      v-if="statusMessage"
      role="status"
      class="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-900"
    >
      {{ statusMessage }}
    </p>

    <div class="space-y-5">
      <section class="rounded-xl border bg-white p-5">
        <h2 class="font-bold">Player profile</h2>
        <form class="mt-3 flex flex-wrap items-end gap-3" @submit.prevent="savePlayerName">
          <label class="flex min-w-48 flex-1 flex-col gap-1 text-sm font-medium">
            Player name
            <input
              v-model="playerName"
              maxlength="32"
              autocomplete="nickname"
              class="rounded-lg border px-3 py-2"
            />
          </label>
          <button
            type="submit"
            class="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800"
          >
            Save name
          </button>
        </form>
        <p class="mt-3 text-sm text-gray-600">
          Difficulty: {{ profile?.difficultyTier ?? 'beginner' }}
        </p>
      </section>

      <section class="rounded-xl border bg-white p-5">
        <h2 class="font-bold">Language</h2>
        <label class="mt-3 flex max-w-sm flex-col gap-1 text-sm font-medium">
          Interface language
          <select
            :value="profile?.language ?? 'en'"
            data-testid="language-select"
            aria-label="Language"
            class="rounded-lg border px-3 py-2"
            @change="setLanguage(($event.target as HTMLSelectElement).value)"
          >
            <option v-for="option in languageOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>
        <p data-testid="current-language" class="mt-2 text-sm text-gray-600">{{ languageName }}</p>
      </section>

      <section class="rounded-xl border bg-white p-5">
        <h2 class="font-bold">Accessibility</h2>
        <div class="mt-3 space-y-3">
          <label class="flex items-start gap-3">
            <input
              class="mt-1"
              type="checkbox"
              :checked="profile?.accessibility.highContrast ?? false"
              @change="setAccessibility('highContrast', $event)"
            />
            <span
              ><strong>High contrast mode</strong
              ><span class="block text-sm text-gray-600"
                >Increase visual contrast across the game.</span
              ></span
            >
          </label>
          <label class="flex items-start gap-3">
            <input
              class="mt-1"
              type="checkbox"
              :checked="profile?.accessibility.keyboardOnly ?? false"
              @change="setAccessibility('keyboardOnly', $event)"
            />
            <span
              ><strong>Keyboard-only mode</strong
              ><span class="block text-sm text-gray-600"
                >Emphasize keyboard focus indicators.</span
              ></span
            >
          </label>
          <label class="flex items-start gap-3">
            <input
              class="mt-1"
              type="checkbox"
              :checked="profile?.accessibility.reducedMotion ?? false"
              @change="setAccessibility('reducedMotion', $event)"
            />
            <span
              ><strong>Reduced motion</strong
              ><span class="block text-sm text-gray-600"
                >Reduce non-essential animation.</span
              ></span
            >
          </label>
        </div>
      </section>

      <section
        class="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-5"
      >
        <div>
          <h2 class="font-bold">Saved game</h2>
          <p class="mt-1 text-sm text-gray-600">
            {{
              sessionStore.hasValidSession
                ? 'A saved match is available.'
                : 'No saved match is available.'
            }}
          </p>
        </div>
        <RouterLink
          v-if="sessionStore.hasValidSession"
          to="/quick-match?resume=1"
          class="rounded-lg border px-4 py-2 font-semibold hover:bg-gray-50"
        >
          Resume Game
        </RouterLink>
      </section>

      <section class="rounded-xl border border-red-200 bg-white p-5">
        <h2 class="font-bold text-red-800">Clear game data</h2>
        <p class="mt-1 text-sm text-gray-600">
          Remove saved matches, player progress, and preferences from this browser.
        </p>
        <button
          type="button"
          class="mt-3 rounded-lg border border-red-300 px-4 py-2 font-semibold text-red-800 hover:bg-red-50"
          @click="clearConfirmationOpen = true"
        >
          Clear Data
        </button>
      </section>
    </div>

    <RouterLink to="/" class="mt-6 inline-block font-semibold text-blue-700 hover:underline">
      Back to Home
    </RouterLink>

    <div
      v-if="clearConfirmationOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      @click.self="clearConfirmationOpen = false"
      @keydown.esc="clearConfirmationOpen = false"
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="clear-title"
        class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 id="clear-title" class="text-lg font-bold">Clear all game data?</h2>
        <p class="mt-2 text-sm text-gray-600">
          This removes your saved match, XP, and preferences from this browser. This cannot be
          undone.
        </p>
        <div class="mt-5 flex justify-end gap-3">
          <button
            type="button"
            class="rounded-lg border px-4 py-2 font-semibold"
            @click="clearConfirmationOpen = false"
          >
            Cancel
          </button>
          <button
            type="button"
            class="rounded-lg bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-800"
            @click="clearGameData"
          >
            Clear Data
          </button>
        </div>
      </section>
    </div>
  </section>
</template>
