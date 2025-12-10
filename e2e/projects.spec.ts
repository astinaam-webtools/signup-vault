import { test, expect } from '@playwright/test'

test.describe('Project Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.waitForSelector('input[name="email"]')
    await page.fill('input[name="email"]', 'admin@signupvault.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    await expect(page).toHaveURL('/dashboard')
  })

  test('should create a new project', async ({ page }) => {
    const projectName = `Test Project E2E ${Date.now()}`
    await page.goto('/dashboard/projects')
    await page.click('text=New Project')
    await page.fill('input[name="name"]', projectName)
    await page.fill('textarea[name="description"]', 'A project created by E2E test')
    await page.click('button[type="submit"]')
    await expect(page.locator(`text=${projectName}`)).toBeVisible()
  })

  // test('should display project analytics', async ({ page }) => {
  //   await page.goto('/dashboard/projects')
  //   // Wait for projects to load
  //   await page.waitForSelector('text=Projects')
  //   // Click on the first project details link
  //   const projectLink = page.locator('a[href*="/dashboard/projects/"]').first()
  //   await expect(projectLink).toBeVisible()
  //   await projectLink.click()
  //   // Wait for the page to load
  //   await page.waitForSelector('h1')
  //   // Check for analytics content
  //   await expect(page.locator('text=Overview')).toBeVisible()
  // })
})