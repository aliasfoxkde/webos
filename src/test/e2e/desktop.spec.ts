import { test, expect } from '@playwright/test';

test.describe('Desktop Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
  });

  test('desktop icons are visible', async ({ page }) => {
    // Desktop icons are buttons inside the desktop grid
    const icons = page.locator('.fixed.inset-0 button');
    const count = await icons.count();
    expect(count).toBeGreaterThan(0);
    // First icon should contain "File Manager" text
    await expect(icons.first()).toContainText('File Manager');
  });

  test('double-clicking an icon opens a window', async ({ page }) => {
    // Double-click the File Manager icon
    const fileManagerIcon = page.locator('.fixed.inset-0 button', { hasText: 'File Manager' });
    await fileManagerIcon.dblclick();

    // A window should appear — windows have rounded-lg shadow-xl border classes
    const windowEl = page.locator('.rounded-lg.shadow-xl.border');
    await expect(windowEl.first()).toBeVisible({ timeout: 5000 });
  });

  test('window has title bar with app name', async ({ page }) => {
    const fileManagerIcon = page.locator('.fixed.inset-0 button', { hasText: 'File Manager' });
    await fileManagerIcon.dblclick();

    // Title bar has h-9 and select-none classes
    const titleBar = page.locator('.h-9.select-none');
    await expect(titleBar.first()).toBeVisible({ timeout: 5000 });
    // Should contain the app title
    await expect(titleBar.first()).toContainText('File Manager');
  });

  test('window close button dismisses the window', async ({ page }) => {
    const fileManagerIcon = page.locator('.fixed.inset-0 button', { hasText: 'File Manager' });
    await fileManagerIcon.dblclick();

    const windowEl = page.locator('.rounded-lg.shadow-xl.border').first();
    await expect(windowEl).toBeVisible({ timeout: 5000 });

    // Close button has title="Close" and hover:bg-red-500
    const closeBtn = windowEl.locator('button[title="Close"]');
    await closeBtn.click();

    // Window should be gone
    await expect(windowEl).not.toBeVisible({ timeout: 3000 });
  });

  test('right-click on desktop shows context menu', async ({ page }) => {
    // Right-click on the desktop area (not on an icon)
    await page.mouse.click(200, 200, { button: 'right' });

    // Context menu has min-w-[180px] class
    const menu = page.locator('.min-w-\\[180px\\]');
    await expect(menu).toBeVisible({ timeout: 3000 });
  });

  test('context menu closes on click', async ({ page }) => {
    await page.mouse.click(200, 200, { button: 'right' });

    const menu = page.locator('.min-w-\\[180px\\]');
    await expect(menu).toBeVisible({ timeout: 3000 });

    // Click elsewhere to close
    await page.mouse.click(100, 100);
    await expect(menu).not.toBeVisible({ timeout: 2000 });
  });
});
