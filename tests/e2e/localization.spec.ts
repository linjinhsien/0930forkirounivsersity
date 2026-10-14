import { expect, test } from '../fixtures/test-fixtures'

test('switching languages updates translated navigation, views, and document language', async ({
  page,
}) => {
  await page.goto('/#/settings')
  await expect(page.getByTestId('nav-home')).toHaveText('Home')

  // Switch to Traditional Chinese (zh-TW)
  await page.getByTestId('language-select').selectOption('zh-TW')
  await expect(page.getByTestId('nav-home')).toHaveText('首頁')
  await expect(page.getByTestId('nav-game')).toHaveText('遊戲')
  await expect(page.getByTestId('nav-codex')).toHaveText('架構圖鑑')
  await expect(page.getByTestId('nav-topology')).toHaveText('知識拓撲圖')
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-TW')
  await expect(page.getByTestId('current-language')).toHaveText('繁體中文')
  await expect(page.getByRole('heading', { name: '設定', exact: true })).toBeVisible()

  await page.getByTestId('nav-home').click()
  await expect(page.getByTestId('quick-match-cta')).toContainText('3 分鐘通勤模式')
  await expect(page.getByTestId('multiplayer-cta')).toContainText('多人挑戰')

  await page.getByTestId('nav-codex').click()
  await expect(page.getByRole('heading', { name: 'Azure 架構圖鑑' })).toBeVisible()

  // Switch to Simplified Chinese (zh-CN)
  await page.getByTestId('nav-settings').click()
  await page.getByTestId('language-select').selectOption('zh-CN')
  await expect(page.getByTestId('nav-home')).toHaveText('首页')
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
  await expect(page.getByTestId('current-language')).toHaveText('简体中文')

  // Switch to Japanese (ja)
  await page.getByTestId('language-select').selectOption('ja')
  await expect(page.getByTestId('nav-settings')).toHaveText('設定')
  await expect(page.getByRole('heading', { name: '設定', exact: true })).toBeVisible()
})
