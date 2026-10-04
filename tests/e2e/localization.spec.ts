import { expect, test } from '../fixtures/test-fixtures'

test('switching languages updates translated navigation and document language', async ({
  page,
}) => {
  await page.goto('/#/settings')
  await expect(page.getByTestId('nav-home')).toHaveText('Home')
  await page.getByTestId('language-select').selectOption('zh-CN')

  await expect(page.getByTestId('nav-home')).toHaveText('首页')
  await expect(page.getByTestId('nav-codex')).toHaveText('架构图鉴')
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
  await expect(page.getByTestId('current-language')).toHaveText('简体中文')
})
