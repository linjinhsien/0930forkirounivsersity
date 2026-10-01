/**
 * Performance Monitoring Utilities — Azure AZ-900 Card Clash Engine
 *
 * Provides synchronous and async measurement, debounced validation,
 * memoised scoring, and lazy image loading helpers.
 */

import type { PerformanceMeasurement } from '@/types/engine'

const BUDGET_MS = 500

export class PerformanceMonitor {
  private measurements: PerformanceMeasurement[] = []

  /**
   * Measures a synchronous operation and records it against the budget.
   */
  measure<T>(operation: string, fn: () => T, metadata?: Record<string, unknown>): T {
    const start = performance.now()
    const result = fn()
    const durationMs = performance.now() - start

    const measurement: PerformanceMeasurement = {
      operation,
      durationMs,
      timestamp: Date.now(),
      withinBudget: durationMs < BUDGET_MS,
      metadata,
    }

    this.measurements.push(measurement)

    if (!measurement.withinBudget) {
      console.warn(
        `[Performance] ${operation} took ${durationMs.toFixed(2)}ms (budget: ${BUDGET_MS}ms)`
      )
    }

    return result
  }

  /**
   * Measures an asynchronous operation and records it against the budget.
   */
  async measureAsync<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    const start = performance.now()
    const result = await fn()
    const durationMs = performance.now() - start

    const measurement: PerformanceMeasurement = {
      operation,
      durationMs,
      timestamp: Date.now(),
      withinBudget: durationMs < BUDGET_MS,
      metadata,
    }

    this.measurements.push(measurement)

    if (!measurement.withinBudget) {
      console.warn(
        `[Performance] ${operation} took ${durationMs.toFixed(2)}ms (budget: ${BUDGET_MS}ms)`
      )
    }

    return result
  }

  /** Returns a shallow copy of all recorded measurements. */
  getMetrics(): PerformanceMeasurement[] {
    return [...this.measurements]
  }

  /** Clears all recorded measurements. */
  clearMetrics(): void {
    this.measurements = []
  }

  /**
   * Returns measurements whose duration meets or exceeds the given threshold.
   * Defaults to the module-level budget (500 ms).
   */
  getSlowOperations(thresholdMs = BUDGET_MS): PerformanceMeasurement[] {
    return this.measurements.filter((m) => m.durationMs >= thresholdMs)
  }
}

/**
 * Creates a debounced wrapper around a validation function.
 * Subsequent calls within `delayMs` reset the timer.
 */
export function createDebouncedValidator<T>(
  fn: (args: T) => unknown,
  delayMs = 300
): (args: T) => void {
  let timer: ReturnType<typeof setTimeout> | null = null

  return (args: T) => {
    if (timer !== null) clearTimeout(timer)
    timer = setTimeout(() => fn(args), delayMs)
  }
}

/**
 * Creates a memoised version of a scorer function.
 * Results are cached by the string key produced by `keyFn`.
 */
export function createMemoizedScorer<TKey, TResult>(
  fn: (key: TKey) => TResult,
  keyFn: (key: TKey) => string
): (key: TKey) => TResult {
  const cache = new Map<string, TResult>()

  return (key: TKey): TResult => {
    const cacheKey = keyFn(key)

    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!
    }

    const result = fn(key)
    cache.set(cacheKey, result)
    return result
  }
}

/**
 * Lazily loads an image by src, resolving with the loaded HTMLImageElement.
 */
export function lazyLoadImage(src: string): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/** Singleton performance monitor instance for application-wide use. */
export const performanceMonitor = new PerformanceMonitor()
