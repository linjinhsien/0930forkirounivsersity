export type TrackedErrorType = 'validation' | 'storage' | 'network' | 'runtime' | 'unknown'

export interface TrackedError {
  id: string
  type: TrackedErrorType
  message: string
  timestamp: number
  stack?: string
  metadata?: Record<string, unknown>
}

const ERROR_STORAGE_KEY = 'az900-error-log'
const MAX_ERRORS = 50

function createErrorId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `error-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function readErrors(): TrackedError[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(ERROR_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as TrackedError[]) : []
  } catch {
    return []
  }
}

function persistErrors(errors: TrackedError[]): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(ERROR_STORAGE_KEY, JSON.stringify(errors.slice(-MAX_ERRORS)))
  } catch {
    // Error tracking must never cause a secondary application failure.
  }
}

/** Convert an unknown thrown value into a user-safe Error instance. */
export function normalizeError(error: unknown): Error {
  if (error instanceof Error) return error
  if (typeof error === 'string') return new Error(error)
  return new Error('An unexpected error occurred.')
}

/** Record an application error, retaining at most the last 50 entries. */
export function trackError(
  error: unknown,
  type: TrackedErrorType = 'unknown',
  metadata?: Record<string, unknown>
): TrackedError {
  const normalized = normalizeError(error)
  const entry: TrackedError = {
    id: createErrorId(),
    type,
    message: normalized.message,
    timestamp: Date.now(),
    ...(import.meta.env.DEV && normalized.stack ? { stack: normalized.stack } : {}),
    metadata,
  }

  persistErrors([...readErrors(), entry])
  return entry
}

/** Return the persisted error log. */
export function getTrackedErrors(): TrackedError[] {
  return readErrors()
}

/** Remove all persisted errors. */
export function clearTrackedErrors(): void {
  if (typeof localStorage !== 'undefined') localStorage.removeItem(ERROR_STORAGE_KEY)
}

/** Install global error and unhandled-rejection listeners. */
export function installErrorTracking(): () => void {
  if (typeof window === 'undefined') return () => undefined

  const onError = (event: ErrorEvent) => {
    trackError(event.error ?? event.message, 'runtime', { filename: event.filename })
  }
  const onRejection = (event: PromiseRejectionEvent) => {
    trackError(event.reason, 'runtime')
  }

  window.addEventListener('error', onError)
  window.addEventListener('unhandledrejection', onRejection)

  return () => {
    window.removeEventListener('error', onError)
    window.removeEventListener('unhandledrejection', onRejection)
  }
}

export const ERROR_STORAGE_KEY_NAME = ERROR_STORAGE_KEY
