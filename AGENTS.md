# AGENTS.md — Claude Code Sub-Agent Reference

This file documents every sub-agent defined in `.claude/agents/`. Sub-agents are specialized
Claude Code processes that handle bounded, repeatable tasks within the QA framework. They
are invoked via slash commands or explicitly by asking Claude to use a specific agent by name.

---

## How Agents Work

Agents in `.claude/agents/` are instruction files that tell Claude how to behave when
acting in a specific role. Each file defines:

- The agent's **role** (what job it performs)
- **When to invoke** it (what triggers it)
- **Capabilities** it should use
- Expected **inputs** and **outputs**
- **Step-by-step instructions** for the task

Claude reads the agent file and follows the instructions as if it were that specialized
engineer. Agents do not have separate processes or persistent state — they are Claude Code
operating under a focused set of instructions.

### Invocation Methods

```
# Via slash command (recommended)
/analyze-site
/generate-full-suite

# Via natural language in a Claude Code session
"use the site-analyzer to check the current nav structure"
"use the test-generator to add tests for the /features page"
```

---

## site-analyzer

**File:** `.claude/agents/site-analyzer.md`
**Invoked by:** `/analyze-site`, or: _"use the site-analyzer to update site.config.json"_

### Role

Crawls the live CleanliSense website and produces a fully-populated `site.config.json`
that reflects the current state of the site.

### When to invoke

- Onboarding: generating the initial `site.config.json` for this repo
- After a site redesign to verify nav structure and selectors are still accurate
- When `/analyze-site` is run

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
**Invoked by:** `/generate-full-suite`, or: _"use the test-generator to add pricing tests"_

### Role

Reads a populated `site.config.json` and the live site HTML, then generates
site-specific Playwright test files and page object additions that go beyond the
shared framework's generic tests.

### When to invoke

- A site has unique functionality not covered by the shared suite
- A specific page needs dedicated coverage (e.g., `/pricing`, `/features`, blog)
- Writing regression tests for a recently discovered bug
- Running `/generate-full-suite`

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

- TypeScript test files in `tests/<category>/<scenario>.spec.ts`
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
2. Include the required sections:
   - **Role** — one paragraph describing what this agent does
   - **When to invoke** — bullet list of triggering conditions
   - **Capabilities** — what tools and techniques it uses
   - **Inputs** — table of parameters
   - **Output** — what it produces and where it goes
   - **Step-by-step** — numbered instructions Claude follows
3. Reference the new agent in this file
4. If it maps to a slash command, document the command in `SKILLS.md` and create `.claude/commands/<name>.md`

---

## Agent Conventions

| Convention | Detail |
|-----------|--------|
| Config first | Always read `site.config.json` before taking any action |
| Live HTML | Use `WebFetch` to inspect the live site — do not rely on memory or assumptions |
| TypeScript | Generated code must compile under `tsc --noEmit` |
| No side effects | Never submit forms, create accounts, or store credentials |
| Real selectors | Write selectors from actual page HTML, not generic placeholders |
| Confidence | Always report a confidence level (High/Medium/Low) and any limitations encountered |

---

## Agent vs. Skill vs. Rule

| Type | File location | When Claude reads it | Purpose |
|------|--------------|---------------------|---------|
| Agent | `.claude/agents/*.md` | When invoked by command or natural language | Bounded specialist task with specific inputs/outputs |
| Skill / Command | `.claude/commands/*.md` | When the user types `/command-name` | Multi-step procedure, may use agents internally |
| Rule | `.claude/rules/*.md` | Automatically when editing files that match `paths:` | Coding standards for a specific file type |
| CLAUDE.md | Root `CLAUDE.md` | Every session (always loaded) | Project-wide architecture, conventions, do-not list |
