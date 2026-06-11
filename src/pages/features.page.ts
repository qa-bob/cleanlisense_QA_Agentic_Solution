import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import type { SiteConfig } from '@site-types/site-config.types';

export class FeaturesPage extends BasePage {
  constructor(page: Page, config: SiteConfig) {
    super(page, config);
  }

  async getH1Text(): Promise<string> {
    const h1 = this.page.locator('h1').first();
    if ((await h1.count()) === 0) return '';
    return ((await h1.textContent()) ?? '').trim();
  }

  async getAllSectionHeadings(): Promise<string[]> {
    const headings = this.page.locator('h2, h3');
    const all = await headings.all();
    const texts: string[] = [];
    for (const h of all) {
      const text = ((await h.textContent()) ?? '').trim();
      if (text) texts.push(text);
    }
    return texts;
  }

  async hasSection(keyword: string): Promise<boolean> {
    const section = this.page.locator('h2, h3, h4').filter({
      hasText: new RegExp(keyword, 'i'),
    });
    return (await section.count()) > 0;
  }

  async getIntegrationNames(): Promise<string[]> {
    const logoImgs = this.page.locator('[class*="integration"] img, [class*="partner"] img');
    const results: string[] = [];

    const imgs = await logoImgs.all();
    for (const img of imgs) {
      const alt = ((await img.getAttribute('alt')) ?? '').trim();
      if (alt) results.push(alt);
    }

    return results;
  }

  async getTestimonialCount(): Promise<number> {
    const testimonials = this.page.locator(
      '[class*="testimonial"], [class*="review"], [class*="quote"], blockquote'
    );
    return testimonials.count();
  }

  async getPrimaryCtaLinks(): Promise<Locator[]> {
    const ctaLinks = this.page.locator('a').filter({
      hasText: /start.*free trial|get started|join|sign up/i,
    });
    return ctaLinks.all();
  }

  async getAutomationsSection(): Promise<Locator> {
    return this.page.locator('section, div').filter({ hasText: /automations/i }).first();
  }

  async getIntegrationsSection(): Promise<Locator> {
    return this.page.locator('section, div').filter({ hasText: /integrations/i }).first();
  }

  async sectionExists(locator: Locator): Promise<boolean> {
    return (await locator.count()) > 0;
  }
}
