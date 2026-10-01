import { onBeforeUnmount, onMounted, ref } from 'vue'

export function useKeyboardNavigation() {
  const isKeyboardUser = ref(false)

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Tab' || event.key === 'Enter' || event.key === ' ') {
      isKeyboardUser.value = true
      document.documentElement.classList.add('keyboard-only')
    }
  }

  function handlePointerdown(): void {
    isKeyboardUser.value = false
    document.documentElement.classList.remove('keyboard-only')
  }

  function focusElement(element: HTMLElement | null): void {
    element?.focus()
  }

  function handleEscape(callback?: () => void): void {
    callback?.()
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

  return { isKeyboardUser, focusElement, focusFirst, handleEscape }
}
