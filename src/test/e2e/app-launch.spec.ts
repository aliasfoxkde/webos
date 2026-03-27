import { test, expect } from '@playwright/test';

test.describe('App Launch', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
  });

  async function launchAppByName(page: import('@playwright/test').Page, appName: string) {
    // Open start menu
    const startBtn = page.locator('button', { hasText: 'Start' });
    await startBtn.click();

    const menu = page.locator('.fixed.bottom-14.left-2.w-80');
    await expect(menu).toBeVisible({ timeout: 5000 });

    // Click the app in the menu
    await menu.locator('button', { hasText: appName }).click();
  }

  test('Terminal launches and shows terminal UI', async ({ page }) => {
    await launchAppByName(page, 'Terminal');

    // Window should open with Terminal in title
    const windowEl = page.locator('.rounded-lg.shadow-xl.border').first();
    await expect(windowEl).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.h-9.select-none')).toContainText('Terminal');

    // Terminal should have a text input for commands (no type attr, just bare <input>)
    const terminalInput = windowEl.locator('input[spellcheck="false"]').first();
    await expect(terminalInput).toBeVisible({ timeout: 5000 });
  });

  test('Settings launches and shows settings panels', async ({ page }) => {
    await launchAppByName(page, 'Settings');

    const windowEl = page.locator('.rounded-lg.shadow-xl.border').first();
    await expect(windowEl).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.h-9.select-none')).toContainText('Settings');

    // Settings should have tab-like navigation or content panels
    const content = windowEl.locator('nav, [role="tablist"], button').first();
    await expect(content).toBeVisible({ timeout: 5000 });
  });

  test('Calculator launches and shows calculator UI', async ({ page }) => {
    await launchAppByName(page, 'Calculator');

    const windowEl = page.locator('.rounded-lg.shadow-xl.border').first();
    await expect(windowEl).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.h-9.select-none')).toContainText('Calculator');

    // Wait for Suspense to resolve — Calculator should show buttons
    // Calculator has C, CE, %, /, 7, 8, 9, ×, etc.
    await expect(windowEl.locator('button', { hasText: /^C$/ })).toBeVisible({ timeout: 5000 });
    await expect(windowEl.locator('button', { hasText: '=' })).toBeVisible({ timeout: 5000 });
    // Should have multiple buttons (grid of 16)
    const allButtons = windowEl.locator('button');
    const count = await allButtons.count();
    expect(count).toBeGreaterThanOrEqual(10);
  });

  test('File Manager launches and shows file browser', async ({ page }) => {
    await launchAppByName(page, 'File Manager');

    const windowEl = page.locator('.rounded-lg.shadow-xl.border').first();
    await expect(windowEl).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.h-9.select-none')).toContainText('File Manager');

    // File manager should show a breadcrumb or navigation
    const content = windowEl.locator('nav, button, [class*="breadcrumb"], [class*="toolbar"]').first();
    await expect(content).toBeVisible({ timeout: 5000 });
  });
});
