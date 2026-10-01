/**
 * Player Store (Pinia) — Task 14
 *
 * Manages player profile, XP, difficulty tier, match statistics,
 * accessibility preferences, and language selection.
 *
 * Difficulty tier auto-adjusts after 3 consecutive wins (promote) or
 * 3 consecutive losses (demote) as specified in requirements.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PlayerProfile } from '@/types/game'

// ─── Store ───────────────────────────────────────────────────────────────────

export const usePlayerStore = defineStore('player', () => {
  // ── State ────────────────────────────────────────────────────────────────
  const profile = ref<PlayerProfile | null>(null)

  // ── Computed ─────────────────────────────────────────────────────────────

  /** Active difficulty tier, defaults to 'beginner' before init */
  const currentDifficulty = computed<PlayerProfile['difficultyTier']>(
    () => profile.value?.difficultyTier ?? 'beginner'
  )

  /** Total matches played */
  const totalMatches = computed<number>(() => profile.value?.stats.matchesPlayed ?? 0)

  /** Win rate as a percentage (0–100) */
  const winRate = computed<number>(() => {
    if (!profile.value || profile.value.stats.matchesPlayed === 0) return 0
    return Math.round((profile.value.stats.matchesWon / profile.value.stats.matchesPlayed) * 100)
  })

  /** Number of cards in the study deck */
  const studyDeckSize = computed<number>(() => profile.value?.studyDeck.length ?? 0)

  // ── Actions ──────────────────────────────────────────────────────────────

  /**
   * Create (or reset) a player profile with default values.
   * @param id        Unique player identifier
   * @param displayName Human-readable name shown in UI
   */
  function initializeProfile(id: string, displayName: string): void {
    profile.value = {
      id,
      displayName,
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
      accessibility: {
        highContrast: false,
        keyboardOnly: false,
        reducedMotion: false,
      },
    }
  }

  /**
   * Record the outcome of a completed match.
   * Updates stats, awards XP, adds cards to the study deck, and
   * triggers an automatic difficulty check.
   *
   * @param won       Whether the player won the match
   * @param xpAwarded XP points earned this match
   * @param cardsUsed Card IDs played during the match (added to study deck)
   */
  function recordMatchResult(won: boolean, xpAwarded: number, cardsUsed: string[]): void {
    if (!profile.value) return

    profile.value.stats.matchesPlayed++
    profile.value.xp += xpAwarded

    if (won) {
      profile.value.stats.matchesWon++
      profile.value.stats.consecutiveWins++
      profile.value.stats.consecutiveLosses = 0
    } else {
      profile.value.stats.consecutiveLosses++
      profile.value.stats.consecutiveWins = 0
    }

    // Merge new cards into study deck (no duplicates)
    cardsUsed.forEach((cardId) => {
      if (!profile.value!.studyDeck.includes(cardId)) {
        profile.value!.studyDeck.push(cardId)
      }
    })

    adjustDifficulty()
  }

  /**
   * Check consecutive win/loss streaks and promote or demote the
   * difficulty tier accordingly (requirement: 3 consecutive = tier change).
   * Can also be called manually to force a re-evaluation.
   */
  function adjustDifficulty(): void {
    if (!profile.value) return

    const { consecutiveWins, consecutiveLosses } = profile.value.stats

    // Promote after 3 consecutive wins
    if (consecutiveWins >= 3) {
      if (profile.value.difficultyTier === 'beginner') {
        profile.value.difficultyTier = 'intermediate'
      } else if (profile.value.difficultyTier === 'intermediate') {
        profile.value.difficultyTier = 'advanced'
      }
      profile.value.stats.consecutiveWins = 0
    }

    // Demote after 3 consecutive losses
    if (consecutiveLosses >= 3) {
      if (profile.value.difficultyTier === 'advanced') {
        profile.value.difficultyTier = 'intermediate'
      } else if (profile.value.difficultyTier === 'intermediate') {
        profile.value.difficultyTier = 'beginner'
      }
      profile.value.stats.consecutiveLosses = 0
    }
  }

  /**
   * Toggle an accessibility preference.
   * @param key   One of 'highContrast' | 'keyboardOnly' | 'reducedMotion'
   * @param value New boolean value
   */
  function updateAccessibilityPreference(
    key: keyof PlayerProfile['accessibility'],
    value: boolean
  ): void {
    if (!profile.value) return
    profile.value.accessibility[key] = value
  }

  /**
   * Change the player's preferred UI language.
   * @param lang Language code from the allowed set
   */
  function setLanguage(lang: PlayerProfile['language']): void {
    if (!profile.value) return
    profile.value.language = lang
  }

  /**
   * Add a card to the study deck (idempotent).
   * @param cardId Card ID to add
   */
  function addToStudyDeck(cardId: string): void {
    if (!profile.value) return
    if (!profile.value.studyDeck.includes(cardId)) {
      profile.value.studyDeck.push(cardId)
    }
  }

  /**
   * Remove a card from the study deck.
   * @param cardId Card ID to remove
   */
  function removeFromStudyDeck(cardId: string): void {
    if (!profile.value) return
    const idx = profile.value.studyDeck.indexOf(cardId)
    if (idx !== -1) profile.value.studyDeck.splice(idx, 1)
  }

  /**
   * Clear profile (e.g. on logout).
   */
  function clearProfile(): void {
    profile.value = null
  }

  return {
    // State
    profile,
    // Computed
    currentDifficulty,
    totalMatches,
    winRate,
    studyDeckSize,
    // Actions
    initializeProfile,
    recordMatchResult,
    adjustDifficulty,
    updateAccessibilityPreference,
    setLanguage,
    addToStudyDeck,
    removeFromStudyDeck,
    clearProfile,
  }
})
