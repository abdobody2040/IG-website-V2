import { test, expect } from '@playwright/test';

test.describe('Order Wizard E2E Flow', () => {
  test('should complete the order wizard step-by-step', async ({ page }) => {
    // Increase timeout for this multi-step flow
    test.setTimeout(60000);

    // 1. Navigate to order wizard
    await page.goto('/order');

    // --- STEP 0: Company Info ---
    await page.fill('input[name="companyName"]', 'Test E2E LLC');
    // Select Wyoming state (popular choice card)
    await page.click('text=Wyoming');
    await page.fill('textarea[name="businessPurpose"]', 'Software Consulting Services');
    // Go to next step
    await page.click('button:has-text("Next")');

    // --- STEP 1: Member Info ---
    // Fill member full name (target input using placeholder 'John Doe')
    await page.fill('input[placeholder="John Doe"]', 'Jane Member');
    // Fill address
    await page.fill('input[placeholder="Start typing an address..."]', '456 Test Ave, Suite 10');
    // Fill email
    await page.fill('input[placeholder="john@example.com"]', 'jane.member@example.com');
    // Fill phone
    await page.fill('input[placeholder="+1 234 567 8900"]', '+1 (555) 123-4567');
    // Go to next step
    await page.click('button:has-text("Next")');

    // --- STEP 2: Service Package ---
    // Select US Premium package card or just click next since 'us-premium' is selected by default
    await page.click('button:has-text("Next")');

    // --- STEP 3: Add-Ons ---
    // Click next twice to skip both Compliance and Tech add-ons
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Next")');

    // --- STEP 4: Account ---
    // Fill customer account details if not already signed in
    const nameInput = page.locator('input[name="fullName"]');
    if (await nameInput.count() > 0) {
      const randomEmail = `test_customer_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;
      await nameInput.fill('Jane Customer');
      await page.fill('input[name="email"]', randomEmail);
    }
    // Go to next step
    await page.click('button:has-text("Next")');

    // --- STEP 5: Review & Pay ---
    // Verify pricing details and summaries are rendered
    const summaryCard = page.locator('text=Order Summary');
    await expect(summaryCard).toBeVisible();

    // Click "Place Order" button (which in DEV mode directly creates the order and redirects)
    await page.click('button:has-text("Place Order")');

    // Should redirect to order success page
    await page.waitForURL('**/order/success**');
    
    // Success page header should be visible
    const successTitle = page.locator('h1');
    await expect(successTitle).toContainText('Order Placed!');
  });
});
