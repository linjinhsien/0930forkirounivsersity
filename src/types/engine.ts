/**
 * Game Engine Contract Interfaces for Azure AZ-900 Card Clash Engine
 *
 * Defines standard contracts for validation, scoring, evaluation engines,
 * and performance measurement monitoring.
 */

import type {
  AzureCard,
  ArchitectureSlot,
  Scenario,
  ValidationResult,
  ArchitectureScore,
  ScoreBreakdown,
  ValidationViolation,
} from './game'

export type { ValidationViolation, ScoreBreakdown }

/**
 * Validation Engine Interface Contract
 */
export interface IValidationEngine {
  /**
   * Validates a card placement against scenario constraints
   * Target response time <500ms
   */
  validatePlacement(
    card: AzureCard,
    slot: ArchitectureSlot,
    currentSlots: ArchitectureSlot[],
    scenario: Scenario
  ): ValidationResult

  /**
   * Detects conflict cards between a proposed card and placed cards
   */
  detectConflicts(card: AzureCard, placedCards: AzureCard[]): AzureCard[]

  /**
   * Checks unmet prerequisites for a card
   */
  checkRequirements(card: AzureCard, placedCards: AzureCard[]): string[]

  /**
   * Provides suggestions to resolve violations
   */
  getSuggestions(
    card: AzureCard,
    scenario: Scenario,
    placedCards: AzureCard[],
    availableCards: AzureCard[]
  ): AzureCard[]
}

/**
 * Scoring Engine Interface Contract
 */
export interface IScoringEngine {
  /**
   * Calculates comprehensive architecture score across HA, cost, and security
   */
  calculateScore(placedCards: AzureCard[], scenario: Scenario): ArchitectureScore

  /**
   * Calculates high availability component score (0-100)
   */
  calculateHighAvailabilityScore(
    cards: AzureCard[],
    scenario: Scenario
  ): { score: number; details: string[] }

  /**
   * Calculates cost effectiveness component score (0-100)
   */
  calculateCostEffectivenessScore(
    cards: AzureCard[],
    scenario: Scenario
  ): { score: number; details: string[] }

  /**
   * Calculates security & compliance component score (0-100)
   */
  calculateSecurityComplianceScore(
    cards: AzureCard[],
    scenario: Scenario
  ): { score: number; details: string[] }
}

/**
 * Clash Evaluation Result
 */
export interface ClashResult {
  player1Score: ArchitectureScore
  player2Score: ArchitectureScore
  winner: 'player1' | 'player2' | 'tie'
  marginOfVictory: number
}

/**
 * Evaluator Engine Interface Contract for multiplayer clash
 */
export interface IEvaluatorEngine {
  /**
   * Compares two solutions and determines winner
   */
  evaluateClash(
    player1Solution: AzureCard[],
    player2Solution: AzureCard[],
    scenario: Scenario
  ): ClashResult

  /**
   * Calculates XP awarded based on match score and outcome
   */
  calculateXPAward(
    score: ArchitectureScore,
    isWinner: boolean,
    difficulty: Scenario['difficulty']
  ): number
}

/**
 * Performance Measurement Interface for monitoring validation and scoring
 */
export interface PerformanceMeasurement {
  /** Operation name (e.g. 'validatePlacement', 'calculateScore') */
  operation: string

  /** Execution duration in milliseconds */
  durationMs: number

  /** Timestamp of measurement */
  timestamp: number

  /** Whether execution stayed within performance budget (e.g. <500ms) */
  withinBudget: boolean

  /** Optional metadata */
  metadata?: Record<string, unknown>
}
