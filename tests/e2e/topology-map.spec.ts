import { expect, test } from '../fixtures/test-fixtures'

test('AZ-900 knowledge topology is discoverable and connects exam concepts', async ({ page }) => {
  await page.goto('/#/')
  await page.getByTestId('home-topology-map').click()

  await expect(page).toHaveURL(/#\/topology$/)
  await expect(page.getByRole('heading', { name: 'AZ-900 知識拓樸圖' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '資源管理階層' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '全球基礎設施' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '成本治理與 FinOps' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Day 7 · 核心架構階段複習' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Day 28 · 題型與情境推理' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Day 29 · 隨機情境模擬（一）' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Day 30 · 跨域情境終局拓樸' })).toBeVisible()
  for (const day of [7, 27, 28, 29, 30]) {
    await expect(page.getByRole('link', { name: `Day ${day} 練習頁原始碼` })).toHaveAttribute(
      'href',
      `https://github.com/linjinhsien/linjinhsien.github.io/blob/main/day${day}.html`
    )
  }

  await page.getByRole('button', { name: /跨訂用帳戶治理階層/ }).click()
  await expect(page.getByTestId('topology-node-detail')).toContainText('Management Group')

  await page.getByRole('button', { name: /Azure Policy/ }).click()
  await expect(page.getByTestId('topology-node-detail')).toContainText('Policy 管合規')
  await expect(page.getByRole('link', { name: 'Day 28 知識圖譜與陷阱拓樸' })).toHaveAttribute(
    'href',
    /ithome_az900_day28\.md$/
  )

  await page.getByRole('button', { name: /Azure Budgets/ }).click()
  await expect(page.getByTestId('topology-node-detail')).toContainText('不會預設自動關閉 VM')
  await expect(page.getByRole('link', { name: 'Day 27 成本治理拓樸' })).toHaveAttribute(
    'href',
    /ithome_az900_day27\.md$/
  )
})
