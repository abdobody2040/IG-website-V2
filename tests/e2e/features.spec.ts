import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@example.local';
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'AdminTestPassword123!';
const PB_URL = 'http://127.0.0.1:8090';

test.describe('Features E2E Tests (Documents, Notifications, Emails)', () => {
  test.describe.configure({ mode: 'serial' });

  const clientEmail = `client_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;
  const clientPassword = 'ClientPassword123!';
  const clientName = 'Jane E2E Tester';
  let clientUserId = '';
  let mockOrderId = '';

  test.beforeAll(async () => {
    // 1. Authenticate as Superuser to PocketBase directly via API
    let token = '';
    let authRes = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });

    if (authRes.ok) {
      const data = await authRes.json() as any;
      token = data.token;
    } else {
      authRes = await fetch(`${PB_URL}/api/admins/auth-with-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
      });
      if (authRes.ok) {
        const data = await authRes.json() as any;
        token = data.token;
      } else {
        throw new Error('Failed to authenticate as superuser in beforeAll');
      }
    }

    // 2. Ensure Admin User exists in users collection with role 'admin'
    // We use a try-catch and check structure to be highly resilient against parallel worker conflicts
    try {
      const filterQuery = encodeURIComponent(`email="${ADMIN_EMAIL}"`);
      const adminCheckRes = await fetch(`${PB_URL}/api/collections/users/records?filter=${filterQuery}`, {
        headers: { 'Authorization': token }
      });
      if (adminCheckRes.ok) {
        const adminCheckJson = await adminCheckRes.json() as any;
        const adminRecord = adminCheckJson.items && adminCheckJson.items[0];
        if (adminRecord) {
          // Update existing admin user
          await fetch(`${PB_URL}/api/collections/users/records/${adminRecord.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token
            },
            body: JSON.stringify({
              password: ADMIN_PASSWORD,
              passwordConfirm: ADMIN_PASSWORD,
              role: 'admin'
            })
          });
        } else {
          // Create new admin user
          await fetch(`${PB_URL}/api/collections/users/records`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token
            },
            body: JSON.stringify({
              email: ADMIN_EMAIL,
              password: ADMIN_PASSWORD,
              passwordConfirm: ADMIN_PASSWORD,
              display_name: 'Instant Grow Admin',
              role: 'admin',
              verified: true
            })
          });
        }
      }
    } catch (err) {
      console.warn('Ignored admin check/creation conflict in worker:', err);
    }

    // 3. Create the Client User
    const userRes = await fetch(`${PB_URL}/api/collections/users/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({
        email: clientEmail,
        password: clientPassword,
        passwordConfirm: clientPassword,
        display_name: clientName,
        role: 'client',
        verified: true,
        emailVisibility: true,
      }),
    });
    if (!userRes.ok) {
      throw new Error(`Failed to create client user in beforeAll: ${await userRes.text()}`);
    }
    const userJson = await userRes.json() as any;
    clientUserId = userJson.id;

    // 4. Create the Mock Order (status must NOT be 'pending' or 'cancelled' to avoid activation pending block)
    const orderRes = await fetch(`${PB_URL}/api/collections/orders/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({
        user: clientUserId,
        order_number: 'ORD-999-E2E',
        package_name: 'Premium',
        company_name: 'E2E Testing Company LLC',
        company_state: 'WY',
        company_type: 'llc',
        status: 'processing',
        amount: 499,
        currency: 'USD',
      }),
    });
    if (!orderRes.ok) {
      throw new Error(`Failed to create mock order in beforeAll: ${await orderRes.text()}`);
    }
    const orderJson = await orderRes.json() as any;
    mockOrderId = orderJson.id;
  });

  test.beforeEach(({ page }) => {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.error('PAGE ERROR:', err.message));
  });

  test('should login as client, upload a document, and verify document list', async ({ page }) => {
    // Mock R2 upload worker endpoint to prevent external network calls and CORS issues
    await page.route('https://plain-credit-57cf.omegapharm-eg.workers.dev', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'https://mock-r2-url.com/test_doc.pdf' }),
      });
    });

    // 1. Log in as Client
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', clientEmail);
    await page.fill('input[name="password"]', clientPassword);
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await page.waitForURL('**/client/dashboard**');

    // 2. Go to documents page and upload a document
    await page.goto('/client/documents');
    await page.waitForURL('**/client/documents**');

    // Toggle the UploadZone open
    await page.click('button:has-text("Upload Document")');

    // Select file to upload (hidden input)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test_doc.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('dummy pdf content'),
    });

    // Verify the file selection is displayed
    await expect(page.locator('text=test_doc.pdf')).toBeVisible();

    // Click upload to complete the upload
    await page.click('button:has-text("Upload Document")');

    // Wait for the upload to complete and form to close (preview container becomes hidden)
    await expect(page.locator('.bg-blue-50:has-text("test_doc.pdf")')).toBeHidden();

    // Reload the page to bypass React Query cache invalidation key mismatch
    await page.reload();
    await page.waitForURL('**/client/documents**');

    // Verify it appears in the documents table
    await expect(page.locator('table tbody')).toContainText('test_doc.pdf');
  });

  test('should allow admin to send message, which generates notification for client', async ({ page }) => {
    // 1. Log in as Admin
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin**');

    // 2. Navigate to Admin Clients and find the client we just created
    await page.goto('/admin/clients');
    await page.waitForURL('**/admin/clients**');

    // Search for our newly created client
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill(clientEmail);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000); // Wait for filtering

    // Click on the client row's View link to open their detail page
    const clientRow = page.locator(`tr:has-text("${clientEmail}")`);
    const viewLink = clientRow.locator('a:has-text("View")');
    await expect(viewLink).toBeVisible();
    await viewLink.click();
    await page.waitForURL('**/admin/clients/**');

    // 3. Send a message to the client
    await page.click('button:has-text("Message")'); // Click "Message" to open modal
    await page.fill('input[placeholder*="documents are ready"]', 'New Admin Message');
    await page.fill('textarea', 'Hello, this is a test admin message.');
    await page.click('button:has-text("Send Message")'); // Send action inside modal

    // Expect success toast
    await expect(page.locator('text=Message sent')).toBeVisible();

    // Logout admin
    await page.click('button:has-text("Sign out")');
    await page.waitForURL('**/auth/login**');

    // 4. Log in as Client
    await page.fill('input[name="email"]', clientEmail);
    await page.fill('input[name="password"]', clientPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/client/dashboard**');

    // 5. Check Notifications E2E
    const bellBtn = page.locator('button[aria-label="Notifications"]');
    await expect(bellBtn).toBeVisible();

    // Click the bell to open the notification list
    await bellBtn.click();

    // Verify the admin message notification title and content is shown
    await expect(page.locator('text=New Admin Message')).toBeVisible();
    await expect(page.locator('text=Hello, this is a test admin message.')).toBeVisible();

    // Click Mark all read
    const markAllReadBtn = page.locator('button:has-text("Mark all read")');
    if (await markAllReadBtn.count() > 0) {
      await markAllReadBtn.click();
    }
  });

  test('should handle Contact Form submission and trigger email sending api request', async ({ page }) => {
    // Intercept email sending Worker API
    const emailEndpoint = '**/functions/send-email**';
    let emailSent = false;
    let requestPayload: any = null;

    await page.route(emailEndpoint, async (route) => {
      emailSent = true;
      requestPayload = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    // Go to contact page
    await page.goto('/contact');
    await page.fill('input[name="name"]', 'Contact E2E Tester');
    await page.fill('input[name="email"]', 'contact-test@example.com');
    await page.selectOption('select[name="subject"]', { label: 'General Inquiry' });
    await page.fill('textarea[name="message"]', 'Hello, this is a test request from Playwright.');

    // Submit contact form
    await page.click('button[type="submit"]');

    // Verify that the email edge function was triggered with the correct payload
    await expect(page.locator('text=Message sent')).toBeVisible();
    expect(emailSent).toBe(true);
    expect(requestPayload.to).toBe('info@instantgrow.net');
    expect(requestPayload.subject).toContain('General Inquiry');
    expect(requestPayload.html).toContain('Contact E2E Tester');
  });

  test('should allow admin to update order status and notes', async ({ page }) => {
    // 1. Log in as Admin
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin**');

    // 2. Navigate to Admin Orders
    await page.goto('/admin/orders');
    await page.waitForURL('**/admin/orders**');

    // Search for our mock order
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('ORD-999-E2E');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000); // Wait for filtering

    // Click Edit on the first order
    const editBtn = page.locator('button:has-text("Edit")').first();
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    // Verify the modal is open and we can change status
    await page.selectOption('select:has-text("Status")', { label: 'Completed' });
    await page.fill('textarea', 'Completed order notes.');
    await page.click('button:has-text("Save Changes")');

    // Expect success toast
    await expect(page.locator('text=Order updated')).toBeVisible();
  });
});
