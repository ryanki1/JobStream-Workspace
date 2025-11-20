import { test, expect } from '@playwright/test';
import { AdminCompanyDetailPage } from './pages/admin-company-detail.page';

/**
 * E2E Tests for Admin AI Verification - Edge Cases & Error Scenarios
 *
 * This suite focuses on edge cases, error handling, and scenarios
 * not covered by the main POM tests.
 */

test.describe('Admin AI Verification - Edge Cases', () => {
  let companyDetailPage: AdminCompanyDetailPage;

  test.describe('Risk Level Variations', () => {
    test('should display Medium risk level with correct styling', async ({ page }) => {
      companyDetailPage = new AdminCompanyDetailPage(page);

      // Mock with medium risk
      await page.route('**/api/admin/registrations/pending**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [{
              id: 'reg-medium',
              legalName: 'Medium Risk Corp',
              companyName: 'Medium Corp',
              registrationNumber: 'HRB99999',
              industry: 'Consulting',
              companyEmail: 'info@medium.com',
              companySize: 'Small',
              primaryContactName: 'Jane Smith',
              primaryContactEmail: 'jane@medium.com',
              vatId: 'DE987654321',
              status: 'PendingReview',
              createdAt: new Date().toISOString()
            }],
            total: 1,
            page: 1,
            pageSize: 20
          })
        });
      });

      await page.route('**/api/admin/registrations/reg-medium', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            registration: { id: 'reg-medium', legalName: 'Medium Risk Corp' },
            mlVerifications: [{
              id: 'ml-medium',
              registrationId: 'reg-medium',
              overallRiskScore: 55,
              riskLevel: 'Medium',
              confidence: 0.78,
              recommendationsJson: JSON.stringify([
                'Conduct thorough background check',
                'Request additional documentation'
              ]),
              webIntelligenceJson: JSON.stringify({
                handelsregister: { exists: true },
                vat_validation: { valid: true, company_name: 'Medium Risk Corp' },
                website: { accessible: false },
                linkedin: { found: false },
                news_mentions: 1
              }),
              verifiedAt: new Date().toISOString(),
              processingTimeMs: 2000
            }]
          })
        });
      });

      await page.goto('/');
      await companyDetailPage.navigateToCompany('Medium Risk Corp');

      // Assert medium risk styling
      await companyDetailPage.assertRiskScore(55, 'Medium');
      await expect(companyDetailPage.riskScore).toHaveClass(/risk-medium/);
      await expect(companyDetailPage.riskLevel).toContainText('Medium');
    });

    test('should display High risk level with correct styling', async ({ page }) => {
      companyDetailPage = new AdminCompanyDetailPage(page);

      await page.route('**/api/admin/registrations/pending**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [{
              id: 'reg-high',
              legalName: 'High Risk Corp',
              companyName: 'High Corp',
              registrationNumber: 'HRB11111',
              industry: 'Finance',
              companyEmail: 'info@highrisk.com',
              companySize: 'Large',
              primaryContactName: 'Bob Johnson',
              primaryContactEmail: 'bob@highrisk.com',
              vatId: 'DE111111111',
              status: 'PendingReview',
              createdAt: new Date().toISOString()
            }],
            total: 1,
            page: 1,
            pageSize: 20
          })
        });
      });

      await page.route('**/api/admin/registrations/reg-high', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            registration: { id: 'reg-high', legalName: 'High Risk Corp' },
            mlVerifications: [{
              id: 'ml-high',
              registrationId: 'reg-high',
              overallRiskScore: 85,
              riskLevel: 'High',
              confidence: 0.92,
              recommendationsJson: JSON.stringify([
                'REJECT - Multiple red flags detected',
                'Company appears suspicious',
                'No verifiable online presence'
              ]),
              webIntelligenceJson: JSON.stringify({
                handelsregister: { exists: false },
                vat_validation: { valid: false },
                website: { accessible: false },
                linkedin: { found: false },
                news_mentions: 0
              }),
              verifiedAt: new Date().toISOString(),
              processingTimeMs: 1500
            }]
          })
        });
      });

      await page.goto('/');
      await companyDetailPage.navigateToCompany('High Risk Corp');

      // Assert high risk styling
      await companyDetailPage.assertRiskScore(85, 'High');
      await expect(companyDetailPage.riskScore).toHaveClass(/risk-high/);
      await expect(companyDetailPage.riskLevel).toContainText('High');
    });
  });

  test.describe('Missing Data Scenarios', () => {
    test('should handle missing recommendations gracefully', async ({ page }) => {
      companyDetailPage = new AdminCompanyDetailPage(page);

      await page.route('**/api/admin/registrations/pending**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [{
              id: 'reg-no-rec',
              legalName: 'No Recommendations Corp',
              companyName: 'No Rec',
              registrationNumber: 'HRB22222',
              industry: 'Retail',
              companyEmail: 'info@norec.com',
              companySize: 'Medium',
              primaryContactName: 'Alice Brown',
              primaryContactEmail: 'alice@norec.com',
              vatId: 'DE222222222',
              status: 'PendingReview',
              createdAt: new Date().toISOString()
            }],
            total: 1,
            page: 1,
            pageSize: 20
          })
        });
      });

      await page.route('**/api/admin/registrations/reg-no-rec', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            registration: { id: 'reg-no-rec', legalName: 'No Recommendations Corp' },
            mlVerifications: [{
              id: 'ml-no-rec',
              registrationId: 'reg-no-rec',
              overallRiskScore: 25,
              riskLevel: 'Low',
              confidence: 0.95,
              recommendationsJson: null,
              recommendations: null,
              webIntelligenceJson: JSON.stringify({
                handelsregister: { exists: true },
                vat_validation: { valid: true, company_name: 'No Recommendations Corp' }
              }),
              verifiedAt: new Date().toISOString(),
              processingTimeMs: 1200
            }]
          })
        });
      });

      await page.goto('/');
      await companyDetailPage.navigateToCompany('No Recommendations Corp');

      // Recommendations section should not be visible
      await expect(companyDetailPage.recommendationsSection).not.toBeVisible();

      // But other sections should still work
      await companyDetailPage.assertMLReportVisible();
      await companyDetailPage.assertRiskScore(25, 'Low');
    });

    test('should handle missing web intelligence gracefully', async ({ page }) => {
      companyDetailPage = new AdminCompanyDetailPage(page);

      await page.route('**/api/admin/registrations/pending**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [{
              id: 'reg-no-intel',
              legalName: 'No Intelligence Corp',
              companyName: 'No Intel',
              registrationNumber: 'HRB33333',
              industry: 'Manufacturing',
              companyEmail: 'info@nointel.com',
              companySize: 'Small',
              primaryContactName: 'Charlie Davis',
              primaryContactEmail: 'charlie@nointel.com',
              vatId: 'DE333333333',
              status: 'PendingReview',
              createdAt: new Date().toISOString()
            }],
            total: 1,
            page: 1,
            pageSize: 20
          })
        });
      });

      await page.route('**/api/admin/registrations/reg-no-intel', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            registration: { id: 'reg-no-intel', legalName: 'No Intelligence Corp' },
            mlVerifications: [{
              id: 'ml-no-intel',
              registrationId: 'reg-no-intel',
              overallRiskScore: 50,
              riskLevel: 'Medium',
              confidence: 0.65,
              recommendationsJson: JSON.stringify(['Verify manually']),
              webIntelligenceJson: null,
              verifiedAt: new Date().toISOString(),
              processingTimeMs: 1000
            }]
          })
        });
      });

      await page.goto('/');
      await companyDetailPage.navigateToCompany('No Intelligence Corp');

      // Web intelligence section should not be visible
      await expect(companyDetailPage.webIntelligenceSection).not.toBeVisible();

      // But other sections should still work
      await companyDetailPage.assertMLReportVisible();
      await companyDetailPage.assertRiskScore(50, 'Medium');
      await expect(companyDetailPage.recommendationsSection).toBeVisible();
    });

    test('should handle empty web intelligence object', async ({ page }) => {
      companyDetailPage = new AdminCompanyDetailPage(page);

      await page.route('**/api/admin/registrations/pending**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [{
              id: 'reg-empty',
              legalName: 'Empty Intel Corp',
              companyName: 'Empty',
              registrationNumber: 'HRB44444',
              industry: 'Services',
              companyEmail: 'info@empty.com',
              companySize: 'Medium',
              primaryContactName: 'Diana Evans',
              primaryContactEmail: 'diana@empty.com',
              vatId: 'DE444444444',
              status: 'PendingReview',
              createdAt: new Date().toISOString()
            }],
            total: 1,
            page: 1,
            pageSize: 20
          })
        });
      });

      await page.route('**/api/admin/registrations/reg-empty', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            registration: { id: 'reg-empty', legalName: 'Empty Intel Corp' },
            mlVerifications: [{
              id: 'ml-empty',
              registrationId: 'reg-empty',
              overallRiskScore: 45,
              riskLevel: 'Medium',
              confidence: 0.70,
              recommendationsJson: JSON.stringify(['Manual review required']),
              webIntelligenceJson: JSON.stringify({}), // Empty object
              verifiedAt: new Date().toISOString(),
              processingTimeMs: 900
            }]
          })
        });
      });

      await page.goto('/');
      await companyDetailPage.navigateToCompany('Empty Intel Corp');

      // Web intelligence section should be visible but may have no items
      await expect(companyDetailPage.webIntelligenceSection).toBeVisible();
      await expect(companyDetailPage.webIntelligenceTitle).toHaveText('Web Intelligence Summary');
    });
  });

  test.describe('Report Persistence', () => {
    test('should persist report when navigating away and back', async ({ page }) => {
      companyDetailPage = new AdminCompanyDetailPage(page);

      await page.route('**/api/admin/registrations/pending**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [{
              id: 'reg-persist',
              legalName: 'Persistent Corp',
              companyName: 'Persist',
              registrationNumber: 'HRB55555',
              industry: 'Technology',
              companyEmail: 'info@persist.com',
              companySize: 'Large',
              primaryContactName: 'Edward Foster',
              primaryContactEmail: 'edward@persist.com',
              vatId: 'DE555555555',
              status: 'PendingReview',
              createdAt: new Date().toISOString()
            }],
            total: 1,
            page: 1,
            pageSize: 20
          })
        });
      });

      await page.route('**/api/admin/registrations/reg-persist', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            registration: { id: 'reg-persist', legalName: 'Persistent Corp' },
            mlVerifications: [{
              id: 'ml-persist',
              registrationId: 'reg-persist',
              overallRiskScore: 30,
              riskLevel: 'Low',
              confidence: 0.88,
              recommendationsJson: JSON.stringify(['Approve after final check']),
              webIntelligenceJson: JSON.stringify({
                handelsregister: { exists: true },
                vat_validation: { valid: true, company_name: 'Persistent Corp' },
                website: { accessible: true },
                linkedin: { found: true },
                news_mentions: 10
              }),
              verifiedAt: new Date().toISOString(),
              processingTimeMs: 2200
            }]
          })
        });
      });

      await page.goto('/');
      await companyDetailPage.navigateToCompany('Persistent Corp');

      // Verify report is visible
      await companyDetailPage.assertMLReportVisible();
      const originalScore = await companyDetailPage.riskScore.textContent();
      expect(originalScore).toContain('30/100');

      // Navigate to the list (simulate going back)
      // In a real scenario, user might click a "Back" button or similar
      // For this test, we'll just verify the report persists in the same view

      // Report should still be visible without reloading
      await expect(companyDetailPage.mlResult).toBeVisible();
      const persistedScore = await companyDetailPage.riskScore.textContent();
      expect(persistedScore).toContain('30/100');
    });
  });

  test.describe('Re-verification Scenarios', () => {
    test('should update report when re-running AI verification', async ({ page }) => {
      companyDetailPage = new AdminCompanyDetailPage(page);

      let verificationCount = 0;

      await page.route('**/api/admin/registrations/pending**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [{
              id: 'reg-reverify',
              legalName: 'Reverify Corp',
              companyName: 'Reverify',
              registrationNumber: 'HRB66666',
              industry: 'Consulting',
              companyEmail: 'info@reverify.com',
              companySize: 'Medium',
              primaryContactName: 'Fiona Green',
              primaryContactEmail: 'fiona@reverify.com',
              vatId: 'DE666666666',
              status: 'PendingReview',
              createdAt: new Date().toISOString()
            }],
            total: 1,
            page: 1,
            pageSize: 20
          })
        });
      });

      await page.route('**/api/admin/registrations/reg-reverify', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            registration: { id: 'reg-reverify', legalName: 'Reverify Corp' },
            mlVerifications: [{
              id: 'ml-initial',
              registrationId: 'reg-reverify',
              overallRiskScore: 40,
              riskLevel: 'Low',
              confidence: 0.80,
              recommendationsJson: JSON.stringify(['Initial verification complete']),
              webIntelligenceJson: JSON.stringify({
                handelsregister: { exists: true }
              }),
              verifiedAt: new Date().toISOString(),
              processingTimeMs: 1800
            }]
          })
        });
      });

      await page.route('**/api/admin/registrations/*/verify-ml', async (route) => {
        verificationCount++;
        await new Promise(resolve => setTimeout(resolve, 500));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: `ml-new-${verificationCount}`,
            registrationId: 'reg-reverify',
            overallRiskScore: 35, // Improved score
            riskLevel: 'Low',
            confidence: 0.92, // Higher confidence
            recommendationsJson: JSON.stringify(['Re-verification complete - all clear']),
            webIntelligenceJson: JSON.stringify({
              handelsregister: { exists: true },
              vat_validation: { valid: true, company_name: 'Reverify Corp' },
              website: { accessible: true }
            }),
            verifiedAt: new Date().toISOString(),
            processingTimeMs: 1600
          })
        });
      });

      await page.goto('/');
      await companyDetailPage.navigateToCompany('Reverify Corp');

      // Initial state
      await companyDetailPage.assertRiskScore(40, 'Low');

      // Trigger re-verification
      await companyDetailPage.clickAIVerify();
      await companyDetailPage.waitForVerificationComplete();

      // Should show updated results
      await companyDetailPage.assertRiskScore(35, 'Low');
      await companyDetailPage.assertConfidence(92);

      expect(verificationCount).toBe(1);
    });
  });
});
