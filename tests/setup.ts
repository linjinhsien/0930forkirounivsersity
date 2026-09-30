/**
 * Vitest Test Setup File
 * 
 * This file runs before all tests and configures the testing environment.
 * It sets up global test utilities, mocks, and custom matchers.
 */

import { expect, vi, beforeEach, afterEach } from 'vitest'
import { config } from '@vue/test-utils'

/**
 * Vue Test Utils global configuration
 * Configure test environment for all component tests
 */
config.global.stubs = {
  // Stub out router-link and router-view for component tests
  'router-link': true,
  'router-view': true,
}

/**
 * Mock window.matchMedia for responsive design tests
 * Required for components that use CSS media queries
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

/**
 * Mock IntersectionObserver for lazy loading tests
 * Used by components with intersection-based lazy loading
 */
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return []
  }
} as any

/**
 * Mock localStorage for persistence tests
 * Provides in-memory implementation of Storage API
 */
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
})

/**
 * Mock performance.now() for consistent timing in tests
 * Used by game engine performance measurements
 */
const mockPerformanceNow = vi.fn(() => Date.now())
Object.defineProperty(window.performance, 'now', {
  writable: true,
  value: mockPerformanceNow,
})

/**
 * Custom matchers for enhanced test assertions
 */
expect.extend({
  /**
   * Assert that a validation completes within a time budget (ms)
   */
  toCompleteWithin(received: number, expected: number) {
    const pass = received <= expected
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received}ms to exceed ${expected}ms`
          : `Expected validation to complete within ${expected}ms, but took ${received}ms`,
    }
  },

  /**
   * Assert that a score is within valid bounds [min, max]
   */
  toBeWithinBounds(received: number, min: number, max: number) {
    const pass = received >= min && received <= max
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} to be outside bounds [${min}, ${max}]`
          : `Expected score to be within [${min}, ${max}], but received ${received}`,
    }
  },

  /**
   * Assert that an architecture score has valid components
   */
  toBeValidArchitectureScore(received: any) {
    const hasRequiredProps =
      typeof received === 'object' &&
      received !== null &&
      'highAvailability' in received &&
      'costEffectiveness' in received &&
      'securityCompliance' in received &&
      'total' in received

    if (!hasRequiredProps) {
      return {
        pass: false,
        message: () => `Expected object to have ArchitectureScore structure`,
      }
    }

    const scoresInBounds =
      received.highAvailability >= 0 &&
      received.highAvailability <= 100 &&
      received.costEffectiveness >= 0 &&
      received.costEffectiveness <= 100 &&
      received.securityCompliance >= 0 &&
      received.securityCompliance <= 100 &&
      received.total >= 0 &&
      received.total <= 300

    const totalMatchesSum =
      received.total ===
      received.highAvailability +
        received.costEffectiveness +
        received.securityCompliance

    const pass = scoresInBounds && totalMatchesSum

    return {
      pass,
      message: () =>
        pass
          ? `Expected invalid ArchitectureScore`
          : `Expected valid ArchitectureScore with scores in [0,100] and correct total`,
    }
  },
})

/**
 * Global test lifecycle hooks
 */
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks()

  // Reset localStorage before each test
  localStorageMock.clear()

  // Reset performance.now() mock
  mockPerformanceNow.mockClear()
})

afterEach(() => {
  // Clean up any timers
  vi.clearAllTimers()
})
