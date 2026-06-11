# Contributing to CleanliSense QA Agentic Solution

Thank you for contributing to this test suite. This guide covers everything you need
to keep the codebase consistent, the tests reliable, and the CI green.

---

## Before You Start

1. Read `CLAUDE.md` — the authoritative architecture rules loaded into every Claude Code session
2. Read `SKILLS.md` — available slash commands you can use to generate or run tests
3. Read `AGENTS.md` — sub-agents Claude uses for site analysis and test generation
4. Run `npm run typecheck && npm run lint` to confirm your local environment works

---

## Branch Conventions

| Prefix | When to use | Example |
|--------|-------------|---------|
| `feat/` | New test file or new page object | `feat/blog-page-tests` |
| `fix/` | Broken test, stale selector | `fix/pricing-cta-selector` |
| `chore/` | Config, tooling, dependency updates | `chore/playwright-1.50` |
| `docs/` | README, CONTRIBUTING, comments only | `docs/update-skills-md` |

Always branch from `main` and target `main` for PRs.

---

## Writing Tests

### Must-follow rules

| Rule | Detail |
|------|--------|
| No form submission | Never click submit with intent to send real data |
| No hardcoded URLs | Derive all URLs from `siteConfig.url` via the fixture |
| POM only | No `page.locator()` calls in spec files — use page object methods |
| No long waits | No `page.waitForTimeout()` > 500ms — use Playwright auto-waiting |
| No `any` type | Use proper TypeScript types; add a comment if `any` is unavoidable |
| Tag every test | Every `test()` must carry at least one `@tag` |

### Recommended workflow

```powershell
# 1. (Optional) Let Claude fetch the page structure for you
#    In a Claude Code session: /analyze-site

# 2. Add or update the page object
#    src/pages/<page-name>.page.ts

# 3. Register the fixture if you created a new page object
#    src/fixtures/site.fixture.ts

# 4. Write the test file
#    tests/<category>/<feature>.spec.ts

# 5. Type-check
npm run typecheck

# 6. Lint
npm run lint

# 7. Run your new tests in a headed browser to verify visually
npx playwright test tests/<category>/<feature>.spec.ts --headed
```

---

## Page Object Design Rules

All page interactions must be modelled as page objects. Tests call methods — they
do not call `page.locator()` directly.

```
src/pages/
  base.page.ts          ← All page classes extend this
  home.page.ts          ← HomePage
  navigation.page.ts    ← NavigationPage
  contact.page.ts       ← ContactFormPage
  pricing.page.ts       ← PricingPage
  features.page.ts      ← FeaturesPage (homepage sections)
  <your-page>.page.ts   ← New pages follow this pattern
```

### Class structure

```typescript
import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import type { SiteConfig } from '@types/site-config.types';

export class YourPage extends BasePage {
  readonly someLocator: Locator;

  constructor(page: Page, config: SiteConfig) {
    super(page, config);
    this.someLocator = this.page.locator('[data-testid="example"]');
  }

  async clickSomething(): Promise<void> {
    await this.someLocator.click();
  }

  async getSomeText(): Promise<string> {
    return ((await this.someLocator.textContent()) ?? '').trim();
  }
  // No expect() in here — assertions belong in tests
}
```

### Then register in the fixture

```typescript
// src/fixtures/site.fixture.ts
import { YourPage } from '@pages/your.page';
// Add to Fixtures interface and extend:
yourPage: async ({ page, siteConfig }, use) => {
  await use(new YourPage(page, siteConfig));
},
```

---

## Test File Structure

```typescript
/**
 * tests/functional/your-feature.spec.ts
 *
 * Brief description of what is tested.
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Your Feature @functional', () => {
  test.beforeEach(async ({ yourPage }) => {
    await yourPage.navigate();
    await yourPage.waitForLoad();
  });

  test('does something expected @functional', async ({ yourPage }) => {
    const value = await yourPage.getSomeText();
    expect(value).toBeTruthy();
  });
});
```

---

## Visual Baselines

When a PR changes the visual appearance of a tested page:

1. Run `npm run baseline` locally (on Windows — snapshots are OS-specific)
2. Commit the updated `.png` files from `__snapshots__/`
3. Note the visual changes in your PR description

If you intentionally change a baseline but the change is small, you can increase
`maxDiffPixels` in the visual test options temporarily and file a follow-up.

---

## CI Pipeline

The GitHub Actions workflow (`.github/workflows/playwright.yml`) runs on every push
and pull request to `main`. It runs:

- Smoke tests
- Navigation tests
- Forms tests
- Functional tests
- Responsive tests

Visual tests do **not** run in CI by default (screenshot comparison requires a matching
OS and font rendering environment). Run `npm run test:visual` locally before updating baselines.

---

## Pull Request Checklist

The PR template at `.github/PULL_REQUEST_TEMPLATE.md` is the authoritative checklist.
At minimum your PR must satisfy:

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] All new tests carry at least one `@tag`
- [ ] No hardcoded URLs
- [ ] No form submissions in test code
- [ ] Assertions in spec files only — not in page objects
- [ ] Visual baselines updated and committed (if `@visual` tests were touched)

---

## Reporting Issues

Use the GitHub issue templates:

- **Bug report** — a test is failing, a selector is stale, or the suite produces false positives
- **Test coverage request** — a feature or page on cleanlisense.com has no test coverage
