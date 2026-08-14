# CleanliSense — QA Agentic Solution

> Playwright + TypeScript end-to-end test suite for [cleanlisense.com](https://www.cleanlisense.com), powered by Claude Code.

---

## Table of Contents

1. [Purpose](#purpose)
2. [Tech Stack](#tech-stack)
3. [Repository Structure](#repository-structure)
4. [Development Environment Setup](#development-environment-setup)
5. [Running Tests](#running-tests)
6. [Claude Code Integration](#claude-code-integration)
7. [Architecture — Page Object Model (POM)](#architecture--page-object-model-pom)
8. [Test Tags](#test-tags)
9. [.github Folder](#github-folder)
10. [Contributor Rules](#contributor-rules)
11. [Site Under Test](#site-under-test)

---

## Purpose

This repository tests the [CleanliSense](https://www.cleanlisense.com) website — a B2B SaaS platform that automates scheduling and operations for short-term rental cleaning companies. The suite covers smoke, functional, visual regression, navigation, responsive layout, and form tests using a **Page Object Model (POM)** architecture and **OOP** principles.

The repo is designed for agentic execution by Claude Code: slash commands, sub-agents, and path-scoped rules are configured so Claude can generate, run, and maintain tests autonomously.

**Test coverage goal:** exercise every discoverable page and feature of the public site without creating an account, logging in, or submitting any form with live data.

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
│
├── AGENTS.md                     # Claude Code sub-agent reference (this repo's agent catalog)
├── SKILLS.md                     # Slash command / skill reference (all /commands documented here)
├── CLAUDE.md                     # Claude Code project instructions (loaded every session)
├── site.config.json              # Site URL, feature flags, expected nav items
├── playwright.config.ts          # Browser projects: desktop, mobile, tablet
├── tsconfig.json                 # TypeScript strict mode config
├── package.json                  # npm scripts and dependencies
├── global-setup.ts               # Pre-run reachability check
│
├── .claude/                      # Claude Code configuration (commit this folder)
│   ├── settings.json             # Shared project permissions and env vars
│   ├── settings.local.json       # Personal overrides — gitignored, never commit
│   ├── agents/                   # Sub-agent instruction files
│   │   ├── site-analyzer.md      # Crawls the site and updates site.config.json
│   │   └── test-generator.md     # Generates site-specific Playwright tests
│   ├── commands/                 # Slash command definitions (invoked with /command-name)
│   │   ├── analyze-site.md       # /analyze-site
│   │   ├── generate-full-suite.md# /generate-full-suite
│   │   ├── run-smoke.md          # /run-smoke
│   │   ├── update-baseline.md    # /update-baseline
│   │   └── generate-report.md    # /generate-report
│   ├── rules/                    # Path-scoped rules — load only for matching files
│   │   ├── testing.md            # Loads when editing tests/**/*.spec.ts
│   │   └── page-objects.md       # Loads when editing src/pages/**/*.ts
│   └── hooks/
│       └── pre-test.sh           # Reachability check before test execution
│
├── .github/                      # GitHub-specific configuration
│   ├── workflows/
│   │   └── playwright.yml        # CI: runs all test suites on push/PR to main
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md         # Template for stale selectors / broken tests
│   │   └── test_coverage.md      # Template for requesting new test coverage
│   ├── PULL_REQUEST_TEMPLATE.md  # Checklist every PR must satisfy
│   └── CONTRIBUTING.md           # Full contributor guide
│
├── src/
│   ├── pages/                    # Page Object Model classes
│   │   ├── base.page.ts          # BasePage — shared navigate, screenshot, error helpers
│   │   ├── home.page.ts          # HomePage
│   │   ├── navigation.page.ts    # NavigationPage
│   │   ├── contact.page.ts       # ContactFormPage
│   │   ├── pricing.page.ts       # PricingPage
│   │   └── features.page.ts      # FeaturesPage (homepage sections)
│   ├── fixtures/
│   │   └── site.fixture.ts       # Custom Playwright fixtures exposing page objects
│   ├── utils/
│   │   ├── link-checker.ts       # HEAD-request link reachability helper
│   │   └── visual-helper.ts      # Screenshot comparison helpers
│   └── types/
│       └── site-config.types.ts  # TypeScript interface for site.config.json
│
└── tests/
    ├── smoke/
    │   └── site-availability.spec.ts   # @smoke — availability, HTTPS, title, JS errors
    ├── navigation/
    │   └── nav-links.spec.ts           # @navigation — nav links, mobile menu, footer
    ├── forms/
    │   └── contact-form.spec.ts        # @forms — fields, validation, accessibility
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
| Claude Code | Latest | For AI-assisted test generation |

### 1. Install Claude Code

**Windows PowerShell:**
```powershell
irm https://claude.ai/install.ps1 | iex
```

Then open a Claude Code session in this project:
```powershell
cd cleanlisense_QA_Agentic_Solution
claude
```

### 2. Install Project Dependencies

```powershell
npm install
npx playwright install chromium
```

Chromium is sufficient — it covers the desktop, mobile-chrome, and tablet browser projects configured in `playwright.config.ts`.

### 3. Configure Environment Variables

```powershell
copy .env.example .env
```

| Variable | Default | Purpose |
|----------|---------|---------|
| `SITE_URL` | `https://www.cleanlisense.com` | Override target URL for staging/local testing |
| `CI` | — | Set to `1` in CI pipelines to enable retries and cap workers |

### 4. Verify Setup

```powershell
npm run typecheck   # Should exit 0
npm run lint        # Should exit 0
npm run test:smoke  # Runs ~5 fast tests against the live site
```

---

## Running Tests

```powershell
# All tests (all browsers, all suites)
npm test

# Individual suites
npm run test:smoke          # @smoke — fastest, run first
npm run test:navigation     # @navigation
npm run test:forms          # @forms
npm run test:visual         # @visual — screenshot regression
npm run test:responsive     # @responsive

# Functional tests (no dedicated npm alias — use Playwright directly)
npx playwright test tests/functional/

# Debugging — run with a visible browser window
npm run test:headed

# Update visual baselines after intentional design changes
npm run baseline

# Open the HTML report from the last run
npm run report

# Type-check without running tests
npm run typecheck

# Lint
npm run lint
```

---

## Claude Code Integration

This repo is fully initialized for Claude Code. At the start of every session, Claude automatically reads:

1. `CLAUDE.md` — project instructions, architecture rules, do-not list
2. `.claude/rules/*.md` — path-scoped rules that activate when editing matching files
3. Auto-memory from `~/.claude/projects/.../memory/` — accumulated learnings across sessions

### What Belongs in Each Folder

| Folder / File | Purpose | Commit? |
|---------------|---------|---------|
| `CLAUDE.md` | Project-level facts: architecture, conventions, build commands. Loaded every session. Keep under 200 lines. | Yes |
| `CLAUDE.local.md` | Personal notes you don't want to share (e.g., local proxy settings). Never committed. | No |
| `.claude/settings.json` | Shared project permissions (`allow`/`deny` for WebFetch, Bash, etc.) and env vars. | Yes |
| `.claude/settings.local.json` | Personal overrides — your API key, local URLs. gitignored. | No |
| `.claude/commands/*.md` | Slash command definitions. Each file becomes a `/command-name` you can type in Claude Code. YAML frontmatter controls auto-invocation and allowed tools. | Yes |
| `.claude/agents/*.md` | Sub-agent instruction files. Describe a specialized role Claude can adopt for bounded tasks. | Yes |
| `.claude/rules/*.md` | Path-scoped instructions. Add `paths: [...]` frontmatter so they only load when Claude edits matching files. Keeps CLAUDE.md short. | Yes |
| `.claude/hooks/` | Shell scripts triggered by lifecycle events (PreToolUse, PostToolUse, SessionStart). Must be registered in `settings.json` to activate. | Yes |

### Slash Commands

Type any of these in a Claude Code session:

| Command | What it does |
|---------|-------------|
| `/analyze-site` | Crawl cleanlisense.com, update `site.config.json` with current nav, forms, and structure |
| `/generate-full-suite` | Generate or refresh the full POM + test suite from live site inspection |
| `/run-smoke` | Run `@smoke` tests and display a pass/fail summary table |
| `/update-baseline` | Refresh visual regression baseline screenshots |
| `/generate-report` | Parse `test-results/results.json` and produce a readable summary |

Full documentation: [SKILLS.md](./SKILLS.md)

### Command Frontmatter Format

Every command file starts with a YAML frontmatter block:

```yaml
---
description: One-line description — Claude reads this to decide when to auto-invoke the command
allowed-tools: WebFetch, Read, Write, Bash
---
```

- `description` — used by Claude to auto-invoke the command when context matches
- `allowed-tools` — tools pre-approved for this command (no extra permission prompts)

### Sub-Agents

Claude Code uses these sub-agents for specialized, bounded tasks:

| Agent | Role |
|-------|------|
| `site-analyzer` | Crawls the live site and outputs a populated `site.config.json` |
| `test-generator` | Reads site config and generates site-specific Playwright tests |

Full documentation: [AGENTS.md](./AGENTS.md)

### Path-Scoped Rules

Rules in `.claude/rules/` load automatically when Claude edits matching files — they do not consume context otherwise:

| File | Applies when editing | Content |
|------|---------------------|---------|
| `testing.md` | `tests/**/*.spec.ts` | Import conventions, tagging rules, assertion placement |
| `page-objects.md` | `src/pages/**/*.ts` | POM class structure, locator style, prohibited patterns |

### Shared Settings (`settings.json`)

The shared `.claude/settings.json` pre-approves domain-scoped `WebFetch` calls so Claude can inspect the live site without prompting on every request. Personal overrides (different target URL, additional domains) go in `.claude/settings.local.json` which is gitignored.

To add Bash command permissions (e.g., `npm run *`, `npx playwright *`), run `/update-config` in a Claude Code session — this is safer than editing `settings.json` manually because it validates the format and prevents accidental privilege escalation.

---

## Architecture — Page Object Model (POM)

All UI interactions are encapsulated in page object classes. Tests call page object methods — they never call `page.locator()` directly in the test body.

```
Test file  (tests/**/*.spec.ts)
  └── imports fixture  (src/fixtures/site.fixture.ts)
        └── constructs Page Object  (src/pages/*.page.ts)
              └── extends BasePage  (src/pages/base.page.ts)
```

### OOP Design Principles Applied

| Principle | How it's applied |
|-----------|-----------------|
| **Inheritance** | All page classes extend `BasePage`, gaining shared `navigate()`, `waitForLoad()`, `isResponsive()`, and error-checking methods |
| **Encapsulation** | Locators and interaction logic are private to page objects; tests only see the public API |
| **Single Responsibility** | Each page class models one page or major section; no cross-page logic in a single class |
| **Open/Closed** | New pages extend `BasePage` without modifying it; new tests add to existing `describe` blocks |

### Page Object Rules

| Rule | Detail |
|------|--------|
| All locators declared as `readonly Locator` class properties | Initialized in `constructor` via `this.page.locator(...)` |
| Methods represent user actions | `navigate()`, `clickPrimaryNav()`, `fillContactForm()`, `openMobileMenu()` |
| No `expect()` in page objects | Assertions live in spec files only |
| No hardcoded URLs | Always use `this.url` (from `BasePage`) or `this.config.url` |

### Class Template

```typescript
import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import type { SiteConfig } from '@site-types/site-config.types';

export class ExamplePage extends BasePage {
  readonly heading: Locator;
  readonly ctaButton: Locator;

  constructor(page: Page, config: SiteConfig) {
    super(page, config);
    this.heading = this.page.locator('h1');
    this.ctaButton = this.page.getByRole('link', { name: /get started/i }).first();
  }

  async clickCta(): Promise<void> {
    await this.ctaButton.click();
    await this.waitForLoad();
  }
}
```

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

The `.github/` folder contains GitHub-specific automation, templates, and contributor documentation.

### What's in it and why

| File / Folder | Purpose | Why it's here |
|---------------|---------|---------------|
| `workflows/playwright.yml` | GitHub Actions CI pipeline | Runs all test suites automatically on every push and PR to `main`. Fails the PR if smoke, navigation, forms, functional, or responsive tests break. |
| `CONTRIBUTING.md` | Full contributor guide | Describes branch naming, the POM workflow, PR checklist, and how to write/update tests. Every contributor should read this before their first PR. |
| `PULL_REQUEST_TEMPLATE.md` | Pre-filled PR checklist | Enforces quality gates at review time: typecheck, lint, tagging, no hardcoded URLs, no form submissions. Auto-populates when you open a PR on GitHub. |
| `ISSUE_TEMPLATE/bug_report.md` | Bug report form | Structured template for reporting broken tests, stale selectors, or false positives. Captures browser, test file, error message, and steps to reproduce. |
| `ISSUE_TEMPLATE/test_coverage.md` | Coverage request form | Structured template for requesting tests for a new page, feature, or user flow on cleanlisense.com. |

### CI Workflow Summary

The Playwright workflow (`.github/workflows/playwright.yml`) runs on Ubuntu and:

1. Checks out the repo
2. Installs Node 20 + Playwright Chromium
3. Runs smoke → navigation → forms → functional → responsive tests in sequence
4. Uploads the HTML report and `test-results/` as artifacts (kept 14 days)

**Visual tests do not run in CI** — screenshot comparison is OS and font-rendering specific. Run `npm run test:visual` locally on Windows before updating baselines.

---

## Contributor Rules

Full guide: [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md)

### Branch Conventions

| Prefix | When to use | Example |
|--------|-------------|---------|
| `feat/` | New test file or new page object | `feat/blog-page-tests` |
| `fix/` | Broken test, stale selector | `fix/pricing-cta-selector` |
| `chore/` | Config, tooling, dependency updates | `chore/playwright-upgrade` |
| `docs/` | README, CONTRIBUTING, comments only | `docs/update-skills-md` |

Always branch from `main` and target `main` for PRs.

### Non-Negotiable Rules

| Rule | Why |
|------|-----|
| Never submit a form | We are testing the UI, not transacting with real systems |
| No hardcoded URLs | Use `siteConfig.url` from the fixture so staging/prod can be swapped via env var |
| All selectors in page objects | No `page.locator()` in spec files — keeps tests readable and selectors maintainable |
| TypeScript must compile | Run `npm run typecheck` before opening a PR |
| Every test needs a tag | Required for selective test execution in CI and locally |

### Recommended Workflow

```powershell
# 1. Optional: let Claude inspect the page structure
#    In a Claude Code session: /analyze-site

# 2. Add or update the page object
#    src/pages/<page-name>.page.ts

# 3. Register in the fixture
#    src/fixtures/site.fixture.ts

# 4. Write the spec file
#    tests/<category>/<feature>.spec.ts

# 5. Verify
npm run typecheck
npm run lint
npx playwright test tests/<category>/<feature>.spec.ts --headed
```

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
| **Target users** | Cleaning company owners, short-term rental hosts, property managers |

---

*Generated and maintained with [Claude Code](https://code.claude.com). For issues, open a GitHub issue or type `/generate-report` in a Claude Code session.*
