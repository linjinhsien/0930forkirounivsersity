import { expect, test } from '../fixtures/test-fixtures'

test.describe('quick-match end-to-end flow', () => {
  test('completes all three scenarios and shows the final score', async ({ page }) => {
    await page.goto('/quick-match')

    for (let scenario = 1; scenario <= 3; scenario += 1) {
      await expect(page.getByText(`Scenario ${scenario} of 3`)).toBeVisible()
      await expect(page.locator('aside[aria-label="Scenario details"]')).toBeVisible()
      const cards = page.getByRole('list', { name: 'Cards in hand' })
      await cards.getByRole('button').first().click()
      await page.getByRole('button', { name: 'compute slot, empty' }).click()
      await page.getByRole('button', { name: 'Submit Solution' }).click()

      if (scenario < 3) {
        await expect(page.getByText(/Scenario score:/)).toBeVisible()
        await page.getByRole('button', { name: 'Next Scenario' }).click()
      } else {
        await expect(page.getByText('Match complete')).toBeVisible()
      }
    }

    await expect(
      page.getByRole('heading', { name: /Your architecture score: \d+ \/ 900/ })
    ).toBeVisible()
    await expect(page.getByText('You completed all three scenarios.')).toBeVisible()
  })

  test('counts down and automatically submits when time expires', async ({ page }) => {
    await page.clock.install()
    await page.goto('/quick-match')
    const timer = page.getByRole('progressbar', { name: 'Time remaining' })
    await expect(timer).toBeVisible()
    const initialTime = Number(await timer.getAttribute('aria-valuenow'))
    expect(initialTime).toBeGreaterThan(0)

    await page.clock.runFor(2_000)
    expect(Number(await timer.getAttribute('aria-valuenow'))).toBeLessThan(initialTime)
    await page.clock.runFor(44_000)

    await expect(page.getByText(/Scenario score:/)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Next Scenario' })).toBeVisible()
  })
})
