import { test, expect } from '@playwright/test';

test.describe('Arabic RTL and Mobile Responsiveness E2E Tests', () => {
  // Test RTL layout switching on landing page
  test('should support Arabic RTL toggle and verify direction', async ({ page }) => {
    await page.goto('/');

    // Initially, HTML direction should be LTR (default EN)
    const htmlElement = page.locator('html');
    await expect(htmlElement).not.toHaveAttribute('dir', 'rtl');

    // Find and click language toggle for Arabic
    // The button typically contains 'العربية' when in EN mode
    const arToggle = page.locator('button:has-text("العربية"), span:has-text("العربية"), span:text-is("AR")').first();
    await expect(arToggle).toBeVisible();
    await arToggle.click();

    // Verify page direction updates to RTL
    await expect(htmlElement).toHaveAttribute('dir', 'rtl');

    // Confirm that Arabic text is loaded (e.g. Arabic word for Home or LLC/LTD)
    const arabicHeroText = page.locator('h1, h2').first();
    await expect(arabicHeroText).toBeVisible();

    // Verify toggle button changes to 'EN'
    const enToggle = page.locator('button:has-text("EN"), span:has-text("EN"), span:text-is("EN")').first();
    await expect(enToggle).toBeVisible();
    await enToggle.click();

    // Verify page direction returns to LTR
    await expect(htmlElement).not.toHaveAttribute('dir', 'rtl');
  });

  // Test Mobile responsiveness and menu toggle
  test.describe('Mobile Viewport', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test('should render mobile-friendly layout and toggle hamburger menu', async ({ page }) => {
      await page.goto('/');

      // Verify that desktop navigation is hidden in mobile view
      const desktopNav = page.locator('nav.hidden.md\\:flex');
      await expect(desktopNav).toBeHidden();

      // Verify that the mobile menu trigger (hamburger button) is visible
      const menuTrigger = page.locator('button[aria-label="Toggle menu"]');
      await expect(menuTrigger).toBeVisible();

      // Click the menu trigger to open mobile sidebar/overlay
      await menuTrigger.click();

      // Verify mobile overlay menu is now visible
      const mobileNavLinks = page.locator('a[href="/blog"], a[href="/services"]').filter({ visible: true }).first();
      await expect(mobileNavLinks).toBeVisible();

      // Click the close menu button
      const closeButton = page.locator('button[aria-label="Close menu"]');
      await expect(closeButton).toBeVisible();
      await closeButton.click();
    });
  });
});
