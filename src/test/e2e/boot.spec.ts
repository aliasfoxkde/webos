import { test, expect } from '@playwright/test';

test.describe('OS Boot', () => {
  test('page loads and desktop is visible', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    // Desktop should be the full viewport
    const desktop = page.locator('.fixed.inset-0');
    await expect(desktop).toBeVisible();
  });

  test('taskbar appears at bottom', async ({ page }) => {
    await page.goto('/');
    // Taskbar should be present — look for the start button or taskbar container
    const taskbar = page.locator('[data-testid="taskbar"], .fixed.bottom-0');
    await expect(taskbar).toBeVisible({ timeout: 10000 });
  });

  test('start button is visible', async ({ page }) => {
    await page.goto('/');
    const startBtn = page.locator('[data-testid="start-button"], button:has-text("Start"), button:has-text("⬡")');
    await expect(startBtn.first()).toBeVisible({ timeout: 10000 });
  });

  test('no critical console errors on boot', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await page.waitForTimeout(2000);

    // Filter out non-critical errors (e.g., network, external resources)
    const critical = errors.filter(
      (e) =>
        !e.includes('favicon') &&
        !e.includes('manifest') &&
        !e.includes('net::ERR_'),
    );
    expect(critical).toHaveLength(0);
  });
});
