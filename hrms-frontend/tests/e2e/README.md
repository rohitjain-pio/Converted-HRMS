# Playwright E2E Tests

This directory contains end-to-end tests for the HRMS Frontend application using Playwright.

## Test Structure

- `example.spec.ts` - Sample tests to get started
- Add more test files following the pattern `*.spec.ts`

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests in UI mode (interactive)
```bash
npm run test:e2e:ui
```

### View test report
```bash
npm run test:e2e:report
```

### Run specific test file
```bash
npx playwright test tests/e2e/example.spec.ts
```

### Run tests in headed mode (see browser)
```bash
npx playwright test --headed
```

### Debug tests
```bash
npx playwright test --debug
```

## Writing Tests

### Basic Test Structure
```typescript
import { test, expect } from '@playwright/test';

test('test description', async ({ page }) => {
  await page.goto('/path');
  await expect(page.locator('selector')).toBeVisible();
});
```

### Using Fixtures
Playwright provides built-in fixtures like `page`, `context`, `browser`. You can also create custom fixtures for authentication, data setup, etc.

### Best Practices
1. Use meaningful test descriptions
2. Keep tests independent and isolated
3. Use data-testid attributes for stable selectors
4. Use page object model for complex pages
5. Handle asynchronous operations properly

## Configuration

The Playwright configuration is in `playwright.config.ts` at the root of the frontend project.

Key settings:
- Base URL: `http://localhost:5173`
- Test directory: `./tests/e2e`
- Browsers: Chromium (default)
- Auto-starts dev server before tests

## Debugging

1. Use `--debug` flag to run in debug mode
2. Use `page.pause()` to pause test execution
3. Check screenshots in `test-results/` folder on failures
4. View traces in Playwright UI for failed tests

## CI/CD Integration

Tests are configured to:
- Run in CI with 2 retries
- Generate HTML reports
- Capture screenshots on failure
- Record traces on first retry
