import { onBeforeUnmount, onMounted, ref } from 'vue'

export function useKeyboardNavigation() {
  const isKeyboardUser = ref(false)

  function useTab(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      isKeyboardUser.value = true
      document.documentElement.classList.add('keyboard-only')
    }
  }

  function useArrowKeys(
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
  ): number {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      return currentIndex
    }
    if (items.length === 0) return currentIndex

    event.preventDefault()
    const direction = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1
    const nextIndex = (currentIndex + direction + items.length) % items.length
    items[nextIndex]?.focus()
    return nextIndex
  }

  function useEscape(event: KeyboardEvent, callback?: () => void): void {
    if (event.key === 'Escape') callback?.()
  }

  function useFocus(element: HTMLElement | null): void {
    element?.focus()
  }

  function handleKeydown(event: KeyboardEvent): void {
    useTab(event)
    if (event.key === 'Enter' || event.key === ' ') {
      isKeyboardUser.value = true
      document.documentElement.classList.add('keyboard-only')
    }
  }

  function handlePointerdown(): void {
    isKeyboardUser.value = false
    document.documentElement.classList.remove('keyboard-only')
  }

  function focusFirst(container: HTMLElement): void {
    container
      .querySelector<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]',
      )
      ?.focus()
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('pointerdown', handlePointerdown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('pointerdown', handlePointerdown)
  })

  return {
    isKeyboardUser,
    useTab,
    useArrowKeys,
    useEscape,
    useFocus,
    focusFirst,
  }
}
