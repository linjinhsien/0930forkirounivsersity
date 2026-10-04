import { expect, test } from '../fixtures/test-fixtures'

test('AZ-900 knowledge topology is discoverable and connects exam concepts', async ({ page }) => {
  await page.goto('/#/')
  await page.getByTestId('home-topology-map').click()

  await expect(page).toHaveURL(/#\/topology$/)
  await expect(page.getByRole('heading', { name: 'AZ-900 知識拓樸圖' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '資源管理階層' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '全球基礎設施' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '成本治理與 FinOps' })).toBeVisible()

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
