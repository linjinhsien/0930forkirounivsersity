import type { Scenario } from '@/types/game'

export const mockStartupScenario: Scenario = {
  id: 'fixture-startup',
  title: 'Fixture Startup Scenario',
  description: 'A deterministic scenario for unit and integration tests.',
  requirements: [
    {
      type: 'service',
      value: 'compute',
      weight: 100,
      description: 'Provide compute capacity',
    },
    {
      type: 'concept',
      value: 'scalability',
      weight: 80,
      description: 'Support horizontal scaling',
    },
  ],
  constraints: {
    maxCost: 20,
    minAvailability: 99.9,
    securityLevel: 'basic',
  },
  maxRounds: 5,
  difficulty: 'beginner',
  category: 'startup-scaling',
}

export const mockPremiumScenario: Scenario = {
  ...mockStartupScenario,
  id: 'fixture-premium',
  title: 'Fixture Premium Scenario',
  constraints: {
    maxCost: 30,
    minAvailability: 99.99,
    securityLevel: 'premium',
  },
  difficulty: 'advanced',
  category: 'high-compliance',
}

export const mockMultiplayerScenario: Scenario = {
  ...mockStartupScenario,
  id: 'fixture-multiplayer',
  title: 'Fixture Multiplayer Scenario',
  difficulty: 'intermediate',
  category: 'enterprise-migration',
}

export const mockScenarios: Scenario[] = [
  mockStartupScenario,
  mockPremiumScenario,
  mockMultiplayerScenario,
]

export function createMockScenario(overrides: Partial<Scenario> = {}): Scenario {
  return {
    ...mockStartupScenario,
    ...overrides,
    requirements: overrides.requirements ?? mockStartupScenario.requirements.map((requirement) => ({ ...requirement })),
    constraints: { ...mockStartupScenario.constraints, ...(overrides.constraints ?? {}) },
  }
}
