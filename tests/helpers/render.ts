/**
 * Custom Vue Component Test Render Helpers
 * 
 * Provides enhanced mounting utilities for Vue component tests with
 * common configurations and plugins pre-installed.
 */

import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import type { Component } from 'vue'

/**
 * Default i18n instance for tests
 * Uses minimal English messages
 */
export function createTestI18n() {
  return createI18n({
    legacy: false,
    locale: 'en',
    fallbackLocale: 'en',
    messages: {
      en: {
        common: {
          ok: 'OK',
          cancel: 'Cancel',
          save: 'Save',
          delete: 'Delete',
          edit: 'Edit',
        },
        game: {
          title: 'Azure AZ-900 Card Clash',
          quickMatch: 'Quick Match',
          multiplayer: 'Multiplayer',
          settings: 'Settings',
        },
      },
    },
  })
}

/**
 * Options for custom component mounting
 */
export interface RenderOptions {
  /** Include Pinia store plugin */
  withPinia?: boolean
  /** Include i18n plugin */
  withI18n?: boolean
  /** Additional global plugins */
  plugins?: any[]
  /** Props to pass to component */
  props?: Record<string, any>
  /** Slots to pass to component */
  slots?: Record<string, any>
  /** Additional mounting options */
  mountOptions?: Record<string, any>
}

/**
 * Enhanced component mounting with common plugins
 * 
 * @example
 * ```typescript
 * const wrapper = renderComponent(MyComponent, {
 *   withPinia: true,
 *   withI18n: true,
 *   props: { title: 'Test' }
 * })
 * ```
 */
export function renderComponent<T extends Component>(
  component: T,
  options: RenderOptions = {}
): VueWrapper<any> {
  const {
    withPinia = true,
    withI18n = true,
    plugins = [],
    props = {},
    slots = {},
    mountOptions = {},
  } = options

  const globalPlugins: any[] = [...plugins]

  // Add Pinia if requested
  if (withPinia) {
    globalPlugins.push(createPinia())
  }

  // Add i18n if requested
  if (withI18n) {
    globalPlugins.push(createTestI18n())
  }

  return mount(component, {
    props: props as any,
    slots,
    global: {
      plugins: globalPlugins,
      ...mountOptions.global,
    },
    ...mountOptions,
  })
}

/**
 * Wait for next DOM update cycle
 * Useful for testing async updates
 */
export async function nextTick() {
  return new Promise(resolve => setTimeout(resolve, 0))
}

/**
 * Wait for specified number of milliseconds
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Find element by test ID attribute
 * 
 * @example
 * ```typescript
 * const button = findByTestId(wrapper, 'submit-button')
 * ```
 */
export function findByTestId(wrapper: VueWrapper<any>, testId: string) {
  return wrapper.find(`[data-testid="${testId}"]`)
}

/**
 * Find all elements by test ID attribute
 */
export function findAllByTestId(wrapper: VueWrapper<any>, testId: string) {
  return wrapper.findAll(`[data-testid="${testId}"]`)
}

/**
 * Trigger keyboard event on element
 * 
 * @example
 * ```typescript
 * await triggerKeyboard(wrapper, 'button', 'Enter')
 * ```
 */
export async function triggerKeyboard(
  wrapper: VueWrapper<any>,
  selector: string,
  key: string
) {
  const element = wrapper.find(selector)
  await element.trigger('keydown', { key })
  await wrapper.vm.$nextTick()
}

/**
 * Simulate drag and drop operation
 * 
 * @example
 * ```typescript
 * await simulateDragDrop(wrapper, '.card', '.slot')
 * ```
 */
export async function simulateDragDrop(
  wrapper: VueWrapper<any>,
  dragSelector: string,
  dropSelector: string
) {
  const dragElement = wrapper.find(dragSelector)
  const dropElement = wrapper.find(dropSelector)

  await dragElement.trigger('dragstart')
  await dropElement.trigger('dragover')
  await dropElement.trigger('drop')
  await dragElement.trigger('dragend')
  await wrapper.vm.$nextTick()
}

/**
 * Assert element has accessible name (ARIA label or text content)
 */
export function hasAccessibleName(element: any, expectedName: string): boolean {
  const ariaLabel = element.attributes('aria-label')
  const textContent = element.text()
  return ariaLabel === expectedName || textContent.includes(expectedName)
}

/**
 * Assert element is keyboard accessible
 * Checks for tabindex and keyboard event handlers
 */
export function isKeyboardAccessible(element: any): boolean {
  const tabindex = element.attributes('tabindex')
  const hasKeyHandler = 
    element.element.onkeydown !== null ||
    element.element.onkeyup !== null ||
    element.element.onkeypress !== null

  return (
    (tabindex !== undefined && parseInt(tabindex) >= 0) ||
    hasKeyHandler ||
    ['button', 'a', 'input', 'select', 'textarea'].includes(
      element.element.tagName.toLowerCase()
    )
  )
}
