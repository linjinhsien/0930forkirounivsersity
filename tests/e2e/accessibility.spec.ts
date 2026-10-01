import { expect, test } from '../fixtures/test-fixtures'

test('keyboard navigation, ARIA labels, and high contrast mode work', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.locator('.skip-link')).toBeFocused()
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible()

  await page.goto('/quick-match')
  const cards = page.getByRole('list', { name: 'Cards in hand' })
  const firstCard = cards.getByRole('button').first()
  await firstCard.focus()
  await page.keyboard.press('Enter')
  const computeSlot = page.getByRole('button', { name: 'compute slot, empty' })
  await computeSlot.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: /compute slot, occupied by/ })).toBeVisible()
  await expect(page.getByRole('progressbar', { name: 'Time remaining' })).toHaveAttribute(
    'aria-valuemin',
    '0'
  )

  await page.goto('/settings')
  const highContrast = page.getByRole('checkbox', { name: /High contrast mode/ })
  await highContrast.check()
  await expect(page.locator('html')).toHaveClass(/high-contrast/)
})
