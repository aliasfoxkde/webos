import { test, expect } from '@playwright/test';

test.describe('Deployed App Launch', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://webos-aiv.pages.dev/', { waitUntil: 'networkidle' });
    // Wait for boot screen to finish (taskbar appears)
    await page.locator('.fixed.bottom-0.h-12').waitFor({ timeout: 15000 });
  });

  async function launchAppFromMenu(page: import('@playwright/test').Page, appName: string) {
    const startBtn = page.locator('button', { hasText: 'Start' });
    await startBtn.click();
    const menu = page.locator('.fixed.bottom-14.left-2.w-80');
    await expect(menu).toBeVisible({ timeout: 5000 });
    await menu.locator('button', { hasText: appName }).click();
  }

  test('double-click File Manager icon', async ({ page }) => {
    const icon = page.locator('.fixed.inset-0 button', { hasText: 'File Manager' });
    await icon.waitFor({ timeout: 10000 });
    await icon.dblclick();
    const windowEl = page.locator('.rounded-lg.shadow-xl.border').first();
    await expect(windowEl).toBeVisible({ timeout: 10000 });
    console.log('File Manager window opened');
  });

  test('launch Terminal from start menu', async ({ page }) => {
    await launchAppFromMenu(page, 'Terminal');
    const windowEl = page.locator('.rounded-lg.shadow-xl.border').first();
    await expect(windowEl).toBeVisible({ timeout: 10000 });
    console.log('Terminal window opened');
  });

  test('launch Calculator from start menu', async ({ page }) => {
    await launchAppFromMenu(page, 'Calculator');
    const windowEl = page.locator('.rounded-lg.shadow-xl.border').first();
    await expect(windowEl).toBeVisible({ timeout: 10000 });
    console.log('Calculator window opened');
  });

  test('launch Settings from start menu', async ({ page }) => {
    await launchAppFromMenu(page, 'Settings');
    const windowEl = page.locator('.rounded-lg.shadow-xl.border').first();
    await expect(windowEl).toBeVisible({ timeout: 10000 });
    console.log('Settings window opened');
  });

  test('close a window', async ({ page }) => {
    const icon = page.locator('.fixed.inset-0 button', { hasText: 'Terminal' });
    await icon.waitFor({ timeout: 10000 });
    await icon.dblclick();
    const windowEl = page.locator('.rounded-lg.shadow-xl.border').first();
    await expect(windowEl).toBeVisible({ timeout: 10000 });
    await windowEl.locator('button[title="Close"]').click();
    await expect(windowEl).not.toBeVisible({ timeout: 5000 });
    console.log('Window closed successfully');
  });

  test('right-click context menu', async ({ page }) => {
    await page.mouse.click(200, 200, { button: 'right' });
    const menu = page.locator('.min-w-\\[180px\\]');
    await expect(menu).toBeVisible({ timeout: 5000 });
    console.log('Context menu visible');
    await page.mouse.click(100, 100);
    await expect(menu).not.toBeVisible({ timeout: 3000 });
    console.log('Context menu dismissed');
  });
});
