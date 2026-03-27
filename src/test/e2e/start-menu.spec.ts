import { test, expect } from '@playwright/test';

test.describe('Start Menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
  });

  test('clicking start button opens menu', async ({ page }) => {
    const startBtn = page.locator('button', { hasText: 'Start' });
    await startBtn.click();

    // Start menu is fixed bottom-14 left-2 w-80
    const menu = page.locator('.fixed.bottom-14.left-2.w-80');
    await expect(menu).toBeVisible({ timeout: 5000 });
  });

  test('menu shows app entries', async ({ page }) => {
    const startBtn = page.locator('button', { hasText: 'Start' });
    await startBtn.click();

    const menu = page.locator('.fixed.bottom-14.left-2.w-80');
    await expect(menu).toBeVisible({ timeout: 5000 });

    // Should show File Manager, Terminal, Settings in the menu
    await expect(menu.locator('button', { hasText: 'File Manager' })).toBeVisible();
    await expect(menu.locator('button', { hasText: 'Terminal' })).toBeVisible();
    await expect(menu.locator('button', { hasText: 'Settings' })).toBeVisible();
  });

  test('search input filters apps', async ({ page }) => {
    const startBtn = page.locator('button', { hasText: 'Start' });
    await startBtn.click();

    const menu = page.locator('.fixed.bottom-14.left-2.w-80');
    await expect(menu).toBeVisible({ timeout: 5000 });

    // Type in the search input — use "settings" which only matches one app
    const searchInput = menu.locator('input[placeholder="Search apps..."]');
    await searchInput.fill('settings');

    // Should show Settings but not Terminal
    await expect(menu.locator('button', { hasText: 'Settings' })).toBeVisible();
    await expect(menu.locator('button', { hasText: 'Terminal' })).not.toBeVisible();
  });

  test('clicking an app launches it', async ({ page }) => {
    const startBtn = page.locator('button', { hasText: 'Start' });
    await startBtn.click();

    const menu = page.locator('.fixed.bottom-14.left-2.w-80');
    await expect(menu).toBeVisible({ timeout: 5000 });

    // Click Terminal in the start menu
    await menu.locator('button', { hasText: 'Terminal' }).click();

    // A window should open
    const windowEl = page.locator('.rounded-lg.shadow-xl.border');
    await expect(windowEl.first()).toBeVisible({ timeout: 5000 });

    // Window title should contain "Terminal"
    await expect(page.locator('.h-9.select-none')).toContainText('Terminal');
  });

  test('clicking outside closes the menu', async ({ page }) => {
    const startBtn = page.locator('button', { hasText: 'Start' });
    await startBtn.click();

    const menu = page.locator('.fixed.bottom-14.left-2.w-80');
    await expect(menu).toBeVisible({ timeout: 5000 });

    // Click on desktop area (above taskbar)
    await page.mouse.click(100, 100);
    await expect(menu).not.toBeVisible({ timeout: 3000 });
  });
});
