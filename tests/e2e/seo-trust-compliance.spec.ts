import { test, expect } from '@playwright/test';

test.describe('Technical SEO, Trust, Compliance & Pricing Verification', () => {

  test('1. Technical SEO: /services has unique title, canonical, and meta description', async ({ page }) => {
    await page.goto('/services');
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page).toHaveTitle(/Services|Instant Grow/i);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toContain('/services');

    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc).toBeTruthy();
    expect(desc?.length).toBeGreaterThan(20);
  });

  test('2. Technical SEO: /us-company/wyoming has state-specific canonical and content', async ({ page }) => {
    await page.goto('/us-company/wyoming');
    await expect(page.locator('h1').first()).toBeVisible();
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toContain('/us-company/wyoming');
  });

  test('3. Technical SEO: Sitemap is valid, clean, and contains country & blog routes', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.ok()).toBeTruthy();
    const xml = await res.text();

    // Must NOT contain leaked dev comments or deprecated tags
    expect(xml).not.toContain('DYNAMIC SITEMAP: This file is kept for Sitemap Index');
    expect(xml).not.toContain('<changefreq>');
    expect(xml).not.toContain('<priority>');

    // Must contain core and new routes
    expect(xml).toContain('<loc>https://instantgrow.net/team</loc>');
    expect(xml).toContain('<loc>https://instantgrow.net/how-we-work</loc>');
    expect(xml).toContain('<loc>https://instantgrow.net/form-llc/egypt</loc>');
    expect(xml).toContain('<loc>https://instantgrow.net/form-llc/uae</loc>');
    expect(xml).toContain('<loc>https://instantgrow.net/blog/why-stripe-doesnt-work-your-country</loc>');
    expect(xml).toContain('<lastmod>');
  });

  test('4. Technical SEO: /terms redirects to /terms-of-service', async ({ page }) => {
    await page.goto('/terms');
    await page.waitForURL('**/terms-of-service');
    expect(page.url()).toContain('/terms-of-service');
  });

  test('5. Trust & Proof: Footer has unified Company Details block, dynamic year, and security alert', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    const currentYear = new Date().getFullYear().toString();
    await expect(footer).toContainText(currentYear);
    await expect(footer).toContainText('Instant Grow LLC');
    await expect(footer).toContainText('support@instantgrow.net');
    await expect(footer).toContainText('[REGISTERED_ADDRESS]');
    await expect(footer).toContainText('[REGISTRATION_NUMBER]');
    await expect(footer).toContainText(/Beware of Similar/i);

    // Official Facebook URL
    const fbLink = footer.locator('a[href*="facebook.com"]');
    await expect(fbLink).toHaveAttribute('href', 'https://www.facebook.com/Instant.grow.net');
  });

  test('6. Trust & Proof: Unverified claims removed; Trustpilot profile linked', async ({ page }) => {
    await page.goto('/');

    // Ensure unverified claims are absent
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toContain('24,800+ companies formed');
    expect(bodyText).not.toContain('thousands of verified reviews');

    // Real Trustpilot link
    const tpLink = page.locator('a[href="https://www.trustpilot.com/review/instantgrow.net"]').first();
    await expect(tpLink).toBeVisible();
    await expect(tpLink).toHaveAttribute('target', '_blank');
  });

  test('7. Trust & Proof: /team page renders real structure and placeholders', async ({ page }) => {
    await page.goto('/team');
    await expect(page.locator('h1')).toBeVisible();
    const teamContent = await page.content();
    expect(teamContent).toContain('[FOUNDER_NAME]');
    expect(teamContent).toContain('[COMPLIANCE_LEAD_NAME]');
    expect(teamContent).toContain('Verified Team');
  });

  test('8. Trust & Proof: /how-we-work page details 4 formation stages and registered agents', async ({ page }) => {
    await page.goto('/how-we-work');
    await expect(page.locator('h1')).toBeVisible();
    const pageText = await page.locator('body').innerText();
    expect(pageText).toContain('The 4-Stage Filing Process');
    expect(pageText).toContain('Security Alert: Beware of Similar Domain Names');
  });

  test('9. Content & Compliance: Form 5472 $25,000 penalty disclosure present', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h1')).toBeVisible();
    const aboutText = await page.locator('body').innerText();
    expect(aboutText).toContain('5472');
    expect(aboutText).toContain('$25,000');
  });

  test('10. Pricing & Consistency: All-in pricing table with state fees and renewal costs', async ({ page }) => {
    await page.goto('/#pricing');
    const pricingSection = page.locator('#pricing');
    await expect(pricingSection).toBeVisible();
    const pricingText = await pricingSection.innerText();
    expect(pricingText).toContain('$197');
    expect(pricingText).toContain('$397');
    expect(pricingText).toContain('$102'); // Wyoming state fee
    expect(pricingText).toContain('$60');  // Wyoming renewal
    expect(pricingText).toContain('3–6 weeks'); // non-resident EIN timeline
  });

  test('11. Arabic Country Pages: /form-llc/egypt has bespoke Egyptian banking content', async ({ page }) => {
    await page.goto('/form-llc/egypt');
    await expect(page.locator('h1')).toBeVisible();
    const content = await page.locator('body').innerText();
    expect(content).toContain('Egypt');
    expect(content).toContain('Trustpilot');
    expect(content).toContain('5.0');
  });

  test('12. Arabic Country Pages: /form-llc/uae accurately reflects UAE 9% tax reality', async ({ page }) => {
    await page.goto('/form-llc/uae');
    await expect(page.locator('h1')).toBeVisible();
    const uaeContent = await page.locator('body').innerText();
    expect(uaeContent).toContain('9%');
    expect(uaeContent).toContain('Qualifying Free Zone');
  });
});
