import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@example.local';
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'AdminTestPassword123!';

test.describe('Authentication & Localization E2E Tests', () => {
  test('should load login page, toggle language, and handle invalid login', async ({ page }) => {
    // Navigate to login page
    await page.goto('/auth/login');
    
    // Check heading exists and has English content
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Welcome back');
    
    // Verify default layout direction is LTR
    const body = page.locator('html');
    await expect(body).not.toHaveAttribute('dir', 'rtl');

    // Toggle language to Arabic
    const arToggle = page.locator('span:text-is("AR")');
    if (await arToggle.isVisible()) {
      await arToggle.click();
      
      // Verify direction changed to RTL
      await expect(body).toHaveAttribute('dir', 'rtl');
      
      // Toggle back to English
      const enToggle = page.locator('span:text-is("EN")');
      await enToggle.click();
      await expect(body).not.toHaveAttribute('dir', 'rtl');
    }

    // Try logging in with invalid credentials
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Expect error message
    const errorAlert = page.locator('.bg-red-50');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('Invalid email or password.');
  });

  test('should login as admin and log out successfully', async ({ page }) => {
    // Navigate to login page
    await page.goto('/auth/login');

    // Fill credentials
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    
    // Submit
    await page.click('button[type="submit"]');

    // Should redirect to admin dashboard
    await page.waitForURL('**/admin**');
    
    // Verify admin layout indicators
    const adminAccessBadge = page.locator('text=Admin Access');
    await expect(adminAccessBadge).toBeVisible();

    // Click Sign out button in user footer
    await page.click('button:has-text("Sign out")');

    // Should redirect back to login
    await page.waitForURL('**/auth/login');
  });
});
