import type { SavedSession } from '@/types/game'

export const SESSION_STORAGE_KEY = 'az900-saved-session'

export class StorageAdapterError extends Error {
  readonly code: 'quota-exceeded' | 'unavailable' | 'invalid-data' | 'unknown'

  constructor(message: string, code: StorageAdapterError['code'] = 'unknown') {
    super(message)
    this.name = 'StorageAdapterError'
    this.code = code
  }
}

function getStorage(): Storage | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage
}

function isQuotaError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  )
}

function isSavedSession(value: unknown): value is SavedSession {
  if (!value || typeof value !== 'object') return false
  const session = value as Partial<SavedSession>
  return (
    typeof session.id === 'string' &&
    typeof session.timestamp === 'number' &&
    typeof session.expiresAt === 'number' &&
    typeof session.playerId === 'string' &&
    Boolean(session.gameState && typeof session.gameState === 'object')
  )
}

export function saveToLocalStorage<T>(
  key: string,
  value: T,
  validate: (value: unknown) => boolean = () => true
): void {
  if (!validate(value)) {
    throw new StorageAdapterError('Storage value failed validation.', 'invalid-data')
  }

  const storage = getStorage()
  if (!storage) throw new StorageAdapterError('LocalStorage is unavailable.', 'unavailable')

  try {
    storage.setItem(key, JSON.stringify(value))
  } catch (error) {
    if (isQuotaError(error)) {
      throw new StorageAdapterError('LocalStorage quota exceeded.', 'quota-exceeded')
    }
    throw new StorageAdapterError('Unable to save data to LocalStorage.', 'unknown')
  }
}

export function loadFromLocalStorage<T>(
  key: string,
  validate: (value: unknown) => value is T
): T | null {
  const storage = getStorage()
  if (!storage) return null

  const raw = storage.getItem(key)
  if (raw === null) return null

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!validate(parsed)) {
      storage.removeItem(key)
      throw new StorageAdapterError('Stored data failed validation.', 'invalid-data')
    }
    return parsed
  } catch (error) {
    if (error instanceof StorageAdapterError) throw error
    storage.removeItem(key)
    throw new StorageAdapterError('Stored data is not valid JSON.', 'invalid-data')
  }
}

export function clearFromLocalStorage(key: string): void {
  const storage = getStorage()
  if (!storage) return
  try {
    storage.removeItem(key)
  } catch {
    throw new StorageAdapterError('Unable to clear LocalStorage.', 'unknown')
  }
}

export const isValidSavedSession = isSavedSession
