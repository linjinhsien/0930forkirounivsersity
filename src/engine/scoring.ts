/**
 * Scoring Engine — Azure AZ-900 Card Clash Engine
 *
 * Calculates three-dimensional architecture scores (HA, cost, security)
 * for a player's placed cards against a scenario.
 */

import type { AzureCard, Scenario, ArchitectureScore, ScoreBreakdown } from '@/types/game'
import type { IScoringEngine } from '@/types/engine'

/** Clamps a numeric value to the inclusive [min, max] range. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * Returns all synergyTags that appear on two or more cards.
 */
function findSynergyTags(cards: AzureCard[]): string[] {
  const tagCount = new Map<string, number>()
  for (const card of cards) {
    for (const tag of card.synergyTags) {
      tagCount.set(tag, (tagCount.get(tag) ?? 0) + 1)
    }
  }
  return Array.from(tagCount.entries())
    .filter(([, count]) => count >= 2)
    .map(([tag]) => tag)
}

/** Returns true if any card in the array carries the given tag. */
function hasTag(cards: AzureCard[], tag: string): boolean {
  return cards.some((c) => c.synergyTags.includes(tag))
}

export class ScoringEngine implements IScoringEngine {
  // ─── High Availability ──────────────────────────────────────────────────────

  calculateHighAvailabilityScore(
    cards: AzureCard[],
    scenario: Scenario
  ): { score: number; details: string[] } {
    const details: string[] = []
    let score = 0

    // +15 per card with 'ha' or 'availability-zone' tag
    for (const card of cards) {
      if (card.synergyTags.includes('ha') || card.synergyTags.includes('availability-zone')) {
        score += 15
        details.push(`+15 HA/availability-zone tag: ${card.name}`)
      }
    }

    // +10 for multi-region tag
    if (hasTag(cards, 'multi-region')) {
      score += 10
      details.push('+10 multi-region tag present')
    }

    // +8 for load-balancer tag
    if (hasTag(cards, 'load-balancer')) {
      score += 8
      details.push('+8 load-balancer tag present')
    }

    // +10 for backup/recovery tag
    if (hasTag(cards, 'backup') || hasTag(cards, 'recovery')) {
      score += 10
      details.push('+10 backup/recovery tag present')
    }

    // +5 per managed service (paas or serverless tag)
    for (const card of cards) {
      if (card.synergyTags.includes('paas') || card.synergyTags.includes('serverless')) {
        score += 5
        details.push(`+5 managed service (paas/serverless): ${card.name}`)
      }
    }

    // -20 penalty if no HA cards and minAvailability >= 99.9
    const hasHACard = cards.some(
      (c) => c.synergyTags.includes('ha') || c.synergyTags.includes('availability-zone')
    )
    const minAvail = scenario.constraints.minAvailability ?? 0
    if (!hasHACard && minAvail >= 99.9) {
      score -= 20
      details.push('-20 penalty: no HA cards but scenario requires ≥99.9% availability')
    }

    return { score: clamp(score, 0, 100), details }
  }

  // ─── Cost Effectiveness ──────────────────────────────────────────────────────

  calculateCostEffectivenessScore(
    cards: AzureCard[],
    scenario: Scenario
  ): { score: number; details: string[] } {
    const details: string[] = []

    const totalCost = cards.reduce((sum, c) => sum + c.cost, 0)
    const maxCost = scenario.constraints.maxCost ?? 100
    const utilRatio = maxCost > 0 ? totalCost / maxCost : 0

    let score: number

    if (utilRatio >= 0.7 && utilRatio <= 0.9) {
      score = 100
      details.push(`100 pts: optimal cost utilisation (${(utilRatio * 100).toFixed(1)}%)`)
    } else if (utilRatio > 0.9) {
      score = Math.max(0, 100 - (utilRatio - 0.9) * 500)
      details.push(
        `${score.toFixed(1)} pts: over-budget penalty (utilisation ${(utilRatio * 100).toFixed(1)}%)`
      )
    } else {
      score = (utilRatio / 0.7) * 80
      details.push(
        `${score.toFixed(1)} pts: under-budget (utilisation ${(utilRatio * 100).toFixed(1)}%)`
      )
    }

    // +10 bonus for paas or serverless tag
    if (hasTag(cards, 'paas') || hasTag(cards, 'serverless')) {
      score += 10
      details.push('+10 managed service efficiency bonus (paas/serverless)')
    }

    // +5 bonus for reserved tag
    if (hasTag(cards, 'reserved')) {
      score += 5
      details.push('+5 reserved capacity discount bonus')
    }

    return { score: clamp(score, 0, 100), details }
  }

  // ─── Security & Compliance ───────────────────────────────────────────────────

  calculateSecurityComplianceScore(
    cards: AzureCard[],
    scenario: Scenario
  ): { score: number; details: string[] } {
    const details: string[] = []
    let score = 0
    let hasSecurityCard = false

    // +20 identity/entra
    if (hasTag(cards, 'identity') || hasTag(cards, 'entra')) {
      score += 20
      hasSecurityCard = true
      details.push('+20 identity/entra tag present')
    }

    // +15 encryption
    if (hasTag(cards, 'encryption')) {
      score += 15
      hasSecurityCard = true
      details.push('+15 encryption tag present')
    }

    // +15 network security (nsg or firewall)
    if (hasTag(cards, 'nsg') || hasTag(cards, 'firewall')) {
      score += 15
      hasSecurityCard = true
      details.push('+15 network security (nsg/firewall) tag present')
    }

    // +15 governance/policy
    if (hasTag(cards, 'governance') || hasTag(cards, 'policy')) {
      score += 15
      hasSecurityCard = true
      details.push('+15 governance/policy tag present')
    }

    // +10 monitoring
    if (hasTag(cards, 'monitoring')) {
      score += 10
      hasSecurityCard = true
      details.push('+10 monitoring tag present')
    }

    // +10 backup
    if (hasTag(cards, 'backup')) {
      score += 10
      hasSecurityCard = true
      details.push('+10 backup tag present')
    }

    // -30 penalty for premium security level with no security cards
    if (scenario.constraints.securityLevel === 'premium' && !hasSecurityCard) {
      score -= 30
      details.push('-30 penalty: premium security scenario but no security cards placed')
    }

    return { score: clamp(score, 0, 100), details }
  }

  // ─── Aggregate Score ─────────────────────────────────────────────────────────

  calculateScore(placedCards: AzureCard[], scenario: Scenario): ArchitectureScore {
    const { score: haScore } = this.calculateHighAvailabilityScore(placedCards, scenario)
    const { score: costScore } = this.calculateCostEffectivenessScore(placedCards, scenario)
    const { score: secScore } = this.calculateSecurityComplianceScore(placedCards, scenario)

    const breakdown = this.createBreakdown(placedCards, scenario, haScore, costScore, secScore)

    return {
      highAvailability: haScore,
      costEffectiveness: costScore,
      securityCompliance: secScore,
      total: haScore + costScore + secScore,
      breakdown,
    }
  }

  // ─── Breakdown ───────────────────────────────────────────────────────────────

  createBreakdown(
    cards: AzureCard[],
    scenario: Scenario,
    ha: number,
    cost: number,
    sec: number
  ): ScoreBreakdown {
    // Requirements met: a requirement is met when a placed card's synergyTags
    // contains the requirement value OR the card's domain equals the value.
    const requirementsMet = scenario.requirements.filter((req) =>
      cards.some((card) => card.synergyTags.includes(req.value) || card.domain === req.value)
    ).length

    const totalCost = cards.reduce((sum, c) => sum + c.cost, 0)
    const maxCost = scenario.constraints.maxCost ?? 100
    const costUtilization = Math.round((totalCost / maxCost) * 100)

    const synergyBonuses = findSynergyTags(cards)

    // Collect penalty descriptions from all three dimensions
    const penalties: string[] = []

    const { details: haDetails } = this.calculateHighAvailabilityScore(cards, scenario)
    for (const d of haDetails) {
      if (d.startsWith('-')) penalties.push(d)
    }

    const { details: costDetails } = this.calculateCostEffectivenessScore(cards, scenario)
    for (const d of costDetails) {
      if (d.startsWith('-') || d.includes('over-budget') || d.includes('under-budget')) {
        // only push negative/suboptimal entries
        if (d.startsWith('-')) penalties.push(d)
      }
    }

    const { details: secDetails } = this.calculateSecurityComplianceScore(cards, scenario)
    for (const d of secDetails) {
      if (d.startsWith('-')) penalties.push(d)
    }

    // Suppress unused parameter warnings — ha/cost/sec are accepted for
    // potential future use (e.g., threshold-based penalty descriptions).
    void ha
    void cost
    void sec

    return {
      requirementsMet,
      totalRequirements: scenario.requirements.length,
      costUtilization,
      synergyBonuses,
      penalties,
    }
  }
}
