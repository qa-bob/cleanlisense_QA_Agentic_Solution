import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import type { SiteConfig } from '@site-types/site-config.types';

export class PricingPage extends BasePage {
  constructor(page: Page, config: SiteConfig) {
    super(page, config);
  }

  async navigate(): Promise<void> {
    const pricingUrl = this.url.replace(/\/$/, '') + '/pricing';
    await this.page.goto(pricingUrl, { waitUntil: 'domcontentloaded' });
  }

  async getPricingCards(): Promise<Locator[]> {
    const byClass = this.page.locator('[class*="plan"], [class*="pricing-card"], [class*="tier"], [class*="package"]');
    if (await byClass.count() > 0) return byClass.all();

    const byContent = this.page.locator('section, div').filter({ hasText: /\$\d+/ });
    return byContent.all();
  }

  async getPlanHeadings(): Promise<string[]> {
    const headings = this.page.locator('h2, h3').filter({
      hasText: /start|pro|elite|basic|standard|premium/i,
    });
    const all = await headings.all();
    const names: string[] = [];
    for (const h of all) {
      const text = ((await h.textContent()) ?? '').trim();
      if (text) names.push(text);
    }
    return names;
  }

  async getCTAButtons(): Promise<Locator[]> {
    const ctaLocator = this.page.locator('a, button').filter({
      hasText: /select|get started|sign up|try free|join|choose/i,
    });
    return ctaLocator.all();
  }

  async hasPriceElements(): Promise<boolean> {
    const dollarText = await this.page.evaluate<boolean>(() =>
      document.body.innerText.includes('$')
    );
    return dollarText;
  }

  async getStartTrialLink(): Promise<Locator | null> {
    const link = this.page.locator('a').filter({
      hasText: /start.*free trial|30.day.*free|free trial/i,
    }).first();
    if (await link.count() > 0) return link;
    return null;
  }

  async isLoaded(): Promise<boolean> {
    const heading = this.page.locator('h1, h2').first();
    const hasHeading = (await heading.count()) > 0;
    const hasPrice = await this.hasPriceElements();
    return hasHeading && hasPrice;
  }
}
