/**
 * Game-specific helper utilities for Playwright E2E tests
 *
 * Provides reusable functions for common game interactions,
 * assertions, and test setup operations.
 */

import { Page, expect } from '@playwright/test'

/**
 * Mock card data for testing
 */
export interface MockCard {
  id: string
  name: string
  domain: 'cloud-concepts' | 'azure-services' | 'management-governance'
  cost: number
}

/**
 * Mock scenario data for testing
 */
export interface MockScenario {
  id: string
  title: string
  description: string
  maxCost: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

/**
 * Game interaction helpers
 */
export class GameHelpers {
  constructor(private page: Page) {}

  /**
   * Drag and drop a card onto an architecture slot
   */
  async dragCardToSlot(cardId: string, slotId: string): Promise<void> {
    const card = this.page.locator(`[data-testid="card-${cardId}"]`)
    const slot = this.page.locator(`[data-testid="slot-${slotId}"]`)

    await card.hover()
    await this.page.mouse.down()
    await slot.hover()
    await this.page.mouse.up()

    // Wait for animation to complete
    await this.page.waitForTimeout(500)
  }

  /**
   * Place a card using keyboard navigation
   */
  async placeCardWithKeyboard(cardId: string, slotId: string): Promise<void> {
    // Focus on the card
    await this.page.locator(`[data-testid="card-${cardId}"]`).focus()

    // Press Enter to pick up card
    await this.page.keyboard.press('Enter')

    // Navigate to slot (implementation depends on layout)
    await this.page.locator(`[data-testid="slot-${slotId}"]`).focus()

    // Press Enter to place
    await this.page.keyboard.press('Enter')

    await this.page.waitForTimeout(500)
  }

  /**
   * Remove a card from a slot
   */
  async removeCard(slotId: string): Promise<void> {
    const slot = this.page.locator(`[data-testid="slot-${slotId}"]`)
    const removeButton = slot.locator('[data-testid="remove-card-button"]')

    await removeButton.click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Submit the current solution
   */
  async submitSolution(): Promise<void> {
    await this.page.locator('[data-testid="submit-solution-button"]').click()

    // Wait for evaluation to complete
    await expect(this.page.locator('[data-testid="evaluation-complete"]')).toBeVisible({
      timeout: 10000,
    })
  }

  /**
   * Get current architecture score
   */
  async getArchitectureScore(): Promise<{
    highAvailability: number
    costEffectiveness: number
    securityCompliance: number
    total: number
  }> {
    const haScore = await this.page.locator('[data-testid="score-ha"]').getAttribute('data-value')
    const costScore = await this.page
      .locator('[data-testid="score-cost"]')
      .getAttribute('data-value')
    const securityScore = await this.page
      .locator('[data-testid="score-security"]')
      .getAttribute('data-value')
    const totalScore = await this.page
      .locator('[data-testid="score-total"]')
      .getAttribute('data-value')

    return {
      highAvailability: parseInt(haScore || '0', 10),
      costEffectiveness: parseInt(costScore || '0', 10),
      securityCompliance: parseInt(securityScore || '0', 10),
      total: parseInt(totalScore || '0', 10),
    }
  }

  /**
   * Check if validation error is displayed
   */
  async hasValidationError(): Promise<boolean> {
    const errorElement = this.page.locator('[data-testid="validation-error"]')
    return await errorElement.isVisible()
  }

  /**
   * Get validation error message
   */
  async getValidationErrorMessage(): Promise<string> {
    const errorElement = this.page.locator('[data-testid="validation-error-message"]')
    return (await errorElement.textContent()) || ''
  }

  /**
   * Wait for timer to count down to specific time
   */
  async waitForTimer(seconds: number): Promise<void> {
    await expect(this.page.locator('[data-testid="timer-display"]')).toContainText(
      `00:${seconds.toString().padStart(2, '0')}`,
      { timeout: 60000 }
    )
  }

  /**
   * Check if a card is in the study deck
   */
  async isCardInStudyDeck(cardId: string): Promise<boolean> {
    await this.page.goto('/#/codex')
    await this.page.waitForLoadState('networkidle')

    const studyDeckTab = this.page.locator('[data-testid="study-deck-tab"]')
    await studyDeckTab.click()

    const card = this.page.locator(`[data-testid="study-deck-card-${cardId}"]`)
    return await card.isVisible()
  }
}

/**
 * Accessibility testing helpers
 */
export class AccessibilityHelpers {
  constructor(private page: Page) {}

  /**
   * Test keyboard navigation through all interactive elements
   */
  async testKeyboardNavigation(): Promise<void> {
    // Get all focusable elements
    const focusableElements = await this.page.locator(
      'button:visible, a:visible, input:visible, [tabindex]:visible'
    )

    const count = await focusableElements.count()

    // Tab through all elements
    for (let i = 0; i < count; i++) {
      await this.page.keyboard.press('Tab')

      // Verify focus indicator is visible
      const focused = await this.page.evaluateHandle(() => document.activeElement)
      await expect(focused).toBeTruthy()
    }
  }

  /**
   * Check ARIA labels and roles
   */
  async verifyAriaLabels(selector: string, expectedRole: string): Promise<void> {
    const element = this.page.locator(selector)

    const role = await element.getAttribute('role')
    expect(role).toBe(expectedRole)

    const ariaLabel = await element.getAttribute('aria-label')
    expect(ariaLabel).toBeTruthy()
  }

  /**
   * Test focus trap in modal
   */
  async testModalFocusTrap(modalSelector: string): Promise<void> {
    const modal = this.page.locator(modalSelector)
    await expect(modal).toBeVisible()

    // Get first and last focusable elements in modal
    const firstFocusable = modal.locator('button, a, input').first()
    const lastFocusable = modal.locator('button, a, input').last()

    // Focus last element and press Tab (should cycle to first)
    await lastFocusable.focus()
    await this.page.keyboard.press('Tab')

    const focused = await this.page.evaluateHandle(() => document.activeElement)
    const firstElement = await firstFocusable.elementHandle()

    // Verify focus returned to first element
    expect(await focused.asElement()).toBe(firstElement)
  }

  /**
   * Verify color contrast meets WCAG AA standards (4.5:1)
   */
  async checkColorContrast(selector: string): Promise<boolean> {
    const element = this.page.locator(selector)

    const contrast = await element.evaluate((el) => {
      const style = window.getComputedStyle(el)
      const bgColor = style.backgroundColor
      const textColor = style.color

      // Simple contrast calculation (simplified for demonstration)
      // In production, use a proper contrast calculation library
      const bg = bgColor.match(/\d+/g)?.map(Number) || [255, 255, 255]
      const text = textColor.match(/\d+/g)?.map(Number) || [0, 0, 0]

      const bgLuminance = 0.299 * bg[0] + 0.587 * bg[1] + 0.114 * bg[2]
      const textLuminance = 0.299 * text[0] + 0.587 * text[1] + 0.114 * text[2]

      const lighter = Math.max(bgLuminance, textLuminance)
      const darker = Math.min(bgLuminance, textLuminance)

      return (lighter + 0.05) / (darker + 0.05)
    })

    return contrast >= 4.5
  }
}

/**
 * Mock data generators
 */
export class MockDataHelpers {
  /**
   * Generate mock card data
   */
  static createMockCard(overrides?: Partial<MockCard>): MockCard {
    return {
      id: `card-${Date.now()}`,
      name: 'Test Azure Service',
      domain: 'azure-services',
      cost: 5,
      ...overrides,
    }
  }

  /**
   * Generate mock scenario data
   */
  static createMockScenario(overrides?: Partial<MockScenario>): MockScenario {
    return {
      id: `scenario-${Date.now()}`,
      title: 'Test Scenario',
      description: 'A test architecture scenario',
      maxCost: 20,
      difficulty: 'beginner',
      ...overrides,
    }
  }

  /**
   * Create a complete mock game state
   */
  static createMockGameState(overrides?: Record<string, unknown>): unknown {
    return {
      currentScenario: this.createMockScenario(),
      deck: [this.createMockCard(), this.createMockCard()],
      hand: [this.createMockCard()],
      slots: [
        { id: 'slot-1', type: 'compute', card: null, required: true },
        { id: 'slot-2', type: 'storage', card: null, required: true },
      ],
      round: 1,
      score: {
        highAvailability: 0,
        costEffectiveness: 0,
        securityCompliance: 0,
        total: 0,
      },
      mode: 'quick-match',
      timeRemaining: 45,
      status: 'playing',
      ...overrides,
    }
  }
}

/**
 * Performance testing helpers
 */
export class PerformanceHelpers {
  constructor(private page: Page) {}

  /**
   * Measure validation response time
   */
  async measureValidationTime(dragCard: () => Promise<void>): Promise<number> {
    const startTime = Date.now()

    await dragCard()

    // Wait for validation to complete
    await expect(this.page.locator('[data-testid="validation-complete"]')).toBeVisible({
      timeout: 1000,
    })

    const endTime = Date.now()
    return endTime - startTime
  }

  /**
   * Measure page load time
   */
  async measurePageLoadTime(url: string): Promise<number> {
    const startTime = Date.now()

    await this.page.goto(url)
    await this.page.waitForLoadState('networkidle')

    const endTime = Date.now()
    return endTime - startTime
  }

  /**
   * Check if operation completes within time limit
   */
  async assertCompletesWithin(operation: () => Promise<void>, maxMs: number): Promise<void> {
    const startTime = Date.now()
    await operation()
    const elapsed = Date.now() - startTime

    expect(elapsed).toBeLessThanOrEqual(maxMs)
  }
}
