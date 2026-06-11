## Summary

<!-- What does this PR do? One or two sentences. -->

## Type of change

- [ ] New test file(s)
- [ ] Updated page object / selector fix
- [ ] Bug fix (broken or flaky test)
- [ ] Visual baseline update
- [ ] Config / tooling / dependency change
- [ ] Documentation only

## Files changed

<!-- List the key files added or modified -->

- `tests/`
- `src/pages/`

## Test results

<!-- Paste relevant output from the test run, or a link to the CI report -->

```
# Example:
# npx playwright test tests/functional/pricing.spec.ts
# 7 passed (12s)
```

## Checklist

- [ ] `npm run typecheck` passes with no errors
- [ ] `npm run lint` passes with no warnings
- [ ] All new tests are tagged (`@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, `@responsive`)
- [ ] No hardcoded URLs — all URLs derived from `siteConfig.url`
- [ ] No form submissions in test code
- [ ] Assertions are in spec files only — not inside page object methods
- [ ] No `page.waitForTimeout()` longer than 500ms
- [ ] Visual baselines updated and committed (if `@visual` tests were added or changed)
- [ ] `npm run test:smoke` passes on this branch

## Screenshots / Evidence

<!-- Paste Playwright HTML report screenshots or terminal output if helpful -->
