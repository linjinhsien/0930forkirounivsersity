/**
 * Example E2E test demonstrating Playwright setup
 * 
 * This test validates that the basic application structure loads
 * and demonstrates usage of custom fixtures and helpers.
 */

import { test, expect } from '../fixtures/test-fixtures'
import { GameHelpers, AccessibilityHelpers } from '../utils/game-helpers'

test.describe('Application Setup Validation', () => {
  test('should load home page successfully', async ({ homePage }) => {
    // Verify page title
    await expect(homePage).toHaveTitle(/Azure AZ-900 Card Clash/i)
    
    // Verify main navigation elements are present
    await expect(homePage.locator('[data-testid="app-header"]')).toBeVisible()
    await expect(homePage.locator('[data-testid="main-content"]')).toBeVisible()
  })

  test('should navigate between main views', async ({ page }) => {
    // Start at home
    await page.goto('/')
    await expect(page.locator('[data-testid="home-view"]')).toBeVisible()
    
    // Navigate to codex
    await page.locator('[data-testid="nav-codex"]').click()
    await expect(page.locator('[data-testid="codex-browser"]')).toBeVisible()
    
    // Navigate to settings
    await page.locator('[data-testid="nav-settings"]').click()
    await expect(page.locator('[data-testid="settings-view"]')).toBeVisible()
    
    // Navigate back to home
    await page.locator('[data-testid="nav-home"]').click()
    await expect(page.locator('[data-testid="home-view"]')).toBeVisible()
  })

  test('should support keyboard navigation', async ({ homePage }) => {
    const a11yHelpers = new AccessibilityHelpers(homePage)
    
    // Test that all interactive elements are keyboard accessible
    await a11yHelpers.testKeyboardNavigation()
    
    // Verify ARIA labels on main navigation
    await a11yHelpers.verifyAriaLabels('[data-testid="nav-home"]', 'link')
    await a11yHelpers.verifyAriaLabels('[data-testid="nav-codex"]', 'link')
  })

  test('should clear game data successfully', async ({ page, clearGameData }) => {
    // Add some data to storage
    await page.evaluate(() => {
      localStorage.setItem('test-key', 'test-value')
    })
    
    // Verify data exists
    const beforeClear = await page.evaluate(() => localStorage.getItem('test-key'))
    expect(beforeClear).toBe('test-value')
    
    // Clear data using fixture
    await clearGameData()
    
    // Verify data is cleared
    const afterClear = await page.evaluate(() => localStorage.getItem('test-key'))
    expect(afterClear).toBeNull()
  })

  test('should support language switching', async ({ settingsPage, changeLanguage }) => {
    // Change language to Spanish
    await changeLanguage(settingsPage, 'es')
    
    // Verify language was applied (check for Spanish text)
    const languageIndicator = await settingsPage.locator('[data-testid="current-language"]').textContent()
    expect(languageIndicator).toContain('Español')
  })

  test('should enable high contrast mode', async ({ page, enableHighContrast }) => {
    await page.goto('/')
    
    // Enable high contrast
    await enableHighContrast(page)
    
    // Verify high contrast class is applied
    const hasHighContrast = await page.evaluate(() => {
      return document.documentElement.classList.contains('high-contrast')
    })
    expect(hasHighContrast).toBe(true)
  })
})

test.describe('Game Helpers Demonstration', () => {
  test.skip('should demonstrate card placement helpers', async ({ quickMatchPage }) => {
    // Note: This test is skipped as it requires actual game components to be implemented
    // Uncomment when game UI is ready
    
    const gameHelpers = new GameHelpers(quickMatchPage)
    
    // Example: Drag and drop a card
    await gameHelpers.dragCardToSlot('card-1', 'slot-compute')
    
    // Verify card was placed
    await expect(
      quickMatchPage.locator('[data-testid="slot-compute"]')
    ).toContainText('card-1')
    
    // Get architecture score
    const score = await gameHelpers.getArchitectureScore()
    expect(score.total).toBeGreaterThanOrEqual(0)
  })

  test.skip('should demonstrate keyboard card placement', async ({ quickMatchPage }) => {
    // Note: This test is skipped as it requires actual game components to be implemented
    
    const gameHelpers = new GameHelpers(quickMatchPage)
    
    // Place card using keyboard
    await gameHelpers.placeCardWithKeyboard('card-1', 'slot-compute')
    
    // Verify placement
    await expect(
      quickMatchPage.locator('[data-testid="slot-compute"]')
    ).toContainText('card-1')
  })
})

test.describe('Performance Validation', () => {
  test('should load home page within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000)
  })

  test('should respond to navigation quickly', async ({ page }) => {
    await page.goto('/')
    
    const startTime = Date.now()
    await page.locator('[data-testid="nav-codex"]').click()
    await page.waitForLoadState('networkidle')
    
    const navigationTime = Date.now() - startTime
    
    // Navigation should complete within 3 seconds
    expect(navigationTime).toBeLessThan(3000)
  })
})
