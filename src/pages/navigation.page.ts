/**
 * src/pages/navigation.page.ts
 *
 * NavigationPage models the site's primary navigation.
 * Uses semantic role-based selectors and avoids site-specific class names
 * where possible, with ElementsKit-aware fallbacks.
 */

import { type Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';

export interface NavLinkInfo {
  text: string;
  href: string;
}

export interface LinkCheckResult {
  url: string;
  status: number;
  ok: boolean;
}

export class NavigationPage extends BasePage {
  // ── Nav detection ────────────────────────────────────────────────────────────

  /**
   * Return the primary navigation locator.
   * Prefers header-scoped nav, then nav with menu-related classes, then any nav.
   */
  private getNavLocator(): Locator {
    return this.page.locator(
      'header nav, nav[class*="menu"], nav[class*="ekit"], nav, [role="navigation"]'
    ).first();
  }

  /**
   * Return true if a navigation element (or its hamburger toggle) is present on the page.
   * On mobile/tablet, ElementsKit collapses the nav — hamburger presence counts as "nav visible".
   */
  async isNavVisible(): Promise<boolean> {
    // Hamburger toggle visible → nav exists in collapsed state (mobile/tablet)
    const hamburger = this.page.locator(
      '[aria-label="hamburger-icon"], [class*="hamburger"][class*="toggler"], [class*="hamburger"][class*="toggle"]'
    ).first();
    if (await hamburger.count() > 0 && await hamburger.isVisible()) return true;

    // Desktop: check for any visible link inside the header or nav
    const headerLinks = this.page.locator('header a[href], nav a[href]');
    const count = await headerLinks.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      if (await headerLinks.nth(i).isVisible()) return true;
    }

    return false;
  }

  // ── Nav links ────────────────────────────────────────────────────────────────

  /**
   * Return all links inside the primary navigation with their text and href.
   * Filters out empty hrefs and anchor-only links (#).
   * Falls back to ElementsKit-specific containers if the generic nav selector yields nothing.
   */
  async getNavLinks(): Promise<NavLinkInfo[]> {
    const nav = this.getNavLocator();
    let links = nav.locator('a[href]');

    // If the nav locator found nothing useful, try ElementsKit-specific containers
    if (await links.count() === 0) {
      links = this.page.locator(
        '.elementskit-menu-container a[href], #ekit-megamenu-main-menu a[href], header a[href]'
      );
    }

    const count = await links.count();
    const results: NavLinkInfo[] = [];

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const text = ((await link.textContent()) ?? '').trim();
      const href = (await link.getAttribute('href')) ?? '';

      // Skip empty, anchor-only, or javascript: links
      if (!href || href === '#' || href.startsWith('javascript:')) continue;

      results.push({ text, href });
    }

    return results;
  }

  /**
   * Click a navigation item by its visible text.
   * Uses a case-insensitive partial match.
   */
  async clickNavItem(text: string): Promise<void> {
    const nav = this.getNavLocator();
    const link = nav.getByRole('link', { name: text });
    await link.first().click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ── Mobile menu ──────────────────────────────────────────────────────────────

  /**
   * Return the mobile hamburger / menu toggle locator, or null if not found.
   * ElementsKit uses aria-label="hamburger-icon" with class elementskit-menu-toggler.
   */
  async getMobileMenuToggle(): Promise<Locator | null> {
    const candidates = [
      // ElementsKit-specific (most precise)
      this.page.locator('[aria-label="hamburger-icon"]'),
      this.page.locator('[class*="hamburger"][class*="toggler"]'),
      // Generic fallbacks
      this.page.getByRole('button', { name: /menu|navigation|toggle|hamburger/i }),
      this.page.locator('[class*="hamburger"], [class*="menu-toggle"], [class*="nav-toggle"]'),
      this.page.locator('[aria-label*="menu" i], [aria-label*="navigation" i]'),
      this.page.locator('button[aria-expanded]'),
    ];

    for (const candidate of candidates) {
      if (await candidate.count() > 0 && await candidate.first().isVisible()) {
        return candidate.first();
      }
    }

    return null;
  }

  /**
   * Open the mobile navigation menu if a toggle exists and the menu is currently closed.
   * Waits for the menu container to become visible after clicking.
   */
  async openMobileMenu(): Promise<void> {
    const toggle = await this.getMobileMenuToggle();
    if (!toggle) return;

    const isExpanded = await toggle.getAttribute('aria-expanded');
    if (isExpanded === 'true') return; // Already open

    await toggle.click();

    // Wait for the ElementsKit menu container to animate in
    const menuContainer = this.page.locator(
      '.elementskit-menu-container, #ekit-megamenu-main-menu, [class*="menu-container"]'
    ).first();
    if (await menuContainer.count() > 0) {
      await menuContainer.waitFor({ state: 'visible', timeout: 3000 }).catch(() => null);
    } else {
      await this.page.waitForTimeout(400);
    }
  }

  // ── Link reachability ────────────────────────────────────────────────────────

  /**
   * Check all nav links are reachable by issuing HEAD requests.
   * Returns an array of results with URL, HTTP status, and ok flag.
   * Relative URLs are resolved against config.url.
   */
  async checkAllNavLinksReachable(): Promise<LinkCheckResult[]> {
    const navLinks = await this.getNavLinks();
    const baseUrl = new URL(this.config.url);
    const results: LinkCheckResult[] = [];

    for (const link of navLinks) {
      let absoluteUrl: string;
      try {
        absoluteUrl = new URL(link.href, baseUrl).toString();
      } catch {
        results.push({ url: link.href, status: 0, ok: false });
        continue;
      }

      try {
        const response = await this.page.request.head(absoluteUrl, {
          timeout: 10_000,
        });
        results.push({
          url: absoluteUrl,
          status: response.status(),
          ok: response.ok(),
        });
      } catch {
        results.push({ url: absoluteUrl, status: 0, ok: false });
      }
    }

    return results;
  }
}
