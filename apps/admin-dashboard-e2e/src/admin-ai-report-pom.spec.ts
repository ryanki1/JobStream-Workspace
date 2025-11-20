import { test, expect } from '@playwright/test';
import { AdminCompanyDetailPage } from './pages/admin-company-detail.page';

/**
 * E2E Tests for Admin AI Verification Report (using Page Object Model)
 *
 * This test suite uses the Page Object Model pattern for better
 * maintainability and readability.
 */

test.describe('Admin AI Report - Page Object Model Tests', () => {
  let companyDetailPage: AdminCompanyDetailPage;

  test.beforeEach(async ({ page }) => {
    companyDetailPage = new AdminCompanyDetailPage(page);

    // Setup API mocks - using the correct response format matching AdminApiService
    await page.route('**/api/admin/registrations/pending**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [{
            id: 'reg-123',
            legalName: 'Example Corp GmbH',
            companyName: 'Example Corp',
            registrationNumber: 'HRB12345',
            industry: 'Technology',
            companyEmail: 'contact@example.com',
            companySize: 'Medium',
            primaryContactName: 'John Doe',
            primaryContactEmail: 'john@example.com',
            vatId: 'DE123456789',
            status: 'PendingReview',
            stakeAmount: 2500,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }],
          total: 1,
          page: 1,
          pageSize: 20
        })
      });
    });

    await page.route('**/api/admin/registrations/reg-123', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          registration: {
            id: 'reg-123',
            companyName: 'Example Corp',
            status: 'PendingReview',
            vatId: 'DE123456789'
          },
          mlVerifications: [{
            id: 'ml-1',
            registrationId: 'reg-123',
            overallRiskScore: 42,
            riskLevel: 'Low',
            confidence: 0.87,
            recommendationsJson: JSON.stringify([
              'Verify business registration documents',
              'Check references from previous clients',
              'Monitor account activity for first 30 days'
            ]),
            webIntelligenceJson: JSON.stringify({
              handelsregister: { exists: true },
              vat_validation: { valid: true, company_name: 'Example Corp GmbH' },
              website: { accessible: true },
              linkedin: { found: true },
              news_mentions: 3
            }),
            verifiedAt: new Date().toISOString(),
            processingTimeMs: 2100
          }]
        })
      });
    });

    await page.route('**/api/admin/registrations/*/verify-ml', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'ml-2',
          registrationId: 'reg-123',
          overallRiskScore: 38,
          riskLevel: 'Low',
          confidence: 0.91,
          recommendationsJson: JSON.stringify([
            'All checks passed',
            'Company appears legitimate'
          ]),
          webIntelligenceJson: JSON.stringify({
            handelsregister: { exists: true },
            vat_validation: { valid: true, company_name: 'Example Corp GmbH' },
            website: { accessible: true },
            linkedin: { found: true },
            news_mentions: 5
          }),
          verifiedAt: new Date().toISOString(),
          processingTimeMs: 1800
        })
      });
    });

    await page.goto('/');
  });

  test('Complete AI Verification Report Flow', async () => {
    // Navigate to company (using legalName from mock data)
    await companyDetailPage.navigateToCompany('Example Corp GmbH');

    // Assert ML report is visible
    await companyDetailPage.assertMLReportVisible();

    // Assert risk score
    await companyDetailPage.assertRiskScore(42, 'Low');

    // Assert confidence
    await companyDetailPage.assertConfidence(87);

    // Assert recommendations
    await companyDetailPage.assertRecommendations([
      'Verify business registration documents',
      'Check references from previous clients',
      'Monitor account activity for first 30 days'
    ]);

    // Assert web intelligence
    await companyDetailPage.assertWebIntelligenceVisible();

    await companyDetailPage.assertWebIntelItem('Handelsregister', 'Verified', true);
    await companyDetailPage.assertWebIntelItem(
      'VAT Validation',
      'Valid',
      true,
      'Example Corp GmbH'
    );
    await companyDetailPage.assertWebIntelItem('Website', 'Accessible', true);
    await companyDetailPage.assertWebIntelItem('LinkedIn', 'Found', true);

    // Assert timestamp
    await companyDetailPage.assertTimestampVisible();

    // Assert all Sprint requirements
    await companyDetailPage.assertSprintRequirementsMet();
  });

  test('AI Verify Button Interaction', async () => {
    await companyDetailPage.navigateToCompany('Example Corp GmbH');

    // Check initial button state
    await companyDetailPage.assertAIVerifyButtonState('AI Verify', true);

    // Click AI Verify
    await companyDetailPage.clickAIVerify();

    // Check loading state
    await companyDetailPage.assertAIVerifyButtonState('Verifying...', false);

    // Wait for completion
    await companyDetailPage.waitForVerificationComplete();

    // Check button is enabled again
    await companyDetailPage.assertAIVerifyButtonState('AI Verify', true);

    // Check updated report
    await companyDetailPage.assertMLReportVisible();
  });

  test('Risk Level Color Coding - Low', async () => {
    await companyDetailPage.navigateToCompany('Example Corp GmbH');
    await companyDetailPage.assertRiskScore(42, 'Low');

    // Check CSS class for color coding
    const riskScoreElement = companyDetailPage.riskScore;
    await expect(riskScoreElement).toHaveClass(/risk-low/);
  });

  test('Recommendations Section Visibility', async () => {
    await companyDetailPage.navigateToCompany('Example Corp GmbH');

    await expect(companyDetailPage.recommendationsSection).toBeVisible();
    await expect(companyDetailPage.recommendationsTitle).toHaveText('Recommendations');

    const recommendations = companyDetailPage.getRecommendations();
    await expect(recommendations).toHaveCount(3);
  });

  test('Web Intelligence Items Display', async () => {
    await companyDetailPage.navigateToCompany('Example Corp GmbH');

    // All web intel items should be visible
    await expect(companyDetailPage.getWebIntelItem('Handelsregister')).toBeVisible();
    await expect(companyDetailPage.getWebIntelItem('VAT Validation')).toBeVisible();
    await expect(companyDetailPage.getWebIntelItem('Website')).toBeVisible();
    await expect(companyDetailPage.getWebIntelItem('LinkedIn')).toBeVisible();
    await expect(companyDetailPage.getWebIntelItem('News Mentions')).toBeVisible();
  });

  test('Sprint Plan Requirements Validation', async () => {
    await companyDetailPage.navigateToCompany('Example Corp GmbH');

    // Verify all Sprint 3 requirements from SPRINT-3.md lines 174-179
    await companyDetailPage.assertSprintRequirementsMet();
  });
});
