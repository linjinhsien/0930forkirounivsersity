import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { PlayerProfile } from '@/types/game'

const STORAGE_KEY = 'az900-player-profile'
const LANGUAGE_KEY = 'az900-language'
const SUPPORTED_LANGUAGES: PlayerProfile['language'][] = ['en', 'zh-CN', 'ja', 'es', 'de', 'fr']

const DEFAULT_PROFILE: PlayerProfile = {
  id: '',
  displayName: 'Azure Learner',
  xp: 0,
  difficultyTier: 'beginner',
  stats: {
    matchesPlayed: 0,
    matchesWon: 0,
    consecutiveWins: 0,
    consecutiveLosses: 0,
  },
  studyDeck: [],
  language: 'en',
  accessibility: { highContrast: false, keyboardOnly: false, reducedMotion: false },
}

function cloneDefaultProfile(): PlayerProfile {
  return JSON.parse(JSON.stringify(DEFAULT_PROFILE)) as PlayerProfile
}

function createPlayerId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `player-${Date.now()}`
}

function isSupportedLanguage(value: string | null): value is PlayerProfile['language'] {
  return SUPPORTED_LANGUAGES.some((language) => language === value)
}

export const usePlayerStore = defineStore('player', () => {
  const profile = ref<PlayerProfile | null>(null)

  const currentDifficulty = computed(() => profile.value?.difficultyTier ?? 'beginner')
  const totalMatches = computed(() => profile.value?.stats.matchesPlayed ?? 0)
  const winRate = computed(() => {
    const stats = profile.value?.stats
    return stats && stats.matchesPlayed > 0 ? stats.matchesWon / stats.matchesPlayed : 0
  })

  function initializeProfile(savedProfile?: Partial<PlayerProfile>): PlayerProfile {
    let storedProfile: PlayerProfile | null = null
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        storedProfile = raw ? (JSON.parse(raw) as PlayerProfile) : null
      } catch {
        storedProfile = null
      }
    }

    const base = storedProfile ?? cloneDefaultProfile()
    let savedLanguage: string | null = null
    if (typeof localStorage !== 'undefined') {
      try {
        savedLanguage = localStorage.getItem(LANGUAGE_KEY)
      } catch {
        savedLanguage = null
      }
    }
    profile.value = {
      ...base,
      ...savedProfile,
      id: savedProfile?.id || base.id || createPlayerId(),
      stats: { ...base.stats, ...(savedProfile?.stats ?? {}) },
      accessibility: { ...base.accessibility, ...(savedProfile?.accessibility ?? {}) },
      language:
        savedProfile?.language ??
        (isSupportedLanguage(savedLanguage) ? savedLanguage : base.language),
    }
    persist()
    return profile.value
  }

  function recordMatchResult(won: boolean): void {
    if (!profile.value) initializeProfile()

    const stats = profile.value!.stats
    stats.matchesPlayed += 1
    if (won) {
      stats.matchesWon += 1
      stats.consecutiveWins += 1
      stats.consecutiveLosses = 0
    } else {
      stats.consecutiveLosses += 1
      stats.consecutiveWins = 0
    }
    adjustDifficulty()
    persist()
  }

  function adjustDifficulty(): PlayerProfile['difficultyTier'] {
    if (!profile.value) return 'beginner'

    const tiers: PlayerProfile['difficultyTier'][] = ['beginner', 'intermediate', 'advanced']
    const stats = profile.value.stats
    let index = tiers.indexOf(profile.value.difficultyTier)

    if (stats.consecutiveWins >= 3 && index < tiers.length - 1) {
      index += 1
      stats.consecutiveWins = 0
    } else if (stats.consecutiveLosses >= 3 && index > 0) {
      index -= 1
      stats.consecutiveLosses = 0
    }

    profile.value.difficultyTier = tiers[index]
    return profile.value.difficultyTier
  }

  function updateAccessibilityPreference(
    preference: keyof PlayerProfile['accessibility'],
    value: boolean
  ): void {
    if (!profile.value) initializeProfile()
    profile.value!.accessibility[preference] = value
    persist()
  }

  function setLanguage(language: PlayerProfile['language']): void {
    if (!profile.value) initializeProfile()
    profile.value!.language = language
    persist()
  }

  function addStudyCard(cardId: string): void {
    if (!profile.value) initializeProfile()
    if (!profile.value!.studyDeck.includes(cardId)) {
      profile.value!.studyDeck.push(cardId)
      persist()
    }
  }

  function setDisplayName(displayName: string): void {
    if (!profile.value) initializeProfile()
    profile.value!.displayName = displayName.trim().slice(0, 32)
    persist()
  }

  function awardExperience(amount: number): void {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new RangeError('Experience amount must be a non-negative finite number.')
    }
    if (!profile.value) initializeProfile()
    profile.value!.xp += Math.floor(amount)
    persist()
  }

  function persist(): void {
    if (profile.value && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile.value))
    }
  }

  return {
    profile,
    currentDifficulty,
    totalMatches,
    winRate,
    initializeProfile,
    recordMatchResult,
    adjustDifficulty,
    updateAccessibilityPreference,
    setLanguage,
    addStudyCard,
    setDisplayName,
    awardExperience,
  }
})
