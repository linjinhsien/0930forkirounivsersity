import { expect, test } from '../fixtures/test-fixtures'

test('two-player clash determines a result and displays XP awards', async ({ page }) => {
  await page.goto('/#/multiplayer')
  await page.getByLabel('Player 1').fill('Ada')
  await page.getByLabel('Player 2').fill('Grace')
  await page.getByRole('button', { name: 'Start Clash' }).click()

  const adaBoard = page.getByRole('region', { name: "Ada's board" })
  const graceBoard = page.getByRole('region', { name: "Grace's board" })
  await expect(adaBoard).toBeVisible()
  await expect(graceBoard).toBeVisible()

  const adaCards = adaBoard.getByRole('list', { name: 'Cards in hand' })
  await adaCards.getByRole('button').first().click()
  await adaBoard.getByRole('button', { name: 'compute slot, empty' }).click()
  await adaBoard.getByRole('button', { name: 'Submit Solution' }).click()

  const graceCards = graceBoard.getByRole('list', { name: 'Cards in hand' })
  await graceCards.getByRole('button').first().click()
  await graceBoard.getByRole('button', { name: 'compute slot, empty' }).click()
  await graceBoard.getByRole('button', { name: 'Submit Solution' }).click()

  await expect(page.getByRole('heading', { name: 'Clash results' })).toBeVisible()
  await expect(page.getByText(/Ada wins!|Grace wins!|It’s a tie!/)).toBeVisible()
  const result = page
    .getByRole('region')
    .filter({ has: page.getByRole('heading', { name: 'Clash results' }) })
  await expect(result.getByText(/Ada: \d+ \/ 300 · \d+ XP/)).toBeVisible()
  await expect(result.getByText(/Grace: \d+ \/ 300 · \d+ XP/)).toBeVisible()
})
