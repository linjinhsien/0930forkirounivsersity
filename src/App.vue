<script setup lang="ts">
import { computed, ref } from 'vue'

type View = 'home' | 'codex' | 'settings'

const getInitialView = (): View => {
  const path = window.location.pathname
  if (path === '/codex') return 'codex'
  if (path === '/settings') return 'settings'
  return 'home'
}

const currentView = ref<View>(getInitialView())

const getInitialLanguage = (): string => {
  try {
    return localStorage.getItem('az900-language') || 'en'
  } catch {
    return 'en'
  }
}

const language = ref(getInitialLanguage())

const currentLanguage = computed(() => (language.value === 'es' ? 'Español' : 'English'))

const navigate = (view: View) => {
  currentView.value = view
  const path = view === 'home' ? '/' : `/${view}`
  window.history.pushState({ view }, '', path)
}

const setLanguage = (value: string) => {
  language.value = value
  try {
    localStorage.setItem('az900-language', value)
  } catch {
    // Ignore storage errors in restricted browser contexts.
  }
}
</script>

<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <header data-testid="app-header" class="border-b bg-white">
      <nav
        aria-label="Main navigation"
        class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"
      >
        <a
          href="/"
          data-testid="nav-home"
          role="link"
          aria-label="Home"
          class="font-bold"
          @click.prevent="navigate('home')"
        >
          Azure AZ-900 Card Clash
        </a>

        <div class="flex gap-4">
          <a
            href="/"
            data-testid="nav-home"
            role="link"
            aria-label="Home"
            @click.prevent="navigate('home')"
          >
            Home
          </a>
          <a
            href="/codex"
            data-testid="nav-codex"
            role="link"
            aria-label="Codex"
            @click.prevent="navigate('codex')"
          >
            Codex
          </a>
          <a
            href="/settings"
            data-testid="nav-settings"
            role="link"
            aria-label="Settings"
            @click.prevent="navigate('settings')"
          >
            Settings
          </a>
        </div>
      </nav>
    </header>

    <main id="main-content" data-testid="main-content" class="mx-auto max-w-6xl px-6 py-8">
      <section v-if="currentView === 'home'" data-testid="home-view">
        <h1 class="mb-4 text-3xl font-bold">Azure AZ-900 Card Clash</h1>
        <p class="text-gray-600">Learn Azure architecture through scenario-driven card gameplay.</p>
      </section>

      <section v-else-if="currentView === 'codex'" data-testid="codex-browser">
        <h1 class="mb-4 text-3xl font-bold">Azure Codex</h1>
        <p class="text-gray-600">Browse Azure services and architecture concepts.</p>
      </section>

      <section v-else data-testid="settings-view">
        <h1 class="mb-4 text-3xl font-bold">Settings</h1>
        <label class="flex max-w-xs flex-col gap-2">
          <span>Language</span>
          <select
            :value="language"
            data-testid="language-select"
            aria-label="Language"
            @change="setLanguage(($event.target as HTMLSelectElement).value)"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </label>
        <p data-testid="current-language" class="mt-4">{{ currentLanguage }}</p>
      </section>
    </main>
  </div>
</template>
