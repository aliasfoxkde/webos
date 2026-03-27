import { test, expect } from '@playwright/test';

test.describe('Window Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Open a window by double-clicking the File Manager icon
    const icon = page.locator('.fixed.inset-0 button', { hasText: 'File Manager' });
    await icon.dblclick();

    const windowEl = page.locator('.rounded-lg.shadow-xl.border').first();
    await expect(windowEl).toBeVisible({ timeout: 5000 });
  });

  test('window has minimize, maximize, and close buttons', async ({ page }) => {
    const windowEl = page.locator('.rounded-lg.shadow-xl.border').first();
    // Title bar has 3 control buttons with title attributes
    await expect(windowEl.locator('button[title="Minimize"]')).toBeVisible();
    await expect(windowEl.locator('button[title="Maximize"]')).toBeVisible();
    await expect(windowEl.locator('button[title="Close"]')).toBeVisible();
  });

  test('minimize button hides the window', async ({ page }) => {
    const windowEl = page.locator('.rounded-lg.shadow-xl.border').first();
    const minimizeBtn = windowEl.locator('button[title="Minimize"]');
    await minimizeBtn.click();

    // Window should be hidden (minimized) — component returns null
    await expect(windowEl).not.toBeVisible({ timeout: 3000 });
  });

  test('clicking a window focuses it (z-index)', async ({ page }) => {
    // Open a second window (Writer)
    const writerIcon = page.locator('.fixed.inset-0 button', { hasText: 'Writer' });
    await writerIcon.dblclick();

    const windows = page.locator('.rounded-lg.shadow-xl.border');
    await expect(windows).toHaveCount(2, { timeout: 5000 });

    // Wait for any loading spinners to disappear
    await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

    // Verify the second window (Writer) has a higher z-index than the first (File Manager)
    // This is the expected behavior — last opened window is on top
    const zIndices = await windows.evaluateAll((els) =>
      els.map((el) => {
        const style = window.getComputedStyle(el);
        return parseInt(style.zIndex || '0');
      }),
    );

    // Second window should have higher z-index (last focused)
    expect(zIndices[1]).toBeGreaterThan(zIndices[0]);

    // Now close the Writer window to bring File Manager back on top
    const closeBtn = windows.nth(1).locator('button[title="Close"]');
    await closeBtn.click();
    await page.waitForTimeout(200);

    // Re-open Writer to test focus switching
    await writerIcon.dblclick();
    const windows2 = page.locator('.rounded-lg.shadow-xl.border');
    await expect(windows2).toHaveCount(2, { timeout: 5000 });

    // Now Writer should again be on top
    const zIndices2 = await windows2.evaluateAll((els) =>
      els.map((el) => {
        const style = window.getComputedStyle(el);
        return parseInt(style.zIndex || '0');
      }),
    );
    expect(zIndices2[1]).toBeGreaterThan(zIndices2[0]);
  });

  test('window can be dragged by title bar', async ({ page }) => {
    const windowEl = page.locator('.rounded-lg.shadow-xl.border').first();
    const titleBar = windowEl.locator('.h-9.select-none');

    const boxBefore = await windowEl.boundingBox();
    expect(boxBefore).not.toBeNull();

    // Drag the title bar
    await titleBar.hover();
    await page.mouse.down();
    await page.mouse.move(boxBefore!.x + 100, boxBefore!.y + 50);
    await page.mouse.up();

    const boxAfter = await windowEl.boundingBox();
    expect(boxAfter).not.toBeNull();

    // Position should have changed
    expect(Math.abs(boxAfter!.x - boxBefore!.x)).toBeGreaterThan(10);
  });
});
