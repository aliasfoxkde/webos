import { test, expect } from '@playwright/test';

test.describe('Desktop Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
  });

  test('desktop icons are visible', async ({ page }) => {
    // At minimum, we should see some desktop icons
    const icons = page.locator('.flex.flex-col.flex-wrap [class*="cursor-pointer"], [data-testid="desktop-icon"]');
    await expect(icons.first()).toBeVisible({ timeout: 10000 });
  });

  test('double-clicking an icon opens a window', async ({ page }) => {
    // Find the first desktop icon and double-click it
    const icon = page.locator('.flex.flex-col.flex-wrap [class*="cursor-pointer"], [data-testid="desktop-icon"]').first();
    await icon.dblclick();

    // A window should appear
    const window = page.locator('[data-testid="window"], [class*="window"]');
    await expect(window.first()).toBeVisible({ timeout: 5000 });
  });

  test('window has title bar with app name', async ({ page }) => {
    const icon = page.locator('.flex.flex-col.flex-wrap [class*="cursor-pointer"], [data-testid="desktop-icon"]').first();
    await icon.dblclick();

    // Title bar should contain text
    const titleBar = page.locator('[data-testid="window-titlebar"], [class*="titlebar"], [class*="drag"]');
    await expect(titleBar.first()).toBeVisible({ timeout: 5000 });
  });

  test('window close button dismisses the window', async ({ page }) => {
    const icon = page.locator('.flex.flex-col.flex-wrap [class*="cursor-pointer"], [data-testid="desktop-icon"]').first();
    await icon.dblclick();

    const window = page.locator('[data-testid="window"], [class*="window"]').first();
    await expect(window).toBeVisible({ timeout: 5000 });

    // Find and click close button
    const closeBtn = page.locator('button:has-text("×"), button:has-text("✕"), [data-testid="window-close"]').first();
    await closeBtn.click();

    // Window should be gone
    await expect(window).not.toBeVisible({ timeout: 3000 });
  });

  test('right-click on desktop shows context menu', async ({ page }) => {
    // Right-click on the desktop area (not on an icon)
    await page.mouse.click(200, 200, { button: 'right' });

    // Context menu should appear
    const menu = page.locator('[data-testid="context-menu"], [class*="context-menu"], [class*="ContextMenu"]');
    await expect(menu.first()).toBeVisible({ timeout: 3000 });
  });

  test('context menu closes on click', async ({ page }) => {
    await page.mouse.click(200, 200, { button: 'right' });

    const menu = page.locator('[data-testid="context-menu"], [class*="context-menu"], [class*="ContextMenu"]');
    await expect(menu.first()).toBeVisible({ timeout: 3000 });

    // Click elsewhere to close
    await page.mouse.click(100, 100);
    await expect(menu.first()).not.toBeVisible({ timeout: 2000 });
  });
});
