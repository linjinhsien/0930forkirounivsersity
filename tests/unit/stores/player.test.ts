import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePlayerStore } from '@/stores/player'

describe('player store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('initializes a default profile with a generated id', () => {
    const store = usePlayerStore()

    const profile = store.initializeProfile()

    expect(profile.id).toBeTruthy()
    expect(profile.displayName).toBe('Azure Learner')
    expect(store.currentDifficulty).toBe('beginner')
    expect(store.totalMatches).toBe(0)
    expect(store.winRate).toBe(0)
  })

  it('restores a stored profile and merges overrides', () => {
    localStorage.setItem(
      'az900-player-profile',
      JSON.stringify({
        id: 'stored-player',
        displayName: 'Stored',
        xp: 40,
        difficultyTier: 'intermediate',
        stats: {
          matchesPlayed: 4,
          matchesWon: 3,
          consecutiveWins: 2,
          consecutiveLosses: 0,
        },
        studyDeck: ['card-1'],
        language: 'zh-CN',
        accessibility: { highContrast: true, keyboardOnly: false, reducedMotion: true },
      }),
    )

    const store = usePlayerStore()
    store.initializeProfile({ displayName: 'Override' })

    expect(store.profile?.id).toBe('stored-player')
    expect(store.profile?.displayName).toBe('Override')
    expect(store.totalMatches).toBe(4)
    expect(store.winRate).toBe(0.75)
  })

  it('records wins and resets the loss streak', () => {
    const store = usePlayerStore()
    store.initializeProfile()

    store.recordMatchResult(true)
    store.recordMatchResult(true)
    store.recordMatchResult(true)

    expect(store.profile?.stats.matchesPlayed).toBe(3)
    expect(store.profile?.stats.matchesWon).toBe(3)
    expect(store.profile?.stats.consecutiveWins).toBe(0)
    expect(store.profile?.difficultyTier).toBe('intermediate')
  })

  it('records losses and resets the win streak', () => {
    const store = usePlayerStore()
    store.initializeProfile()

    store.recordMatchResult(true)
    store.recordMatchResult(false)

    expect(store.profile?.stats.consecutiveWins).toBe(0)
    expect(store.profile?.stats.consecutiveLosses).toBe(1)
  })

  it('adds a study card only once', () => {
    const store = usePlayerStore()
    store.initializeProfile()

    store.addStudyCard('card-1')
    store.addStudyCard('card-1')

    expect(store.profile?.studyDeck).toEqual(['card-1'])
  })

  it('persists accessibility and language preferences', () => {
    const store = usePlayerStore()
    store.initializeProfile()

    store.updateAccessibilityPreference('highContrast', true)
    store.setLanguage('zh-CN')

    const persisted = JSON.parse(localStorage.getItem('az900-player-profile') ?? '{}')
    expect(persisted.accessibility.highContrast).toBe(true)
    expect(persisted.language).toBe('zh-CN')
  })
})
