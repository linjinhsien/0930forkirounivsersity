import { expect, test } from '../fixtures/test-fixtures'

test.describe('Phase 7 game views', () => {
  test('quick match progresses after submitting a scenario', async ({ page }) => {
    await page.goto('/#/quick-match')

    await expect(page.getByRole('heading', { name: '3-Minute Commute Mode' })).toBeVisible()
    await expect(page.locator('aside[aria-label="Scenario details"]')).toBeVisible()

    const cardList = page.getByRole('list', { name: 'Cards in hand' })
    await expect(cardList.getByRole('button').first()).toBeVisible()
    await cardList.getByRole('button').first().click()
    await page.getByRole('button', { name: 'compute slot, empty' }).click()
    await page.getByRole('button', { name: 'Submit Solution' }).click()

    await expect(page.getByText(/Scenario score:/)).toBeVisible()
    await page.getByRole('button', { name: 'Next Scenario' }).click()
    await expect(page.getByText('Scenario 2 of 3')).toBeVisible()
  })

  test('multiplayer boards keep each player solution separate', async ({ page }) => {
    await page.goto('/#/multiplayer')
    await page.getByLabel('Player 1').fill('Ada')
    await page.getByLabel('Player 2').fill('Grace')
    await page.getByRole('button', { name: 'Start Clash' }).click()

    const adaBoard = page.getByRole('region', { name: "Ada's board" })
    const graceBoard = page.getByRole('region', { name: "Grace's board" })
    await expect(adaBoard).toBeVisible()
    await expect(graceBoard).toBeVisible()
    await expect(adaBoard.getByRole('button', { name: 'Submit Solution' })).toBeVisible()
    await expect(graceBoard.getByRole('button', { name: 'Submit Solution' })).toBeVisible()

    const adaCards = adaBoard.getByRole('list', { name: 'Cards in hand' })
    await adaCards.getByRole('button').first().click()
    await adaBoard.getByRole('button', { name: 'compute slot, empty' }).click()
    await expect(adaBoard.getByRole('button', { name: /compute slot, occupied by/ })).toBeVisible()
    await expect(graceBoard.getByRole('button', { name: 'compute slot, empty' })).toBeVisible()

    const graceCards = graceBoard.getByRole('list', { name: 'Cards in hand' })
    await graceCards.getByRole('button').first().click()
    await graceBoard.getByRole('button', { name: 'compute slot, empty' }).click()
    await adaBoard.getByRole('button', { name: 'Submit Solution' }).click()
    await graceBoard.getByRole('button', { name: 'Submit Solution' }).click()
    await expect(page.getByRole('heading', { name: 'Clash results' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Play Again' })).toBeVisible()
  })

  test('codex and settings views expose their main controls', async ({ page }) => {
    await page.goto('/#/codex')
    await expect(page.getByRole('heading', { name: 'Azure Architecture Codex' })).toBeVisible()
    await expect(page.getByRole('searchbox', { name: 'Search cards' })).toBeVisible()
    await page.getByRole('tab', { name: 'Study Deck' }).click()
    await expect(page.getByRole('heading', { name: 'Study Deck' })).toBeVisible()

    await page.goto('/#/settings')
    await expect(page.getByTestId('language-select').locator('option')).toHaveCount(6)
    await expect(page.getByRole('checkbox', { name: /High contrast mode/ })).toBeVisible()
    await page.getByRole('button', { name: 'Clear Data' }).click()
    await expect(page.getByRole('alertdialog')).toBeVisible()
    await page.getByRole('button', { name: 'Cancel' }).click()
  })

  test('saved quick match can be resumed from settings', async ({ page }) => {
    await page.goto('/#/quick-match')
    await expect(page.getByRole('button', { name: 'Submit Solution' })).toBeVisible()
    await page.getByRole('button', { name: 'Save for Later' }).click()
    await page.goto('/#/settings')
    await page.getByRole('link', { name: 'Resume Game' }).click()

    await expect(page.getByText('Scenario 1 of 3')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Submit Solution' })).toBeVisible()
  })
})
