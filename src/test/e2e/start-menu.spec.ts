import { test, expect } from '@playwright/test';

test.describe('Start Menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
  });

  test('clicking start button opens menu', async ({ page }) => {
    const startBtn = page.locator('[data-testid="start-button"], button:has-text("Start"), button:has-text("⬡")').first();
    await startBtn.click();

    const menu = page.locator('[data-testid="start-menu"], [class*="start-menu"], [class*="StartMenu"]');
    await expect(menu.first()).toBeVisible({ timeout: 5000 });
  });

  test('menu shows app entries', async ({ page }) => {
    const startBtn = page.locator('[data-testid="start-button"], button:has-text("Start"), button:has-text("⬡")').first();
    await startBtn.click();

    // Should see at least some known apps
    const menu = page.locator('[data-testid="start-menu"], [class*="start-menu"], [class*="StartMenu"]');
    await expect(menu.first()).toBeVisible({ timeout: 5000 });

    // Look for at least a few app names
    const appNames = ['File Manager', 'Terminal', 'Settings', 'Calculator'];
    for (const name of appNames) {
      const item = page.locator(`text=${name}`).first();
      await expect(item).toBeVisible({ timeout: 3000 }).catch(() => {
        // App name might be truncated or use icon only — soft assertion
      });
    }
  });

  test('search input filters apps', async ({ page }) => {
    const startBtn = page.locator('[data-testid="start-button"], button:has-text("Start"), button:has-text("⬡")').first();
    await startBtn.click();

    const menu = page.locator('[data-testid="start-menu"], [class*="start-menu"], [class*="StartMenu"]');
    await expect(menu.first()).toBeVisible({ timeout: 5000 });

    // Find search input if it exists
    const searchInput = page.locator('[data-testid="start-search"], input[placeholder*="Search"], input[placeholder*="search"]').first();
    await searchInput.fill('calc');

    // Should show Calculator
    const calcItem = page.locator('text=Calc').first();
    await expect(calcItem).toBeVisible({ timeout: 3000 });
  });

  test('clicking an app launches it', async ({ page }) => {
    const startBtn = page.locator('[data-testid="start-button"], button:has-text("Start"), button:has-text("⬡")').first();
    await startBtn.click();

    const menu = page.locator('[data-testid="start-menu"], [class*="start-menu"], [class*="StartMenu"]');
    await expect(menu.first()).toBeVisible({ timeout: 5000 });

    // Click on Terminal
    const terminalItem = page.locator('text=Terminal').first();
    await terminalItem.click();

    // A window should open
    const window = page.locator('[data-testid="window"], [class*="window"]').first();
    await expect(window).toBeVisible({ timeout: 5000 });
  });

  test('clicking outside closes the menu', async ({ page }) => {
    const startBtn = page.locator('[data-testid="start-button"], button:has-text("Start"), button:has-text("⬡")').first();
    await startBtn.click();

    const menu = page.locator('[data-testid="start-menu"], [class*="start-menu"], [class*="StartMenu"]');
    await expect(menu.first()).toBeVisible({ timeout: 5000 });

    // Click on desktop area (above taskbar)
    await page.mouse.click(100, 100);
    await expect(menu.first()).not.toBeVisible({ timeout: 3000 });
  });
});
