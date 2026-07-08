import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@example.local';
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'AdminTestPassword123!';

test.describe('Admin Panel E2E Tests', () => {
  test('should login and navigate admin dashboard and payments page', async ({ page }) => {
    // 1. Login as admin
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // 2. Navigation to Admin Overview
    await page.waitForURL('**/admin');
    
    // Assert title or header
    const title = page.locator('h1');
    await expect(title).toContainText('Overview');

    // Verify main stat cards are visible
    const statCards = page.locator('.grid');
    await expect(statCards).toBeVisible();

    // 3. Go to Payments page
    await page.click('a[href="/admin/payments"]');
    await page.waitForURL('**/admin/payments');

    // Assert Payments dashboard components
    await expect(page.locator('text=Payment Dashboard')).toBeVisible();
    
    // Verify Export controls exist
    const csvExportBtn = page.locator('button:has-text("CSV")');
    await expect(csvExportBtn).toBeVisible();

    const pdfExportBtn = page.locator('button:has-text("PDF")');
    await expect(pdfExportBtn).toBeVisible();

    // 4. Go to Orders page
    await page.click('a[href="/admin/orders"]');
    await page.waitForURL('**/admin/orders');

    // Assert Orders page content
    const ordersTitle = page.locator('h1');
    await expect(ordersTitle).toContainText('Orders');
  });
});
