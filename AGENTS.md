# AGENTS.md — Claude Code Sub-Agent Reference

This file documents the sub-agents defined in `.claude/agents/` for this repository.
Sub-agents are specialized Claude Code processes that handle bounded, repeatable tasks
within the QA framework. Invoke them via slash commands or by asking Claude to use a
specific agent by name.

---

## site-analyzer

**File:** `.claude/agents/site-analyzer.md`
**Invoked by:** `/analyze-site`, or ask Claude: _"use the site-analyzer to update site.config.json"_

### Role

Crawls the live CleanliSense website and produces a fully-populated `site.config.json`
that reflects the current state of the site.

### When to invoke

- Onboarding: generating the initial `site.config.json` for this repo
- After a site redesign to verify selectors and nav structure are still accurate
- When the `/analyze-site` slash command is run

### Capabilities

- Navigate pages using `waitUntil: 'networkidle'` (handles SPAs and deferred rendering)
- Extract nav link text and hrefs from `nav` and `[role="navigation"]`
- Detect contact forms (checks homepage, `/contact`, `/contact-us`, `/get-in-touch`)
- Dismiss cookie consent banners before DOM inspection
- Issue HEAD requests to check link reachability
- Detect auth-gated pages (redirect to login URL → `auth.required: true`)
- Infer industry from page copy

### Inputs

| Input | Required | Description |
|-------|----------|-------------|
| `url` | No | Override URL (defaults to `site.config.json` url) |

### Output

1. A complete `site.config.json` JSON block with all fields populated
2. An **Issues found** checklist (missing meta description, broken nav links, etc.)
3. A **Confidence** rating: High / Medium / Low with reasoning

### Step-by-step

1. Resolve the URL, follow all redirects, use the final canonical URL
2. Navigate with `waitUntil: 'networkidle'`; wait +2s if body appears empty (SPA hydration)
3. Dismiss cookie banners before inspecting structure
4. Extract nav items: query `nav a[href], [role="navigation"] a[href]`
5. Find contact forms on the current page, then try `/contact`, `/contact-us`, `/get-in-touch`
6. Infer industry from `<h1>`, `<h2>`, and `<p>` content
7. Set `skipVisual: true` only if the homepage has uncontrollable CSS animations
8. Set `auth.required: true` if any page load redirects to a URL containing `login`, `signin`, `auth`

---

## test-generator

**File:** `.claude/agents/test-generator.md`
**Invoked by:** `/generate-full-suite`, or ask Claude: _"use the test-generator to add pricing tests"_

### Role

Reads a populated `site.config.json` and the live site HTML, then generates
site-specific Playwright test files and page object additions that go beyond the
shared framework's generic tests.

### When to invoke

- A site has unique functionality not covered by the shared suite
- The client requests coverage of a specific page (e.g., `/pricing`, blog)
- Writing regression tests for a recently discovered bug
- Running the `/generate-full-suite` slash command

### Capabilities

- Read and parse `site.config.json`
- Fetch live site HTML via `WebFetch` to derive real selectors
- Generate valid TypeScript Playwright test files
- Add methods to existing page objects in `src/pages/`
- Create new page objects when a page has no existing model
- Apply the correct `@tag` to all generated tests
- Run `npx tsc --noEmit` to validate output before reporting completion

### Inputs

| Input | Required | Description |
|-------|----------|-------------|
| `siteConfig` | Yes | Populated `site.config.json` |
| `testScenarios` | No | Description of specific scenarios to cover |
| `pagesToTest` | No | List of page paths (e.g., `["/pricing", "/about"]`) |

### Output

- TypeScript test files in `tests/functional/<scenario>.spec.ts` (or appropriate category)
- Page object additions or new files in `src/pages/`
- Updated `src/fixtures/site.fixture.ts` if new page objects are added
- Summary of what was created, updated, and skipped

### Conventions for generated files

- File naming: `tests/<category>/<kebab-case>.spec.ts`
- One `describe` block per page or feature area
- Import `{ test, expect }` from `@fixtures/site.fixture` — never from `@playwright/test`
- Tag every test with at least one of `@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, `@responsive`
- Generated code must pass `npx tsc --noEmit`

---

## Adding a New Agent

1. Create `.claude/agents/<name>.md`
2. Include sections: **Role**, **When to invoke**, **Capabilities**, **Inputs**, **Output**, **Step-by-step**
3. Reference the agent in this file
4. If the agent maps to a slash command, document the command in `SKILLS.md` and create `.claude/commands/<name>.md`

---

## Agent Conventions

| Convention | Detail |
|-----------|--------|
| Config first | Always read `site.config.json` before taking any action |
| Live HTML | Use `WebFetch` to inspect the live site — do not rely on memory or assumptions |
| TypeScript | Generated code must compile under `tsc --noEmit` |
| No side effects | Never submit forms, create accounts, or store credentials |
| Real selectors | Write selectors from actual page HTML, not generic placeholders |
