import type { PerformanceMeasurement } from '@/types/engine'

const PERFORMANCE_STORAGE_KEY = 'az900-performance-metrics'
const MAX_STORED_METRICS = 100
const DEFAULT_BUDGET_MS = 500

export interface PerformanceMetric extends PerformanceMeasurement {
  category?: 'validation' | 'scoring' | 'render' | 'other'
}

function readStoredMetrics(): PerformanceMetric[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(PERFORMANCE_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as PerformanceMetric[]) : []
  } catch {
    return []
  }
}

function persistMetrics(metrics: PerformanceMetric[]): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(
      PERFORMANCE_STORAGE_KEY,
      JSON.stringify(metrics.slice(-MAX_STORED_METRICS))
    )
  } catch {
    // Performance logging must never interrupt the application.
  }
}

/** Application-wide performance metrics collector for validation, scoring, and rendering. */
export class PerformanceMetrics {
  private readonly metrics: PerformanceMetric[] = []

  constructor(private readonly budgetMs = DEFAULT_BUDGET_MS) {}

  /** Record a completed operation and persist slow operations for diagnostics. */
  record(
    operation: string,
    durationMs: number,
    category: PerformanceMetric['category'] = 'other',
    metadata?: Record<string, unknown>
  ): PerformanceMetric {
    const metric: PerformanceMetric = {
      operation,
      durationMs,
      timestamp: Date.now(),
      withinBudget: durationMs < this.budgetMs,
      category,
      metadata,
    }

    this.metrics.push(metric)

    if (!metric.withinBudget) {
      persistMetrics([...readStoredMetrics(), metric])
      console.warn(
        `[Performance] ${operation} took ${durationMs.toFixed(2)}ms (budget: ${this.budgetMs}ms)`
      )
    }

    return metric
  }

  /** Measure a synchronous operation. */
  measure<T>(
    operation: string,
    fn: () => T,
    category: PerformanceMetric['category'] = 'other',
    metadata?: Record<string, unknown>
  ): T {
    const start = performance.now()
    try {
      return fn()
    } finally {
      this.record(operation, performance.now() - start, category, metadata)
    }
  }

  /** Measure an asynchronous operation. */
  async measureAsync<T>(
    operation: string,
    fn: () => Promise<T>,
    category: PerformanceMetric['category'] = 'other',
    metadata?: Record<string, unknown>
  ): Promise<T> {
    const start = performance.now()
    try {
      return await fn()
    } finally {
      this.record(operation, performance.now() - start, category, metadata)
    }
  }

  /** Start a component render measurement and return its completion callback. */
  startComponentRender(componentName: string): () => PerformanceMetric {
    const start = performance.now()
    return () =>
      this.record(`component-render:${componentName}`, performance.now() - start, 'render', {
        component: componentName,
      })
  }

  /** Return in-memory metrics. */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  /** Return persisted diagnostic metrics, including slow operations from prior sessions. */
  getPersistedMetrics(): PerformanceMetric[] {
    return readStoredMetrics()
  }

  /** Clear in-memory and persisted metrics. */
  clearMetrics(): void {
    this.metrics.length = 0
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(PERFORMANCE_STORAGE_KEY)
    }
  }

  /** Export all available metrics as a JSON string for analysis. */
  exportMetrics(): string {
    return JSON.stringify(
      {
        budgetMs: this.budgetMs,
        exportedAt: new Date().toISOString(),
        metrics: [...this.getPersistedMetrics(), ...this.metrics],
      },
      null,
      2
    )
  }
}

export const performanceMetrics = new PerformanceMetrics()
export const PERFORMANCE_METRICS_STORAGE_KEY = PERFORMANCE_STORAGE_KEY
