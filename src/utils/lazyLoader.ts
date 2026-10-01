export interface LazyImageOptions {
  root?: Element | null
  rootMargin?: string
  threshold?: number
  onLoad?: (image: HTMLImageElement) => void
  onError?: (error: unknown, image: HTMLImageElement) => void
}

const DEFAULT_ROOT_MARGIN = '200px'

/** Load an image once it enters or approaches the viewport. */
export function observeLazyImage(
  image: HTMLImageElement,
  src: string,
  options: LazyImageOptions = {}
): () => void {
  const load = () => {
    if (image.dataset.lazyLoaded === 'true') return
    image.src = src
    image.dataset.lazyLoaded = 'true'
    image.onload = () => options.onLoad?.(image)
    image.onerror = (event) => options.onError?.(event, image)
  }

  if (typeof IntersectionObserver === 'undefined') {
    load()
    return () => undefined
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect()
        load()
      }
    },
    {
      root: options.root ?? null,
      rootMargin: options.rootMargin ?? DEFAULT_ROOT_MARGIN,
      threshold: options.threshold ?? 0,
    }
  )

  observer.observe(image)
  return () => observer.disconnect()
}

/** Promise-based lazy image loader for non-viewport use cases. */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

/** Dynamically import a data module only when it is requested. */
export async function lazyLoadData<T>(
  loader: () => Promise<{ default: T } | T>
): Promise<T> {
  const module = await loader()
  return typeof module === 'object' && module !== null && 'default' in module
    ? module.default
    : module
}

/** Dynamically import a large component only when it is requested. */
export const lazyLoadComponent = lazyLoadData
