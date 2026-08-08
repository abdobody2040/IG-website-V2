<?php
// =============================================================================
//  Full Admin CRUD + Notification/Email Test
//  Run: php scripts/test-admin-crud.php
// =============================================================================

$BASE = 'http://localhost:8080';
$ADMIN_EMAIL = 'instantgrow.net@gmail.com';
$ADMIN_PASS  = 'AdminPassword2026!';

$pass = 0; $fail = 0; $warn = 0;

// ── Colour / output helpers ───────────────────────────────────────────────────
function c(string $code, string $t): string { return "\033[{$code}m{$t}\033[0m"; }
function ok(string $m)   { global $pass; $pass++; echo c('32', '  [PASS] ') . $m . PHP_EOL; }
function fail(string $m) { global $fail; $fail++; echo c('31', '  [FAIL] ') . $m . PHP_EOL; }
function warn(string $m) { global $warn; $warn++; echo c('33', '  [WARN] ') . $m . PHP_EOL; }
function info(string $m) { echo c('36', '  [INFO] ') . $m . PHP_EOL; }
function head(string $m) { echo PHP_EOL . c('1;35', "=== {$m} ===") . PHP_EOL; }
function chk(bool $cond, string $okMsg, string $failMsg): void { if ($cond) ok($okMsg); else fail($failMsg); }

// ── HTTP helper ───────────────────────────────────────────────────────────────
function http(string $method, string $path, array $body = [], string $token = ''): array {
    global $BASE;
    $ch = curl_init($BASE . $path);
    $headers = ['Content-Type: application/json', 'Accept: application/json'];
    if ($token) { $headers[] = "Authorization: Bearer $token"; }
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST  => strtoupper($method),
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_TIMEOUT        => 10,
    ]);
    if ($body && in_array(strtoupper($method), ['POST','PATCH','PUT'])) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    }
    $raw  = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    $data = $raw ? (json_decode($raw, true) ?? []) : [];
    return ['code' => $code, 'data' => $data, 'raw' => $raw];
}

// =============================================================================
// 1. AUTH – Login as admin
// =============================================================================
head('1. Admin Login');
$r = http('POST', '/auth/login', ['identity' => $ADMIN_EMAIL, 'password' => $ADMIN_PASS]);
chk($r['code'] === 200, 'Admin login → 200', "Admin login failed → HTTP {$r['code']}: " . ($r['data']['message'] ?? $r['raw']));
$token = $r['data']['token'] ?? '';
$adminId = $r['data']['record']['id'] ?? '';
chk((bool)$token, 'JWT token returned', 'No token in response');
chk(($r['data']['record']['role'] ?? '') === 'admin', 'Role = admin', 'Role mismatch: ' . ($r['data']['record']['role'] ?? '?'));
info("Admin ID: $adminId");

// =============================================================================
// 2. HEALTH + DEBUG
// =============================================================================
head('2. Health & Debug Endpoints');
$r = http('GET', '/health');
chk($r['code'] === 200, '/health → 200', "/health failed → {$r['code']}");
$r = http('GET', '/debug/tables');
chk($r['code'] === 200, '/debug/tables → 200', "/debug/tables failed → {$r['code']}");
$missing = $r['data']['tables_missing'] ?? [];
chk(count($missing) === 0, 'All tables present (' . count($r['data']['tables_present'] ?? []) . ')', 'Missing tables: ' . implode(', ', $missing));
$r = http('GET', '/debug/auth', [], $token);
chk($r['code'] === 200, '/debug/auth → 200', "/debug/auth failed → {$r['code']}");
chk(($r['data']['token_valid'] ?? false) === true, 'Token valid confirmed by /debug/auth', 'Token invalid on debug endpoint');

// =============================================================================
// 3. USERS CRUD (admin only)
// =============================================================================
head('3. Users CRUD');

// GET list
$r = http('GET', '/collections/users/records?perPage=5', [], $token);
chk($r['code'] === 200, 'GET users list → 200', "GET users list → {$r['code']}");
chk(isset($r['data']['items']), 'Users list has items key', 'No items key in users list');
info('Total users: ' . ($r['data']['totalItems'] ?? '?'));

// POST create user (admin creates a new client)
$testEmail = 'test_crud_' . time() . '@example.com';
$r = http('POST', '/collections/users/records', [
    'email'    => $testEmail,
    'password' => 'Test1234!',
    'name'     => 'Test CRUD User',
    'role'     => 'client',
], $token);
chk($r['code'] === 201, "POST create user → 201", "POST create user → {$r['code']}: " . ($r['data']['message'] ?? ''));
$testUserId = $r['data']['id'] ?? '';
chk((bool)$testUserId, 'Created user has ID', 'No user ID in response');
info("Created user ID: $testUserId");

// GET single
if ($testUserId) {
    $r = http('GET', "/collections/users/records/$testUserId", [], $token);
    chk($r['code'] === 200, "GET user by ID → 200", "GET user → {$r['code']}");
    chk(($r['data']['email'] ?? '') === $testEmail, 'User email matches', 'Email mismatch');

    // PATCH update
    $r = http('PATCH', "/collections/users/records/$testUserId", ['name' => 'Updated Name'], $token);
    chk($r['code'] === 200, 'PATCH user → 200', "PATCH user → {$r['code']}: " . ($r['data']['message'] ?? ''));
    chk(($r['data']['name'] ?? '') === 'Updated Name', 'Name updated correctly', 'Name not updated');

    // DELETE
    $r = http('DELETE', "/collections/users/records/$testUserId", [], $token);
    chk($r['code'] === 204, 'DELETE user → 204', "DELETE user → {$r['code']}");

    // Verify deleted
    $r = http('GET', "/collections/users/records/$testUserId", [], $token);
    chk($r['code'] === 404, 'Deleted user returns 404', "Expected 404, got {$r['code']}");
}

// =============================================================================
// 4. ORDERS CRUD
// =============================================================================
head('4. Orders CRUD');

// Get a real user ID for order creation
$usersR = http('GET', '/collections/users/records?perPage=1', [], $token);
$firstUserId = $usersR['data']['items'][0]['id'] ?? $adminId;

$r = http('POST', '/collections/orders/records', [
    'user'         => $firstUserId,
    'order_number' => 'TEST-' . time(),
    'package_name' => 'US LLC Formation',
    'company_name' => 'Test Corp LLC',
    'company_state'=> 'Wyoming',
    'company_type' => 'LLC',
    'status'       => 'pending',
    'amount'       => 149.00,
    'currency'     => 'USD',
], $token);
chk($r['code'] === 201, "POST create order → 201", "POST create order → {$r['code']}: " . ($r['data']['message'] ?? ''));
$orderId = $r['data']['id'] ?? '';
info("Created order ID: $orderId");

if ($orderId) {
    $r = http('GET', "/collections/orders/records/$orderId", [], $token);
    chk($r['code'] === 200, 'GET order by ID → 200', "GET order → {$r['code']}");
    chk(($r['data']['status'] ?? '') === 'pending', 'Order status = pending', 'Status mismatch');

    $r = http('PATCH', "/collections/orders/records/$orderId", ['status' => 'processing', 'notes' => 'Admin updated'], $token);
    chk($r['code'] === 200, 'PATCH order status → 200', "PATCH order → {$r['code']}: " . ($r['data']['message'] ?? ''));
    chk(($r['data']['status'] ?? '') === 'processing', 'Order status updated to processing', 'Status not updated');

    $r = http('DELETE', "/collections/orders/records/$orderId", [], $token);
    chk($r['code'] === 204, 'DELETE order → 204', "DELETE order → {$r['code']}");
}

// =============================================================================
// 5. NOTIFICATIONS CRUD
// =============================================================================
head('5. Notifications CRUD');

$r = http('POST', '/collections/notifications/records', [
    'user'    => $adminId,
    'type'    => 'info',
    'title'   => 'Test Notification',
    'message' => 'This is a CRUD test notification',
    'read'    => false,
], $token);
chk($r['code'] === 201, 'POST create notification → 201', "POST notification → {$r['code']}: " . ($r['data']['message'] ?? ''));
$notifId = $r['data']['id'] ?? '';
info("Created notification ID: $notifId");

if ($notifId) {
    $r = http('GET', "/collections/notifications/records?perPage=5", [], $token);
    chk($r['code'] === 200, 'GET notifications list → 200', "GET notifications → {$r['code']}");
    
    $r = http('PATCH', "/collections/notifications/records/$notifId", ['read' => true], $token);
    chk($r['code'] === 200, 'PATCH notification mark-read → 200', "PATCH notification → {$r['code']}");
    chk(($r['data']['read'] ?? false) === true, 'Notification marked as read', 'Read flag not updated');

    // Test mark-all-read endpoint
    $r = http('POST', '/notifications/mark-read', ['ids' => 'all'], $token);
    chk($r['code'] === 200, 'POST /notifications/mark-read (all) → 200', "Mark-read → {$r['code']}");

    $r = http('DELETE', "/collections/notifications/records/$notifId", [], $token);
    chk($r['code'] === 204, 'DELETE notification → 204', "DELETE notification → {$r['code']}");
}

// =============================================================================
// 6. SERVICES CRUD (admin only)
// =============================================================================
head('6. Services CRUD');

$r = http('GET', '/collections/services/records?perPage=5', [], $token);
chk($r['code'] === 200, 'GET services list → 200', "GET services → {$r['code']}");
info('Total services: ' . ($r['data']['totalItems'] ?? '?'));

$r = http('POST', '/collections/services/records', [
    'title_en'       => 'Test Service ' . time(),
    'title_ar'       => 'خدمة اختبار',
    'description_en' => 'Test service description',
    'description_ar' => 'وصف الخدمة التجريبية',
    'price'          => 99.00,
    'active'         => true,
    'sort_order'     => 999,
    'type'           => 'addon',
    'category'       => 'Test',
], $token);
chk($r['code'] === 201, 'POST create service → 201', "POST service → {$r['code']}: " . ($r['data']['message'] ?? ''));
$svcId = $r['data']['id'] ?? '';

if ($svcId) {
    $r = http('PATCH', "/collections/services/records/$svcId", ['price' => 199.00, 'active' => false], $token);
    chk($r['code'] === 200, 'PATCH service → 200', "PATCH service → {$r['code']}");
    chk((float)($r['data']['price'] ?? 0) === 199.0, 'Service price updated', 'Price not updated');

    $r = http('DELETE', "/collections/services/records/$svcId", [], $token);
    chk($r['code'] === 204, 'DELETE service → 204', "DELETE service → {$r['code']}");
}

// =============================================================================
// 7. BLOGS CRUD (admin only)
// =============================================================================
head('7. Blogs CRUD');

$slug = 'test-blog-' . time();
$r = http('POST', '/collections/blogs/records', [
    'title'     => 'Test Blog Post',
    'title_ar'  => 'مقالة اختبار',
    'slug'      => $slug,
    'slug_ar'   => $slug . '-ar',
    'excerpt'   => 'Test excerpt',
    'content'   => '<p>Test content</p>',
    'published' => true,
    'featured'  => false,
    'tags'      => ['test', 'crud'],
], $token);
chk($r['code'] === 201, 'POST create blog → 201', "POST blog → {$r['code']}: " . ($r['data']['message'] ?? ''));
$blogId = $r['data']['id'] ?? '';

if ($blogId) {
    $r = http('GET', "/collections/blogs/records/$blogId");  // public read
    chk($r['code'] === 200, 'GET blog by ID (public) → 200', "GET blog → {$r['code']}");

    $r = http('PATCH', "/collections/blogs/records/$blogId", ['featured' => true], $token);
    chk($r['code'] === 200, 'PATCH blog → 200', "PATCH blog → {$r['code']}");

    $r = http('DELETE', "/collections/blogs/records/$blogId", [], $token);
    chk($r['code'] === 204, 'DELETE blog → 204', "DELETE blog → {$r['code']}");
}

// =============================================================================
// 8. COMPANIES CRUD
// =============================================================================
head('8. Companies CRUD');

$r = http('GET', '/collections/companies/records?perPage=5', [], $token);
chk($r['code'] === 200, 'GET companies list → 200', "GET companies → {$r['code']}");

$r = http('POST', '/collections/companies/records', [
    'user'         => $adminId,
    'company_name' => 'Test LLC',
    'company_type' => 'LLC',
    'state'        => 'Wyoming',
    'status'       => 'pending',
], $token);
chk($r['code'] === 201, 'POST create company → 201', "POST company → {$r['code']}: " . ($r['data']['message'] ?? ''));
$companyId = $r['data']['id'] ?? '';

if ($companyId) {
    $r = http('PATCH', "/collections/companies/records/$companyId", ['status' => 'active', 'ein_number' => '12-3456789'], $token);
    chk($r['code'] === 200, 'PATCH company → 200', "PATCH company → {$r['code']}");
    chk(($r['data']['status'] ?? '') === 'active', 'Company status updated', 'Status not updated');

    $r = http('DELETE', "/collections/companies/records/$companyId", [], $token);
    chk($r['code'] === 204, 'DELETE company → 204', "DELETE company → {$r['code']}");
}

// =============================================================================
// 9. CONTACT MESSAGES (admin read, public create)
// =============================================================================
head('9. Contact Messages');

// Public create
$r = http('POST', '/collections/contact_messages/records', [
    'name'    => 'Test User',
    'email'   => 'test@example.com',
    'message' => 'Test contact message',
    'subject' => 'Test',
    'status'  => 'new',
]);
chk($r['code'] === 201, 'POST contact_message (public) → 201', "POST contact → {$r['code']}: " . ($r['data']['message'] ?? ''));
$contactId = $r['data']['id'] ?? '';

// Admin read
$r = http('GET', '/collections/contact_messages/records?perPage=5', [], $token);
chk($r['code'] === 200, 'GET contact_messages (admin) → 200', "GET contacts → {$r['code']}");

// Admin update status
if ($contactId) {
    $r = http('PATCH', "/collections/contact_messages/records/$contactId", ['status' => 'resolved'], $token);
    chk($r['code'] === 200, 'PATCH contact status → 200', "PATCH contact → {$r['code']}");
    $r = http('DELETE', "/collections/contact_messages/records/$contactId", [], $token);
    chk($r['code'] === 204, 'DELETE contact → 204', "DELETE contact → {$r['code']}");
}

// =============================================================================
// 10. INVITATIONS CRUD (admin only)
// =============================================================================
head('10. Invitations CRUD');

$r = http('POST', '/collections/invitations/records', [
    'email'      => 'invited_' . time() . '@example.com',
    'role'       => 'client',
    'invited_by' => $adminId,
    'status'     => 'pending',
    'token'      => bin2hex(random_bytes(16)),
    'expires_at' => date('Y-m-d H:i:s', strtotime('+7 days')),
], $token);
chk($r['code'] === 201, 'POST create invitation → 201', "POST invitation → {$r['code']}: " . ($r['data']['message'] ?? ''));
$invitationId = $r['data']['id'] ?? '';

if ($invitationId) {
    $r = http('GET', '/collections/invitations/records?perPage=5', [], $token);
    chk($r['code'] === 200, 'GET invitations (admin) → 200', "GET invitations → {$r['code']}");

    $r = http('PATCH', "/collections/invitations/records/$invitationId", ['status' => 'accepted'], $token);
    chk($r['code'] === 200, 'PATCH invitation status → 200', "PATCH invitation → {$r['code']}");

    $r = http('DELETE', "/collections/invitations/records/$invitationId", [], $token);
    chk($r['code'] === 204, 'DELETE invitation → 204', "DELETE invitation → {$r['code']}");
}

// =============================================================================
// 11. PAGES CRUD (admin only)
// =============================================================================
head('11. Pages CRUD');

$pageSlug = 'test-page-' . time();
$r = http('POST', '/collections/pages/records', [
    'slug'       => $pageSlug,
    'title_en'   => 'Test Page',
    'title_ar'   => 'صفحة اختبار',
    'content_en' => '<p>Test content</p>',
    'content_ar' => '<p>محتوى اختبار</p>',
    'active'     => true,
], $token);
chk($r['code'] === 201, 'POST create page → 201', "POST page → {$r['code']}: " . ($r['data']['message'] ?? ''));
$pageId = $r['data']['id'] ?? '';

if ($pageId) {
    $r = http('PATCH', "/collections/pages/records/$pageId", ['active' => false], $token);
    chk($r['code'] === 200, 'PATCH page → 200', "PATCH page → {$r['code']}");

    $r = http('DELETE', "/collections/pages/records/$pageId", [], $token);
    chk($r['code'] === 204, 'DELETE page → 204', "DELETE page → {$r['code']}");
}

// =============================================================================
// 12. DOCUMENTS CRUD (admin)
// =============================================================================
head('12. Documents CRUD');

$r = http('GET', '/collections/documents/records?perPage=5', [], $token);
chk($r['code'] === 200, 'GET documents list → 200', "GET documents → {$r['code']}");

$r = http('POST', '/collections/documents/records', [
    'user'      => $adminId,
    'name'      => 'Test Document',
    'doc_type'  => 'articles',
    'file_url'  => 'https://example.com/test.pdf',
    'file_name' => 'test.pdf',
    'status'    => 'pending',
], $token);
chk($r['code'] === 201, 'POST create document → 201', "POST document → {$r['code']}: " . ($r['data']['message'] ?? ''));
$docId = $r['data']['id'] ?? '';

if ($docId) {
    $r = http('PATCH', "/collections/documents/records/$docId", ['status' => 'approved'], $token);
    chk($r['code'] === 200, 'PATCH document → 200', "PATCH document → {$r['code']}");

    $r = http('DELETE', "/collections/documents/records/$docId", [], $token);
    chk($r['code'] === 204, 'DELETE document → 204', "DELETE document → {$r['code']}");
}

// =============================================================================
// 13. ADMIN AUDIT LOG
// =============================================================================
head('13. Admin Audit Log');

$r = http('POST', '/collections/admin_audit_log/records', [
    'admin'      => $adminId,
    'action'     => 'CRUD_TEST',
    'table_name' => 'users',
    'record_id'  => 'test',
    'details'    => json_encode(['note' => 'automated test']),
], $token);
chk($r['code'] === 201, 'POST admin_audit_log → 201', "POST audit_log → {$r['code']}: " . ($r['data']['message'] ?? ''));
$auditId = $r['data']['id'] ?? '';

$r = http('GET', '/collections/admin_audit_log/records?perPage=5', [], $token);
chk($r['code'] === 200, 'GET admin_audit_log (admin) → 200', "GET audit_log → {$r['code']}");

// Verify non-admin can't read
$r = http('GET', '/collections/admin_audit_log/records?perPage=5');
chk($r['code'] === 403 || $r['code'] === 401, 'GET audit_log (no auth) → 401/403 ✓', "Expected 401/403, got {$r['code']}");

// =============================================================================
// 14. PRICING CONFIG
// =============================================================================
head('14. Pricing Config');

$r = http('GET', '/collections/pricing_config/records?perPage=10');
chk($r['code'] === 200, 'GET pricing_config (public) → 200', "GET pricing → {$r['code']}");

$r = http('POST', '/collections/pricing_config/records', [
    'region'      => 'test_region_' . time(),
    'plan'        => 'basic',
    'price'       => 49.99,
    'features_en' => ['Feature 1', 'Feature 2'],
    'features_ar' => ['الميزة 1', 'الميزة 2'],
], $token);
chk($r['code'] === 201, 'POST pricing_config → 201', "POST pricing → {$r['code']}: " . ($r['data']['message'] ?? ''));
$priceId = $r['data']['id'] ?? '';

if ($priceId) {
    $r = http('PATCH', "/collections/pricing_config/records/$priceId", ['price' => 59.99], $token);
    chk($r['code'] === 200, 'PATCH pricing_config → 200', "PATCH pricing → {$r['code']}");
    $r = http('DELETE', "/collections/pricing_config/records/$priceId", [], $token);
    chk($r['code'] === 204, 'DELETE pricing_config → 204', "DELETE pricing → {$r['code']}");
}

// =============================================================================
// 15. SEO COUNTRY PAGES
// =============================================================================
head('15. Countries SEO Pages');

$r = http('GET', '/collections/countries_seo_pages/records?perPage=5');
chk($r['code'] === 200, 'GET countries_seo_pages (public) → 200', "GET countries → {$r['code']}");
info('Total country pages: ' . ($r['data']['totalItems'] ?? '?'));

$r = http('POST', '/collections/countries_seo_pages/records', [
    'slug'             => 'test-country-' . time(),
    'country_name'     => 'Test Country',
    'country_code'     => 'TC',
    'meta_title'       => 'Test SEO Title',
    'meta_description' => 'Test SEO description for testing',
    'published'        => true,
], $token);
chk($r['code'] === 201, 'POST country_seo_page → 201', "POST country → {$r['code']}: " . ($r['data']['message'] ?? ''));
$cPageId = $r['data']['id'] ?? '';

if ($cPageId) {
    $r = http('DELETE', "/collections/countries_seo_pages/records/$cPageId", [], $token);
    chk($r['code'] === 204, 'DELETE country_seo_page → 204', "DELETE country → {$r['code']}");
}

// =============================================================================
// 16. NOTIFICATION PREFERENCES
// =============================================================================
head('16. Notification Preferences');

$r = http('GET', '/collections/notification_preferences/records?perPage=5', [], $token);
chk($r['code'] === 200, 'GET notification_preferences (admin) → 200', "GET notif prefs → {$r['code']}");

$r = http('POST', '/collections/notification_preferences/records', [
    'user'                 => $adminId,
    'email_notifications'  => true,
    'order_updates'        => true,
    'marketing_emails'     => false,
    'admin_new_order'      => 'all',
    'admin_payment_failed' => 'all',
], $token);
chk($r['code'] === 201, 'POST notification_preferences → 201', "POST notif prefs → {$r['code']}: " . ($r['data']['message'] ?? ''));
$npId = $r['data']['id'] ?? '';

if ($npId) {
    $r = http('PATCH', "/collections/notification_preferences/records/$npId", ['marketing_emails' => true], $token);
    chk($r['code'] === 200, 'PATCH notification_preferences → 200', "PATCH notif prefs → {$r['code']}");
    $r = http('DELETE', "/collections/notification_preferences/records/$npId", [], $token);
    chk($r['code'] === 204, 'DELETE notification_preferences → 204', "DELETE notif prefs → {$r['code']}");
}

// =============================================================================
// 17. SITE CONTENT
// =============================================================================
head('17. Site Content');

$r = http('GET', '/collections/site_content/records?perPage=5');
chk($r['code'] === 200, 'GET site_content (public) → 200', "GET site_content → {$r['code']}");

$r = http('POST', '/collections/site_content/records', [
    'key'      => 'test_key_' . time(),
    'value_en' => 'Test English Value',
    'value_ar' => 'قيمة اختبار عربية',
], $token);
chk($r['code'] === 201, 'POST site_content → 201', "POST site_content → {$r['code']}: " . ($r['data']['message'] ?? ''));
$scId = $r['data']['id'] ?? '';

if ($scId) {
    $r = http('PATCH', "/collections/site_content/records/$scId", ['value_en' => 'Updated Value'], $token);
    chk($r['code'] === 200, 'PATCH site_content → 200', "PATCH site_content → {$r['code']}");
    $r = http('DELETE', "/collections/site_content/records/$scId", [], $token);
    chk($r['code'] === 204, 'DELETE site_content → 204', "DELETE site_content → {$r['code']}");
}

// =============================================================================
// 18. AUTH REFRESH
// =============================================================================
head('18. Auth Refresh');
$r = http('POST', '/auth/refresh', [], $token);
chk($r['code'] === 200, 'POST /auth/refresh → 200', "Auth refresh → {$r['code']}");
chk(isset($r['data']['token']), 'Refresh returns new token', 'No token in refresh response');

// =============================================================================
// 19. ROLE SECURITY CHECKS
// =============================================================================
head('19. Role Security Checks');

// Non-admin can't access admin-only endpoints
$r = http('GET', '/collections/users/records');  // no token
chk($r['code'] === 403 || $r['code'] === 401, 'GET users without auth → 401/403', "Expected 401/403, got {$r['code']}");

$r = http('POST', '/collections/services/records', ['title_en' => 'Hack'], 'fake_token_xyz');
chk($r['code'] === 401, 'POST service with invalid token → 401', "Expected 401, got {$r['code']}");

$r = http('POST', '/collections/admin_audit_log/records', ['action' => 'hack']);
chk($r['code'] === 401, 'POST audit_log without auth → 401', "Expected 401, got {$r['code']}");

// =============================================================================
// 20. EMAIL / NOTIFICATION SYSTEM
// =============================================================================
head('20. Email / Notification System');

// Check if RESEND_API_KEY is configured
$r = http('POST', '/admin/send-email', [
    'to'      => 'test@example.com',
    'subject' => 'CRUD Test Email',
    'html'    => '<p>Test email from CRUD test script.</p>',
], $token);
chk($r['code'] === 200, 'POST /admin/send-email → 200', "Admin send-email → {$r['code']}: " . ($r['data']['message'] ?? ''));
if ($r['code'] === 200) {
    if (($r['data']['sent'] ?? false) === true) {
        ok('Email sent via Resend API (RESEND_API_KEY configured)');
    } else {
        warn('Email endpoint OK but sent=false — RESEND_API_KEY not set in api/config.php (expected for local dev)');
    }
}

// Test notification creation + mark-read
$r = http('POST', '/collections/notifications/records', [
    'user'    => $adminId,
    'type'    => 'test',
    'title'   => 'Email Test Notification',
    'message' => 'Notification from test suite',
    'read'    => false,
], $token);
$notifId2 = $r['data']['id'] ?? '';
chk($r['code'] === 201, 'POST test notification (email sim) → 201', "POST notif → {$r['code']}");

if ($notifId2) {
    // Mark specific IDs read
    $r = http('POST', '/notifications/mark-read', ['ids' => [$notifId2]], $token);
    chk($r['code'] === 200, 'POST /notifications/mark-read with IDs → 200', "Mark-read → {$r['code']}");

    // Verify it's read
    $r = http('GET', "/collections/notifications/records/$notifId2", [], $token);
    chk(($r['data']['read'] ?? false) === true, 'Notification confirmed as read', 'Notification not read');

    // Cleanup
    http('DELETE', "/collections/notifications/records/$notifId2", [], $token);
}

// Clean up audit log entry
if ($auditId) {
    http('DELETE', "/collections/admin_audit_log/records/$auditId", [], $token);
}

// =============================================================================
// SUMMARY
// =============================================================================
$total = $pass + $fail;
echo PHP_EOL . str_repeat('─', 60) . PHP_EOL;
if ($fail === 0) {
    echo c('1;32', "  ALL $total CHECKS PASSED ✔  Admin CRUD + Notifications OK") . PHP_EOL;
} else {
    echo c('1;32', "  PASSED: {$pass}/{$total}") . '   ' . c('1;31', "FAILED: {$fail}/{$total}") . PHP_EOL;
}
if ($warn > 0) {
    echo c('33', "  WARNINGS: $warn (expected for local dev — see above)") . PHP_EOL;
}
echo str_repeat('─', 60) . PHP_EOL . PHP_EOL;

exit($fail > 0 ? 1 : 0);
