/**
 * Core Game Types and Interfaces for Azure AZ-900 Card Clash Engine
 *
 * Defines all domain models, cards, slots, scenarios, scores, and game states
 * aligned with official AZ-900 exam objectives and the system design specification.
 */

/**
 * AZ-900 exam domain categories
 */
export type AZ900Domain = 'cloud-concepts' | 'azure-services' | 'management-governance'

/**
 * Azure Service Card representing a service or concept
 * Aligned with official AZ-900 exam content
 */
export interface AzureCard {
  /** Unique identifier */
  id: string

  /** Service or concept name */
  name: string

  /** AZ-900 exam domain classification */
  domain: AZ900Domain

  /** Cost tier (0-10, where 0=free tier, 10=most expensive) */
  cost: number

  /** Tags for synergy detection (e.g., ['compute', 'serverless']) */
  synergyTags: string[]

  /** Brief AZ-900 exam tip (max 280 chars) */
  az900ExamTip: string

  /** Detailed description */
  description: string

  /** Power rating for scoring (0-100) */
  power: number

  /** Prerequisites - other card IDs that should be present */
  requirements?: string[]

  /** Anti-pattern conflicts - card IDs that conflict with this card */
  conflicts?: string[]
}

/**
 * Architecture slot on the game board
 */
export interface ArchitectureSlot {
  /** Slot identifier */
  id: string

  /** Display position on board */
  position: { x: number; y: number }

  /** Slot type constraint */
  type: 'compute' | 'storage' | 'network' | 'security' | 'governance' | 'any'

  /** Currently placed card */
  card: AzureCard | null

  /** Whether this slot is required for solution */
  required: boolean
}

/**
 * Scenario requirement types
 */
export type RequirementType = 'service' | 'concept' | 'governance'

/**
 * Individual scenario requirement
 */
export interface ScenarioRequirement {
  /** Requirement type */
  type: RequirementType

  /** Required value or tag */
  value: string

  /** Weight for scoring (0-100) */
  weight: number

  /** Human-readable description */
  description: string
}

/**
 * Game scenario representing an architecture challenge
 */
export interface Scenario {
  /** Unique identifier */
  id: string

  /** Scenario title */
  title: string

  /** Detailed description of the challenge */
  description: string

  /** Specific requirements to satisfy */
  requirements: ScenarioRequirement[]

  /** Budget and other constraints */
  constraints: {
    maxCost?: number
    minAvailability?: number
    securityLevel?: 'basic' | 'standard' | 'premium'
    region?: string
  }

  /** Maximum rounds to complete */
  maxRounds: number

  /** Difficulty tier */
  difficulty: 'beginner' | 'intermediate' | 'advanced'

  /** Scenario category */
  category: 'startup-scaling' | 'enterprise-migration' | 'high-compliance' | 'real-time-analytics'
}

/**
 * Individual validation violation
 */
export interface ValidationViolation {
  /** Violation type */
  type: 'cost-exceeded' | 'requirement-unmet' | 'conflict-detected' | 'anti-pattern'

  /** Human-readable message */
  message: string

  /** Violated AZ-900 principle name */
  principle?: string

  /** Associated requirement index */
  requirementIndex?: number

  /** Numeric details (e.g., cost overrun amount) */
  numericDetail?: number
}

/**
 * Validation result for card placement
 */
export interface ValidationResult {
  /** Whether placement is valid */
  isValid: boolean

  /** Validation timestamp */
  timestamp: number

  /** Violated constraints */
  violations: ValidationViolation[]

  /** Suggested fixes */
  suggestions?: AzureCard[]
}

/**
 * Detailed score calculation breakdown
 */
export interface ScoreBreakdown {
  /** Requirements met count */
  requirementsMet: number

  /** Total requirements count */
  totalRequirements: number

  /** Cost utilization percentage */
  costUtilization: number

  /** Synergy bonuses applied */
  synergyBonuses: string[]

  /** Anti-pattern penalties applied */
  penalties: string[]
}

/**
 * Architecture score breakdown
 */
export interface ArchitectureScore {
  /** High availability score (0-100) */
  highAvailability: number

  /** Cost effectiveness score (0-100) */
  costEffectiveness: number

  /** Security compliance score (0-100) */
  securityCompliance: number

  /** Total score (sum of above, 0-300) */
  total: number

  /** Detailed scoring breakdown */
  breakdown: ScoreBreakdown
}

/**
 * Game state for active match
 */
export interface GameState {
  /** Current scenario */
  currentScenario: Scenario

  /** Available cards in deck */
  deck: AzureCard[]

  /** Cards in player's hand */
  hand: AzureCard[]

  /** Architecture slots on board */
  slots: ArchitectureSlot[]

  /** Current round number */
  round: number

  /** Current score */
  score: ArchitectureScore

  /** Match mode */
  mode: 'quick-match' | 'multiplayer'

  /** Time remaining in current turn (seconds) */
  timeRemaining: number

  /** Match status */
  status: 'setup' | 'playing' | 'evaluating' | 'complete'
}

/**
 * Player profile and progress
 */
export interface PlayerProfile {
  /** Player identifier */
  id: string

  /** Display name */
  displayName: string

  /** Current XP total */
  xp: number

  /** Current difficulty tier */
  difficultyTier: 'beginner' | 'intermediate' | 'advanced'

  /** Match history statistics */
  stats: {
    matchesPlayed: number
    matchesWon: number
    consecutiveWins: number
    consecutiveLosses: number
  }

  /** Study deck card IDs */
  studyDeck: string[]

  /** Preferred language */
  language: 'en' | 'zh-CN' | 'ja' | 'es' | 'de' | 'fr'

  /** Accessibility preferences */
  accessibility: {
    highContrast: boolean
    keyboardOnly: boolean
    reducedMotion: boolean
  }
}

/**
 * Saved session for resume capability
 */
export interface SavedSession {
  /** Session identifier */
  id: string

  /** Save timestamp */
  timestamp: number

  /** Expiration timestamp (7 days from save) */
  expiresAt: number

  /** Saved game state */
  gameState: GameState

  /** Player ID */
  playerId: string
}

/**
 * Multiplayer match data
 */
export interface MultiplayerMatch {
  /** Match identifier */
  id: string

  /** Player 1 data */
  player1: {
    profile: PlayerProfile
    solution: AzureCard[]
    score: ArchitectureScore
  }

  /** Player 2 data */
  player2: {
    profile: PlayerProfile
    solution: AzureCard[]
    score: ArchitectureScore
  }

  /** Scenario used */
  scenario: Scenario

  /** Winner ID or 'tie' */
  winner: string | 'tie'

  /** XP awarded to each player */
  xpAwarded: {
    player1: number
    player2: number
  }
}

/**
 * Architecture Codex entry for learning
 */
export interface CodexEntry {
  /** Associated card ID */
  cardId: string

  /** AZ-900 exam definition */
  examDefinition: string

  /** Common use cases */
  useCases: string[]

  /** Best practice recommendations */
  bestPractices: string[]

  /** Related services */
  relatedServices: string[]

  /** External learning resources */
  resources: {
    title: string
    url: string
    type: 'microsoft-learn' | 'documentation' | 'video'
  }[]
}
