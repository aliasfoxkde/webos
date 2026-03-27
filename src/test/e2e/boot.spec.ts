import { test, expect } from '@playwright/test';

test.describe('OS Boot', () => {
  test('page loads and desktop is visible', async ({ page }) => {
    await page.goto('/');
    // Desktop is a fixed fullscreen div with inset-0 and overflow-hidden
    const desktop = page.locator('.fixed.inset-0.overflow-hidden');
    await expect(desktop).toBeVisible({ timeout: 10000 });
  });

  test('taskbar appears at bottom', async ({ page }) => {
    await page.goto('/');
    // Taskbar is fixed bottom-0 with h-12
    const taskbar = page.locator('.fixed.bottom-0.h-12');
    await expect(taskbar).toBeVisible({ timeout: 10000 });
  });

  test('start button is visible', async ({ page }) => {
    await page.goto('/');
    const startBtn = page.locator('button', { hasText: 'Start' });
    await expect(startBtn).toBeVisible({ timeout: 10000 });
  });

  test('no critical console errors on boot', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await page.waitForTimeout(2000);

    // Filter out non-critical errors
    const critical = errors.filter(
      (e) =>
        !e.includes('favicon') &&
        !e.includes('manifest') &&
        !e.includes('net::ERR_'),
    );
    expect(critical).toHaveLength(0);
  });
});
