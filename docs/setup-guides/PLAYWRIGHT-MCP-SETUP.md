# Playwright MCP Server Configuration

This project is configured with Playwright MCP (Model Context Protocol) Server for browser automation and testing.

## What is Playwright MCP Server?

The Playwright MCP Server allows AI assistants and tools to control browsers through the Model Context Protocol. It provides a standardized way to:
- Automate browser interactions
- Run end-to-end tests
- Perform web scraping
- Test web applications

## Configuration

### MCP Settings
The MCP server configuration is located in `.vscode/mcp-settings.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-playwright"
      ],
      "env": {
        "PLAYWRIGHT_BROWSER": "chromium"
      }
    }
  }
}
```

### Playwright Configuration
Main configuration is in `hrms-frontend/playwright.config.ts`:
- Base URL: `http://localhost:5173`
- Test directory: `./tests/e2e`
- Browser: Chromium (default)
- Auto-starts dev server before running tests

## Installation

All required dependencies have been installed:
```bash
cd hrms-frontend
npm install -D @playwright/test @playwright/browser-chromium
npx playwright install chromium
```

## Running Tests

### Basic Commands
```bash
# Run all tests
npm run test:e2e

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# View test report
npm run test:e2e:report

# Run specific test file
npx playwright test tests/e2e/auth.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Debug tests
npx playwright test --debug
```

### Available Test Scripts
- `test:e2e` - Run all Playwright tests
- `test:e2e:ui` - Open Playwright UI for interactive testing
- `test:e2e:report` - Show HTML test report

## Test Structure

```
hrms-frontend/
├── playwright.config.ts          # Playwright configuration
├── tests/
│   └── e2e/
│       ├── README.md             # Testing documentation
│       ├── fixtures.ts           # Custom test fixtures
│       ├── example.spec.ts       # Sample tests
│       ├── auth.spec.ts          # Authentication tests
│       └── pages/
│           └── index.ts          # Page Object Models
```

## Writing Tests

### Basic Test Example
```typescript
import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/HRMS/);
});
```

### Using Page Object Model
```typescript
import { test, expect } from '../fixtures';
import { LoginPage } from '../pages';

test('user can login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password');
  await expect(page).toHaveURL(/dashboard/);
});
```

## MCP Server Usage

When using the MCP server through compatible AI tools:
1. The server automatically starts when needed
2. Uses the configured Chromium browser
3. Executes commands through the Model Context Protocol
4. Provides browser automation capabilities to AI assistants

## Features

### Implemented
- ✅ Playwright test framework installed
- ✅ Chromium browser configured
- ✅ MCP Server configuration
- ✅ Basic test structure and examples
- ✅ Page Object Model pattern
- ✅ Custom fixtures support
- ✅ HTML reporting
- ✅ Screenshot on failure
- ✅ Trace on retry
- ✅ Auto dev server startup

### Test Files Created
1. `example.spec.ts` - Basic homepage and navigation tests
2. `auth.spec.ts` - Authentication flow tests (with placeholders)
3. `fixtures.ts` - Custom fixtures for authenticated sessions
4. `pages/index.ts` - Page Object Models for Login and Dashboard

## Best Practices

1. **Use data-testid attributes** for stable selectors
2. **Keep tests independent** - each test should work in isolation
3. **Use Page Object Model** for complex pages
4. **Handle async properly** - always await Playwright commands
5. **Use meaningful test descriptions** for better reporting
6. **Group related tests** using `test.describe()`

## Debugging

### Debug Mode
```bash
npx playwright test --debug
```

### Pause Execution
```typescript
await page.pause(); // Pause test execution
```

### View Traces
Failed tests automatically capture traces. View them:
```bash
npx playwright show-trace trace.zip
```

### Screenshots
Screenshots are automatically captured on test failure in `test-results/` folder.

## CI/CD Integration

The configuration includes CI-specific settings:
- Retries: 2 on CI, 0 locally
- Workers: 1 on CI, auto locally
- Fails build if `test.only` is found

## Troubleshooting

### Browser Installation Issues
If you see "chrome_elf.dll" warning on Windows, it's usually safe to ignore. The browser should still work.

### Port Already in Use
If port 5173 is in use, either:
1. Stop the existing dev server
2. Change the port in `vite.config.ts` and `playwright.config.ts`

### MCP Server Not Starting
Ensure:
1. Node.js is installed
2. NPM packages are installed
3. MCP-compatible tool is being used

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

## Next Steps

1. Implement actual authentication logic in fixtures
2. Add more test cases for employee management
3. Add tests for attendance tracking
4. Add tests for asset management
5. Add visual regression tests
6. Set up CI/CD pipeline integration
7. Add API mocking for isolated frontend tests
