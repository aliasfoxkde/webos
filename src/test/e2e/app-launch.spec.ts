import { test, expect } from '@playwright/test';

test.describe('App Launch', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
  });

  async function launchAppByName(page: import('@playwright/test').Page, appName: string) {
    const startBtn = page.locator('[data-testid="start-button"], button:has-text("Start"), button:has-text("⬡")').first();
    await startBtn.click();

    const menu = page.locator('[data-testid="start-menu"], [class*="start-menu"], [class*="StartMenu"]');
    await expect(menu.first()).toBeVisible({ timeout: 5000 });

    const appItem = page.locator(`text=${appName}`).first();
    await appItem.click();
  }

  test('Terminal launches and shows terminal UI', async ({ page }) => {
    await launchAppByName(page, 'Terminal');

    const window = page.locator('[data-testid="window"], [class*="window"]').first();
    await expect(window).toBeVisible({ timeout: 5000 });

    // Terminal should have some kind of input or display area
    const terminalContent = page.locator('[data-testid="terminal"], textarea, input, pre, code, [class*="terminal"]').first();
    await expect(terminalContent).toBeVisible({ timeout: 5000 });
  });

  test('Settings launches and shows settings panels', async ({ page }) => {
    await launchAppByName(page, 'Settings');

    const window = page.locator('[data-testid="window"], [class*="window"]').first();
    await expect(window).toBeVisible({ timeout: 5000 });

    // Settings should have some navigation or panel content
    const settingsContent = page.locator('[data-testid="settings"], [class*="settings"], nav, [role="tablist"]').first();
    await expect(settingsContent).toBeVisible({ timeout: 5000 });
  });

  test('Calculator launches and shows calculator UI', async ({ page }) => {
    await launchAppByName(page, 'Calculator');

    const window = page.locator('[data-testid="window"], [class*="window"]').first();
    await expect(window).toBeVisible({ timeout: 5000 });

    // Calculator should have number buttons or a display
    const calcContent = page.locator('button:has-text("0"), button:has-text("1"), button:has-text("="), [data-testid="calc-display"]').first();
    await expect(calcContent).toBeVisible({ timeout: 5000 });
  });

  test('File Manager launches and shows file browser', async ({ page }) => {
    await launchAppByName(page, 'File Manager');

    const window = page.locator('[data-testid="window"], [class*="window"]').first();
    await expect(window).toBeVisible({ timeout: 5000 });

    // File manager should have a breadcrumb, sidebar, or file list
    const fmContent = page.locator('[data-testid="file-manager"], [class*="breadcrumb"], [class*="sidebar"], [class*="file-grid"], [class*="file-list"]').first();
    await expect(fmContent).toBeVisible({ timeout: 5000 });
  });
});
