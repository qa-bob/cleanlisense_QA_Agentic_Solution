# SKILLS.md — Slash Command Reference

This file documents all slash commands (skills) available in this repository when
running Claude Code. Slash commands are defined in `.claude/commands/` and invoked
by typing `/command-name` in a Claude Code session.

---

## /analyze-site

**File:** `.claude/commands/analyze-site.md`
**Agent:** `site-analyzer`

Crawl the live CleanliSense site and produce a refreshed `site.config.json`.

### Usage

```
/analyze-site [url]
```

If `url` is omitted, uses the `url` field from `site.config.json`.

### What it does

1. Navigates to the site and waits for full load (`networkidle`)
2. Extracts navigation links, headings, CTAs, and form elements
3. Dismisses cookie consent banners before inspection
4. Attempts to find a contact page (`/contact`, `/contact-us`, etc.)
5. Checks for HTTPS, meta viewport tag, meta description, and favicon
6. Outputs a complete `site.config.json` block + issues checklist + confidence rating

### When to use

After a site redesign, or to validate that `site.config.json` reflects the current site structure.

---

## /generate-full-suite

**File:** `.claude/commands/generate-full-suite.md`
**Agent:** `test-generator`

Analyze the live site and generate the complete POM + test suite.

### Usage

```
/generate-full-suite
```

### What it does

1. Reads `site.config.json` for the current URL and flags
2. Fetches live HTML for the homepage and all discovered pages
3. Audits existing page objects in `src/pages/` — updates stale selectors
4. Audits existing test files in `tests/` — identifies coverage gaps
5. Generates missing page objects for any unmodelled page
6. Generates missing test files for all test categories
7. Updates `src/fixtures/site.fixture.ts` with any new page objects
8. Runs `npx tsc --noEmit` and fixes any TypeScript errors
9. Reports what was created, updated, and skipped

### When to use

Initial setup or after a major site overhaul requiring fresh test generation.

---

## /run-smoke

**File:** `.claude/commands/run-smoke.md`

Run the `@smoke` test suite and report results.

### Usage

```
/run-smoke
```

### What it does

1. Executes `npx playwright test --grep @smoke`
2. Parses `test-results/results.json`
3. Reports pass/fail counts and details of any failures

### When to use

Quick health check before a deeper test run, or after any site deployment.

---

## /update-baseline

**File:** `.claude/commands/update-baseline.md`

Refresh visual regression baseline screenshots.

### Usage

```
/update-baseline
```

### What it does

1. Runs `npx playwright test --grep @visual --update-snapshots`
2. Reports which baselines were updated (desktop, mobile, tablet)
3. Reminds you to commit the new snapshot files in `__snapshots__/`

### When to use

After intentional design changes that alter the visual appearance of the site.
Visual baselines are OS-specific — always run this command on Windows if the CI runs on Windows.

---

## /generate-report

**File:** `.claude/commands/generate-report.md`

Generate a human-readable test results summary from the last test run.

### Usage

```
/generate-report
```

### What it does

1. Reads `test-results/results.json` from the most recent run
2. Summarizes pass/fail counts by tag (`@smoke`, `@functional`, etc.) and browser project
3. Lists failing tests with their error messages
4. Identifies flaky tests (passed on retry)

### When to use

After a full test run to produce a summary for the team or stakeholders.

---

## Adding a New Skill

1. Create `.claude/commands/<name>.md`
2. Define: **Usage**, **What it does** (numbered steps), **When to use**
3. Add an entry to this file
4. If the skill relies on a sub-agent, reference it in `AGENTS.md`

---

## Skill Conventions

| Convention | Detail |
|-----------|--------|
| Config first | Read `site.config.json` at the start of every skill |
| Live HTML | Use `WebFetch` — never assume page structure from memory |
| Compile check | Run `npx tsc --noEmit` before reporting any code changes as complete |
| No side effects | Never submit forms or commit changes without user confirmation |
| Tagging | All generated tests tagged with at least one `@tag` |
