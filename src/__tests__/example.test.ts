import { describe, it, expect } from 'vitest'

describe('Example Test Suite', () => {
  it('should pass basic assertion', () => {
    expect(1 + 1).toBe(2)
  })

  it('should verify string equality', () => {
    const greeting = 'Hello, Azure AZ-900!'
    expect(greeting).toContain('Azure')
  })

  it('should verify array operations', () => {
    const cards = ['Azure VM', 'Blob Storage', 'Azure Functions']
    expect(cards).toHaveLength(3)
    expect(cards).toContain('Blob Storage')
  })
})
