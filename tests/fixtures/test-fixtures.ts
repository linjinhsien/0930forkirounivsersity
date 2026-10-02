/**
 * Custom Playwright test fixtures for Azure AZ-900 Card Clash
 * 
 * Provides extended test context with game-specific utilities,
 * mock data, and helper functions for E2E testing.
 */

import { test as base, expect, Page } from '@playwright/test'

/**
 * Extended test context with custom fixtures
 */
interface GameTestFixtures {
  /**
   * Navigate to home page and wait for app to be ready
   */
  homePage: Page

  /**
   * Navigate to quick match game view
   */
  quickMatchPage: Page

  /**
   * Navigate to codex (learning library) view
   */
  codexPage: Page

  /**
   * Navigate to settings view
   */
  settingsPage: Page

  /**
   * Helper to clear all local storage and session data
   */
  clearGameData: () => Promise<void>

  /**
   * Helper to set up a saved game session
   */
  setupSavedSession: (gameState: unknown) => Promise<void>

  /**
   * Helper to wait for validation feedback to appear
   */
  waitForValidation: (page: Page) => Promise<void>

  /**
   * Helper to enable high contrast mode
   */
  enableHighContrast: (page: Page) => Promise<void>

  /**
   * Helper to change language setting
   */
  changeLanguage: (page: Page, language: string) => Promise<void>
}

/**
 * Custom test with game-specific fixtures
 */
export const test = base.extend<GameTestFixtures>({
  /**
   * Home page fixture - automatically navigates and waits for ready state
   */
  homePage: async ({ page }, use) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('[data-testid="app-header"]')).toBeVisible({ timeout: 10000 })
    await use(page)
  },

  /**
   * Quick match page fixture
   */
  quickMatchPage: async ({ page }, use) => {
    await page.goto('/quick-match')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible({ timeout: 10000 })
    await use(page)
  },

  /**
   * Codex page fixture
   */
  codexPage: async ({ page }, use) => {
    await page.goto('/codex')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('[data-testid="codex-browser"]')).toBeVisible({ timeout: 10000 })
    await use(page)
  },

  /**
   * Settings page fixture
   */
  settingsPage: async ({ page }, use) => {
    await page.goto('/settings')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('[data-testid="settings-view"]')).toBeVisible({ timeout: 10000 })
    await use(page)
  },

  /**
   * Clear game data helper
   */
  clearGameData: async ({ page }, use) => {
    const clearData = async () => {
      if (page.url() === 'about:blank') {
        await page.goto('/')
        await page.waitForLoadState('domcontentloaded')
      }

      await page.evaluate(() => {
        localStorage.clear()
        sessionStorage.clear()
        // Clear IndexedDB if used
        if (window.indexedDB) {
          const dbs = ['az900-game-db', 'player-db']
          dbs.forEach(dbName => {
            window.indexedDB.deleteDatabase(dbName)
          })
        }
      })
    }
    await use(clearData)
  },

  /**
   * Setup saved session helper
   */
  setupSavedSession: async ({ page }, use) => {
    const setupSession = async (gameState: unknown) => {
      await page.evaluate((state) => {
        const session = {
          id: 'test-session-' + Date.now(),
          timestamp: Date.now(),
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
          gameState: state,
          playerId: 'test-player-1',
        }
        localStorage.setItem('az900-saved-session', JSON.stringify(session))
      }, gameState)
    }
    await use(setupSession)
  },

  /**
   * Wait for validation feedback helper
   */
  waitForValidation: async ({ }, use) => {
    const waitForValidation = async (page: Page) => {
      // Wait for validation feedback component to appear
      await expect(
        page.locator('[data-testid="validation-feedback"]')
      ).toBeVisible({ timeout: 5000 })

      // Ensure validation completed (check for loading state to disappear)
      await expect(
        page.locator('[data-testid="validation-loading"]')
      ).not.toBeVisible({ timeout: 3000 })
    }
    await use(waitForValidation)
  },

  /**
   * Enable high contrast mode helper
   */
  enableHighContrast: async ({ }, use) => {
    const enableHighContrast = async (page: Page) => {
      await page.evaluate(() => {
        document.documentElement.classList.add('high-contrast')
        localStorage.setItem('az900-high-contrast', 'true')
      })
    }
    await use(enableHighContrast)
  },

  /**
   * Change language helper
   */
  changeLanguage: async ({ }, use) => {
    const changeLanguage = async (page: Page, language: string) => {
      await page.evaluate((lang) => {
        localStorage.setItem('az900-language', lang)
      }, language)
      await page.reload()
      await page.waitForLoadState('domcontentloaded')
    }
    await use(changeLanguage)
  },
})

/**
 * Re-export expect for convenience
 */
export { expect } from '@playwright/test'
