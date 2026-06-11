---
name: Bug report
about: A test is failing, a selector is stale, or the suite produces false positives
title: '[BUG] '
labels: bug
assignees: ''
---

## Describe the bug

<!-- A clear description of what is failing and what you expected to happen. -->

## Test file and test name

<!-- e.g. tests/functional/pricing.spec.ts > "pricing page has at least one CTA button @functional" -->

```
File:
Test:
```

## Steps to reproduce

```powershell
npx playwright test <test-file> --headed
```

1.
2.
3.

## Error output

```
# Paste the Playwright error output here
```

## Environment

| Field | Value |
|-------|-------|
| OS | |
| Node version | (`node --version`) |
| Playwright version | (`npx playwright --version`) |
| Browser project | chromium-desktop / mobile-chrome / tablet |

## Root cause hypothesis

<!-- Is this a stale selector? A site change? A timing issue? -->

## Additional context

<!-- Any other information — recent site deployments, A/B tests, CDN changes, etc. -->
