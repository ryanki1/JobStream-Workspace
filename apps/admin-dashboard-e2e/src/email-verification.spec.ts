import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Email Verification Flow
 *
 * This test suite covers the email verification step of the company registration process.
 * It tests both successful and failed verification scenarios.
 */

test.describe('Email Verification', () => {
  const baseUrl = 'http://localhost:4200';
  const validRegistrationId = '123e4567-e89b-12d3-a456-426614174000';
  const validToken = 'valid-verification-token-123';
  const invalidToken = 'invalid-token';

  test.beforeEach(async ({ page }) => {
    // Set up console logging for debugging
    page.on('console', (msg) => console.log('Browser console:', msg.text()));
  });

  test('should show loading state initially', async ({ page }) => {
    // Mock API to delay response
    await page.route('**/api/company/register/verify-email', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          verified: true,
          nextStep: 'company-details'
        })
      });
    });

    await page.goto(`${baseUrl}/register/verify?id=${validRegistrationId}&token=${validToken}`);

    // Should show loading spinner and message
    await expect(page.locator('.spinner')).toBeVisible();
    await expect(page.locator('text=E-Mail wird verifiziert')).toBeVisible();
  });

  test('should successfully verify email with valid token', async ({ page }) => {
    // Mock successful verification API response
    await page.route('**/api/company/register/verify-email', async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();

      // Verify request payload
      expect(postData.registrationId).toBe(validRegistrationId);
      expect(postData.verificationToken).toBe(validToken);

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          verified: true,
          nextStep: 'company-details'
        })
      });
    });

    await page.goto(`${baseUrl}/register/verify?id=${validRegistrationId}&token=${validToken}`);

    // Wait for success state
    await expect(page.locator('.verification-success')).toBeVisible({ timeout: 10000 });

    // Should show success icon
    await expect(page.locator('.success-icon svg')).toBeVisible();

    // Should show success message
    await expect(page.locator('h2:has-text("erfolgreich bestätigt")')).toBeVisible();
    await expect(page.locator('.success-message')).toContainText('erfolgreich verifiziert');

    // Should show next steps
    await expect(page.locator('.next-steps h3')).toContainText('Nächste Schritte');
    await expect(page.locator('.next-steps li').first()).toContainText('Unternehmensdaten');

    // Should show continue button
    const continueButton = page.locator('button:has-text("Weiter zur Registrierung")');
    await expect(continueButton).toBeVisible();
    await expect(continueButton).toBeEnabled();

    // Should store registration ID in session storage
    const registrationId = await page.evaluate(() => sessionStorage.getItem('registrationId'));
    expect(registrationId).toBe(validRegistrationId);
  });

  test('should handle expired verification token', async ({ page }) => {
    // Mock API response for expired token
    await page.route('**/api/company/register/verify-email', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'VALIDATION_ERROR',
          message: 'Der Verifizierungslink ist ungültig oder abgelaufen.'
        })
      });
    });

    await page.goto(`${baseUrl}/register/verify?id=${validRegistrationId}&token=${invalidToken}`);

    // Wait for error state
    await expect(page.locator('.verification-error')).toBeVisible({ timeout: 10000 });

    // Should show error icon
    await expect(page.locator('.error-icon svg')).toBeVisible();

    // Should show error heading
    await expect(page.locator('h2:has-text("fehlgeschlagen")')).toBeVisible();

    // Should show error message
    await expect(page.locator('.error-message')).toBeVisible();

    // Should show possible reasons
    await expect(page.locator('.error-reasons h3')).toContainText('Mögliche Gründe');
    await expect(page.locator('.error-reasons li').first()).toContainText('abgelaufen');

    // Should show action buttons
    await expect(page.locator('button:has-text("Neuen Verifizierungslink")')).toBeVisible();
    await expect(page.locator('button:has-text("Zur Startseite")')).toBeVisible();
  });

  test('should handle invalid verification token', async ({ page }) => {
    // Mock API response for invalid token
    await page.route('**/api/company/register/verify-email', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'VALIDATION_ERROR',
          message: 'Der Verifizierungslink ist ungültig oder abgelaufen.'
        })
      });
    });

    await page.goto(`${baseUrl}/register/verify?id=${validRegistrationId}&token=bad-token`);

    // Wait for error state
    await expect(page.locator('.verification-error')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.error-message')).toContainText('ungültig oder abgelaufen');
  });

  test('should handle registration not found', async ({ page }) => {
    const invalidRegistrationId = 'non-existent-id';

    // Mock API response for not found
    await page.route('**/api/company/register/verify-email', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'REGISTRATION_NOT_FOUND',
          message: 'Die Registrierung wurde nicht gefunden.'
        })
      });
    });

    await page.goto(`${baseUrl}/register/verify?id=${invalidRegistrationId}&token=${validToken}`);

    // Wait for error state
    await expect(page.locator('.verification-error')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.error-message')).toContainText('nicht gefunden');
  });

  test('should handle missing query parameters', async ({ page }) => {
    // Navigate without query parameters
    await page.goto(`${baseUrl}/register/verify`);

    // Should show missing parameters error
    await expect(page.locator('.verification-error')).toBeVisible();
    await expect(page.locator('h2:has-text("Ungültiger Link")')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('ungültig');

    // Should show home button
    await expect(page.locator('button:has-text("Zur Startseite")')).toBeVisible();
  });

  test('should handle missing registration ID', async ({ page }) => {
    // Navigate with only token parameter
    await page.goto(`${baseUrl}/register/verify?token=${validToken}`);

    await expect(page.locator('.verification-error')).toBeVisible();
    await expect(page.locator('h2:has-text("Ungültiger Link")')).toBeVisible();
  });

  test('should handle missing token', async ({ page }) => {
    // Navigate with only ID parameter
    await page.goto(`${baseUrl}/register/verify?id=${validRegistrationId}`);

    await expect(page.locator('.verification-error')).toBeVisible();
    await expect(page.locator('h2:has-text("Ungültiger Link")')).toBeVisible();
  });

  test('should navigate to company details on continue button click', async ({ page }) => {
    // Mock successful verification
    await page.route('**/api/company/register/verify-email', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          verified: true,
          nextStep: 'company-details'
        })
      });
    });

    await page.goto(`${baseUrl}/register/verify?id=${validRegistrationId}&token=${validToken}`);

    // Wait for success state
    await expect(page.locator('.verification-success')).toBeVisible({ timeout: 10000 });

    // Click continue button
    await page.locator('button:has-text("Weiter zur Registrierung")').click();

    // Should navigate to company details page
    // TODO [kr] uncomment when company details page available - await expect(page).toHaveURL(new RegExp(`/register/company-details\\?id=${validRegistrationId}`));
  });

  test('should navigate to home on home button click', async ({ page }) => {
    // Mock API error
    await page.route('**/api/company/register/verify-email', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'VALIDATION_ERROR',
          message: 'Der Verifizierungslink ist ungültig oder abgelaufen.'
        })
      });
    });

    await page.goto(`${baseUrl}/register/verify?id=${validRegistrationId}&token=bad-token`);

    // Wait for error state
    await expect(page.locator('.verification-error')).toBeVisible({ timeout: 10000 });

    // Click home button
    await page.locator('button:has-text("Zur Startseite")').click();

    // Should navigate to home
    // TODO [kr] uncomment when home page available - await expect(page).toHaveURL(baseUrl + '/');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network error
    await page.route('**/api/company/register/verify-email', async (route) => {
      await route.abort('failed');
    });

    await page.goto(`${baseUrl}/register/verify?id=${validRegistrationId}&token=${validToken}`);

    // Should show error state
    await expect(page.locator('.verification-error')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.error-message')).toContainText(/unerwarteter Fehler|später erneut/i);
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Mock successful verification
    await page.route('**/api/company/register/verify-email', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          verified: true,
          nextStep: 'company-details'
        })
      });
    });

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

    await page.goto(`${baseUrl}/register/verify?id=${validRegistrationId}&token=${validToken}`);

    // Wait for success state
    await expect(page.locator('.verification-success')).toBeVisible({ timeout: 10000 });

    // Take screenshot for visual regression
    await page.screenshot({ path: 'screenshots/email-verification-mobile-success.png' });

    // Card should still be visible and properly sized
    const card = page.locator('.verify-email-card');
    await expect(card).toBeVisible();

    // Button should be visible and clickable
    const button = page.locator('button:has-text("Weiter zur Registrierung")');
    await expect(button).toBeVisible();
  });

  test('should display info footer', async ({ page }) => {
    await page.goto(`${baseUrl}/register/verify?id=${validRegistrationId}&token=${validToken}`);

    // Info footer should always be visible
    await expect(page.locator('.info-footer')).toBeVisible();
    await expect(page.locator('.info-footer p')).toContainText('24 Stunden gültig');
  });
});
