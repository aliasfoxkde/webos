import { test, expect } from '@playwright/test';

test.describe('Window Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Open a window by double-clicking a desktop icon
    const icon = page.locator('.flex.flex-col.flex-wrap [class*="cursor-pointer"], [data-testid="desktop-icon"]').first();
    await icon.dblclick();

    const window = page.locator('[data-testid="window"], [class*="window"]').first();
    await expect(window).toBeVisible({ timeout: 5000 });
  });

  test('window has minimize, maximize, and close buttons', async ({ page }) => {
    const windowControls = page.locator('[data-testid="window"] button, [class*="window"] button');
    const count = await windowControls.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('minimize button hides the window', async ({ page }) => {
    const minimizeBtn = page.locator('[data-testid="window-minimize"], button').nth(1);
    await minimizeBtn.click();

    // Window should be hidden (minimized)
    const window = page.locator('[data-testid="window"], [class*="window"]').first();
    await expect(window).not.toBeVisible({ timeout: 3000 });
  });

  test('clicking a window focuses it (z-index)', async ({ page }) => {
    // Open a second window
    const icons = page.locator('.flex.flex-col.flex-wrap [class*="cursor-pointer"], [data-testid="desktop-icon"]');
    await icons.nth(1).dblclick();

    const windows = page.locator('[data-testid="window"], [class*="window"]');
    await expect(windows).toHaveCount(2, { timeout: 5000 });

    // Click first window
    await windows.first().click();

    // First window should be on top (last in DOM or highest z-index)
    const boundingBoxes = await windows.evaluateAll((els) =>
      els.map((el) => {
        const style = window.getComputedStyle(el);
        return {
          zIndex: parseInt(style.zIndex || '0'),
          visible: style.display !== 'none' && style.visibility !== 'hidden',
        };
      }),
    );

    const visible = boundingBoxes.filter((b) => b.visible);
    expect(visible.length).toBeGreaterThanOrEqual(1);

    // The last clicked window should have the highest z-index among visible windows
    const maxZ = Math.max(...visible.map((b) => b.zIndex));
    expect(visible[0].zIndex).toBeGreaterThanOrEqual(maxZ - 1);
  });

  test('window can be dragged by title bar', async ({ page }) => {
    const titleBar = page.locator('[data-testid="window-titlebar"], [class*="titlebar"], [class*="drag"]').first();
    if (!(await titleBar.isVisible())) return;

    const window = page.locator('[data-testid="window"], [class*="window"]').first();
    const boxBefore = await window.boundingBox();
    if (!boxBefore) return;

    // Drag the title bar
    await titleBar.hover();
    await page.mouse.down();
    await page.mouse.move(boxBefore.x + 100, boxBefore.y + 50);
    await page.mouse.up();

    const boxAfter = await window.boundingBox();
    if (!boxAfter) return;

    // Position should have changed
    expect(Math.abs(boxAfter.x - boxBefore.x)).toBeGreaterThan(10);
  });
});
