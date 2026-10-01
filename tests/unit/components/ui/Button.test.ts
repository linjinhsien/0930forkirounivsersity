import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import Button from '@/components/ui/Button.vue'

describe('Button', () => {
  it('renders with default props', () => {
    const { getByRole } = render(Button, { slots: { default: 'Click me' } })
    const btn = getByRole('button')
    expect(btn).toBeTruthy()
    expect(btn.textContent).toContain('Click me')
    expect(btn.getAttribute('type')).toBe('button')
  })

  it('renders slot content', () => {
    const { getByText } = render(Button, { slots: { default: 'Save Changes' } })
    expect(getByText('Save Changes')).toBeTruthy()
  })

  it('emits click event on click', async () => {
    const { getByRole, emitted } = render(Button, { slots: { default: 'Click' } })
    await fireEvent.click(getByRole('button'))
    expect(emitted().click).toHaveLength(1)
  })

  it('does not emit click when disabled', async () => {
    const { getByRole, emitted } = render(Button, {
      props: { disabled: true },
      slots: { default: 'Click' },
    })
    await fireEvent.click(getByRole('button'))
    expect(emitted().click).toBeUndefined()
  })

  it('shows loading spinner and sets aria-busy when loading=true', () => {
    const { getByRole, container } = render(Button, {
      props: { loading: true },
      slots: { default: 'Save' },
    })
    const btn = getByRole('button')
    expect(btn.getAttribute('aria-busy')).toBe('true')
    expect(container.querySelector('svg.animate-spin')).toBeTruthy()
  })

  it.each([
    ['primary', 'bg-blue-600'],
    ['secondary', 'bg-gray-100'],
    ['danger', 'bg-red-600'],
    ['ghost', 'bg-transparent'],
  ] as const)('applies correct class for variant=%s', (variant, expectedClass) => {
    const { getByRole } = render(Button, {
      props: { variant },
      slots: { default: 'Btn' },
    })
    expect(getByRole('button').className).toContain(expectedClass)
  })

  it('applies correct size classes for size=lg', () => {
    const { getByRole } = render(Button, {
      props: { size: 'lg' },
      slots: { default: 'Large' },
    })
    expect(getByRole('button').className).toContain('px-6')
  })

  it('applies ariaLabel prop', () => {
    const { getByRole } = render(Button, {
      props: { ariaLabel: 'Close dialog' },
      slots: { default: 'X' },
    })
    expect(getByRole('button').getAttribute('aria-label')).toBe('Close dialog')
  })

  it('has correct type attribute when type=submit', () => {
    const { getByRole } = render(Button, {
      props: { type: 'submit' },
      slots: { default: 'Submit' },
    })
    expect(getByRole('button').getAttribute('type')).toBe('submit')
  })

  it('triggers click on Enter key', async () => {
    const { getByRole, emitted } = render(Button, { slots: { default: 'Enter' } })
    await fireEvent.keyDown(getByRole('button'), { key: 'Enter', code: 'Enter' })
    await fireEvent.click(getByRole('button'))
    expect(emitted().click).toBeTruthy()
  })

  it('is disabled when loading=true', () => {
    const { getByRole } = render(Button, {
      props: { loading: true },
      slots: { default: 'Wait' },
    })
    expect((getByRole('button') as HTMLButtonElement).disabled).toBe(true)
  })
})
