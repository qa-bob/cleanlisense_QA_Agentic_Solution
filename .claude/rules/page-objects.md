---
paths:
  - "src/pages/**/*.ts"
---

# Page Object Rules

These rules load automatically when Claude edits or creates files in `src/pages/**/*.ts`.

## Class structure

Every page class must:
- Extend `BasePage` from `@pages/base.page`
- Use constructor signature: `constructor(page: Page, config: SiteConfig)`
- Call `super(page, config)` as the first statement

```typescript
import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import type { SiteConfig } from '@site-types/site-config.types';

export class YourPage extends BasePage {
  readonly someLocator: Locator;

  constructor(page: Page, config: SiteConfig) {
    super(page, config);
    this.someLocator = this.page.locator('[data-testid="example"]');
  }
}
```

## Locators

- Declare as `readonly locatorName: Locator` class properties
- Initialize in the constructor via `this.page.locator(...)` or `this.page.getByRole(...)`
- Prefer role-based selectors in this order: `getByRole` → `getByLabel` → `getByText` → attribute selectors
- When using CSS selectors, use attribute substring matching `[class*="pricing"]` rather than exact class names
- Never hardcode `https://` URLs inside locators

## Methods

- Methods represent **user actions**: navigate, click, fill, hover, scroll
- Methods must NOT contain `expect()` or any Playwright assertion
- Return types must be explicit: `Promise<string>`, `Promise<boolean>`, `Promise<Locator[]>`
- Use `Locator` return type, never `ElementHandle`
- For optional elements, return `Locator | null` with a count-check pattern

```typescript
async getOptionalElement(): Promise<Locator | null> {
  const el = this.page.locator('[class*="banner"]').first();
  if (await el.count() === 0) return null;
  return el;
}
```

## URLs

- Use `this.url` (from BasePage) for the site root
- For sub-pages: `this.url.replace(/\/$/, '') + '/pricing'`
- Never hardcode a URL string

## Prohibited

- `expect()` inside page objects
- Hardcoded URLs
- `any` type without an explicit comment justifying it
- `page.waitForTimeout()` > 500ms
- Returning raw `ElementHandle` — use `Locator` instead

## Imports

```typescript
import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import type { SiteConfig } from '@site-types/site-config.types';
```
