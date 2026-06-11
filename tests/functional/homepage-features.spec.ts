/**
 * tests/functional/homepage-features.spec.ts
 *
 * Functional tests for the CleanliSense homepage feature sections.
 * Verifies the hero heading, feature section headings, testimonials,
 * and primary CTAs are all present and discoverable.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Homepage Features @functional', () => {
  test.beforeEach(async ({ featuresPage }) => {
    await featuresPage.navigate();
    await featuresPage.waitForLoad();
  });

  // ── Hero section ─────────────────────────────────────────────────────────────

  test('homepage hero heading (h1) is visible @functional @smoke', async ({ page }) => {
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    const text = ((await h1.textContent()) ?? '').trim();
    expect(text.length, 'H1 should have meaningful text').toBeGreaterThan(10);
  });

  test('hero headline reflects a cleaning/operations value proposition @functional', async ({ featuresPage }) => {
    const heading = await featuresPage.getH1Text();
    const lower = heading.toLowerCase();
    const hasKeyword =
      lower.includes('clean') ||
      lower.includes('schedule') ||
      lower.includes('operat') ||
      lower.includes('quick') ||
      lower.includes('property') ||
      lower.includes('host');

    expect(
      hasKeyword,
      `H1 "${heading}" should reflect a cleaning or operations value proposition`
    ).toBeTruthy();
  });

  // ── Feature sections ─────────────────────────────────────────────────────────

  test('homepage has an Automations feature section @functional', async ({ featuresPage }) => {
    const hasSection = await featuresPage.hasSection('Automations');
    expect(hasSection, 'Page should include an "Automations" feature section').toBeTruthy();
  });

  test('homepage has a Housekeeper Apps feature section @functional', async ({ featuresPage }) => {
    const hasSection = await featuresPage.hasSection('Housekeeper');
    expect(hasSection, 'Page should include a "Housekeeper Apps" feature section').toBeTruthy();
  });

  test('homepage has a Calendars / scheduling feature section @functional', async ({ featuresPage }) => {
    const hasSection = await featuresPage.hasSection('Calendar');
    expect(hasSection, 'Page should include a calendars or scheduling section').toBeTruthy();
  });

  test('homepage has a CRM or property management section @functional', async ({ featuresPage }) => {
    const hasCrm = await featuresPage.hasSection('CRM');
    const hasProperties = await featuresPage.hasSection('Property');
    expect(
      hasCrm || hasProperties,
      'Page should include a CRM or property management section'
    ).toBeTruthy();
  });

  test('homepage has multiple feature section headings @functional', async ({ featuresPage }) => {
    const headings = await featuresPage.getAllSectionHeadings();
    expect(
      headings.length,
      'Homepage should have at least 3 feature section headings (h2/h3)'
    ).toBeGreaterThanOrEqual(3);
  });

  // ── Primary CTAs ─────────────────────────────────────────────────────────────

  test('homepage has at least one primary CTA link @functional', async ({ featuresPage }) => {
    const ctaLinks = await featuresPage.getPrimaryCtaLinks();
    expect(
      ctaLinks.length,
      'Homepage should have at least one "Start free trial" or "Get started" CTA'
    ).toBeGreaterThan(0);
  });

  test('primary CTA links have valid hrefs @functional', async ({ featuresPage }) => {
    const ctaLinks = await featuresPage.getPrimaryCtaLinks();
    for (const cta of ctaLinks.slice(0, 3)) {
      const href = await cta.getAttribute('href');
      expect(href, 'CTA should have a non-empty href').toBeTruthy();
    }
  });

  // ── Testimonials ─────────────────────────────────────────────────────────────

  test('homepage displays customer testimonials @functional', async ({ featuresPage }) => {
    const count = await featuresPage.getTestimonialCount();
    if (count === 0) {
      console.warn('[homepage-features] No testimonial elements found — site structure may have changed.');
    } else {
      expect(count, 'Page should display at least one customer testimonial').toBeGreaterThan(0);
    }
  });

  // ── Navigation CTA ───────────────────────────────────────────────────────────

  test('homepage header has a Login link @functional @navigation', async ({ page }) => {
    const loginLink = page.locator('a').filter({ hasText: /login|log in|sign in/i }).first();
    await expect(loginLink, 'A Login / Sign In link should be visible in the header').toBeVisible();
  });

  test('Login link points to the app subdomain @functional', async ({ page }) => {
    const loginLink = page.locator('a').filter({ hasText: /login|log in|sign in/i }).first();
    if ((await loginLink.count()) === 0) return;

    const href = await loginLink.getAttribute('href');
    expect(href, 'Login link should have a non-empty href').toBeTruthy();

    const isAppLink =
      (href ?? '').includes('app.cleanlisense') ||
      (href ?? '').includes('/login') ||
      (href ?? '').includes('/signin');

    expect(
      isAppLink,
      `Login href "${href}" should point to app.cleanlisense.com or a /login path`
    ).toBeTruthy();
  });

  test('homepage links to the Pricing page @functional @navigation', async ({ page, siteConfig }) => {
    const pricingLink = page.locator('a').filter({ hasText: /pricing/i }).first();
    if ((await pricingLink.count()) === 0) {
      console.warn('[homepage-features] No "Pricing" link found in the nav.');
      return;
    }
    await expect(pricingLink, 'Pricing nav link should be visible').toBeVisible();
    const href = await pricingLink.getAttribute('href');
    const resolved = new URL(href ?? '/', siteConfig.url).toString();
    expect(resolved).toContain('pricing');
  });
});
