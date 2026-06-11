# CleanliSense — QA Agentic Solution

> Playwright + TypeScript end-to-end test suite for [cleanlisense.com](https://www.cleanlisense.com), powered by Claude Code.

---

## Purpose

This repository tests the [CleanliSense](https://www.cleanlisense.com) website — a B2B SaaS platform that automates scheduling and operations for short-term rental cleaning companies. The suite covers smoke, functional, visual regression, navigation, responsive layout, and form tests using a **Page Object Model (POM)** architecture and **OOP** principles.

The repo is designed for agentic execution by Claude Code: slash commands, sub-agents, and path-scoped rules are configured so Claude can generate, run, and maintain tests autonomously.

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| [Playwright](https://playwright.dev/) | Browser automation (Chromium, Mobile Chrome, iPad) |
| TypeScript (strict mode) | Typed test code |
| Page Object Model (POM) | OOP abstraction for all UI interactions |
| Claude Code | AI-assisted test generation and maintenance |
| GitHub Actions | CI/CD pipeline |

---

## Repository Structure

```text
cleanlisense_QA_Agentic_Solution/
├── AGENTS.md                     # Claude Code sub-agent reference
├── SKILLS.md                     # Slash command / skill reference
├── CLAUDE.md                     # Claude Code project instructions (loaded every session)
├── site.config.json              # Site URL and feature flags
├── playwright.config.ts          # Browser projects: desktop, mobile, tablet
├── tsconfig.json
├── package.json
│
├── .claude/
│   ├── agents/                   # Sub-agent definitions
│   │   ├── site-analyzer.md
│   │   └── test-generator.md
│   ├── commands/                 # Slash command definitions
│   │   ├── analyze-site.md
│   │   ├── generate-full-suite.md
│   │   ├── run-smoke.md
│   │   ├── update-baseline.md
│   │   └── generate-report.md
│   ├── rules/                    # Path-scoped CLAUDE.md rules
│   │   ├── testing.md            # Loads when editing tests/**/*.spec.ts
│   │   └── page-objects.md       # Loads when editing src/pages/**/*.ts
│   └── hooks/
│       └── pre-test.sh
│
├── .github/
│   ├── workflows/
│   │   └── playwright.yml        # CI: runs all test suites on push/PR
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── test_coverage.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CONTRIBUTING.md
│
├── src/
│   ├── pages/                    # Page Object Model classes
│   │   ├── base.page.ts          # BasePage — shared methods
│   │   ├── home.page.ts          # HomePage
│   │   ├── navigation.page.ts    # NavigationPage
│   │   ├── contact.page.ts       # ContactFormPage
│   │   ├── pricing.page.ts       # PricingPage
│   │   └── features.page.ts      # FeaturesPage (homepage sections)
│   ├── fixtures/
│   │   └── site.fixture.ts       # Custom Playwright fixtures exposing page objects
│   ├── utils/
│   │   ├── link-checker.ts
│   │   └── visual-helper.ts
│   └── types/
│       └── site-config.types.ts
│
└── tests/
    ├── smoke/
    │   └── site-availability.spec.ts   # @smoke
    ├── navigation/
    │   └── nav-links.spec.ts           # @navigation
    ├── forms/
    │   └── contact-form.spec.ts        # @forms
    ├── functional/
    │   ├── pricing.spec.ts             # @functional — pricing plans, CTAs
    │   ├── homepage-features.spec.ts   # @functional — hero, features, testimonials
    │   └── integrations.spec.ts        # @functional — Airbnb, VRBO, Guesty, etc.
    ├── visual/
    │   └── visual-regression.spec.ts   # @visual — screenshot regression
    └── responsive/
        └── layout.spec.ts              # @responsive — viewport layout checks
```

---

## Development Environment Setup

### Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| npm | 9+ | Bundled with Node |
| Git | Any | For cloning and branching |
| Claude Code | Latest | Optional — for AI-assisted test generation |

### Install Claude Code (Windows PowerShell)

```powershell
irm https://claude.ai/install.ps1 | iex
```

Then open Claude Code in this project:

```powershell
cd cleanlisense_QA_Agentic_Solution
claude
```

### Install Project Dependencies

```powershell
# Install Node packages
npm install

# Install Playwright browsers (Chromium covers desktop + mobile/tablet profiles)
npx playwright install chromium
```

### Environment Variables

Copy `.env.example` to `.env`:

```powershell
copy .env.example .env
```

| Variable | Default | Purpose |
|----------|---------|---------|
| `SITE_URL` | `https://www.cleanlisense.com` | Override the target URL for local/staging |
| `CI` | — | Set to `1` in CI to enable retries and cap workers |

---

## Running Tests

```powershell
# All tests
npm test

# Smoke tests only (fastest — run first in CI)
npm run test:smoke

# Navigation tests
npm run test:navigation

# Forms tests
npm run test:forms

# Functional tests (pricing, features, integrations)
npx playwright test tests/functional/

# Visual regression
npm run test:visual

# Responsive layout
npm run test:responsive

# Run with visible browser (debugging)
npm run test:headed

# Update visual baselines after intentional design changes
npm run baseline

# Type check
npm run typecheck

# Lint
npm run lint

# Open HTML test report
npm run report
```

---

## Claude Code Integration

This repo is initialized for Claude Code. At the start of every session, Claude reads:

1. `CLAUDE.md` — project instructions, architecture rules, do-not list
2. `.claude/rules/*.md` — path-scoped rules that activate when editing matching files
3. Auto-memory from `~/.claude/projects/.../memory/` — Claude's accumulated learnings

### Slash Commands

Type any of these in a Claude Code session:

| Command | Description |
|---------|-------------|
| `/analyze-site` | Crawl cleanlisense.com and refresh `site.config.json` |
| `/generate-full-suite` | Generate the complete POM + test suite from live site inspection |
| `/run-smoke` | Run smoke tests and report results |
| `/update-baseline` | Refresh visual regression baseline screenshots |
| `/generate-report` | Generate a test results summary from the last run |

Full documentation: [SKILLS.md](./SKILLS.md)

### Sub-Agents

Claude Code uses these sub-agents for specialized tasks:

| Agent | Role |
|-------|------|
| `site-analyzer` | Crawls the live site and outputs a populated `site.config.json` |
| `test-generator` | Reads site config and generates site-specific Playwright tests |

Full documentation: [AGENTS.md](./AGENTS.md)

### Path-Scoped Rules

Rules in `.claude/rules/` load automatically when Claude edits matching files:

| File | Applies to | Content |
|------|-----------|---------|
| `testing.md` | `tests/**/*.spec.ts` | Import conventions, tagging, assertion placement |
| `page-objects.md` | `src/pages/**/*.ts` | POM structure, locator style, method conventions |

---

## Architecture — Page Object Model (POM)

All UI interactions are encapsulated in page object classes. Tests call page object methods — they never use `page.locator()` directly.

```
Test file  (tests/**/*.spec.ts)
  └── imports fixture  (src/fixtures/site.fixture.ts)
        └── constructs Page Object  (src/pages/*.page.ts)
              └── extends BasePage  (src/pages/base.page.ts)
```

### OOP Design

- **Inheritance:** All page classes extend `BasePage`, gaining shared navigation, screenshot, and console error helpers
- **Encapsulation:** Locators and interaction logic are private to page objects; tests only see the public API
- **Single responsibility:** Each page class models one page or major section; no cross-page logic in a single class

### Page Object Rules

| Rule | Detail |
|------|--------|
| Locators | Declared as `readonly Locator` on the class |
| Methods | Represent user actions — navigate, click, fill, hover |
| Assertions | Live in test files only, never inside page objects |
| URLs | Derived from `this.url` / `this.config.url` — never hardcoded |

---

## Test Tags

Every test carries one or more tags for selective execution:

| Tag | Run with | What it covers |
|-----|----------|----------------|
| `@smoke` | `npm run test:smoke` | Site reachable, HTTPS, title, no critical JS errors |
| `@navigation` | `npm run test:navigation` | Nav links, mobile menu, logo link, 404 detection |
| `@forms` | `npm run test:forms` | Email fields, validation, submit button, labels |
| `@functional` | `npx playwright test tests/functional/` | Pricing plans, feature sections, integrations, CTAs |
| `@visual` | `npm run test:visual` | Screenshot regression at desktop/mobile/tablet |
| `@responsive` | `npm run test:responsive` | Horizontal scroll, font sizes, alt text, viewport meta |

---

## .github Folder

| File | Purpose |
|------|---------|
| `workflows/playwright.yml` | CI pipeline — runs all test suites on every push and PR to `main` |
| `CONTRIBUTING.md` | Contributor guidelines, branch conventions, and PR checklist |
| `PULL_REQUEST_TEMPLATE.md` | Pre-filled checklist for every pull request |
| `ISSUE_TEMPLATE/bug_report.md` | Template for reporting broken tests or bad selectors |
| `ISSUE_TEMPLATE/test_coverage.md` | Template for requesting coverage of a new feature or page |

---

## Contributor Rules

Full guide: [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md)

| Rule | Detail |
|------|--------|
| Branch naming | `feat/`, `fix/`, `chore/`, or `docs/` prefix from `main` |
| No form submission | Never click submit with intent to send data |
| No hardcoded URLs | Always use `siteConfig.url` from the fixture |
| POM discipline | All selectors and interactions live in `src/pages/`, not in spec files |
| TypeScript | Run `npm run typecheck` before opening a PR |
| Lint | Run `npm run lint` before opening a PR |
| Tagging | Every test must carry at least one `@tag` |
| Visual baselines | Run `npm run baseline` locally and commit the updated snapshots |

---

## Site Under Test

| Field | Value |
|-------|-------|
| **Company** | CleanliSense |
| **URL** | https://www.cleanlisense.com |
| **Description** | B2B SaaS for short-term rental cleaning operations |
| **Key pages** | Home, Pricing (`/pricing`), App login (`app.cleanlisense.com`) |
| **Integrations** | Airbnb, VRBO, OwnerRez, Guesty, iCAL |
| **Pricing plans** | Start ($19/mo), Pro ($49/mo), Elite ($99/mo) |

---

*Generated and maintained with [Claude Code](https://code.claude.com). For issues, open a GitHub issue or type `/generate-report` in a Claude Code session.*
