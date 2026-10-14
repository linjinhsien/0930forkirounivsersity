import { expect, test } from '../fixtures/test-fixtures'

test('switching languages updates translated navigation, views, and document language', async ({
  page,
}) => {
  await page.goto('/#/settings')
  await expect(page.getByTestId('nav-home')).toHaveText('Home')
  await page.getByTestId('language-select').selectOption('zh-CN')

  await expect(page.getByTestId('nav-home')).toHaveText('首页')
  await expect(page.getByTestId('nav-codex')).toHaveText('架构图鉴')
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
  await expect(page.getByTestId('current-language')).toHaveText('简体中文')
  await expect(page.getByRole('heading', { name: '设置' })).toBeVisible()

  await page.getByTestId('nav-home').click()
  await expect(page.getByRole('heading', { name: 'Azure AZ-900 架构卡牌对战' })).toBeVisible()
  await expect(page.getByRole('link', { name: '3 分钟通勤模式' })).toBeVisible()

  await page.getByTestId('nav-codex').click()
  await expect(page.getByRole('heading', { name: 'Azure 架构图鉴' })).toBeVisible()
})
