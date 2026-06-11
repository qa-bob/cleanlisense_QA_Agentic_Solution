---
paths:
  - "tests/**/*.spec.ts"
---

# Test File Rules

These rules load automatically when Claude edits or creates files in `tests/**/*.spec.ts`.

## Imports

- Import `{ test, expect }` from `@fixtures/site.fixture` — NEVER from `@playwright/test` directly
- The fixture exposes: `siteConfig`, `homePage`, `navigationPage`, `contactPage`, `pricingPage`, `featuresPage`

## Tagging

- Every `test()` call must carry at least one tag: `@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, or `@responsive`
- Tags appear in the test name string: `'page has a title @smoke'`
- A test can carry multiple tags when it legitimately crosses categories

## Page interactions

- Never call `page.locator()` in a spec file — use page object methods from the fixture
- Never call `page.goto()` in a spec file unless the page object has no navigate method — prefer `pageObject.navigate()`
- The one exception: raw `page.goto(siteConfig.url + '/path')` is allowed inside `beforeEach` when no POM exists yet

## Assertions

- All `expect()` calls belong in the test body — never inside page object methods
- Prefer specific matchers: `toBeVisible()`, `toHaveText()`, `toBeEnabled()`, `toContain()`
- Use `console.warn()` + `return` (not `test.skip()`) for soft-failure scenarios where a feature may not exist

## Waiting

- Never use `page.waitForTimeout()` > 500ms
- Use `waitForLoadState()`, `waitForSelector()`, or Playwright's built-in auto-waiting instead
- The 500ms exception applies only inside visual test helpers for CSS animation settling

## URLs

- Never hardcode a URL string in a test — always derive from `siteConfig.url`
- Correct: `siteConfig.url.replace(/\/$/, '') + '/pricing'`
- Wrong: `'https://www.cleanlisense.com/pricing'`

## Structure

- One `test.describe` block per page or feature area
- Use `test.beforeEach` for shared navigation setup
- Each test must be fully independent — no shared state between tests
- Do not submit forms; do not click submit buttons with real data intent

## TypeScript

- Strict mode is on — no implicit `any`
- All variables must be typed; use type assertions only when absolutely necessary and add a comment
