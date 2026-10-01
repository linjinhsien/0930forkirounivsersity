/**
 * Evaluator Engine — Azure AZ-900 Card Clash Engine
 *
 * Compares two player solutions and determines the clash winner,
 * then calculates XP awards based on score and difficulty.
 */

import type { AzureCard, Scenario, ArchitectureScore } from '@/types/game'
import type { IEvaluatorEngine, ClashResult } from '@/types/engine'
import { ScoringEngine } from '@/engine/scoring'

/** Difficulty multipliers for XP calculation. */
const DIFFICULTY_MULTIPLIERS: Record<Scenario['difficulty'], number> = {
  beginner: 1.0,
  intermediate: 1.5,
  advanced: 2.0,
}

/** Minimum XP always awarded regardless of performance. */
const MIN_XP = 10

export class EvaluatorEngine implements IEvaluatorEngine {
  // ─── Clash Evaluation ────────────────────────────────────────────────────────

  evaluateClash(
    player1Solution: AzureCard[],
    player2Solution: AzureCard[],
    scenario: Scenario
  ): ClashResult {
    const scorer = new ScoringEngine()

    const player1Score: ArchitectureScore = scorer.calculateScore(player1Solution, scenario)
    const player2Score: ArchitectureScore = scorer.calculateScore(player2Solution, scenario)

    let winner: ClashResult['winner']
    if (player1Score.total > player2Score.total) {
      winner = 'player1'
    } else if (player2Score.total > player1Score.total) {
      winner = 'player2'
    } else {
      winner = 'tie'
    }

    const marginOfVictory = Math.abs(player1Score.total - player2Score.total)

    return {
      player1Score,
      player2Score,
      winner,
      marginOfVictory,
    }
  }

  // ─── XP Award Calculation ────────────────────────────────────────────────────

  calculateXPAward(
    score: ArchitectureScore,
    isWinner: boolean,
    difficulty: Scenario['difficulty']
  ): number {
    const multiplier = DIFFICULTY_MULTIPLIERS[difficulty]

    let xp: number
    if (isWinner) {
      // Winner receives full score contribution
      xp = Math.round((50 + score.total) * multiplier)
    } else {
      // Loser receives half score contribution
      xp = Math.round((50 + score.total * 0.5) * multiplier)
    }

    return Math.max(MIN_XP, xp)
  }
}
