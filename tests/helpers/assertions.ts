/**
 * Custom Test Assertions
 * 
 * Domain-specific assertion utilities for testing game logic,
 * card validation, scoring, and game state.
 */

import type {
  AzureCard,
  ValidationResult,
  ArchitectureScore,
  Scenario,
} from '@/types/game'

/**
 * Assert that a card has all required properties
 */
export function assertValidCard(card: any): asserts card is AzureCard {
  if (typeof card !== 'object' || card === null) {
    throw new Error('Card must be an object')
  }

  const requiredProps = [
    'id',
    'name',
    'domain',
    'cost',
    'synergyTags',
    'az900ExamTip',
    'description',
    'power',
  ]

  for (const prop of requiredProps) {
    if (!(prop in card)) {
      throw new Error(`Card missing required property: ${prop}`)
    }
  }

  if (
    !['cloud-concepts', 'azure-services', 'management-governance'].includes(
      card.domain
    )
  ) {
    throw new Error(`Invalid card domain: ${card.domain}`)
  }

  if (typeof card.cost !== 'number' || card.cost < 0) {
    throw new Error(`Card cost must be non-negative number`)
  }

  if (!Array.isArray(card.synergyTags)) {
    throw new Error('Card synergyTags must be an array')
  }
}

/**
 * Assert that a validation result is well-formed
 */
export function assertValidValidationResult(
  result: any
): asserts result is ValidationResult {
  if (typeof result !== 'object' || result === null) {
    throw new Error('ValidationResult must be an object')
  }

  if (typeof result.isValid !== 'boolean') {
    throw new Error('ValidationResult.isValid must be a boolean')
  }

  if (typeof result.timestamp !== 'number') {
    throw new Error('ValidationResult.timestamp must be a number')
  }

  if (!Array.isArray(result.violations)) {
    throw new Error('ValidationResult.violations must be an array')
  }

  // If invalid, must have at least one violation
  if (!result.isValid && result.violations.length === 0) {
    throw new Error('Invalid ValidationResult must have violations')
  }

  // If valid, must have no violations
  if (result.isValid && result.violations.length > 0) {
    throw new Error('Valid ValidationResult must have no violations')
  }
}

/**
 * Assert that a score is within valid bounds
 */
export function assertScoreInBounds(
  score: number,
  min: number = 0,
  max: number = 100,
  label: string = 'Score'
): void {
  if (typeof score !== 'number' || isNaN(score)) {
    throw new Error(`${label} must be a valid number`)
  }

  if (score < min || score > max) {
    throw new Error(
      `${label} must be within [${min}, ${max}], but got ${score}`
    )
  }
}

/**
 * Assert that an architecture score is valid
 */
export function assertValidArchitectureScore(
  score: any
): asserts score is ArchitectureScore {
  if (typeof score !== 'object' || score === null) {
    throw new Error('ArchitectureScore must be an object')
  }

  const requiredProps = [
    'highAvailability',
    'costEffectiveness',
    'securityCompliance',
    'total',
    'breakdown',
  ]

  for (const prop of requiredProps) {
    if (!(prop in score)) {
      throw new Error(`ArchitectureScore missing property: ${prop}`)
    }
  }

  // Check individual score bounds
  assertScoreInBounds(score.highAvailability, 0, 100, 'High Availability score')
  assertScoreInBounds(
    score.costEffectiveness,
    0,
    100,
    'Cost Effectiveness score'
  )
  assertScoreInBounds(
    score.securityCompliance,
    0,
    100,
    'Security Compliance score'
  )
  assertScoreInBounds(score.total, 0, 300, 'Total score')

  // Check total equals sum
  const expectedTotal =
    score.highAvailability +
    score.costEffectiveness +
    score.securityCompliance

  if (Math.abs(score.total - expectedTotal) > 0.001) {
    throw new Error(
      `Total score ${score.total} does not match sum of components ${expectedTotal}`
    )
  }
}

/**
 * Assert that a scenario has required structure
 */
export function assertValidScenario(scenario: any): asserts scenario is Scenario {
  if (typeof scenario !== 'object' || scenario === null) {
    throw new Error('Scenario must be an object')
  }

  const requiredProps = [
    'id',
    'title',
    'description',
    'requirements',
    'constraints',
    'maxRounds',
    'difficulty',
    'category',
  ]

  for (const prop of requiredProps) {
    if (!(prop in scenario)) {
      throw new Error(`Scenario missing required property: ${prop}`)
    }
  }

  if (!Array.isArray(scenario.requirements)) {
    throw new Error('Scenario.requirements must be an array')
  }

  if (
    !['beginner', 'intermediate', 'advanced'].includes(scenario.difficulty)
  ) {
    throw new Error(`Invalid scenario difficulty: ${scenario.difficulty}`)
  }
}

/**
 * Assert that validation completes within time budget
 */
export function assertValidationPerformance(
  durationMs: number,
  budgetMs: number = 500
): void {
  if (durationMs > budgetMs) {
    throw new Error(
      `Validation took ${durationMs}ms, exceeding ${budgetMs}ms budget`
    )
  }
}

/**
 * Assert that two scores are approximately equal (within epsilon)
 */
export function assertScoresApproximatelyEqual(
  actual: number,
  expected: number,
  epsilon: number = 0.01,
  label: string = 'Score'
): void {
  const diff = Math.abs(actual - expected)
  if (diff > epsilon) {
    throw new Error(
      `${label} ${actual} differs from expected ${expected} by ${diff} (epsilon: ${epsilon})`
    )
  }
}

/**
 * Assert that a card array contains specific card IDs
 */
export function assertCardsInclude(
  cards: AzureCard[],
  expectedIds: string[]
): void {
  const cardIds = new Set(cards.map(c => c.id))
  const missingIds = expectedIds.filter(id => !cardIds.has(id))

  if (missingIds.length > 0) {
    throw new Error(`Cards missing expected IDs: ${missingIds.join(', ')}`)
  }
}

/**
 * Assert that a card array does not contain specific card IDs
 */
export function assertCardsExclude(
  cards: AzureCard[],
  excludedIds: string[]
): void {
  const cardIds = new Set(cards.map(c => c.id))
  const foundIds = excludedIds.filter(id => cardIds.has(id))

  if (foundIds.length > 0) {
    throw new Error(`Cards contain excluded IDs: ${foundIds.join(', ')}`)
  }
}

/**
 * Assert that a violation has expected structure
 */
export function assertValidViolation(violation: any): void {
  if (typeof violation !== 'object' || violation === null) {
    throw new Error('Violation must be an object')
  }

  if (
    !['cost-exceeded', 'requirement-unmet', 'conflict-detected', 'anti-pattern'].includes(
      violation.type
    )
  ) {
    throw new Error(`Invalid violation type: ${violation.type}`)
  }

  if (typeof violation.message !== 'string' || violation.message.length === 0) {
    throw new Error('Violation must have non-empty message')
  }
}

/**
 * Assert that XP calculation matches expected formula
 * Formula: 50 + margin of victory
 */
export function assertXPCalculation(
  xpAwarded: number,
  winnerScore: number,
  loserScore: number
): void {
  const margin = Math.abs(winnerScore - loserScore)
  const expectedXP = 50 + margin

  if (xpAwarded !== expectedXP) {
    throw new Error(
      `XP ${xpAwarded} does not match expected ${expectedXP} (50 + margin of ${margin})`
    )
  }
}
