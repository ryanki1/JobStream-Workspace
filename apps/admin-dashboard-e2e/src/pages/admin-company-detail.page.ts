import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Admin Company Detail Page
 *
 * Provides reusable methods and locators for interacting with
 * the company detail view and AI verification report.
 */
export class AdminCompanyDetailPage {
  readonly page: Page;

  // Main sections
  readonly companyDetail: Locator;
  readonly mlVerificationSection: Locator;
  readonly mlResult: Locator;

  // Buttons
  readonly aiVerifyButton: Locator;

  // ML Report elements
  readonly mlResultTitle: Locator;
  readonly riskScore: Locator;
  readonly riskLevel: Locator;
  readonly confidence: Locator;

  // Recommendations
  readonly recommendationsSection: Locator;
  readonly recommendationsTitle: Locator;
  readonly recommendationsList: Locator;

  // Web Intelligence
  readonly webIntelligenceSection: Locator;
  readonly webIntelligenceTitle: Locator;
  readonly webIntelGrid: Locator;

  // Timestamp
  readonly verificationTimestamp: Locator;

  constructor(page: Page) {
    this.page = page;

    // Main sections
    this.companyDetail = page.locator('.company-detail');
    this.mlVerificationSection = page.locator('.ml-verification-section');
    this.mlResult = page.locator('.ml-result');

    // Buttons
    this.aiVerifyButton = page.locator('button.btn-verify');

    // ML Report elements
    this.mlResultTitle = page.locator('.ml-result-title');
    this.riskScore = page.locator('.risk-score');
    this.riskLevel = page.locator('.risk-level');
    this.confidence = page.locator('.confidence');

    // Recommendations
    this.recommendationsSection = page.locator('.recommendations-section');
    this.recommendationsTitle = this.recommendationsSection.locator('h4');
    this.recommendationsList = page.locator('.recommendations-list');

    // Web Intelligence
    this.webIntelligenceSection = page.locator('.web-intelligence-section');
    this.webIntelligenceTitle = this.webIntelligenceSection.locator('h4');
    this.webIntelGrid = page.locator('.web-intel-grid');

    // Timestamp
    this.verificationTimestamp = page.locator('.verification-timestamp');
  }

  /**
   * Navigate to a specific company registration by clicking the registration card
   */
  async navigateToCompany(legalName: string) {
    // Wait for the registration list to load
    await this.page.waitForSelector('.registration-list', { timeout: 10000 });

    // Click on the registration card containing the legal name
    const card = this.page.locator('.registration-card', { hasText: legalName });
    await card.waitFor({ state: 'visible', timeout: 10000 });
    await card.click();

    // Wait for company detail to be visible
    await this.companyDetail.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Click the AI Verify button
   */
  async clickAIVerify() {
    await this.aiVerifyButton.click();
  }

  /**
   * Wait for ML verification to complete
   */
  async waitForVerificationComplete() {
    await this.mlResult.waitFor({ state: 'visible' });
    await expect(this.aiVerifyButton).not.toHaveText('Verifying...');
  }

  /**
   * Get all recommendation items
   */
  getRecommendations(): Locator {
    return this.recommendationsList.locator('li');
  }

  /**
   * Get a specific web intelligence item by label
   */
  getWebIntelItem(label: string): Locator {
    return this.page.locator('.web-intel-item', { hasText: `${label}:` });
  }

  /**
   * Assert that the ML report is visible with all required sections
   */
  async assertMLReportVisible() {
    await expect(this.mlResult).toBeVisible();
    await expect(this.mlResultTitle).toBeVisible();
    await expect(this.riskScore).toBeVisible();
    await expect(this.confidence).toBeVisible();
  }

  /**
   * Assert risk score matches expected value and level
   */
  async assertRiskScore(score: number, level: 'Low' | 'Medium' | 'High') {
    await expect(this.riskScore).toContainText(`${score}/100`);
    await expect(this.riskLevel).toHaveText(level);

    const expectedClass = `risk-${level.toLowerCase()}`;
    await expect(this.riskScore).toHaveClass(new RegExp(expectedClass));
  }

  /**
   * Assert confidence matches expected percentage
   */
  async assertConfidence(percentage: number) {
    await expect(this.confidence).toContainText(`${percentage}%`);
  }

  /**
   * Assert recommendations are displayed correctly
   */
  async assertRecommendations(expectedRecommendations: string[]) {
    await expect(this.recommendationsSection).toBeVisible();
    await expect(this.recommendationsTitle).toHaveText('Recommendations');

    const recommendations = this.getRecommendations();
    await expect(recommendations).toHaveCount(expectedRecommendations.length);

    for (let i = 0; i < expectedRecommendations.length; i++) {
      await expect(recommendations.nth(i)).toHaveText(expectedRecommendations[i]);
    }
  }

  /**
   * Assert web intelligence summary is visible
   */
  async assertWebIntelligenceVisible() {
    await expect(this.webIntelligenceSection).toBeVisible();
    await expect(this.webIntelligenceTitle).toHaveText('Web Intelligence Summary');
  }

  /**
   * Assert a web intel item has the expected status
   */
  async assertWebIntelItem(
    label: string,
    status: string,
    verified: boolean,
    detail?: string
  ) {
    const item = this.getWebIntelItem(label);
    await expect(item).toBeVisible();

    const statusClass = verified ? 'status-verified' : 'status-unverified';
    const statusSpan = item.locator(`span.${statusClass}`);
    await expect(statusSpan).toHaveText(status);

    if (detail) {
      const detailDiv = item.locator('.web-intel-detail');
      await expect(detailDiv).toHaveText(detail);
    }
  }

  /**
   * Assert verification timestamp is displayed
   */
  async assertTimestampVisible() {
    await expect(this.verificationTimestamp).toBeVisible();
    await expect(this.verificationTimestamp.locator('small')).toContainText('Verified:');
  }

  /**
   * Assert AI Verify button state
   */
  async assertAIVerifyButtonState(text: string, enabled: boolean) {
    await expect(this.aiVerifyButton).toHaveText(text);
    if (enabled) {
      await expect(this.aiVerifyButton).toBeEnabled();
    } else {
      await expect(this.aiVerifyButton).toBeDisabled();
    }
  }

  /**
   * Assert all Sprint requirements are met
   */
  async assertSprintRequirementsMet() {
    // Risk Score with color coding
    await expect(this.riskScore).toBeVisible();
    await expect(this.riskLevel).toBeVisible();

    // Recommendations List
    await expect(this.recommendationsSection).toBeVisible();

    // Web Intelligence Summary
    await expect(this.webIntelligenceSection).toBeVisible();

    // Confidence indicator (implicit requirement)
    await expect(this.confidence).toBeVisible();
  }
}
