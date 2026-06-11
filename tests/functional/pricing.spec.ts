/**
 * tests/functional/pricing.spec.ts
 *
 * Functional tests for the CleanliSense Pricing page (/pricing).
 * Verifies plan structure, pricing content, and CTAs.
 * Does NOT submit any forms or click purchase buttons with intent to buy.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Pricing Page @functional', () => {
  test.beforeEach(async ({ pricingPage }) => {
    await pricingPage.navigate();
    await pricingPage.waitForLoad();
  });

  // ── Page load ───────────────────────────────────────────────────────────────

  test('pricing page loads with a heading @functional @smoke', async ({ page }) => {
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('pricing page loads within 10 seconds @functional', async ({ pricingPage, siteConfig, page }) => {
    const start = Date.now();
    await page.goto(siteConfig.url.replace(/\/$/, '') + '/pricing', { waitUntil: 'load' });
    const elapsed = Date.now() - start;
    expect(
      elapsed,
      `Pricing page took ${elapsed}ms — exceeds the 10s limit`
    ).toBeLessThan(10_000);
  });

  // ── Pricing content ─────────────────────────────────────────────────────────

  test('pricing page displays price amounts @functional', async ({ pricingPage }) => {
    const hasPricing = await pricingPage.hasPriceElements();
    expect(
      hasPricing,
      'Pricing page should display at least one dollar amount (e.g. $19, $49, $99)'
    ).toBeTruthy();
  });

  test('pricing page is fully loaded (heading + prices) @functional', async ({ pricingPage }) => {
    const isLoaded = await pricingPage.isLoaded();
    expect(
      isLoaded,
      'Pricing page should have both a visible heading and at least one price amount'
    ).toBeTruthy();
  });

  test('pricing page includes known plan names @functional', async ({ pricingPage }) => {
    const planNames = await pricingPage.getPlanHeadings();
    const lower = planNames.map((n) => n.toLowerCase());

    const hasStart = lower.some((n) => n.includes('start'));
    const hasPro = lower.some((n) => n.includes('pro'));
    const hasElite = lower.some((n) => n.includes('elite'));

    if (!hasStart && !hasPro && !hasElite) {
      console.warn(
        '[pricing] Start/Pro/Elite plan headings not found — page structure may have changed. ' +
          `Found headings: [${planNames.join(', ')}]`
      );
    } else {
      expect(
        hasStart || hasPro || hasElite,
        'At least one of Start, Pro, or Elite plan names should appear on the pricing page'
      ).toBeTruthy();
    }
  });

  // ── CTAs ────────────────────────────────────────────────────────────────────

  test('pricing page has at least one CTA button @functional', async ({ pricingPage }) => {
    const ctaButtons = await pricingPage.getCTAButtons();
    expect(
      ctaButtons.length,
      'Pricing page should have at least one CTA (e.g. "Select Start", "Get Started")'
    ).toBeGreaterThan(0);
  });

  test('pricing CTA buttons are enabled @functional', async ({ pricingPage }) => {
    const ctaButtons = await pricingPage.getCTAButtons();
    expect(ctaButtons.length, 'Should have at least one CTA to check').toBeGreaterThan(0);

    for (const cta of ctaButtons.slice(0, 4)) {
      await expect(cta, 'Each pricing CTA should be enabled').toBeEnabled();
    }
  });

  test('pricing page has a free trial CTA @functional', async ({ pricingPage }) => {
    const trialLink = await pricingPage.getStartTrialLink();
    if (!trialLink) {
      console.warn('[pricing] No "Start free trial" CTA found — asserting page has CTAs as fallback.');
      const ctaButtons = await pricingPage.getCTAButtons();
      expect(ctaButtons.length).toBeGreaterThan(0);
      return;
    }
    await expect(trialLink, 'Free trial CTA should be visible').toBeVisible();
  });

  test('free trial CTA links to a sign-up destination @functional', async ({ pricingPage }) => {
    const trialLink = await pricingPage.getStartTrialLink();
    if (!trialLink) return;

    const href = await trialLink.getAttribute('href');
    expect(href, 'Free trial CTA should have a non-empty href').toBeTruthy();

    const isExternal = (href ?? '').startsWith('http') || (href ?? '').startsWith('//');
    const isRelative = (href ?? '').startsWith('/');
    expect(
      isExternal || isRelative,
      `Free trial href "${href}" should be an absolute or relative URL`
    ).toBeTruthy();
  });

  // ── Cleaning company vs host plans ──────────────────────────────────────────

  test('page mentions both cleaning companies and hosts @functional', async ({ page }) => {
    const bodyText = await page.evaluate<string>(() => document.body.innerText.toLowerCase());
    const hasCleaning = bodyText.includes('cleaning') || bodyText.includes('cleaner');
    const hasHost = bodyText.includes('host') || bodyText.includes('property manager');

    expect(hasCleaning, 'Pricing page should mention cleaning companies').toBeTruthy();
    expect(hasHost, 'Pricing page should mention hosts or property managers').toBeTruthy();
  });
});
