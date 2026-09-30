# Design Document: Azure AZ-900 Architecture Card Clash Engine

## Overview

The Azure AZ-900 Architecture Card Clash Engine is an interactive, web-based educational game that teaches Microsoft Azure fundamentals through scenario-driven card gameplay. Players deploy Azure service cards to solve architectural challenges while learning AZ-900 certification concepts. The system validates solutions against Azure best practices, provides immediate feedback, and adapts to player skill levels.

### Core Design Principles

1. **Educational First**: Every game mechanic reinforces AZ-900 exam concepts
2. **Instant Feedback**: Sub-500ms validation responses for immediate learning
3. **Progressive Learning**: Adaptive difficulty based on player performance
4. **Accessibility**: WCAG 2.1 AA compliance with full keyboard navigation
5. **Mobile-Optimized**: Quick-play modes for learning on the go

### Technical Foundation

- **Framework**: Vue 3 with Composition API and TypeScript strict mode
- **State Management**: Pinia stores for game state, player progress, and codex
- **Styling**: Tailwind CSS with mobile-first responsive design
- **Performance**: Sub-500ms validation, optimistic UI updates, lazy loading
- **Deployment**: Azure Static Web Apps with global CDN distribution

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Vue 3 Application                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Game UI    │  │  Codex UI    │  │ Settings UI  │        │
│  │  Components  │  │  Components  │  │  Components  │        │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘        │
│         │                  │                  │                 │
│  ┌──────┴──────────────────┴──────────────────┴───────┐        │
│  │              Pinia State Stores                     │        │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐     │        │
│  │  │ Game   │ │ Player │ │ Codex  │ │Session │     │        │
│  │  │ Store  │ │ Store  │ │ Store  │ │ Store  │     │        │
│  │  └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘     │        │
│  └──────┼──────────┼──────────┼──────────┼───────────┘        │
│         │          │          │          │                     │
│  ┌──────┴──────────┴──────────┴──────────┴───────┐            │
│  │            Game Engine Layer                   │            │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐      │            │
│  │  │Validator │ │Evaluator │ │ Scoring  │      │            │
│  │  │ Engine   │ │ Engine   │ │ Engine   │      │            │
│  │  └──────────┘ └──────────┘ └──────────┘      │            │
│  └─────────────────────────────────────────────┘             │
│         │          │          │                                │
│  ┌──────┴──────────┴──────────┴────────────────┐             │
│  │         Data Access Layer                    │             │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐    │             │
│  │  │  Cards   │ │Scenarios │ │LocalStorage│   │             │
│  │  │   Data   │ │   Data   │ │  Adapter   │   │             │
│  │  └──────────┘ └──────────┘ └──────────┘    │             │
│  └───────────────────────────────────────────┘              │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Architecture Layers

**1. Presentation Layer (Vue Components)**
- Card rendering components with drag-and-drop interactions
- Game board with architecture slot placement zones
- Real-time score display and feedback components
- Architecture Codex browser with search and filtering
- Accessibility-compliant keyboard navigation handlers

**2. State Management Layer (Pinia Stores)**
- **Game Store**: Current match state, deployed cards, active scenario
- **Player Store**: Profile, XP, difficulty tier, match history
- **Codex Store**: Card library, study deck, learning progress
- **Session Store**: Persistence, resume state, save/load operations

**3. Game Engine Layer**
- **Validator Engine**: Real-time card placement validation (<500ms)
- **Evaluator Engine**: Architecture solution scoring and comparison
- **Scoring Engine**: Multi-dimensional score calculation (HA, Cost, Security)

**4. Data Layer**
- Static JSON data files for cards and scenarios
- LocalStorage adapter for session persistence
- IndexedDB for extended player progress tracking

## Components and Interfaces

### Core Component Structure

```
src/
├── components/
│   ├── game/
│   │   ├── GameBoard.vue              # Main game board container
│   │   ├── ArchitectureSlot.vue       # Card drop zone component
│   │   ├── CardDeck.vue               # Available cards display
│   │   ├── ScenarioPanel.vue          # Scenario requirements display
│   │   ├── ScoreDisplay.vue           # Real-time score breakdown
│   │   ├── TimerBar.vue               # Turn timer with visual countdown
│   │   └── ValidationFeedback.vue     # Error/success messages
│   ├── cards/
│   │   ├── AzureCard.vue              # Individual card component
│   │   ├── CardTooltip.vue            # Quick-reference popup
│   │   └── CardComparison.vue         # Side-by-side multiplayer view
│   ├── codex/
│   │   ├── CodexBrowser.vue           # Architecture Codex main view
│   │   ├── CodexEntry.vue             # Detailed service explanation
│   │   ├── CodexSearch.vue            # Search and filter interface
│   │   └── StudyDeck.vue              # Player's collected cards
│   ├── ui/
│   │   ├── Modal.vue                  # Base modal component
│   │   ├── Button.vue                 # Accessible button component
│   │   ├── Select.vue                 # Accessible dropdown
│   │   └── Toast.vue                  # Notification component
│   └── layout/
│       ├── AppHeader.vue              # Main navigation
│       ├── AppFooter.vue              # Footer with settings
│       └── GameLayout.vue             # Game screen layout
├── views/
│   ├── HomeView.vue                   # Main menu
│   ├── QuickMatchView.vue             # Commute mode game
│   ├── MultiplayerView.vue            # Multiplayer match
│   ├── CodexView.vue                  # Learning library
│   └── SettingsView.vue               # User preferences
```

### Key Component Interfaces

#### GameBoard.vue
```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'
import type { AzureCard, ArchitectureSlot } from '@/types/game'

interface Props {
  mode: 'quick-match' | 'multiplayer'
  timeLimit?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  cardPlaced: [card: AzureCard, slot: ArchitectureSlot]
  solutionSubmitted: [solution: AzureCard[]]
  matchComplete: []
}>()

const gameStore = useGameStore()

const currentScenario = computed(() => gameStore.currentScenario)
const architectureSlots = computed(() => gameStore.architectureSlots)
const validationState = computed(() => gameStore.validationState)
</script>
```

#### AzureCard.vue
```vue
<script setup lang="ts">
import { computed } from 'vue'
import type { AzureCard } from '@/types/game'

interface Props {
  card: AzureCard
  isPlaced: boolean
  isValid?: boolean
  isDraggable: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  dragStart: [card: AzureCard]
  dragEnd: []
  click: [card: AzureCard]
  tooltipRequest: [card: AzureCard]
}>()

const cardClasses = computed(() => ({
  'card-cloud-concepts': props.card.domain === 'cloud-concepts',
  'card-azure-services': props.card.domain === 'azure-services',
  'card-management-governance': props.card.domain === 'management-governance',
  'card-valid': props.isValid === true,
  'card-invalid': props.isValid === false,
  'card-placed': props.isPlaced,
}))
</script>
```

## Data Models

### Core Type Definitions

```typescript
// src/types/game.ts

/**
 * AZ-900 exam domain categories
 */
export type AZ900Domain = 
  | 'cloud-concepts'
  | 'azure-services'
  | 'management-governance'

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
```

### AZ-900 Card Data Schema

```typescript
// src/types/az900.ts

/**
 * Cloud Concepts domain cards (Domain 1)
 */
export const CLOUD_CONCEPTS_CARDS: AzureCard[] = [
  {
    id: 'cc-high-availability',
    name: 'High Availability Architecture',
    domain: 'cloud-concepts',
    cost: 0,
    synergyTags: ['availability', 'reliability', 'multi-region'],
    az900ExamTip: 'HA ensures service uptime through redundancy and failover',
    description: 'Design pattern for minimizing downtime through redundant components',
    power: 80,
  },
  {
    id: 'cc-elastic-scaling',
    name: 'Elastic Scaling',
    domain: 'cloud-concepts',
    cost: 0,
    synergyTags: ['scalability', 'performance', 'auto-scaling'],
    az900ExamTip: 'Elasticity allows resources to scale automatically based on demand',
    description: 'Automatic resource adjustment based on workload patterns',
    power: 75,
  },
  // Additional cloud concept cards...
]

/**
 * Azure Services domain cards (Domain 2)
 */
export const AZURE_SERVICES_CARDS: AzureCard[] = [
  {
    id: 'as-app-service',
    name: 'Azure App Service',
    domain: 'azure-services',
    cost: 5,
    synergyTags: ['compute', 'paas', 'web', 'scaling'],
    az900ExamTip: 'PaaS for web apps with built-in scaling and DevOps integration',
    description: 'Fully managed platform for building and hosting web applications',
    power: 70,
    conflicts: ['as-vm-windows'], // Anti-pattern: using both App Service and VMs for same workload
  },
  {
    id: 'as-sql-database',
    name: 'Azure SQL Database',
    domain: 'azure-services',
    cost: 6,
    synergyTags: ['database', 'paas', 'sql', 'managed'],
    az900ExamTip: 'Managed relational database with automatic updates and scaling',
    description: 'Fully managed SQL database service with built-in intelligence',
    power: 75,
    requirements: ['as-vnet'], // Requires network for secure access
  },
  // Additional service cards...
]

/**
 * Management & Governance domain cards (Domain 3)
 */
export const MANAGEMENT_GOVERNANCE_CARDS: AzureCard[] = [
  {
    id: 'mg-azure-policy',
    name: 'Azure Policy',
    domain: 'management-governance',
    cost: 0,
    synergyTags: ['governance', 'compliance', 'enforcement'],
    az900ExamTip: 'Enforce organizational standards and compliance at scale',
    description: 'Service for creating, assigning, and managing policies',
    power: 85,
  },
  {
    id: 'mg-rbac',
    name: 'Role-Based Access Control',
    domain: 'management-governance',
    cost: 0,
    synergyTags: ['security', 'identity', 'access-control'],
    az900ExamTip: 'Manage access through role assignments with least privilege',
    description: 'Fine-grained access management for Azure resources',
    power: 90,
  },
  // Additional governance cards...
]
```

## Game Engine Logic

### Validator Engine

The Validator Engine performs real-time validation of card placements against scenario constraints and Azure best practices.

```typescript
// src/engine/validator.ts

import type {
  AzureCard,
  ArchitectureSlot,
  Scenario,
  ValidationResult,
  ValidationViolation,
} from '@/types/game'

export class ValidationEngine {
  /**
   * Validates a card placement against scenario constraints
   * Must complete in <500ms for real-time feedback
   */
  validatePlacement(
    card: AzureCard,
    slot: ArchitectureSlot,
    currentSlots: ArchitectureSlot[],
    scenario: Scenario
  ): ValidationResult {
    const startTime = performance.now()
    const violations: ValidationViolation[] = []
    
    // Get all currently placed cards
    const placedCards = currentSlots
      .filter(s => s.card !== null)
      .map(s => s.card!)
    
    // Check 1: Slot type compatibility
    if (!this.isSlotTypeCompatible(card, slot)) {
      violations.push({
        type: 'requirement-unmet',
        message: `${card.name} cannot be placed in ${slot.type} slot`,
      })
    }
    
    // Check 2: Budget constraints
    const totalCost = this.calculateTotalCost([...placedCards, card])
    if (scenario.constraints.maxCost && totalCost > scenario.constraints.maxCost) {
      violations.push({
        type: 'cost-exceeded',
        message: `Budget exceeded by ${totalCost - scenario.constraints.maxCost} points`,
        numericDetail: totalCost - scenario.constraints.maxCost,
      })
    }
    
    // Check 3: Card requirements
    const unmetRequirements = this.checkRequirements(card, placedCards)
    if (unmetRequirements.length > 0) {
      violations.push({
        type: 'requirement-unmet',
        message: `${card.name} requires: ${unmetRequirements.join(', ')}`,
      })
    }
    
    // Check 4: Conflict detection
    const conflicts = this.detectConflicts(card, placedCards)
    if (conflicts.length > 0) {
      violations.push({
        type: 'conflict-detected',
        message: `${card.name} conflicts with: ${conflicts.map(c => c.name).join(', ')}`,
      })
    }
    
    // Check 5: Anti-pattern detection
    const antiPatterns = this.detectAntiPatterns(card, placedCards, scenario)
    violations.push(...antiPatterns)
    
    const elapsedTime = performance.now() - startTime
    
    // Log performance warning if validation exceeds 500ms
    if (elapsedTime > 500) {
      console.warn(`Validation took ${elapsedTime}ms - exceeds 500ms target`)
    }
    
    return {
      isValid: violations.length === 0,
      timestamp: Date.now(),
      violations,
      suggestions: violations.length > 0 ? this.getSuggestions(card, violations) : undefined,
    }
  }
  
  /**
   * Checks if card can be placed in slot based on type
   */
  private isSlotTypeCompatible(card: AzureCard, slot: ArchitectureSlot): boolean {
    if (slot.type === 'any') return true
    
    // Map card synergy tags to slot types
    const slotTypeMap: Record<string, string[]> = {
      compute: ['compute', 'serverless', 'container'],
      storage: ['storage', 'blob', 'disk', 'files'],
      network: ['network', 'connectivity', 'vpn'],
      security: ['security', 'identity', 'encryption'],
      governance: ['governance', 'compliance', 'policy'],
    }
    
    const compatibleTags = slotTypeMap[slot.type] || []
    return card.synergyTags.some(tag => compatibleTags.includes(tag))
  }
  
  /**
   * Calculates total cost of cards
   */
  private calculateTotalCost(cards: AzureCard[]): number {
    return cards.reduce((total, card) => total + card.cost, 0)
  }
  
  /**
   * Checks if card requirements are met
   */
  private checkRequirements(card: AzureCard, placedCards: AzureCard[]): string[] {
    if (!card.requirements || card.requirements.length === 0) {
      return []
    }
    
    const placedCardIds = new Set(placedCards.map(c => c.id))
    const unmet = card.requirements.filter(reqId => !placedCardIds.has(reqId))
    
    return unmet.map(reqId => {
      // Look up card name from ID (would reference card registry)
      return reqId
    })
  }
  
  /**
   * Detects conflicts between cards
   */
  private detectConflicts(card: AzureCard, placedCards: AzureCard[]): AzureCard[] {
    if (!card.conflicts || card.conflicts.length === 0) {
      return []
    }
    
    const conflictSet = new Set(card.conflicts)
    return placedCards.filter(c => conflictSet.has(c.id))
  }
  
  /**
   * Detects Azure architecture anti-patterns
   */
  private detectAntiPatterns(
    card: AzureCard,
    placedCards: AzureCard[],
    scenario: Scenario
  ): ValidationViolation[] {
    const violations: ValidationViolation[] = []
    
    // Anti-pattern 1: Public storage without security in high-compliance scenario
    if (
      scenario.constraints.securityLevel === 'premium' &&
      card.synergyTags.includes('storage') &&
      !placedCards.some(c => c.synergyTags.includes('security'))
    ) {
      violations.push({
        type: 'anti-pattern',
        message: 'High-compliance scenarios require security controls for storage',
        principle: 'Security by Default',
      })
    }
    
    // Anti-pattern 2: Using IaaS when PaaS would suffice
    if (
      card.synergyTags.includes('iaas') &&
      scenario.category === 'startup-scaling' &&
      !scenario.requirements.some(r => r.value === 'custom-os')
    ) {
      violations.push({
        type: 'anti-pattern',
        message: 'Consider PaaS services for faster time-to-market in startup scenarios',
        principle: 'Platform as a Service First',
      })
    }
    
    // Anti-pattern 3: Single region for high availability requirements
    if (
      scenario.constraints.minAvailability &&
      scenario.constraints.minAvailability >= 99.99 &&
      !placedCards.some(c => c.synergyTags.includes('multi-region'))
    ) {
      violations.push({
        type: 'anti-pattern',
        message: '99.99% SLA requires multi-region deployment',
        principle: 'High Availability Design',
      })
    }
    
    return violations
  }
  
  /**
   * Suggests alternative cards to fix violations
   */
  private getSuggestions(
    card: AzureCard,
    violations: ValidationViolation[]
  ): AzureCard[] {
    // Implementation would query card registry for compatible alternatives
    // Based on violation types and scenario requirements
    return []
  }
}
```

### Scoring Engine

The Scoring Engine calculates the three-dimensional architecture score (HA, Cost, Security) for solutions.

```typescript
// src/engine/scoring.ts

import type {
  AzureCard,
  Scenario,
  ArchitectureScore,
  ScoreBreakdown,
} from '@/types/game'

export class ScoringEngine {
  /**
   * Calculates comprehensive architecture score
   */
  calculateScore(
    placedCards: AzureCard[],
    scenario: Scenario
  ): ArchitectureScore {
    const haScore = this.calculateHighAvailabilityScore(placedCards, scenario)
    const costScore = this.calculateCostEffectivenessScore(placedCards, scenario)
    const securityScore = this.calculateSecurityComplianceScore(placedCards, scenario)
    
    return {
      highAvailability: haScore.score,
      costEffectiveness: costScore.score,
      securityCompliance: securityScore.score,
      total: haScore.score + costScore.score + securityScore.score,
      breakdown: this.createBreakdown(placedCards, scenario, {
        ha: haScore,
        cost: costScore,
        security: securityScore,
      }),
    }
  }
  
  /**
   * High Availability Score (0-100)
   * Evaluates redundancy, failover, and uptime design
   */
  private calculateHighAvailabilityScore(
    cards: AzureCard[],
    scenario: Scenario
  ): { score: number; details: string[] } {
    let score = 0
    const details: string[] = []
    
    // Base score from HA-related cards
    const haCards = cards.filter(c => 
      c.synergyTags.includes('availability') ||
      c.synergyTags.includes('redundancy') ||
      c.synergyTags.includes('multi-region')
    )
    
    if (haCards.length > 0) {
      score += 30
      details.push(`${haCards.length} HA component(s) deployed`)
    }
    
    // Multi-region bonus
    const hasMultiRegion = cards.some(c => c.synergyTags.includes('multi-region'))
    if (hasMultiRegion) {
      score += 20
      details.push('Multi-region deployment')
    }
    
    // Managed service bonus (automatic failover)
    const managedServices = cards.filter(c => c.synergyTags.includes('managed'))
    if (managedServices.length >= 2) {
      score += 15
      details.push('Managed services with built-in HA')
    }
    
    // Load balancing bonus
    const hasLoadBalancing = cards.some(c => 
      c.synergyTags.includes('load-balancer') ||
      c.name.includes('Load Balancer')
    )
    if (hasLoadBalancing) {
      score += 15
      details.push('Load balancing configured')
    }
    
    // Backup and recovery bonus
    const hasBackup = cards.some(c => c.synergyTags.includes('backup'))
    if (hasBackup) {
      score += 10
      details.push('Backup and recovery configured')
    }
    
    // Penalty for single points of failure
    const hasSinglePointFailure = this.detectSinglePointFailure(cards)
    if (hasSinglePointFailure) {
      score -= 20
      details.push('Warning: Potential single point of failure')
    }
    
    return {
      score: Math.min(100, Math.max(0, score)),
      details,
    }
  }
  
  /**
   * Cost Effectiveness Score (0-100)
   * Evaluates resource optimization and value
   */
  private calculateCostEffectivenessScore(
    cards: AzureCard[],
    scenario: Scenario
  ): { score: number; details: string[] } {
    let score = 50 // Start at midpoint
    const details: string[] = []
    
    const totalCost = cards.reduce((sum, c) => sum + c.cost, 0)
    const maxCost = scenario.constraints.maxCost || 100
    const costUtilization = (totalCost / maxCost) * 100
    
    // Optimal cost utilization (70-90%)
    if (costUtilization >= 70 && costUtilization <= 90) {
      score += 30
      details.push(`Optimal budget utilization: ${costUtilization.toFixed(1)}%`)
    } else if (costUtilization < 70) {
      // Under-utilizing budget
      score += 10
      details.push(`Under-utilizing budget: ${costUtilization.toFixed(1)}%`)
    } else {
      // Over budget - significant penalty
      const overrun = costUtilization - 100
      score -= Math.min(50, overrun * 2)
      details.push(`Over budget by ${overrun.toFixed(1)}%`)
    }
    
    // PaaS preference bonus (lower operational costs)
    const paasCards = cards.filter(c => c.synergyTags.includes('paas'))
    if (paasCards.length >= 2) {
      score += 15
      details.push('PaaS services reduce operational costs')
    }
    
    // Serverless bonus (pay-per-use efficiency)
    const serverlessCards = cards.filter(c => c.synergyTags.includes('serverless'))
    if (serverlessCards.length > 0) {
      score += 10
      details.push('Serverless for cost-efficient scaling')
    }
    
    // Reserved capacity bonus (long-term savings)
    const hasReservedCapacity = cards.some(c => c.name.includes('Reserved'))
    if (hasReservedCapacity) {
      score += 10
      details.push('Reserved capacity for long-term savings')
    }
    
    return {
      score: Math.min(100, Math.max(0, score)),
      details,
    }
  }
  
  /**
   * Security Compliance Score (0-100)
   * Evaluates security controls and compliance
   */
  private calculateSecurityComplianceScore(
    cards: AzureCard[],
    scenario: Scenario
  ): { score: number; details: string[] } {
    let score = 0
    const details: string[] = []
    
    const requiredLevel = scenario.constraints.securityLevel || 'basic'
    
    // Identity and access control
    const hasRBAC = cards.some(c => c.synergyTags.includes('rbac'))
    const hasIdentity = cards.some(c => c.synergyTags.includes('identity'))
    if (hasRBAC || hasIdentity) {
      score += 20
      details.push('Identity and access management configured')
    }
    
    // Network security
    const hasNetworkSecurity = cards.some(c => 
      c.synergyTags.includes('nsg') ||
      c.synergyTags.includes('firewall') ||
      c.name.includes('Network Security Group')
    )
    if (hasNetworkSecurity) {
      score += 20
      details.push('Network security controls in place')
    }
    
    // Encryption
    const hasEncryption = cards.some(c => c.synergyTags.includes('encryption'))
    if (hasEncryption) {
      score += 20
      details.push('Data encryption enabled')
    }
    
    // Governance and compliance
    const hasGovernance = cards.filter(c => c.domain === 'management-governance')
    if (hasGovernance.length >= 2) {
      score += 20
      details.push('Governance policies enforced')
    }
    
    // Monitoring and logging
    const hasMonitoring = cards.some(c => 
      c.synergyTags.includes('monitoring') ||
      c.name.includes('Monitor')
    )
    if (hasMonitoring) {
      score += 10
      details.push('Security monitoring active')
    }
    
    // Backup and disaster recovery
    const hasBackup = cards.some(c => c.synergyTags.includes('backup'))
    if (hasBackup) {
      score += 10
      details.push('Backup and DR configured')
    }
    
    // Penalty for missing required security level
    if (requiredLevel === 'premium' && score < 70) {
      details.push('Warning: Premium security level not met')
    }
    
    return {
      score: Math.min(100, Math.max(0, score)),
      details,
    }
  }
  
  /**
   * Creates detailed score breakdown
   */
  private createBreakdown(
    cards: AzureCard[],
    scenario: Scenario,
    scores: {
      ha: { score: number; details: string[] }
      cost: { score: number; details: string[] }
      security: { score: number; details: string[] }
    }
  ): ScoreBreakdown {
    const requirementsMet = this.countRequirementsMet(cards, scenario)
    const totalCost = cards.reduce((sum, c) => sum + c.cost, 0)
    const maxCost = scenario.constraints.maxCost || 100
    
    return {
      requirementsMet: requirementsMet,
      totalRequirements: scenario.requirements.length,
      costUtilization: (totalCost / maxCost) * 100,
      synergyBonuses: this.detectSynergyBonuses(cards),
      penalties: this.detectPenalties(cards, scenario),
    }
  }
  
  private detectSinglePointFailure(cards: AzureCard[]): boolean {
    // Implementation would check for redundancy patterns
    return false
  }
  
  private countRequirementsMet(cards: AzureCard[], scenario: Scenario): number {
    let met = 0
    for (const req of scenario.requirements) {
      const hasMatch = cards.some(c => c.synergyTags.includes(req.value))
      if (hasMatch) met++
    }
    return met
  }
  
  private detectSynergyBonuses(cards: AzureCard[]): string[] {
    const bonuses: string[] = []
    
    // Check for common synergy patterns
    const hasAppService = cards.some(c => c.name.includes('App Service'))
    const hasSQLDB = cards.some(c => c.name.includes('SQL Database'))
    if (hasAppService && hasSQLDB) {
      bonuses.push('App Service + SQL Database synergy')
    }
    
    // Add more synergy patterns...
    
    return bonuses
  }
  
  private detectPenalties(cards: AzureCard[], scenario: Scenario): string[] {
    const penalties: string[] = []
    
    // Check for anti-patterns
    const totalCost = cards.reduce((sum, c) => sum + c.cost, 0)
    if (scenario.constraints.maxCost && totalCost > scenario.constraints.maxCost) {
      penalties.push('Budget exceeded')
    }
    
    return penalties
  }
}
```

### Evaluator Engine

The Evaluator Engine handles multiplayer solution comparison and winner determination.

```typescript
// src/engine/evaluator.ts

import type { AzureCard, Scenario, ArchitectureScore, MultiplayerMatch } from '@/types/game'
import { ScoringEngine } from './scoring'

export class EvaluatorEngine {
  private scoringEngine: ScoringEngine
  
  constructor() {
    this.scoringEngine = new ScoringEngine()
  }
  
  /**
   * Evaluates two player solutions and determines winner
   */
  evaluateClash(
    player1Solution: AzureCard[],
    player2Solution: AzureCard[],
    scenario: Scenario
  ): {
    player1Score: ArchitectureScore
    player2Score: ArchitectureScore
    winner: 'player1' | 'player2' | 'tie'
    marginOfVictory: number
  } {
    const player1Score = this.scoringEngine.calculateScore(player1Solution, scenario)
    const player2Score = this.scoringEngine.calculateScore(player2Solution, scenario)
    
    const diff = player1Score.total - player2Score.total
    
    let winner: 'player1' | 'player2' | 'tie'
    if (Math.abs(diff) < 1) {
      winner = 'tie'
    } else {
      winner = diff > 0 ? 'player1' : 'player2'
    }
    
    return {
      player1Score,
      player2Score,
      winner,
      marginOfVictory: Math.abs(diff),
    }
  }
  
  /**
   * Calculates XP award based on match outcome
   */
  calculateXPAward(
    score: ArchitectureScore,
    isWinner: boolean,
    marginOfVictory: number
  ): number {
    if (isWinner) {
      return 50 + Math.floor(marginOfVictory)
    } else {
      // Participation XP based on score
      return Math.floor(score.total / 10)
    }
  }
}
```

## State Management Architecture

### Pinia Store Structure

```typescript
// src/stores/game.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GameState, AzureCard, ArchitectureSlot, Scenario, ValidationResult } from '@/types/game'
import { ValidationEngine } from '@/engine/validator'
import { ScoringEngine } from '@/engine/scoring'

export const useGameStore = defineStore('game', () => {
  // State
  const gameState = ref<GameState | null>(null)
  const validationResult = ref<ValidationResult | null>(null)
  const isValidating = ref(false)
  
  // Engine instances
  const validatorEngine = new ValidationEngine()
  const scoringEngine = new ScoringEngine()
  
  // Computed
  const currentScenario = computed(() => gameState.value?.currentScenario)
  const placedCards = computed(() => 
    gameState.value?.slots.filter(s => s.card !== null).map(s => s.card!) || []
  )
  const currentScore = computed(() => gameState.value?.score)
  const isGameActive = computed(() => 
    gameState.value?.status === 'playing' || gameState.value?.status === 'evaluating'
  )
  
  // Actions
  function initializeGame(scenario: Scenario, mode: 'quick-match' | 'multiplayer') {
    gameState.value = {
      currentScenario: scenario,
      deck: [], // Load from data
      hand: [], // Deal initial hand
      slots: generateSlots(scenario),
      round: 1,
      score: {
        highAvailability: 0,
        costEffectiveness: 0,
        securityCompliance: 0,
        total: 0,
        breakdown: {
          requirementsMet: 0,
          totalRequirements: scenario.requirements.length,
          costUtilization: 0,
          synergyBonuses: [],
          penalties: [],
        },
      },
      mode,
      timeRemaining: mode === 'quick-match' ? 45 : 120,
      status: 'playing',
    }
  }
  
  async function placeCard(card: AzureCard, slot: ArchitectureSlot): Promise<boolean> {
    if (!gameState.value) return false
    
    isValidating.value = true
    
    // Validate placement
    const result = validatorEngine.validatePlacement(
      card,
      slot,
      gameState.value.slots,
      gameState.value.currentScenario
    )
    
    validationResult.value = result
    isValidating.value = false
    
    if (result.isValid) {
      // Update slot with card
      const slotIndex = gameState.value.slots.findIndex(s => s.id === slot.id)
      if (slotIndex !== -1) {
        gameState.value.slots[slotIndex].card = card
      }
      
      // Remove card from hand
      const handIndex = gameState.value.hand.findIndex(c => c.id === card.id)
      if (handIndex !== -1) {
        gameState.value.hand.splice(handIndex, 1)
      }
      
      // Recalculate score
      updateScore()
      
      return true
    }
    
    return false
  }
  
  function removeCard(slotId: string) {
    if (!gameState.value) return
    
    const slot = gameState.value.slots.find(s => s.id === slotId)
    if (slot && slot.card) {
      // Return card to hand
      gameState.value.hand.push(slot.card)
      slot.card = null
      
      // Recalculate score
      updateScore()
    }
  }
  
  function updateScore() {
    if (!gameState.value) return
    
    const placed = placedCards.value
    gameState.value.score = scoringEngine.calculateScore(
      placed,
      gameState.value.currentScenario
    )
  }
  
  function submitSolution() {
    if (!gameState.value) return
    
    gameState.value.status = 'evaluating'
    
    // Final score calculation
    updateScore()
    
    // Transition to complete after brief delay
    setTimeout(() => {
      if (gameState.value) {
        gameState.value.status = 'complete'
      }
    }, 1000)
  }
  
  function generateSlots(scenario: Scenario): ArchitectureSlot[] {
    // Generate appropriate slots based on scenario requirements
    const slots: ArchitectureSlot[] = []
    
    // At minimum, create slots for each requirement
    scenario.requirements.forEach((req, index) => {
      slots.push({
        id: `slot-${index}`,
        position: { x: index * 150, y: 100 },
        type: req.type as any,
        card: null,
        required: true,
      })
    })
    
    // Add optional slots
    for (let i = 0; i < 3; i++) {
      slots.push({
        id: `slot-opt-${i}`,
        position: { x: i * 150, y: 250 },
        type: 'any',
        card: null,
        required: false,
      })
    }
    
    return slots
  }
  
  return {
    // State
    gameState,
    validationResult,
    isValidating,
    
    // Computed
    currentScenario,
    placedCards,
    currentScore,
    isGameActive,
    
    // Actions
    initializeGame,
    placeCard,
    removeCard,
    updateScore,
    submitSolution,
  }
})
```

```typescript
// src/stores/player.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PlayerProfile } from '@/types/game'

export const usePlayerStore = defineStore('player', () => {
  // State
  const profile = ref<PlayerProfile | null>(null)
  
  // Computed
  const currentDifficulty = computed(() => profile.value?.difficultyTier || 'beginner')
  const totalMatches = computed(() => profile.value?.stats.matchesPlayed || 0)
  const winRate = computed(() => {
    if (!profile.value || profile.value.stats.matchesPlayed === 0) return 0
    return (profile.value.stats.matchesWon / profile.value.stats.matchesPlayed) * 100
  })
  
  // Actions
  function initializeProfile(id: string, displayName: string) {
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
  
  function recordMatchResult(won: boolean, xpAwarded: number, cardsUsed: string[]) {
    if (!profile.value) return
    
    profile.value.stats.matchesPlayed++
    profile.value.xp += xpAwarded
    
    if (won) {
      profile.value.stats.matchesWon++
      profile.value.stats.consecutiveWins++
      profile.value.stats.consecutiveLosses = 0
    } else {
      profile.value.stats.consecutiveWins = 0
      profile.value.stats.consecutiveLosses++
    }
    
    // Add cards to study deck
    cardsUsed.forEach(cardId => {
      if (!profile.value!.studyDeck.includes(cardId)) {
        profile.value!.studyDeck.push(cardId)
      }
    })
    
    // Check for difficulty tier adjustment
    adjustDifficulty()
  }
  
  function adjustDifficulty() {
    if (!profile.value) return
    
    const { consecutiveWins, consecutiveLosses } = profile.value.stats
    
    // Increase difficulty after 3 consecutive wins
    if (consecutiveWins >= 3) {
      if (profile.value.difficultyTier === 'beginner') {
        profile.value.difficultyTier = 'intermediate'
      } else if (profile.value.difficultyTier === 'intermediate') {
        profile.value.difficultyTier = 'advanced'
      }
      profile.value.stats.consecutiveWins = 0
    }
    
    // Decrease difficulty after 3 consecutive losses
    if (consecutiveLosses >= 3) {
      if (profile.value.difficultyTier === 'advanced') {
        profile.value.difficultyTier = 'intermediate'
      } else if (profile.value.difficultyTier === 'intermediate') {
        profile.value.difficultyTier = 'beginner'
      }
      profile.value.stats.consecutiveLosses = 0
    }
  }
  
  function updateAccessibilityPreference(
    key: keyof PlayerProfile['accessibility'],
    value: boolean
  ) {
    if (!profile.value) return
    profile.value.accessibility[key] = value
  }
  
  function setLanguage(lang: PlayerProfile['language']) {
    if (!profile.value) return
    profile.value.language = lang
  }
  
  return {
    // State
    profile,
    
    // Computed
    currentDifficulty,
    totalMatches,
    winRate,
    
    // Actions
    initializeProfile,
    recordMatchResult,
    adjustDifficulty,
    updateAccessibilityPreference,
    setLanguage,
  }
})
```

```typescript
// src/stores/session.ts

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SavedSession, GameState } from '@/types/game'

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
const STORAGE_KEY = 'az900-card-clash-session'

export const useSessionStore = defineStore('session', () => {
  // State
  const savedSession = ref<SavedSession | null>(null)
  
  // Actions
  function saveSession(gameState: GameState, playerId: string): boolean {
    try {
      const now = Date.now()
      const session: SavedSession = {
        id: `session-${now}`,
        timestamp: now,
        expiresAt: now + SEVEN_DAYS_MS,
        gameState,
        playerId,
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
      savedSession.value = session
      
      return true
    } catch (error) {
      console.error('Failed to save session:', error)
      return false
    }
  }
  
  function loadSession(): SavedSession | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return null
      
      const session = JSON.parse(stored) as SavedSession
      
      // Check if expired
      if (Date.now() > session.expiresAt) {
        clearSession()
        return null
      }
      
      savedSession.value = session
      return session
    } catch (error) {
      console.error('Failed to load session:', error)
      return null
    }
  }
  
  function clearSession() {
    localStorage.removeItem(STORAGE_KEY)
    savedSession.value = null
  }
  
  function hasValidSession(): boolean {
    const session = loadSession()
    return session !== null
  }
  
  return {
    // State
    savedSession,
    
    // Actions
    saveSession,
    loadSession,
    clearSession,
    hasValidSession,
  }
})
```

## Performance Considerations

### Critical Performance Targets

1. **Validation Response Time: <500ms**
   - Optimized validation algorithms with early exit conditions
   - Card data indexed by synergy tags for fast lookup
   - Validation results cached for identical configurations
   - Web Workers for heavy computations if needed

2. **Initial Load Time: <3 seconds**
   - Code splitting by route (Home, Game, Codex as separate chunks)
   - Lazy loading of card images and heavy components
   - Critical CSS inlined, non-critical deferred
   - Static JSON data preloaded during build

3. **Animation Performance: 60 FPS**
   - CSS transforms and opacity for animations (GPU-accelerated)
   - RequestAnimationFrame for complex animations
   - Reduced motion support for accessibility
   - Virtualized lists for large card collections

### Optimization Techniques

```typescript
// src/utils/performance.ts

/**
 * Debounced validation for real-time feedback
 */
export function createDebouncedValidator(
  validationFn: (...args: any[]) => ValidationResult,
  delay: number = 100
) {
  let timeoutId: number | null = null
  
  return (...args: any[]): Promise<ValidationResult> => {
    return new Promise((resolve) => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
      }
      
      timeoutId = window.setTimeout(() => {
        const result = validationFn(...args)
        resolve(result)
      }, delay)
    })
  }
}

/**
 * Memoized score calculation
 */
export function createMemoizedScorer() {
  const cache = new Map<string, ArchitectureScore>()
  
  return (cards: AzureCard[], scenario: Scenario): ArchitectureScore => {
    const cacheKey = `${scenario.id}-${cards.map(c => c.id).sort().join(',')}`
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!
    }
    
    const score = new ScoringEngine().calculateScore(cards, scenario)
    cache.set(cacheKey, score)
    
    return score
  }
}

/**
 * Lazy load card images
 */
export function lazyLoadImage(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(src)
    img.onerror = reject
    img.src = src
  })
}
```

### Bundle Size Management

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-core': ['vue', 'vue-router', 'pinia'],
          'game-engine': [
            './src/engine/validator',
            './src/engine/scoring',
            './src/engine/evaluator',
          ],
          'ui-components': [
            './src/components/ui/Modal.vue',
            './src/components/ui/Button.vue',
            './src/components/ui/Select.vue',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
})
```

## Error Handling

### Error Boundary Strategy

```typescript
// src/composables/useErrorHandler.ts

import { ref } from 'vue'
import { useToast } from '@/composables/useToast'

export interface AppError {
  code: string
  message: string
  recoverable: boolean
  timestamp: number
}

export function useErrorHandler() {
  const toast = useToast()
  const lastError = ref<AppError | null>(null)
  
  function handleError(error: unknown, context: string): AppError {
    console.error(`Error in ${context}:`, error)
    
    let appError: AppError
    
    if (error instanceof Error) {
      appError = {
        code: 'RUNTIME_ERROR',
        message: error.message,
        recoverable: true,
        timestamp: Date.now(),
      }
    } else {
      appError = {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
        recoverable: true,
        timestamp: Date.now(),
      }
    }
    
    lastError.value = appError
    
    // Show user-friendly error message
    toast.error(appError.message)
    
    return appError
  }
  
  function handleValidationError(violations: ValidationViolation[]): void {
    const primaryViolation = violations[0]
    toast.warning(primaryViolation.message)
  }
  
  function handleSessionError(): void {
    toast.error('Session has expired. Starting new game.')
  }
  
  return {
    lastError,
    handleError,
    handleValidationError,
    handleSessionError,
  }
}
```

### Graceful Degradation

```typescript
// src/utils/featureDetection.ts

export function checkBrowserSupport(): {
  supported: boolean
  missing: string[]
} {
  const missing: string[] = []
  
  // Check LocalStorage
  if (!window.localStorage) {
    missing.push('LocalStorage')
  }
  
  // Check Drag and Drop API
  if (!('draggable' in document.createElement('div'))) {
    missing.push('Drag and Drop')
  }
  
  // Check Web Animations API
  if (!Element.prototype.animate) {
    missing.push('Web Animations')
  }
  
  return {
    supported: missing.length === 0,
    missing,
  }
}

export function setupFallbacks() {
  // Fallback for missing drag and drop: use click-to-place
  // Fallback for missing animations: instant transitions
  // Fallback for missing localStorage: in-memory only
}
```

## Testing Strategy

### Testing Approach

This feature is **suitable for property-based testing** because it involves:
- Game logic with clear input/output behavior (card placements → validation results)
- Scoring algorithms that should satisfy universal properties
- State transformations that maintain invariants

However, certain components are **NOT suitable for PBT**:
- Vue component rendering (use snapshot tests instead)
- UI interactions and layouts (use component tests with Vue Testing Library)
- LocalStorage persistence (use example-based integration tests)

### Test Structure

```typescript
// tests/unit/engine/validator.test.ts
import { describe, it, expect } from 'vitest'
import { ValidationEngine } from '@/engine/validator'

describe('ValidationEngine', () => {
  // Example-based unit tests for specific scenarios
  it('should reject card placement exceeding budget', () => {
    const engine = new ValidationEngine()
    const result = engine.validatePlacement(/* ... */)
    
    expect(result.isValid).toBe(false)
    expect(result.violations).toHaveLength(1)
    expect(result.violations[0].type).toBe('cost-exceeded')
  })
  
  // Edge case tests
  it('should handle empty slot array', () => {
    const engine = new ValidationEngine()
    const result = engine.validatePlacement(card, slot, [], scenario)
    
    expect(result).toBeDefined()
  })
})
```

```typescript
// tests/integration/game-flow.test.ts
import { describe, it, expect } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '@/stores/game'

describe('Game Flow Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  
  it('should complete full game flow', async () => {
    const store = useGameStore()
    
    // Initialize game
    store.initializeGame(mockScenario, 'quick-match')
    expect(store.isGameActive).toBe(true)
    
    // Place cards
    await store.placeCard(mockCard1, mockSlot1)
    await store.placeCard(mockCard2, mockSlot2)
    
    // Submit solution
    store.submitSolution()
    
    // Verify final state
    expect(store.gameState?.status).toBe('complete')
    expect(store.currentScore?.total).toBeGreaterThan(0)
  })
})
```

```typescript
// tests/component/GameBoard.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GameBoard from '@/components/game/GameBoard.vue'

describe('GameBoard Component', () => {
  it('should render architecture slots', () => {
    const wrapper = mount(GameBoard, {
      props: {
        mode: 'quick-match',
      },
    })
    
    const slots = wrapper.findAll('[data-testid="architecture-slot"]')
    expect(slots.length).toBeGreaterThan(0)
  })
  
  it('should emit cardPlaced event on drop', async () => {
    const wrapper = mount(GameBoard, {
      props: { mode: 'quick-match' },
    })
    
    // Simulate drag and drop
    await wrapper.find('[data-testid="card"]').trigger('dragstart')
    await wrapper.find('[data-testid="slot"]').trigger('drop')
    
    expect(wrapper.emitted('cardPlaced')).toBeTruthy()
  })
})
```

### E2E Tests

```typescript
// tests/e2e/quick-match.spec.ts
import { test, expect } from '@playwright/test'

test('complete quick match game', async ({ page }) => {
  await page.goto('/')
  
  // Start quick match
  await page.click('text=3-Minute Commute Mode')
  
  // Wait for game to load
  await expect(page.locator('[data-testid="game-board"]')).toBeVisible()
  
  // Place cards
  await page.dragAndDrop(
    '[data-testid="card-app-service"]',
    '[data-testid="slot-compute"]'
  )
  
  // Submit solution
  await page.click('text=Submit Solution')
  
  // Verify score display
  await expect(page.locator('[data-testid="final-score"]')).toBeVisible()
})

test('keyboard navigation', async ({ page }) => {
  await page.goto('/game')
  
  // Tab through focusable elements
  await page.keyboard.press('Tab')
  await expect(page.locator('[data-testid="card"]:first-child')).toBeFocused()
  
  // Select card with Enter
  await page.keyboard.press('Enter')
  
  // Navigate to slot
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  
  // Verify placement
  await expect(page.locator('[data-testid="placed-card"]')).toBeVisible()
})
```

## Accessibility and Internationalization

### WCAG 2.1 AA Compliance

```vue
<!-- src/components/cards/AzureCard.vue -->
<template>
  <div
    :class="cardClasses"
    role="button"
    :tabindex="isDraggable ? 0 : -1"
    :aria-label="`${card.name}, ${card.domain} domain, cost ${card.cost}`"
    :aria-describedby="`card-${card.id}-description`"
    @keydown.enter="$emit('click', card)"
    @keydown.space.prevent="$emit('click', card)"
  >
    <div class="card-header">
      <h3 class="text-lg font-semibold">{{ card.name }}</h3>
      <span class="text-sm" aria-label="Cost">{{ card.cost }}</span>
    </div>
    
    <p 
      :id="`card-${card.id}-description`"
      class="text-sm text-gray-600"
    >
      {{ card.description }}
    </p>
    
    <div class="card-footer">
      <span 
        class="badge"
        :class="`badge-${card.domain}`"
        role="status"
      >
        {{ domainLabel }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AzureCard } from '@/types/game'

const { t } = useI18n()

const domainLabel = computed(() => {
  const labels = {
    'cloud-concepts': t('domain.cloudConcepts'),
    'azure-services': t('domain.azureServices'),
    'management-governance': t('domain.managementGovernance'),
  }
  return labels[props.card.domain]
})
</script>

<style scoped>
/* High contrast mode support */
@media (prefers-contrast: high) {
  .card {
    border: 2px solid currentColor;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .card {
    transition: none;
  }
}

/* Focus visible styles */
.card:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}
</style>
```

### Internationalization Setup

```typescript
// src/i18n/index.ts
import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zhCN from './locales/zh-CN.json'
import ja from './locales/ja.json'
import es from './locales/es.json'
import de from './locales/de.json'
import fr from './locales/fr.json'

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    'zh-CN': zhCN,
    ja,
    es,
    de,
    fr,
  },
  missingWarn: false,
  fallbackWarn: false,
})

export function setupI18n(app: any) {
  app.use(i18n)
}
```

```json
// src/i18n/locales/en.json
{
  "domain": {
    "cloudConcepts": "Cloud Concepts",
    "azureServices": "Azure Services",
    "managementGovernance": "Management & Governance"
  },
  "game": {
    "placeCard": "Place Card",
    "submitSolution": "Submit Solution",
    "timeRemaining": "Time Remaining: {time}s",
    "score": {
      "highAvailability": "High Availability",
      "costEffectiveness": "Cost Effectiveness",
      "securityCompliance": "Security Compliance",
      "total": "Total Score"
    }
  },
  "validation": {
    "costExceeded": "Budget exceeded by {amount} points",
    "requirementUnmet": "Requirement not met: {requirement}",
    "conflictDetected": "Conflict detected with {card}",
    "antiPattern": "Architecture anti-pattern detected"
  },
  "accessibility": {
    "skipToContent": "Skip to main content",
    "keyboardHint": "Use Tab to navigate, Enter to select",
    "dragHint": "Use Space to pick up, Arrow keys to move, Enter to drop"
  }
}
```

This completes the design document sections: Overview, Architecture, Components and Interfaces, Data Models, Game Engine Logic, State Management, Performance Considerations, Error Handling, and Testing Strategy through Accessibility and Internationalization. 

Now I need to run the prework analysis to determine which acceptance criteria are testable as properties before writing the Correctness Properties section.

<function_calls>
<invoke name="prework">
<parameter name="featureName">azure-az900-card-clash-engine


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Validation completes within performance budget

*For any* card placement validation request (card, slot, current slots, scenario), the validation SHALL complete and return a valid result structure within 500 milliseconds.

**Validates: Requirements 1.1, 1.2**

### Property 2: Invalid placements identify all constraint violations

*For any* card placement that violates one or more scenario constraints, the validation result SHALL include a violation entry for each violated constraint with appropriate error metadata.

**Validates: Requirements 1.2, 2.1**

### Property 3: Valid placements trigger score updates

*For any* valid card placement, the architecture score SHALL be recalculated and the total score SHALL be greater than or equal to the previous score.

**Validates: Requirements 1.3**

### Property 4: Complete solutions provide score breakdown

*For any* completed architecture solution, the final score SHALL include all three components (High Availability 0-100, Cost Effectiveness 0-100, Security Compliance 0-100) and the total SHALL equal their sum (0-300).

**Validates: Requirements 1.4**

### Property 5: Budget violations are correctly calculated

*For any* scenario with a maximum cost constraint, if the total cost of placed cards exceeds the constraint, the validation SHALL report a cost-exceeded violation with the numeric overrun amount equal to (total cost - max cost).

**Validates: Requirements 2.2**

### Property 6: Conflicts prevent score updates

*For any* invalid architecture state (containing constraint violations or conflicts), the architecture score SHALL remain unchanged from the last valid state until all violations are resolved.

**Validates: Requirements 2.4**

### Property 7: Quick match mode enforces time limits

*For any* game session in "3-Minute Commute Mode", the turn timer SHALL be initialized to exactly 45 seconds.

**Validates: Requirements 3.1**

### Property 8: Quick match generates correct scenario count

*For any* "3-Minute Commute Mode" session initialization, exactly 3 scenarios SHALL be generated, and each scenario SHALL require between 3 and 5 card placements inclusive.

**Validates: Requirements 3.2**

### Property 9: Multiplayer scoring is deterministic and bounded

*For any* two player solutions evaluated against the same scenario, both scores SHALL have High Availability, Cost Effectiveness, and Security Compliance components in the range [0, 100], and the total score SHALL be in the range [0, 300].

**Validates: Requirements 4.1**

### Property 10: Higher score determines winner

*For any* two player solutions with different total scores, the player with the higher total score SHALL be declared the winner.

**Validates: Requirements 4.2**

### Property 11: Identical scores result in tie

*For any* two player solutions with identical total scores (within 1 point tolerance), the result SHALL be declared a tie and both players SHALL receive 50 XP.

**Validates: Requirements 4.3**

### Property 12: XP calculation follows formula

*For any* winning player in a multiplayer match, the XP awarded SHALL equal 50 plus the margin of victory (rounded down).

**Validates: Requirements 4.5**

### Property 13: Codex entries are complete

*For any* Azure Service Card, its codex entry SHALL contain an exam definition, service category, at least 2 use cases, and at least 1 best practice recommendation.

**Validates: Requirements 5.2**

### Property 14: Tooltips respect character limit

*For any* Azure Service Card, the quick-reference tooltip SHALL contain no more than 280 characters.

**Validates: Requirements 5.3**

### Property 15: Study deck contains all used cards

*For any* completed scenario, all card IDs from the submitted solution SHALL be present in the player's study deck.

**Validates: Requirements 5.5**

### Property 16: Study deck prevents duplicates

*For any* study deck, no card ID SHALL appear more than once.

**Validates: Requirements 5.6**

### Property 17: Win streak increases difficulty

*For any* player with exactly 3 consecutive single-player wins in a session, if the current difficulty tier is not 'advanced', the difficulty tier SHALL increase by one level.

**Validates: Requirements 6.1**

### Property 18: Loss streak decreases difficulty

*For any* player with exactly 3 consecutive single-player losses in a session, if the current difficulty tier is not 'beginner', the difficulty tier SHALL decrease by one level.

**Validates: Requirements 6.2**

### Property 19: Scenarios match difficulty tier

*For any* game session start, all loaded scenarios SHALL have a difficulty tier matching the player's current difficulty tier.

**Validates: Requirements 6.4**

### Property 20: Session save preserves state

*For any* game state saved to storage, loading that saved session SHALL restore a game state that is structurally equivalent (same deployed cards, same score, same scenario, same time remaining) to the saved state.

**Validates: Requirements 7.1, 7.2**

### Property 21: Session expiration logic

*For any* saved session timestamp, if the current time is more than 7 days (604,800,000 milliseconds) after the save timestamp, the session SHALL be marked as expired.

**Validates: Requirements 7.3**

### Property 22: Translation completeness per language

*For any* supported language (English, Simplified Chinese, Japanese, Spanish, German, French), all required translation keys SHALL exist in the language file.

**Validates: Requirements 8.3**

### Property 23: Missing translations fallback to English

*For any* text element with a missing translation key in the selected language, the displayed text SHALL be the English translation and the missing key SHALL be logged.

**Validates: Requirements 8.5**



## Security and Privacy

### Data Security

**Client-Side Data Protection**
- All game data stored in LocalStorage and IndexedDB
- No personally identifiable information collected beyond display name
- Study deck and progress data isolated per browser/device
- No third-party analytics or tracking

**Input Validation**
- All user inputs sanitized before display (display name, custom text)
- XSS prevention through Vue's template escaping
- No eval() or dynamic code execution
- Content Security Policy headers enforced

### Privacy Considerations

**Data Collection**
- No server-side data collection (static web app)
- No authentication required for single-player mode
- Multiplayer mode uses ephemeral session IDs (no personal data)
- Optional display name stored locally only

**Data Retention**
- Game sessions expire after 7 days automatically
- User can manually clear all data via settings
- No data transmitted outside the browser
- No cookies used (LocalStorage only)

## Deployment Architecture

### Azure Static Web Apps Deployment

```yaml
# staticwebapp.config.json
{
  "routes": [
    {
      "route": "/",
      "rewrite": "/index.html"
    },
    {
      "route": "/assets/*",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    }
  ],
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/assets/*", "/*.json"]
  },
  "globalHeaders": {
    "content-security-policy": "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:",
    "x-frame-options": "DENY",
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin"
  },
  "mimeTypes": {
    ".json": "application/json",
    ".woff2": "font/woff2"
  }
}
```

### Build Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Azure Static Web Apps

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Run tests
        run: npm run test:unit
      
      - name: Build
        run: npm run build
        env:
          NODE_ENV: production
      
      - name: Deploy to Azure Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: ""
          output_location: "dist"
```

### Environment Configuration

```typescript
// src/config/environment.ts
export const config = {
  production: {
    cdnUrl: 'https://cdn.azurestaticapps.net',
    enableAnalytics: false,
    logLevel: 'error',
  },
  development: {
    cdnUrl: '',
    enableAnalytics: false,
    logLevel: 'debug',
  },
}

export function getConfig() {
  return import.meta.env.PROD ? config.production : config.development
}
```

## Monitoring and Observability

### Error Tracking

```typescript
// src/utils/monitoring.ts
export interface ErrorEvent {
  message: string
  stack?: string
  context: string
  timestamp: number
  userAgent: string
}

export function logError(error: Error, context: string) {
  const errorEvent: ErrorEvent = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
  }
  
  // Log to console in development
  if (import.meta.env.DEV) {
    console.error('Error tracked:', errorEvent)
  }
  
  // Store errors locally for debugging
  const errors = JSON.parse(localStorage.getItem('error-log') || '[]')
  errors.push(errorEvent)
  
  // Keep only last 50 errors
  if (errors.length > 50) {
    errors.shift()
  }
  
  localStorage.setItem('error-log', JSON.stringify(errors))
}

export function logPerformance(metric: string, duration: number) {
  if (import.meta.env.DEV) {
    console.log(`[Performance] ${metric}: ${duration}ms`)
  }
  
  // Track performance metrics
  const metrics = JSON.parse(sessionStorage.getItem('perf-metrics') || '[]')
  metrics.push({ metric, duration, timestamp: Date.now() })
  sessionStorage.setItem('perf-metrics', JSON.stringify(metrics))
}
```

### Performance Monitoring

```typescript
// src/utils/performanceMonitor.ts
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map()
  
  start(label: string) {
    this.marks.set(label, performance.now())
  }
  
  end(label: string): number {
    const startTime = this.marks.get(label)
    if (!startTime) {
      console.warn(`No start mark for ${label}`)
      return 0
    }
    
    const duration = performance.now() - startTime
    this.marks.delete(label)
    
    logPerformance(label, duration)
    
    return duration
  }
  
  measure(label: string, fn: () => void): number {
    this.start(label)
    fn()
    return this.end(label)
  }
  
  async measureAsync(label: string, fn: () => Promise<void>): Promise<number> {
    this.start(label)
    await fn()
    return this.end(label)
  }
}

export const perfMonitor = new PerformanceMonitor()
```

## Future Enhancements

### Phase 2 Features (Post-MVP)

1. **Multiplayer Real-Time Mode**
   - WebSocket-based live matches
   - Spectator mode
   - Tournament brackets

2. **Advanced Learning Features**
   - Progress tracking dashboard
   - Personalized card recommendations
   - AZ-900 exam readiness assessment

3. **Social Features**
   - Friend challenges
   - Leaderboards (global, regional, friends)
   - Share solutions on social media

4. **Content Expansion**
   - Additional scenario types (Hybrid Cloud, IoT, AI/ML)
   - Seasonal events and limited-time scenarios
   - Community-created scenarios

5. **Mobile Native Apps**
   - iOS and Android apps with native performance
   - Offline mode with sync capability
   - Push notifications for challenges

### Technical Debt Considerations

1. **Scalability**
   - Current design is client-only (no backend)
   - Multiplayer requires WebSocket server for real-time features
   - Consider Azure Functions + SignalR for future multiplayer

2. **Testing Coverage**
   - Target 80% code coverage for game engine
   - Add visual regression tests for card rendering
   - E2E tests for all critical user flows

3. **Accessibility Audit**
   - Third-party WCAG audit before public launch
   - Screen reader user testing
   - Keyboard-only user testing

4. **Performance Budget**
   - Monitor bundle size (target: <500KB initial load)
   - Lighthouse score: 90+ for all categories
   - Core Web Vitals: all "Good" thresholds

## Appendix

### Card Data Example

```json
// src/data/cards/azure-services.json
{
  "cards": [
    {
      "id": "as-app-service",
      "name": "Azure App Service",
      "domain": "azure-services",
      "cost": 5,
      "synergyTags": ["compute", "paas", "web", "scaling"],
      "az900ExamTip": "PaaS for web apps with built-in scaling and DevOps integration",
      "description": "Fully managed platform for building and hosting web applications",
      "power": 70,
      "conflicts": ["as-vm-windows"]
    }
  ]
}
```

### Scenario Data Example

```json
// src/data/scenarios/startup-scaling.json
{
  "scenarios": [
    {
      "id": "startup-mvp",
      "title": "Startup MVP Launch",
      "description": "Launch a minimum viable product with room to scale",
      "requirements": [
        {
          "type": "service",
          "value": "web",
          "weight": 100,
          "description": "Host a web application"
        },
        {
          "type": "service",
          "value": "database",
          "weight": 80,
          "description": "Store user data reliably"
        }
      ],
      "constraints": {
        "maxCost": 20,
        "minAvailability": 99.9,
        "securityLevel": "standard"
      },
      "maxRounds": 5,
      "difficulty": "beginner",
      "category": "startup-scaling"
    }
  ]
}
```

### Codex Entry Example

```json
// src/data/codex/app-service.json
{
  "cardId": "as-app-service",
  "examDefinition": "Azure App Service is a fully managed platform for building, deploying, and scaling web apps. It provides built-in infrastructure maintenance, security patching, and scaling capabilities.",
  "useCases": [
    "Hosting web applications and REST APIs",
    "Mobile app backends",
    "Microservices architectures"
  ],
  "bestPractices": [
    "Use deployment slots for zero-downtime deployments",
    "Enable auto-scaling for variable workloads",
    "Integrate with Azure Application Insights for monitoring"
  ],
  "relatedServices": [
    "as-sql-database",
    "as-storage-blob",
    "as-application-insights"
  ],
  "resources": [
    {
      "title": "Azure App Service Documentation",
      "url": "https://learn.microsoft.com/azure/app-service/",
      "type": "documentation"
    },
    {
      "title": "AZ-900: Azure App Service",
      "url": "https://learn.microsoft.com/training/modules/azure-compute-fundamentals/",
      "type": "microsoft-learn"
    }
  ]
}
```

### Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend Framework | Vue 3 | Specified in tech stack guide; excellent for component-driven UI |
| Type System | TypeScript 5.0+ strict | Specified in tech stack guide; prevents runtime errors |
| State Management | Pinia | Specified in tech stack guide; simpler than Vuex, great TypeScript support |
| Styling | Tailwind CSS | Specified in tech stack guide; rapid prototyping, consistent design |
| Testing Framework | Vitest | Fast, Vite-native, excellent Vue integration |
| Component Library | Radix Vue | Headless, accessible, customizable with Tailwind |
| Build Tool | Vite | Fast HMR, optimized production builds, Vue 3 recommended |
| Deployment | Azure Static Web Apps | Global CDN, automatic SSL, native Azure integration |
| I18n | Vue I18n | Standard Vue localization solution, full TypeScript support |

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Authors**: Azure AZ-900 Card Clash Engine Team  
**Status**: Design Complete - Ready for Implementation
