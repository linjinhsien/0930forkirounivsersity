import type { AzureCard, CodexEntry, GameState, PlayerProfile } from '@/types/game'

const DB_NAME = 'az900-card-clash'
export const DB_VERSION = 1

export type IndexedDbStore = 'gameState' | 'playerProfile' | 'codex'

interface StoredRecord<T> {
  id: string
  data: T
  updatedAt: number
}

function getIndexedDB(): IDBFactory {
  if (typeof indexedDB === 'undefined') {
    throw new Error('IndexedDB is unavailable in this environment.')
  }
  return indexedDB
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = getIndexedDB().open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      for (const store of ['gameState', 'playerProfile', 'codex'] as IndexedDbStore[]) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id' })
        }
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Unable to open IndexedDB.'))
  })
}

async function withStore<T>(
  storeName: IndexedDbStore,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest
): Promise<T> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode)
    const request = operation(transaction.objectStore(storeName))

    request.onsuccess = () => {
      db.close()
      resolve(request.result as T)
    }
    request.onerror = () => {
      db.close()
      reject(request.error ?? new Error('IndexedDB operation failed.'))
    }
    transaction.onabort = () => {
      db.close()
      reject(transaction.error ?? new Error('IndexedDB transaction aborted.'))
    }
  })
}

export function saveGameState(id: string, gameState: GameState): Promise<void> {
  return withStore<void>('gameState', 'readwrite', (store) => {
    return store.put({ id, data: gameState, updatedAt: Date.now() })
  })
}

export async function loadGameState(id: string): Promise<GameState | null> {
  const record = await withStore<StoredRecord<GameState> | undefined>(
    'gameState',
    'readonly',
    (store) => store.get(id)
  )
  return record?.data ?? null
}

export function savePlayerProfile(id: string, profile: PlayerProfile): Promise<void> {
  return withStore<void>('playerProfile', 'readwrite', (store) => {
    return store.put({ id, data: profile, updatedAt: Date.now() })
  })
}

export async function loadPlayerProfile(id: string): Promise<PlayerProfile | null> {
  const record = await withStore<StoredRecord<PlayerProfile> | undefined>(
    'playerProfile',
    'readonly',
    (store) => store.get(id)
  )
  return record?.data ?? null
}

export function saveCodexData(
  id: string,
  data: { cards: AzureCard[]; entries: CodexEntry[] }
): Promise<void> {
  return withStore<void>('codex', 'readwrite', (store) => {
    return store.put({ id, data, updatedAt: Date.now() })
  })
}

export async function loadCodexData(
  id: string
): Promise<{ cards: AzureCard[]; entries: CodexEntry[] } | null> {
  const record = await withStore<
    StoredRecord<{ cards: AzureCard[]; entries: CodexEntry[] }> | undefined
  >(
    'codex',
    'readonly',
    (store) => store.get(id)
  )
  return record?.data ?? null
}

export async function clearIndexedDbRecord(
  storeName: IndexedDbStore,
  id: string
): Promise<void> {
  await withStore<undefined>(storeName, 'readwrite', (store) => store.delete(id))
}
