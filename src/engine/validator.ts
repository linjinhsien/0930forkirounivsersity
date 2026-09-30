import type {
  AzureCard,
  ArchitectureSlot,
  Scenario,
  ValidationResult,
  ValidationViolation,
} from '@/types/game'
import type { IValidationEngine } from '@/types/engine'

const SLOT_COMPATIBLE_TAGS: Record<ArchitectureSlot['type'], readonly string[]> = {
  compute: ['compute', 'serverless', 'container'],
  storage: ['storage', 'blob', 'disk', 'files'],
  network: ['network', 'connectivity', 'vpn'],
  security: ['security', 'identity', 'encryption'],
  governance: ['governance', 'compliance', 'policy'],
  any: [],
}

export class ValidationEngine implements IValidationEngine {
  validatePlacement(
    card: AzureCard,
    slot: ArchitectureSlot,
    currentSlots: ArchitectureSlot[],
    scenario: Scenario
  ): ValidationResult {
    const startTime = performance.now()
    const violations: ValidationViolation[] = []
    const placedCards = currentSlots.flatMap((currentSlot) =>
      currentSlot.card ? [currentSlot.card] : []
    )

    if (!this.isSlotTypeCompatible(card, slot)) {
      violations.push({
        type: 'requirement-unmet',
        message: `${card.name} cannot be placed in ${slot.type} slot`,
      })
    }

    const totalCost = this.calculateTotalCost(placedCards) + card.cost
    const maxCost = scenario.constraints.maxCost
    if (maxCost !== undefined && totalCost > maxCost) {
      const overrun = totalCost - maxCost
      violations.push({
        type: 'cost-exceeded',
        message: `Budget exceeded by ${overrun} points`,
        numericDetail: overrun,
      })
    }

    const unmetRequirements = this.checkRequirements(card, placedCards)
    if (unmetRequirements.length > 0) {
      violations.push({
        type: 'requirement-unmet',
        message: `${card.name} requires: ${unmetRequirements.join(', ')}`,
      })
    }

    const conflicts = this.detectConflicts(card, placedCards)
    if (conflicts.length > 0) {
      violations.push({
        type: 'conflict-detected',
        message: `${card.name} conflicts with: ${conflicts.map(({ name }) => name).join(', ')}`,
      })
    }

    violations.push(...this.detectAntiPatterns(card, placedCards, scenario))

    const elapsedTime = performance.now() - startTime
    if (elapsedTime > 500) {
      console.warn(`Validation took ${elapsedTime.toFixed(2)}ms - exceeds 500ms target`)
    }

    return {
      isValid: violations.length === 0,
      timestamp: Date.now(),
      violations,
      suggestions:
        violations.length > 0
          ? this.getSuggestions(card, scenario, placedCards, currentSlots.flatMap((item) => item.card ? [] : []))
          : undefined,
    }
  }

  /**
   * Checks whether the card's semantic tags match the architecture slot.
   */
  isSlotTypeCompatible(card: AzureCard, slot: ArchitectureSlot): boolean {
    if (slot.type === 'any') return true
    const compatibleTags = SLOT_COMPATIBLE_TAGS[slot.type]
    return card.synergyTags.some((tag) => compatibleTags.includes(tag))
  }

  /**
   * Returns card IDs for prerequisites that are not currently deployed.
   */
  checkRequirements(card: AzureCard, placedCards: AzureCard[]): string[] {
    if (!card.requirements?.length) return []

    const placedCardIds = new Set(placedCards.map(({ id }) => id))
    return card.requirements.filter((requiredId) => !placedCardIds.has(requiredId))
  }

  /**
   * Finds cards that explicitly conflict with the proposed card.
   * Conflict declarations are treated as symmetric so either card can declare the conflict.
   */
  detectConflicts(card: AzureCard, placedCards: AzureCard[]): AzureCard[] {
    const declaredConflicts = new Set(card.conflicts ?? [])
    return placedCards.filter(
      (placedCard) =>
        declaredConflicts.has(placedCard.id) || (placedCard.conflicts ?? []).includes(card.id)
    )
  }

  /**
   * Detects architecture anti-patterns described by the game design.
   */
  detectAntiPatterns(
    card: AzureCard,
    placedCards: AzureCard[],
    scenario: Scenario
  ): ValidationViolation[] {
    const violations: ValidationViolation[] = []

    const hasSecurity = placedCards.some((placedCard) =>
      placedCard.synergyTags.includes('security')
    )

    if (
      scenario.constraints.securityLevel === 'premium' &&
      card.synergyTags.includes('storage') &&
      !hasSecurity
    ) {
      violations.push({
        type: 'anti-pattern',
        message: 'High-compliance scenarios require security controls for storage',
        principle: 'Security by Default',
      })
    }

    if (
      card.synergyTags.includes('iaas') &&
      scenario.category === 'startup-scaling' &&
      !scenario.requirements.some((requirement) => requirement.value === 'custom-os')
    ) {
      violations.push({
        type: 'anti-pattern',
        message: 'Consider PaaS services for faster time-to-market in startup scenarios',
        principle: 'Platform as a Service First',
      })
    }

    if (
      scenario.constraints.minAvailability !== undefined &&
      scenario.constraints.minAvailability >= 99.99 &&
      !placedCards.some((placedCard) => placedCard.synergyTags.includes('multi-region')) &&
      !card.synergyTags.includes('multi-region')
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
   * Suggests alternatives from the supplied available-card pool.
   */
  getSuggestions(
    card: AzureCard,
    scenario: Scenario,
    placedCards: AzureCard[],
    availableCards: AzureCard[]
  ): AzureCard[] {
    const candidates = availableCards.filter(
      (candidate) => candidate.id !== card.id && !placedCards.some(({ id }) => id === candidate.id)
    )

    const hasCustomOsRequirement = scenario.requirements.some(
      (requirement) => requirement.value === 'custom-os'
    )

    return candidates
      .filter((candidate) => {
        if (candidate.conflicts?.includes(card.id) || card.conflicts?.includes(candidate.id)) {
          return false
        }

        if (scenario.constraints.maxCost !== undefined) {
          const currentCost = this.calculateTotalCost(placedCards)
          if (currentCost + candidate.cost > scenario.constraints.maxCost) return false
        }

        if (
          scenario.category === 'startup-scaling' &&
          candidate.synergyTags.includes('iaas') &&
          !hasCustomOsRequirement
        ) {
          return candidate.synergyTags.includes('paas') || candidate.synergyTags.includes('serverless')
        }

        if (
          scenario.constraints.securityLevel === 'premium' &&
          card.synergyTags.includes('storage')
        ) {
          return candidate.synergyTags.includes('security') || candidate.synergyTags.includes('encryption')
        }

        if (
          scenario.constraints.minAvailability !== undefined &&
          scenario.constraints.minAvailability >= 99.99
        ) {
          return candidate.synergyTags.includes('multi-region')
        }

        return candidate.synergyTags.some((tag) => card.synergyTags.includes(tag))
      })
      .slice(0, 5)
  }

  private calculateTotalCost(cards: AzureCard[]): number {
    return cards.reduce((total, currentCard) => total + currentCard.cost, 0)
  }
}
