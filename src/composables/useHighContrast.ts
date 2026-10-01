import { onBeforeUnmount, onMounted, ref } from 'vue'

const STORAGE_KEY = 'az900-high-contrast'

function getSystemPreference(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-contrast: more)').matches
}

function readStoredPreference(): boolean | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === null ? null : value === 'true'
  } catch {
    return null
  }
}

export function useHighContrast() {
  const enabled = ref(readStoredPreference() ?? getSystemPreference())

  function apply(value: boolean): void {
    enabled.value = value
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('high-contrast', value)
    }
    try {
      localStorage.setItem(STORAGE_KEY, String(value))
    } catch {
      // Keep the preference in memory when storage is unavailable.
    }
  }

  function toggle(): void {
    apply(!enabled.value)
  }

  function handleSystemChange(event: MediaQueryListEvent): void {
    if (readStoredPreference() === null) apply(event.matches)
  }

  onMounted(() => {
    apply(enabled.value)
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const mediaQuery = window.matchMedia('(prefers-contrast: more)')
      mediaQuery.addEventListener?.('change', handleSystemChange)
    }
  })

  onBeforeUnmount(() => {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const mediaQuery = window.matchMedia('(prefers-contrast: more)')
      mediaQuery.removeEventListener?.('change', handleSystemChange)
    }
  })

  return { enabled, apply, toggle }
}
