/**
 * useErrorHandler Composable — Azure AZ-900 Card Clash Engine
 *
 * Provides reactive error state management with persistent localStorage logging
 * for validation, session, and general errors.
 */

import { ref } from 'vue'

const MAX_LOG_ENTRIES = 50
const STORAGE_KEY = 'az900-error-log'

export interface ErrorLogEntry {
  id: string
  type: 'validation' | 'session' | 'general'
  message: string
  stack?: string
  timestamp: number
}

export function useErrorHandler() {
  const lastError = ref<ErrorLogEntry | null>(null)
  const hasError = ref(false)

  // ─── Storage ────────────────────────────────────────────────────────────────

  function logToStorage(entry: ErrorLogEntry): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const log: ErrorLogEntry[] = raw ? (JSON.parse(raw) as ErrorLogEntry[]) : []
      log.unshift(entry)
      if (log.length > MAX_LOG_ENTRIES) log.length = MAX_LOG_ENTRIES
      localStorage.setItem(STORAGE_KEY, JSON.stringify(log))
    } catch {
      // Ignore storage errors (e.g. private browsing quota exceeded)
    }
  }

  // ─── Entry Factory ───────────────────────────────────────────────────────────

  function createEntry(type: ErrorLogEntry['type'], error: unknown): ErrorLogEntry {
    const message = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : undefined

    return {
      id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      message,
      stack,
      timestamp: Date.now(),
    }
  }

  // ─── Public Handlers ─────────────────────────────────────────────────────────

  function handleError(error: unknown, userMessage?: string): void {
    const entry = createEntry('general', error)
    lastError.value = entry
    hasError.value = true
    logToStorage(entry)
    console.error('[ErrorHandler]', userMessage ?? entry.message, error)
  }

  function handleValidationError(error: unknown): void {
    const entry = createEntry('validation', error)
    lastError.value = entry
    hasError.value = true
    logToStorage(entry)
    console.error('[ValidationError]', entry.message, error)
  }

  function handleSessionError(error: unknown): void {
    const entry = createEntry('session', error)
    lastError.value = entry
    hasError.value = true
    logToStorage(entry)
    console.error('[SessionError]', entry.message, error)
  }

  // ─── State Management ────────────────────────────────────────────────────────

  function clearError(): void {
    lastError.value = null
    hasError.value = false
  }

  function getErrorLog(): ErrorLogEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as ErrorLogEntry[]) : []
    } catch {
      return []
    }
  }

  return {
    lastError,
    hasError,
    handleError,
    handleValidationError,
    handleSessionError,
    clearError,
    getErrorLog,
  }
}
