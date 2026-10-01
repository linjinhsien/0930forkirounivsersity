import type { ArchitectureSlot, ArchitectureScore, GameState } from '@/types/game'
import { mockStartupScenario } from './scenarios'
import { allMockCards } from './cards'

export const emptyScore: ArchitectureScore = {
  highAvailability: 0,
  costEffectiveness: 0,
  securityCompliance: 0,
  total: 0,
  breakdown: {
    requirementsMet: 0,
    totalRequirements: mockStartupScenario.requirements.length,
    costUtilization: 0,
    synergyBonuses: [],
    penalties: [],
  },
}

export function createMockSlots(cards: ArchitectureSlot['card'][] = []): ArchitectureSlot[] {
  const definitions: Array<ArchitectureSlot['type']> = [
    'compute',
    'storage',
    'network',
    'security',
    'governance',
    'any',
  ]

  return definitions.map((type, index) => ({
    id: `fixture-slot-${index + 1}`,
    position: { x: index % 3, y: Math.floor(index / 3) },
    type,
    card: cards[index] ?? null,
    required: index < 4,
  }))
}

export function createMockGameState(overrides: Partial<GameState> = {}): GameState {
  const deck = [...allMockCards]
  const hand = deck.slice(0, 4)

  return {
    currentScenario: mockStartupScenario,
    deck,
    hand,
    slots: createMockSlots(),
    round: 1,
    score: {
      ...emptyScore,
      breakdown: { ...emptyScore.breakdown },
    },
    mode: 'quick-match',
    timeRemaining: 45,
    status: 'playing',
    ...overrides,
  }
}

export const mockGameState = createMockGameState()
