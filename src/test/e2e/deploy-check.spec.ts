import { test, expect } from '@playwright/test';

// Run against deployed site: npx playwright test src/test/e2e/deploy-check.spec.ts --config=playwright-deploy.config.ts

test.describe('Deployed Site Check', () => {
  test('page loads and captures console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('https://webos-aiv.pages.dev/', { waitUntil: 'networkidle' });

    // Wait for boot screen to finish (taskbar or start button appears)
    const taskbar = page.locator('.fixed.bottom-0.h-12');
    await taskbar.waitFor({ timeout: 15000 }).catch(() => {});

    // Check for any JS errors
    console.log('Console errors:', JSON.stringify(errors, null, 2));

    // Check if root div has content
    const root = page.locator('#root');
    const html = await root.innerHTML();
    console.log('Root innerHTML length:', html.length);
    console.log('Root innerHTML preview:', html.substring(0, 500));

    // Check if desktop is visible
    const desktop = page.locator('.fixed.inset-0.overflow-hidden');
    const desktopVisible = await desktop.isVisible().catch(() => false);
    console.log('Desktop visible:', desktopVisible);

    // Check if taskbar is visible
    const taskbarVisible = await taskbar.isVisible().catch(() => false);
    console.log('Taskbar visible:', taskbarVisible);

    // Check if start button exists
    const startBtn = page.locator('button', { hasText: 'Start' });
    const startBtnVisible = await startBtn.isVisible().catch(() => false);
    console.log('Start button visible:', startBtnVisible);

    // Check if any windows exist
    const windows = page.locator('.rounded-lg.shadow-xl.border');
    const windowCount = await windows.count();
    console.log('Window count:', windowCount);

    // Critical: report all findings
    expect(desktopVisible || taskbarVisible).toBe(true);
  });

  test('try clicking start button', async ({ page }) => {
    await page.goto('https://webos-aiv.pages.dev/', { waitUntil: 'networkidle' });

    // Wait for boot screen to finish
    const taskbar = page.locator('.fixed.bottom-0.h-12');
    await taskbar.waitFor({ timeout: 15000 }).catch(() => {});

    const startBtn = page.locator('button', { hasText: 'Start' });
    const startBtnVisible = await startBtn.isVisible().catch(() => false);
    console.log('Start button visible:', startBtnVisible);

    if (startBtnVisible) {
      await startBtn.click();
      await page.waitForTimeout(1000);

      const menu = page.locator('.fixed.bottom-14');
      const menuVisible = await menu.isVisible().catch(() => false);
      console.log('Start menu visible:', menuVisible);
    } else {
      console.log('Start button NOT found - page may not have loaded');
      const bodyText = await page.locator('body').textContent();
      console.log('Body text:', bodyText?.substring(0, 200));
    }
  });
});
