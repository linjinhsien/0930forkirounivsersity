import { onUnmounted } from 'vue'
import { installErrorTracking, trackError } from '@/utils/errorTracking'

/** Install global error tracking for the current application lifecycle. */
export function useErrorTracking(): void {
  const uninstall = installErrorTracking()
  onUnmounted(uninstall)
}

/** Track a caught error from a component or composable. */
export function useTrackedError(
  error: unknown,
  type: Parameters<typeof trackError>[1] = 'unknown'
): ReturnType<typeof trackError> {
  return trackError(error, type)
}
