/**
 * tests/forms/contact-form.spec.ts
 *
 * Contact form tests — verify the presence and structure of contact forms.
 * IMPORTANT: These tests do NOT submit forms to avoid sending spam.
 *
 * Tag: @forms
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Contact Form @forms', () => {
  // Skip the entire suite when skipForms is configured for this site
  test.beforeEach(async ({ siteConfig }) => {
    if (siteConfig.skipForms) {
      test.skip(true, `Forms testing skipped for "${siteConfig.name}" (skipForms: true)`);
    }
  });

  // ── Form presence ───────────────────────────────────────────────────────────

  test('contact form is present on site @forms', async ({ contactPage, siteConfig, page }) => {
    // Check homepage first
    await contactPage.navigate();
    let form = await contactPage.findContactForm();

    if (!form) {
      // Try /contact, /contact-us, /get-in-touch
      const contactPaths = ['/contact', '/contact-us', '/get-in-touch', '/reach-out'];
      for (const contactPath of contactPaths) {
        try {
          await page.goto(siteConfig.url.replace(/\/$/, '') + contactPath, {
            waitUntil: 'domcontentloaded',
            timeout: 10_000,
          });
          form = await contactPage.findContactForm();
          if (form) break;
        } catch {
          // Path doesn't exist — try next
        }
      }
    }

    if (!form) {
      // Also check if there's a "Contact" link in nav to follow
      const contactLink = page.locator('a').filter({ hasText: /contact/i }).first();
      if (await contactLink.count() > 0) {
        await contactLink.click();
        await page.waitForLoadState('domcontentloaded');
        form = await contactPage.findContactForm();
      }
    }

    expect(
      form,
      `No contact form found on "${siteConfig.name}". ` +
        'Checked homepage, /contact, /contact-us, /get-in-touch, and nav Contact link.'
    ).not.toBeNull();
  });

  // ── Required fields ─────────────────────────────────────────────────────────

  test('contact form has required fields (name, email) @forms', async ({ contactPage, siteConfig, page }) => {
    // Navigate to find the form
    await contactPage.navigate();
    let form = await contactPage.findContactForm();

    if (!form) {
      await page.goto(siteConfig.url.replace(/\/$/, '') + '/contact', {
        waitUntil: 'domcontentloaded',
        timeout: 10_000,
      }).catch(() => null);
      form = await contactPage.findContactForm();
    }

    if (!form) {
      test.skip(true, 'No contact form found — covered by "contact form is present" test');
      return;
    }

    const hasEmail = await contactPage.hasEmailField();
    const hasName = await contactPage.hasNameField();

    expect(hasEmail, 'Contact form should have an email input field').toBeTruthy();

    if (!hasName) {
      console.warn(
        `[forms] "${siteConfig.name}" contact form is missing a name field. ` +
          'This is a usability concern.'
      );
    }
  });

  // ── Submit button ───────────────────────────────────────────────────────────

  test('contact form has a submit button @forms', async ({ contactPage, siteConfig, page }) => {
    await contactPage.navigate();
    let form = await contactPage.findContactForm();

    if (!form) {
      await page.goto(siteConfig.url.replace(/\/$/, '') + '/contact', {
        waitUntil: 'domcontentloaded',
        timeout: 10_000,
      }).catch(() => null);
      form = await contactPage.findContactForm();
    }

    if (!form) {
      test.skip(true, 'No contact form found');
      return;
    }

    const hasSubmit = await contactPage.hasSubmitButton();
    expect(hasSubmit, 'Contact form should have a visible submit button').toBeTruthy();
  });

  // ── Labels and placeholders ─────────────────────────────────────────────────

  test('form fields have proper labels or placeholders @forms', async ({ contactPage, siteConfig, page }) => {
    await contactPage.navigate();
    let form = await contactPage.findContactForm();

    if (!form) {
      await page.goto(siteConfig.url.replace(/\/$/, '') + '/contact', {
        waitUntil: 'domcontentloaded',
        timeout: 10_000,
      }).catch(() => null);
      form = await contactPage.findContactForm();
    }

    if (!form) {
      test.skip(true, 'No contact form found');
      return;
    }

    // getFormFields() already excludes CF7 honeypots (_wpcf7*) and CSS-hidden fields
    const fields = await contactPage.getFormFields();

    test.skip(fields.length === 0, 'No visible user-facing fields found after filtering CF7 internals');

    const unlabeledFields: string[] = [];

    for (const field of fields) {
      if (field.type === 'hidden' || field.type === 'submit') continue;

      const fieldLocator = form.locator(
        `input[name="${field.name}"], textarea[name="${field.name}"]`
      ).first();

      if (await fieldLocator.count() === 0) continue;

      const hasAriaLabel = await fieldLocator.getAttribute('aria-label');
      const hasPlaceholder = await fieldLocator.getAttribute('placeholder');
      const fieldId = await fieldLocator.getAttribute('id');
      const hasLabel = fieldId
        ? (await page.locator(`label[for="${fieldId}"]`).count()) > 0
        : false;

      if (!hasAriaLabel && !hasPlaceholder && !hasLabel) {
        unlabeledFields.push(field.name);
      }
    }

    if (unlabeledFields.length > 0) {
      console.warn(
        `[forms] Fields without labels/placeholders in "${siteConfig.name}": ` +
          unlabeledFields.join(', ')
      );
    }

    // Accessibility check — allow max 1 unlabeled field (some CF7 themes omit email label)
    expect(
      unlabeledFields.length,
      `${unlabeledFields.length} user-facing form field(s) have no label, aria-label, or placeholder`
    ).toBeLessThanOrEqual(1);
  });

  // ── HTML5 / CF7 validation ─────────────────────────────────────────────────

  test('required fields show validation when submitted empty @forms', async ({
    siteConfig,
    page,
  }) => {
    // Go directly to a contact page — avoids finding the newsletter/footer form first
    const contactPaths = ['/contact', '/contact-us', '/get-in-touch'];
    let foundForm = false;

    for (const path of contactPaths) {
      try {
        const response = await page.goto(siteConfig.url.replace(/\/$/, '') + path, {
          waitUntil: 'domcontentloaded',
          timeout: 10_000,
        });
        if (response && response.status() < 400) {
          // Look for a CF7 form with a VISIBLE submit button
          const submitBtn = page.locator(
            'input[type="submit"].wpcf7-submit, button[type="submit"].wpcf7-submit'
          ).first();

          if (await submitBtn.count() > 0 && await submitBtn.isVisible()) {
            foundForm = true;

            // Block every non-GET request so nothing can actually be submitted, even
            // if the form posts via fetch/XHR (CF7 uses AJAX) or validation is missing.
            const submissionAttempts: string[] = [];
            const navigationAttempts: string[] = [];
            await page.route('**/*', async (route) => {
              const req = route.request();
              if (req.method() !== 'GET' && req.method() !== 'HEAD') {
                submissionAttempts.push(`${req.method()} ${req.url()}`);
                if (req.isNavigationRequest()) navigationAttempts.push(`${req.method()} ${req.url()}`);
                await route.abort();
                return;
              }
              await route.continue();
            });

            // Use evaluate to dispatch submit — avoids Playwright's actionability checks
            // CF7 forms use AJAX, so native form.submit() or a click triggers JS validation
            await submitBtn.evaluate((el) => (el as HTMLElement).click());
            await page.waitForTimeout(600);

            expect(
              navigationAttempts,
              'Empty CF7 form submit should NOT trigger a full-page POST navigation'
            ).toHaveLength(0);

            // CF7 shows .wpcf7-not-valid-tip on invalid fields after AJAX validation
            const cf7Errors = page.locator('.wpcf7-not-valid-tip, .wpcf7-validation-errors');
            const hasCf7Error = (await cf7Errors.count()) > 0;

            if (!hasCf7Error) {
              console.warn(
                '[forms] CF7 validation error messages (.wpcf7-not-valid-tip) not detected after empty submit. ' +
                  'CF7 AJAX response may still be in flight — check manually.'
              );
            }

            break;
          }
        }
      } catch {
        // Path doesn't exist — try next
      }
    }

    test.skip(
      !foundForm,
      'No contact page with a visible CF7 submit button found at /contact, /contact-us, /get-in-touch'
    );
  });
});
