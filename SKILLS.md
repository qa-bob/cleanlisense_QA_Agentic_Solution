# SKILLS.md — Slash Command Reference

This file documents all slash commands (skills) available in this repository.
Commands are defined in `.claude/commands/` and invoked by typing `/command-name`
in a Claude Code session.

---

## How Skills Work

Each file in `.claude/commands/` becomes a `/command-name` you can type in Claude Code.
The filename (without `.md`) is the command name.

Every command file starts with a YAML frontmatter block:

```yaml
---
description: One-line description — Claude uses this to decide when to auto-invoke the command
allowed-tools: WebFetch, Read, Write, Bash
---
```

**`description`** — Claude reads this field to decide whether to auto-invoke the command
when the user's request matches. Keep it specific enough to avoid false positives.

**`allowed-tools`** — Tools pre-approved for this command. Claude won't prompt for permission
to use these tools when the command is running. Only list tools the command actually needs.

### Creating a new skill

1. Create `.claude/commands/<name>.md`
2. Add the YAML frontmatter with `description:` and `allowed-tools:`
3. Write the body: **Usage**, **What it does** (numbered steps), **When to use**
4. Add an entry to this file
5. If the skill relies on a sub-agent, reference that agent in `AGENTS.md`

---

## /analyze-site

**File:** `.claude/commands/analyze-site.md`
**Agent:** `site-analyzer`
**Allowed tools:** `WebFetch`, `Read`, `Write`

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
**Allowed tools:** `WebFetch`, `Read`, `Write`, `Bash`

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
**Allowed tools:** `Bash`, `Read`

Run the `@smoke` test suite and report results.

### Usage

```
/run-smoke
```

### What it does

1. Runs `bash .claude/hooks/pre-test.sh` to verify site is reachable
2. Executes `npm run test:smoke`
3. Parses `test-results/results.json`
4. Displays a formatted pass/fail table with duration per test
5. For failures, shows the error message and a suggested fix

### When to use

Quick health check before a deeper test run, or after any site deployment.

---

## /update-baseline

**File:** `.claude/commands/update-baseline.md`
**Allowed tools:** `Bash`, `Read`

Refresh visual regression baseline screenshots.

### Usage

```
/update-baseline
```

### What it does

1. Runs `npm run baseline` (`playwright test --grep @visual --update-snapshots`)
2. Lists all updated files by diffing `__snapshots__/` against git
3. Reminds you to review the screenshots visually before committing

### When to use

After intentional design changes that alter the visual appearance of the site.
Visual baselines are OS-specific — always run this command on Windows if the CI runs on Windows.

**Important:** Run `npm run baseline` locally; do not run it in CI. Committing baselines
generated on a different OS will cause visual tests to fail on other machines.

---

## /generate-report

**File:** `.claude/commands/generate-report.md`
**Allowed tools:** `Read`, `Bash`

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
5. Suggests next steps (re-run, update baseline, investigate flaky tests)

### When to use

After a full test run to produce a summary for the team or stakeholders.

---

## Skill Conventions

| Convention | Detail |
|-----------|--------|
| Config first | Read `site.config.json` at the start of every skill |
| Live HTML | Use `WebFetch` — never assume page structure from memory |
| Compile check | Run `npx tsc --noEmit` before reporting any code changes as complete |
| No side effects | Never submit forms or commit changes without user confirmation |
| Tagging | All generated tests tagged with at least one `@tag` |
| Pre-test hook | Run `bash .claude/hooks/pre-test.sh` before any test execution to verify the site is reachable |

---

## Skill vs. Agent vs. Rule

| Type | Invoked by | Purpose |
|------|-----------|---------|
| Skill (command) | User typing `/command-name` | Multi-step procedure the user triggers explicitly |
| Agent | Skill or natural language | Bounded specialist: one well-defined job with defined inputs/outputs |
| Rule | Editing a matching file | Background coding standards; no user action needed |

See [AGENTS.md](./AGENTS.md) for the full agent catalog.
