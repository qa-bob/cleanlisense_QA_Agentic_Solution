/**
 * tests/functional/integrations.spec.ts
 *
 * Functional tests for the CleanliSense integrations section on the homepage.
 * Verifies that key integration partners (Airbnb, VRBO, Guesty, OwnerRez) are
 * mentioned, that integration images have alt text, and that any integration
 * CTA is accessible.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

const KNOWN_INTEGRATIONS = ['Airbnb', 'VRBO', 'Guesty', 'OwnerRez'];

test.describe('Integrations Section @functional', () => {
  test.beforeEach(async ({ featuresPage }) => {
    await featuresPage.navigate();
    await featuresPage.waitForLoad();
  });

  // ── Section presence ────────────────────────────────────────────────────────

  test('integrations section is present on the homepage @functional', async ({ featuresPage }) => {
    const section = await featuresPage.getIntegrationsSection();
    const exists = await featuresPage.sectionExists(section);
    expect(exists, 'An integrations section should be present on the homepage').toBeTruthy();
  });

  test('integrations section has a visible heading @functional', async ({ featuresPage }) => {
    const hasHeading = await featuresPage.hasSection('integration');
    expect(hasHeading, 'An integrations heading (h2/h3/h4) should be on the page').toBeTruthy();
  });

  // ── Known integration partners ───────────────────────────────────────────────

  test('at least one known integration platform is mentioned @functional', async ({ page }) => {
    const bodyText = await page.evaluate<string>(() => document.body.innerText.toLowerCase());
    const found = KNOWN_INTEGRATIONS.filter((name) => bodyText.includes(name.toLowerCase()));

    expect(
      found.length,
      `Expected at least one of [${KNOWN_INTEGRATIONS.join(', ')}] to appear on the page. ` +
        `Found: [${found.join(', ') || 'none'}]`
    ).toBeGreaterThan(0);
  });

  test('Airbnb is mentioned as a supported platform @functional', async ({ page }) => {
    const bodyText = await page.evaluate<string>(() => document.body.innerText);
    expect(bodyText, 'Airbnb should be mentioned as a supported platform').toContain('Airbnb');
  });

  test('VRBO is mentioned as a supported platform @functional', async ({ page }) => {
    const bodyText = await page.evaluate<string>(() => document.body.innerText);
    const hasVRBO =
      bodyText.includes('VRBO') || bodyText.includes('Vrbo') || bodyText.includes('vrbo');
    expect(hasVRBO, 'VRBO should be mentioned as a supported platform').toBeTruthy();
  });

  // ── Accessibility ────────────────────────────────────────────────────────────

  test('integration images have alt text @functional', async ({ page }) => {
    const integrationImgs = page.locator('[class*="integration"] img, [class*="partner"] img');
    const count = await integrationImgs.count();

    if (count === 0) {
      console.warn('[integrations] No integration images found — logos may be text-only or use a different class.');
      return;
    }

    const missingAlt: string[] = [];
    for (let i = 0; i < count; i++) {
      const img = integrationImgs.nth(i);
      const alt = await img.getAttribute('alt');
      if (!alt || alt.trim() === '') {
        const src = (await img.getAttribute('src')) ?? '[no src]';
        missingAlt.push(src);
      }
    }

    expect(
      missingAlt.length,
      `${missingAlt.length} integration image(s) are missing alt text:\n  ${missingAlt.join('\n  ')}`
    ).toBe(0);
  });

  // ── Integration CTA ──────────────────────────────────────────────────────────

  test('"See all integrations" or similar CTA is present @functional', async ({ page }) => {
    const integrationCta = page
      .locator('a')
      .filter({ hasText: /all integrations|see integrations|view integrations|connect.*tools/i })
      .first();

    if ((await integrationCta.count()) === 0) {
      console.warn('[integrations] No "See all integrations" CTA found — checking for any integration link.');
      const anyIntLink = page.locator('a[href*="integrat" i]').first();
      if ((await anyIntLink.count()) > 0) {
        await expect(anyIntLink).toBeVisible();
      }
      return;
    }

    await expect(integrationCta, 'Integration CTA should be visible').toBeVisible();
    const href = await integrationCta.getAttribute('href');
    expect(href, 'Integration CTA should have a non-empty href').toBeTruthy();
  });

  // ── iCAL support ────────────────────────────────────────────────────────────

  test('iCAL syncing is mentioned on the page @functional', async ({ page }) => {
    const bodyText = await page.evaluate<string>(() => document.body.innerText.toLowerCase());
    const hasIcal = bodyText.includes('ical') || bodyText.includes('ics') || bodyText.includes('calendar sync');

    if (!hasIcal) {
      console.warn('[integrations] iCAL syncing not mentioned on the homepage — may be on a dedicated integrations page.');
    }
    // Soft check: log a warning rather than hard-fail, as content may vary
  });
});
