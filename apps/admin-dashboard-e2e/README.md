# Admin Dashboard E2E Tests

Playwright end-to-end tests for the JobStream Admin Dashboard, with comprehensive coverage of the AI Verification Report functionality.

## Test Files

### `admin-ai-report-pom.spec.ts` ⭐ **Main Test Suite**
Clean test suite using the Page Object Model pattern:
- Complete AI verification flow (Low risk scenario)
- AI Verify button interaction and state management
- Risk level color coding validation
- Recommendations section visibility
- Web intelligence items display (all 5 sources)
- Sprint 3 plan requirements validation

**Total Tests:** 6 test cases
**Coverage:** Happy path and core functionality

### `admin-ai-edge-cases.spec.ts` 🔍 **Edge Cases & Error Handling**
Specialized tests for edge cases and error scenarios:
- **Risk Level Variations:** Medium and High risk scenarios with correct styling
- **Missing Data Scenarios:**
  - Missing recommendations
  - Missing web intelligence
  - Empty web intelligence object
- **Report Persistence:** Data persists across navigation
- **Re-verification:** Updated results when re-running AI verification

**Total Tests:** 7 test cases
**Coverage:** Edge cases, error handling, data variations

### `pages/admin-company-detail.page.ts`
Page Object Model providing reusable methods and locators for:
- Navigating to company details
- Interacting with AI Verify button
- Accessing ML report elements
- Assertions for all report components

## Running Tests

### Run all E2E tests (headless)
```bash
npm run test:e2e
```

### Run with Playwright UI mode (recommended for development)
```bash
npm run test:e2e:ui
```

### Run in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Debug mode (step through tests)
```bash
npm run test:e2e:debug
```

### Run specific test file
```bash
npx playwright test admin-ai-verification.spec.ts
```

### Run specific test by name
```bash
npx playwright test -g "should display Risk Score"
```

## Test Coverage

### Sprint 3 Requirements (SPRINT-3.md lines 174-179)
All requirements are validated in the tests:

- ✅ **Risk score visualization (color-coded)**
  - Low: Green (#d4edda)
  - Medium: Yellow (#fff3cd)
  - High: Red (#f8d7da)

- ✅ **Recommendations list**
  - Displayed in dedicated section
  - All recommendations from ML service shown

- ✅ **Web intelligence summary**
  - Handelsregister verification status
  - VAT validation with company name
  - Website accessibility
  - LinkedIn presence
  - News mentions count

- ✅ **Confidence indicator**
  - Displayed as percentage

### Test Scenarios

1. **Button Interaction**
   - Button is visible and enabled
   - Loading state during verification
   - Button re-enabled after completion

2. **Report Display**
   - All sections visible after verification
   - Correct data formatting
   - Proper color coding

3. **Data Persistence**
   - Report remains visible after navigation
   - Updates when new verification triggered

4. **Error Handling**
   - Missing recommendations handled gracefully
   - Missing web intelligence handled gracefully
   - Invalid JSON parsing errors caught

## Mock Data

Tests use mocked API responses to ensure consistent behavior:

### Endpoints Mocked:
- `GET /api/admin/registrations/pending` - List of pending registrations
- `GET /api/admin/registrations/{id}` - Registration details with ML results
- `POST /api/admin/registrations/{id}/verify-ml` - Trigger new ML verification

### Mock ML Verification Result:
```json
{
  "overallRiskScore": 35,
  "riskLevel": "Low",
  "confidence": 0.85,
  "recommendations": [
    "Request additional business references",
    "Verify bank account details with micro-deposits",
    "Monitor first 3 months of activity closely"
  ],
  "webIntelligence": {
    "handelsregister": { "exists": true },
    "vat_validation": { "valid": true, "company_name": "Test GmbH" },
    "website": { "accessible": true },
    "linkedin": { "found": true },
    "news_mentions": 5
  }
}
```

## Page Object Model

The `AdminCompanyDetailPage` class provides clean, reusable test methods:

```typescript
// Example usage
const companyDetailPage = new AdminCompanyDetailPage(page);

await companyDetailPage.navigateToCompany('Example Corp');
await companyDetailPage.assertRiskScore(42, 'Low');
await companyDetailPage.assertRecommendations([...]);
await companyDetailPage.assertWebIntelligenceVisible();
```

### Key Methods:

- `navigateToCompany(name)` - Navigate to specific company
- `clickAIVerify()` - Trigger AI verification
- `waitForVerificationComplete()` - Wait for ML process
- `assertMLReportVisible()` - Verify report display
- `assertRiskScore(score, level)` - Validate risk assessment
- `assertRecommendations(list)` - Check recommendations
- `assertWebIntelItem(label, status, verified)` - Validate web intel
- `assertSprintRequirementsMet()` - Validate all Sprint 3 requirements

## CI/CD Integration

### GitHub Actions Example:
```yaml
- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run E2E Tests
  run: npm run test:e2e

- name: Upload Test Results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Debugging Failed Tests

### View test report:
```bash
npx playwright show-report
```

### Run with trace viewer:
```bash
npx playwright test --trace on
```

### Generate trace for specific test:
```bash
npx playwright test admin-ai-verification.spec.ts --trace on
```

## Best Practices

1. **Use Page Object Model** for new tests to improve maintainability
2. **Mock API responses** to ensure test consistency
3. **Use descriptive test names** that explain what is being tested
4. **Group related tests** using `test.describe()` blocks
5. **Assert all Sprint requirements** to catch regressions
6. **Keep tests independent** - each test should work in isolation
7. **Use proper locators** - prefer data-testid, role, or text over CSS

## Related Documentation

- [Playwright Documentation](https://playwright.dev)
- [Sprint 3 Plan](../../apps/api/SPRINT-3.md)
- [ML Service Summary](../../apps/api/ML_SERVICE_SUMMARY.md)
- [Admin Dashboard README](../admin-dashboard/README.md)

## Troubleshooting

### Tests fail with "Target closed"
- Ensure the dev server is running
- Check if the port 4200 is available
- Try increasing timeout in `playwright.config.ts`

### Tests fail with "Timeout waiting for selector"
- Verify API mocks are set up correctly
- Check if selectors match actual DOM elements
- Increase timeout for slow operations

### API mocking not working
- Ensure route handler is set up before navigation
- Check URL pattern matches exactly
- Verify response format matches expected schema

## Contributing

When adding new AI verification features:

1. Add corresponding E2E tests
2. Update Page Object Model with new locators/methods
3. Update this README with new test scenarios
4. Run full test suite before committing
5. Ensure Sprint requirements are still met
