import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import Toast from '@/components/ui/Toast.vue'

// Toast uses Teleport to body — jsdom handles this automatically
describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders message text when modelValue=true', () => {
    const { getByRole } = render(Toast, {
      props: { modelValue: true, message: 'Operation succeeded' },
    })
    expect(getByRole('alert').textContent).toContain('Operation succeeded')
  })

  it('does not render when modelValue=false', () => {
    const { queryByRole } = render(Toast, {
      props: { modelValue: false, message: 'Hidden' },
    })
    expect(queryByRole('alert')).toBeNull()
  })

  it('has role="alert"', () => {
    const { getByRole } = render(Toast, {
      props: { modelValue: true, message: 'Alert!' },
    })
    expect(getByRole('alert')).toBeTruthy()
  })

  it.each([
    ['success', 'bg-green-50'],
    ['error', 'bg-red-50'],
    ['warning', 'bg-amber-50'],
    ['info', 'bg-blue-50'],
  ] as const)('applies correct class for type=%s', (type, expectedClass) => {
    const { getByRole } = render(Toast, {
      props: { modelValue: true, message: 'Test', type },
    })
    expect(getByRole('alert').className).toContain(expectedClass)
  })

  it('emits update:modelValue=false when close button clicked', async () => {
    const { getByLabelText, emitted } = render(Toast, {
      props: { modelValue: true, message: 'Close me' },
    })
    await fireEvent.click(getByLabelText('Dismiss notification'))
    expect(emitted()['update:modelValue']).toEqual([[false]])
  })

  it('auto-dismisses after duration ms', async () => {
    const { emitted } = render(Toast, {
      props: { modelValue: true, message: 'Auto', duration: 2000 },
    })
    vi.advanceTimersByTime(2000)
    expect(emitted()['update:modelValue']).toEqual([[false]])
  })

  it('does not dismiss before duration elapses', async () => {
    const { emitted } = render(Toast, {
      props: { modelValue: true, message: 'Wait', duration: 3000 },
    })
    vi.advanceTimersByTime(1500)
    expect(emitted()['update:modelValue']).toBeUndefined()
  })
})
