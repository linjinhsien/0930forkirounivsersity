import { onBeforeMount, onMounted } from 'vue'
import { performanceMetrics } from '@/utils/performanceMonitor'

/** Track the mount/render interval for a Vue component. */
export function usePerformanceMonitor(componentName: string): void {
  let finish: (() => void) | null = null

  onBeforeMount(() => {
    finish = performanceMetrics.startComponentRender(componentName)
  })

  onMounted(() => {
    finish?.()
    finish = null
  })
}
