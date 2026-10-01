import { describe, expect, it } from 'vitest'
import startup from '@/data/scenarios/startup-scaling.json'
import enterprise from '@/data/scenarios/enterprise-migration.json'
import compliance from '@/data/scenarios/high-compliance.json'
import analytics from '@/data/scenarios/real-time-analytics.json'
import { assertValidScenario } from '../../helpers/assertions'

describe('scenario database', () => {
  it('contains the four Phase 2 scenario categories', () => {
    expect(startup.scenarios.length).toBeGreaterThanOrEqual(4)
    expect(enterprise.scenarios.length).toBeGreaterThanOrEqual(4)
    expect(compliance.scenarios.length).toBeGreaterThanOrEqual(4)
    expect(analytics.scenarios.length).toBeGreaterThanOrEqual(2)
  })

  it('has unique scenario IDs across all categories', () => {
    const scenarios = [
      ...startup.scenarios,
      ...enterprise.scenarios,
      ...compliance.scenarios,
      ...analytics.scenarios,
    ]
    const ids = scenarios.map((scenario) => scenario.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keeps scenario records compatible with the domain model', () => {
    const scenarios = [
      ...startup.scenarios,
      ...enterprise.scenarios,
      ...compliance.scenarios,
      ...analytics.scenarios,
    ]

    for (const scenario of scenarios) {
      assertValidScenario(scenario)
      expect(scenario.requirements.length).toBeGreaterThan(0)
      expect(scenario.maxRounds).toBeGreaterThan(0)
      expect(scenario.constraints.maxCost).toBeGreaterThan(0)
    }
  })
})
