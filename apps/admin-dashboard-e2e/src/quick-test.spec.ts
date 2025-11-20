import { test, expect } from '@playwright/test';

/**
 * Quick smoke test to verify Playwright setup
 */
test.describe('Quick Smoke Test', () => {
  test('should load the admin dashboard', async ({ page }) => {
    await page.goto('/');

    // Just verify the page loads
    await expect(page.locator('.registration-list').locator('h1')).toHaveText(/Customer Verification/i, { timeout: 10000 });
  });
});
