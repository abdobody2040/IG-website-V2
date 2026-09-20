<?php
// ─── api/index.php ────────────────────────────────────────────────────────────
// PHP 8.2 REST API for Instant Grow LLC
// Replaces PocketBase (stateless, shared-hosting compatible)
// ─────────────────────────────────────────────────────────────────────────────

declare(strict_types=1);

// ═══════════════════════════════════════════════════════════════════════════
// CORS & Headers — Must be sent before any output or OPTIONS exit
// ═══════════════════════════════════════════════════════════════════════════
// SEC-3: Only echo the Origin back if it matches our allowlist.
// Never mirror arbitrary origins when Allow-Credentials: true is set.
$_allowedOrigins = [
    'https://instantgrow.net',
    'https://www.instantgrow.net',
    'http://localhost:5173',
    'http://localhost:3000',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $_allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
    header('Access-Control-Allow-Credentials: true');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
// X-Auth-Token is our Apache-safe fallback — Apache never strips custom X- headers
header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Admin-Secret, X-Auth-Token, X-Requested-With');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

require_once __DIR__ . '/config.php';


// ── Handle CORS Preflight ──────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function db(): PDO {
    static $pdo = null;
    if ($pdo !== null) return $pdo;
    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        if (DB_USER !== 'root' && (DB_HOST === 'localhost' || DB_HOST === '127.0.0.1')) {
            try {
                $pdo = new PDO($dsn, 'root', '', [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]);
                return $pdo;
            } catch (PDOException $e2) {}
        }
        throw $e;
    }
}

function genId(): string {
    return substr(bin2hex(random_bytes(8)), 0, 15);
}

function jsonOut(mixed $data, int $status = 200): never {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function err(string $message, int $status = 400): never {
    jsonOut(['code' => $status, 'message' => $message], $status);
}

function body(): array {
    if (!empty($_POST)) {
        return $_POST;
    }
    $raw = file_get_contents('php://input');
    if (empty($raw)) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function query(string $q, array $p = []): array {
    $st = db()->prepare($q);
    $st->execute($p);
    return $st->fetchAll();
}

function execute(string $q, array $p = []): int {
    $st = db()->prepare($q);
    $st->execute($p);
    return $st->rowCount();
}

// ── JWT (HS256, no library needed) ───────────────────────────────────────────
function jwtEncode(array $payload): string {
    $header  = base64url(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = base64url(json_encode($payload));
    $sig     = base64url(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    return "$header.$payload.$sig";
}

function jwtDecode(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$h, $p, $s] = $parts;
    $expected = base64url(hash_hmac('sha256', "$h.$p", JWT_SECRET, true));
    if (!hash_equals($expected, $s)) return null;
    $payload = json_decode(base64_decode(strtr($p, '-_', '+/')), true);
    if (!is_array($payload)) return null;
    if (isset($payload['exp']) && $payload['exp'] < time()) return null;
    return $payload;
}

function base64url(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}


// ── Shared auth token extractor — reads ALL locations Hostinger may use ─────────
// Apache/FastCGI on Hostinger may deliver the Authorization header to any of:
//   1. $_SERVER['HTTP_AUTHORIZATION']          — standard CGI passthrough
//   2. $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] — set by .htaccess RewriteRule E= flag
//   3. apache_request_headers()                — mod_php fallback
//   4. $_SERVER['HTTP_X_AUTH_TOKEN']           — NEVER stripped by Apache (our custom header)
// The frontend sends the token in BOTH Authorization AND X-Auth-Token headers
// so at least one always survives.
function extractBearerToken(): ?string {
    // Try all standard Authorization header locations
    $hdr = $_SERVER['HTTP_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? '';

    if (!$hdr && function_exists('apache_request_headers')) {
        $ah  = apache_request_headers();
        $hdr = $ah['Authorization'] ?? $ah['authorization'] ?? '';
    }

    // Ultimate fallback: X-Auth-Token header (Apache never strips X- headers)
    if (!$hdr) {
        $hdr = $_SERVER['HTTP_X_AUTH_TOKEN'] ?? '';
        if (!$hdr && function_exists('apache_request_headers')) {
            $ah  = apache_request_headers();
            $hdr = $ah['X-Auth-Token'] ?? $ah['x-auth-token'] ?? '';
        }
    }

    if (!preg_match('/^Bearer\s+(\S+)$/i', $hdr, $m)) return null;
    return $m[1];
}

function requireAuth(): array {
    $token = extractBearerToken();
    if (!$token) err('Unauthorized', 401);
    $p = jwtDecode($token);
    if (!$p) err('Invalid or expired token', 401);
    return $p;   // ['id', 'email', 'role', 'exp']
}

function requireAdmin(): array {
    $p = requireAuth();
    if (($p['role'] ?? '') !== 'admin') err('Forbidden', 403);
    return $p;
}

function isAdminSecret(): bool {
    return ($_SERVER['HTTP_X_ADMIN_SECRET'] ?? '') === ADMIN_SECRET;
}

// ── Resend email ──────────────────────────────────────────────────────────────
function sendEmail(string $to, string $subject, string $html): bool {
    if (!RESEND_API_KEY) return false;
    $ch = curl_init('https://api.resend.com/emails');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . RESEND_API_KEY,
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS     => json_encode([
            'from'    => FROM_NAME . ' <' . FROM_EMAIL . '>',
            'to'      => [$to],
            'subject' => $subject,
            'html'    => $html,
        ]),
        CURLOPT_TIMEOUT        => 10,
    ]);
    $res  = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return $code >= 200 && $code < 300;
}

// ── Transactional email template (REUSE-1) ───────────────────────────────────
// Single source of truth for all branded email HTML.
// Usage: sendEmail($to, $subject, emailTemplate('Heading', '<p>Body</p>', 'CTA Text', $link))
function emailTemplate(string $heading, string $body, string $btnText = '', string $btnHref = ''): string {
    $btn = $btnText && $btnHref
        ? "<a href='$btnHref' style='display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600'>$btnText</a>"
        : '';
    return "<!DOCTYPE html><html><body style='font-family:sans-serif;max-width:560px;margin:40px auto;color:#222'>
        <h2 style='color:#4f46e5'>$heading</h2>
        $body
        " . ($btn ? "<p style='margin:24px 0'>$btn</p>" : '') . "
        <hr style='margin:32px 0;border:none;border-top:1px solid #eee'>
        <p style='font-size:12px;color:#999'>&copy; " . date('Y') . " Instant Grow. All rights reserved.</p>
    </body></html>";
}

// ── JSON auto-decoder for rows ───────────────────────────────────────────────
function formatRow(array $row): array {
    $jsonFields = ['tags', 'features', 'features_en', 'features_ar', 'benefits', 'process_steps', 'faq', 'testimonials', 'secondary_keywords', 'pain_points', 'faq_json', 'schema_json', 'details', 'metadata'];
    $boolFields = ['active', 'published', 'featured', 'requires_company', 'verified', 'read', 'email_notifications', 'order_updates', 'marketing_emails'];
    foreach ($row as $k => $v) {
        if (in_array($k, $boolFields, true) && $v !== null) {
            $row[$k] = (bool)(int)$v;
        } elseif (is_string($v) && (in_array($k, $jsonFields, true) || str_starts_with(trim($v), '[') || str_starts_with(trim($v), '{'))) {
            $decoded = json_decode($v, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $row[$k] = $decoded;
            }
        }
        // Always guarantee tags is an array (or empty array)
        if ($k === 'tags' && (!is_array($row[$k]) || $row[$k] === null)) {
            $row[$k] = [];
        }
    }
    return $row;
}

// ── PocketBase Filter Parser ──────────────────────────────────────────────────
function parsePbFilter(string $filter): array {
    if (empty(trim($filter))) {
        return ['1=1', []];
    }

    // Strip real newlines/tabs that JS template-literal filter strings may contain
    $filter = preg_replace('/[\r\n\t]+/', ' ', $filter);
    $filter = preg_replace('/\s{2,}/', ' ', $filter);

    // ── Pre-process empty-string checks → NULL-aware SQL ─────────────────────
    // PocketBase uses `field = ""` and `field != ""` for null/empty checks.
    // MySQL DATE/DATETIME columns store NULL (never empty string), so we must
    // convert these to IS NULL / IS NOT NULL checks.
    $filter = preg_replace_callback(
        '/([a-zA-Z0-9_]+)\s*!=\s*""/',
        fn($m) => '(' . $m[1] . ' IS NOT NULL AND ' . $m[1] . ' != \'\')',
        $filter
    );
    $filter = preg_replace_callback(
        '/([a-zA-Z0-9_]+)\s*=\s*""/',
        fn($m) => '(' . $m[1] . ' IS NULL OR ' . $m[1] . ' = \'\')',
        $filter
    );

    $params = [];
    $pattern = '/([a-zA-Z0-9_\.]+)\s*(=|!=|>=|<=|>|<|~)\s*(?:"([^"]*)"|\'([^\']*)\'|([a-zA-Z0-9_\-:.]+))/';

    $sql = preg_replace_callback($pattern, function ($m) use (&$params) {
        $col = preg_replace('/[^a-zA-Z0-9_]/', '', $m[1]);
        $op  = $m[2];
        // Use null-coalesce to safely handle empty-string matched groups
        $val = ($m[3] ?? '') !== '' ? $m[3] : (($m[4] ?? '') !== '' ? $m[4] : ($m[5] ?? ''));

        if ($val === 'true')  $val = 1;
        if ($val === 'false') $val = 0;

        if ($op === '~') {
            $params[] = '%' . $val . '%';
            return "`$col` LIKE ?";
        } else {
            $params[] = $val;
            return "`$col` $op ?";
        }
    }, $filter);

    // Convert PocketBase && and || operators to SQL AND / OR
    $sql = str_replace(['&&', '||'], ['AND', 'OR'], $sql);

    // Sanitize SQL to prevent injection.
    // Allow alphanumeric, backticks, spaces, operators, placeholders, parens,
    // LIKE wildcards, dots, colons (for date/time values), apostrophes (from
    // the IS NULL rewriting above), and SQL keywords.
    if (!preg_match("/^[a-zA-Z0-9_`\s=\!<>\?\(\)\%\.\-:']+$/", $sql)) {
        return ['1=1', []];
    }

    return [$sql, $params];
}

// ── Pagination helper ─────────────────────────────────────────────────────────
function paginate(string $table, string $baseWhere, array $baseParams, int $page, int $perPage, string $sort = '-created'): array {
    $offset = ($page - 1) * $perPage;

    // Build ORDER BY — supports multi-column sort like "sort_order,title_en" or "-created"
    $orderParts = [];
    foreach (explode(',', $sort) as $part) {
        $part = trim($part);
        $dir  = str_starts_with($part, '-') ? 'DESC' : 'ASC';
        $col  = ltrim($part, '-');
        $safeCol = preg_replace('/[^a-z0-9_]/', '', strtolower($col));
        if ($safeCol !== '') {
            $orderParts[] = "`$safeCol` $dir";
        }
    }
    $orderBy = $orderParts ? implode(', ', $orderParts) : '`created` DESC';

    $filter = $_GET['filter'] ?? '';
    [$filterWhere, $filterParams] = parsePbFilter($filter);

    $where  = "($baseWhere) AND ($filterWhere)";
    $params = array_merge($baseParams, $filterParams);

    $total = (int)(query("SELECT COUNT(*) AS c FROM `$table` WHERE $where", $params)[0]['c'] ?? 0);
    $rows  = query("SELECT * FROM `$table` WHERE $where ORDER BY $orderBy LIMIT $perPage OFFSET $offset", $params);
    $items = array_map('formatRow', $rows);

    return [
        'page'       => $page,
        'perPage'    => $perPage,
        'totalItems' => $total,
        'totalPages' => max(1, (int)ceil($total / $perPage)),
        'items'      => $items,
    ];
}

// ── Global Exception Handler ─────────────────────────────────────────────────
set_exception_handler(function (\Throwable $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    // SEC-9: Only expose internal error details in debug mode.
    $msg = DEBUG_MODE ? 'Server Error: ' . $e->getMessage() : 'An internal server error occurred.';
    echo json_encode(['code' => 500, 'message' => $msg], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
});

// ═══════════════════════════════════════════════════════════════════════════
// ROUTER
// ═══════════════════════════════════════════════════════════════════════════

$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Strip /api prefix if requests come through /api/
$uri = preg_replace('#^/api#', '', $uri);
$uri = '/' . trim($uri, '/');

// Split into segments
$segs = explode('/', trim($uri, '/'));
$col  = $segs[0] ?? '';   // e.g. "collections"
$sub  = $segs[1] ?? '';   // collection name
$act  = $segs[2] ?? '';   // "records" | "auth-with-password" | ...
$id   = $segs[3] ?? '';   // record id

// ── Health check ──────────────────────────────────────────────────────────────
if ($uri === '/health') {
    jsonOut(['status' => 'ok', 'time' => date('c')]);
}



// ── Static uploads serving — GET /uploads/{file} ─────────────────────────────
if ($col === 'uploads' && $sub !== '') {
    $filePath = __DIR__ . '/uploads/' . basename($sub);
    if (file_exists($filePath)) {
        $mime = mime_content_type($filePath) ?: 'application/octet-stream';
        header('Content-Type: ' . $mime);
        header('Content-Length: ' . filesize($filePath));
        readfile($filePath);
        exit;
    }
    err('File not found', 404);
}

// ── Dynamic XML Sitemap — GET /sitemap.xml ────────────────────────────────────
// Generates a full sitemap from the database: static pages + blogs + services + country pages
if ($uri === '/sitemap.xml' || $uri === '/sitemap') {
    header('Content-Type: application/xml; charset=utf-8');
    header('Cache-Control: public, max-age=3600');

    $base = 'https://instantgrow.net';
    $today = date('Y-m-d');

    $urls = [];

    // ── Static core pages ──────────────────────────────────────────────────
    $staticPages = [
        ['loc' => '/',               'priority' => '1.0', 'freq' => 'daily'],
        ['loc' => '/services',       'priority' => '0.95', 'freq' => 'weekly'],
        ['loc' => '/us-company',     'priority' => '0.9',  'freq' => 'weekly'],
        ['loc' => '/blog',           'priority' => '0.85', 'freq' => 'daily'],
        ['loc' => '/contact',        'priority' => '0.8',  'freq' => 'monthly'],
        ['loc' => '/about',          'priority' => '0.7',  'freq' => 'monthly'],
        ['loc' => '/us-company/wyoming',  'priority' => '0.9', 'freq' => 'weekly'],
        ['loc' => '/us-company/delaware', 'priority' => '0.9', 'freq' => 'weekly'],
        ['loc' => '/form-llc',       'priority' => '0.85', 'freq' => 'weekly'],
        ['loc' => '/privacy-policy', 'priority' => '0.3',  'freq' => 'yearly'],
        ['loc' => '/terms-of-service','priority' => '0.3', 'freq' => 'yearly'],
        ['loc' => '/refund-policy',  'priority' => '0.3',  'freq' => 'yearly'],
        ['loc' => '/kyc-aml',        'priority' => '0.3',  'freq' => 'yearly'],
        ['loc' => '/accessibility',  'priority' => '0.3',  'freq' => 'yearly'],
    ];
    foreach ($staticPages as $p) {
        $urls[] = ['loc' => $base . $p['loc'], 'priority' => $p['priority'], 'freq' => $p['freq'], 'lastmod' => $today];
    }

    // ── MENA country targeting pages ───────────────────────────────────────
    $menaCountries = [
        'saudi-arabia', 'uae', 'egypt', 'jordan', 'kuwait',
        'qatar', 'oman', 'bahrain', 'iraq', 'morocco',
        'turkey', 'pakistan', 'tunisia', 'libya', 'lebanon',
    ];
    foreach ($menaCountries as $c) {
        $urls[] = ['loc' => "$base/form-llc/$c", 'priority' => '0.88', 'freq' => 'weekly', 'lastmod' => $today];
    }

    // ── Published blog posts ───────────────────────────────────────────────
    try {
        $blogs = query("SELECT slug, updated_at, created_at FROM blogs WHERE published = 1 AND slug IS NOT NULL AND slug != '' ORDER BY updated_at DESC LIMIT 500");
        foreach ($blogs as $b) {
            $lastmod = isset($b['updated_at']) ? substr($b['updated_at'], 0, 10) : $today;
            $urls[] = ['loc' => "$base/blog/{$b['slug']}", 'priority' => '0.75', 'freq' => 'monthly', 'lastmod' => $lastmod];
        }
    } catch (Exception $e) { /* blogs table may not have slug */ }

    // ── Active services ────────────────────────────────────────────────────
    try {
        $services = query("SELECT href, updated_at FROM services WHERE active = 1 AND href IS NOT NULL AND href != '' ORDER BY updated_at DESC LIMIT 500");
        foreach ($services as $s) {
            $loc = strpos($s['href'], 'http') === 0 ? $s['href'] : $base . $s['href'];
            $lastmod = isset($s['updated_at']) ? substr($s['updated_at'], 0, 10) : $today;
            $urls[] = ['loc' => $loc, 'priority' => '0.82', 'freq' => 'weekly', 'lastmod' => $lastmod];
        }
    } catch (Exception $e) { /* services may not have href */ }

    // ── Published country SEO pages ────────────────────────────────────────
    try {
        $seoPages = query("SELECT slug, updated_at FROM countries_seo_pages WHERE published = 1 AND slug IS NOT NULL AND slug != '' ORDER BY updated_at DESC LIMIT 200");
        foreach ($seoPages as $p) {
            $lastmod = isset($p['updated_at']) ? substr($p['updated_at'], 0, 10) : $today;
            $urls[] = ['loc' => "$base/us-company/{$p['slug']}", 'priority' => '0.88', 'freq' => 'weekly', 'lastmod' => $lastmod];
        }
    } catch (Exception $e) { /* ignore */ }

    // ── Deduplicate ────────────────────────────────────────────────────────
    $seen = [];
    $uniqueUrls = [];
    foreach ($urls as $u) {
        if (!isset($seen[$u['loc']])) {
            $seen[$u['loc']] = true;
            $uniqueUrls[] = $u;
        }
    }

    // ── Output XML ────────────────────────────────────────────────────────
    echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"' . "\n";
    echo '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' . "\n";
    echo '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">' . "\n";
    foreach ($uniqueUrls as $url) {
        echo "  <url>\n";
        echo "    <loc>" . htmlspecialchars($url['loc'], ENT_XML1) . "</loc>\n";
        if (!empty($url['lastmod'])) echo "    <lastmod>{$url['lastmod']}</lastmod>\n";
        echo "    <changefreq>{$url['freq']}</changefreq>\n";
        echo "    <priority>{$url['priority']}</priority>\n";
        echo "  </url>\n";
    }
    echo '</urlset>';
    exit;
}


// ── Debug: list which tables exist and pricing_config status ──────────────────
if ($uri === '/debug/tables') {
    requireAdmin(); // SEC-4: admin-only
    $required = [
        'users','orders','companies','documents','notifications','payments',
        'blogs','countries_seo_pages','invitations','contact_messages',
        'admin_audit_log','pages','services','order_updates',
        'notification_preferences','pricing_config','site_content','workspaces','workspace_members',
        'tracking_integrations','tracking_events','tracking_domains','tracking_consent',
        'tracking_custom_events','tracking_logs',
    ];
    $tableRows = db()->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    $missing = array_values(array_diff($required, $tableRows));
    $present = array_values(array_intersect($required, $tableRows));

    $pricingRows = 0;
    if (in_array('pricing_config', $tableRows)) {
        $pricingRows = (int)(query("SELECT COUNT(*) AS c FROM pricing_config")[0]['c'] ?? 0);
    }

    $adminUsers = [];
    if (in_array('users', $tableRows)) {
        $adminUsers = query("SELECT id, email, role, verified FROM users WHERE role='admin' LIMIT 5");
    }

    jsonOut([
        'db_connected'   => true,
        'tables_present' => $present,
        'tables_missing' => $missing,
        'pricing_config' => ['exists' => in_array('pricing_config', $tableRows), 'row_count' => $pricingRows],
        'admin_users'    => $adminUsers,
    ]);
}

// ── Debug: verify Authorization header reaches PHP ───────────────────────────
// GET /api/debug/auth  (requires valid Bearer token)
// Shows exactly which $_SERVER key the token arrived in.
if ($uri === '/debug/auth') {
    requireAdmin(); // SEC-4: admin-only
    $sources = [
        'HTTP_AUTHORIZATION'          => $_SERVER['HTTP_AUTHORIZATION']          ?? null,
        'REDIRECT_HTTP_AUTHORIZATION' => $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null,
        'apache_request_headers'      => null,
    ];
    if (function_exists('apache_request_headers')) {
        $ah = apache_request_headers();
        $sources['apache_request_headers'] = $ah['Authorization'] ?? $ah['authorization'] ?? null;
    }

    // Attempt to decode whichever one we find first
    $token = null;
    foreach ($sources as $k => $v) {
        if ($v && preg_match('/^Bearer\s+(\S+)$/i', $v, $m)) {
            $token = $m[1];
            $sources['token_found_in'] = $k;
            break;
        }
    }

    $decoded = $token ? jwtDecode($token) : null;

    jsonOut([
        'sources'       => $sources,
        'token_present' => (bool)$token,
        'token_valid'   => (bool)$decoded,
        'payload'       => $decoded ? ['id' => $decoded['id'], 'email' => $decoded['email'], 'role' => $decoded['role']] : null,
    ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTH ENDPOINTS  /auth/*
// ═══════════════════════════════════════════════════════════════════════════
if ($col === 'auth') {
    switch ($sub) {
        // POST /auth/register
        case 'register': {
            if ($method !== 'POST') err('Method not allowed', 405);
            $b = body();
            $email    = strtolower(trim($b['email'] ?? ''));
            $password = $b['password'] ?? '';
            $name     = trim($b['name'] ?? '');
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) err('Invalid email');
            if (strlen($password) < 8) err('Password must be at least 8 characters');
            if (query('SELECT id FROM users WHERE email=?', [$email])) err('Email already in use');
            $id   = genId();
            $hash = password_hash($password, PASSWORD_BCRYPT);
            $vToken = bin2hex(random_bytes(24));
            execute(
                'INSERT INTO users (id,email,password_hash,name,display_name,role,verified,verification_token,verification_token_expiry,created,updated)
                 VALUES (?,?,?,?,?,?,?,?,?,NOW(3),NOW(3))',
                [$id, $email, $hash, $name, $name, 'client', 0, $vToken, date('Y-m-d H:i:s', strtotime('+24 hours'))]
            );
            // Send verification email
            $link = APP_URL . '/verify-email?token=' . $vToken;
            sendEmail($email, 'Verify your email — Instant Grow', "
                <h2>Welcome to Instant Grow!</h2>
                <p>Click below to verify your email address:</p>
                <a href='$link' style='background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none'>Verify Email</a>
                <p>Link expires in 24 hours.</p>
            ");
            $user = query('SELECT id,email,name,display_name,role,verified,created,updated FROM users WHERE id=?', [$id])[0];
            $token = jwtEncode(['id' => $id, 'email' => $email, 'role' => 'client', 'exp' => time() + 86400 * 30]);
            jsonOut(['token' => $token, 'record' => $user], 201);
        }

        // POST /auth/login
        case 'login': {
            if ($method !== 'POST') err('Method not allowed', 405);
            $b = body();
            $email    = strtolower(trim($b['identity'] ?? $b['email'] ?? ''));
            $password = $b['password'] ?? '';
            if (!$email || !$password) err('Email and password required');

            $rows = query('SELECT * FROM users WHERE email=?', [$email]);

            // SEC-1/SEC-2: Removed email-pattern admin escalation.
            // Auto-create is ONLY allowed when the database has zero users (first-run bootstrap).
            if (!$rows) {
                $userCount = (int)(query('SELECT COUNT(*) as c FROM users')[0]['c'] ?? 0);
                if ($userCount === 0) {
                    $id = genId();
                    $hash = password_hash($password, PASSWORD_BCRYPT);
                    execute(
                        'INSERT INTO users (id,email,password_hash,name,display_name,role,verified,created,updated)
                         VALUES (?,?,?,?,?,?,?,NOW(3),NOW(3))',
                        [$id, $email, $hash, 'Admin', 'Admin', 'admin', 1]
                    );
                    $rows = query('SELECT * FROM users WHERE id=?', [$id]);
                }
            }

            if (!$rows) err('Invalid credentials', 401);
            $user = $rows[0];
            // SEC-2: Always verify password. No silent reset for any email pattern.
            if (!password_verify($password, $user['password_hash'])) {
                err('Invalid credentials', 401);
            }
            execute('UPDATE users SET last_sign_in=NOW(3) WHERE id=?', [$user['id']]);
            $token = jwtEncode(['id' => $user['id'], 'email' => $user['email'], 'role' => $user['role'], 'exp' => time() + 86400 * 30]);
            unset($user['password_hash'], $user['verification_token'], $user['reset_token']);
            jsonOut(['token' => $token, 'record' => $user]);
        }

        // POST /auth/google
        case 'google': {
            if ($method !== 'POST') err('Method not allowed', 405);
            $b = body();

            // SEC-12: Verify the Google token server-side before trusting the email.
            // The frontend sends either access_token (OAuth2 flow) or id_token (GSI fallback).
            $accessToken = $b['access_token'] ?? '';
            $idToken     = $b['id_token']     ?? '';

            if ($accessToken) {
                // Verify access_token by calling Google's userinfo endpoint
                $ch = curl_init('https://www.googleapis.com/oauth2/v3/userinfo');
                curl_setopt_array($ch, [
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_HTTPHEADER     => ["Authorization: Bearer $accessToken"],
                    CURLOPT_TIMEOUT        => 10,
                    CURLOPT_SSL_VERIFYPEER => true,
                ]);
                $gRes  = curl_exec($ch);
                $gCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);
                if ($gCode !== 200 || !$gRes) err('Google authentication failed. Could not verify access token.', 401);
                $profile = json_decode($gRes, true);
            } elseif ($idToken) {
                // Verify id_token via Google's tokeninfo endpoint
                $ch = curl_init('https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($idToken));
                curl_setopt_array($ch, [
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_TIMEOUT        => 10,
                    CURLOPT_SSL_VERIFYPEER => true,
                ]);
                $gRes  = curl_exec($ch);
                $gCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);
                if ($gCode !== 200 || !$gRes) err('Google authentication failed. Could not verify ID token.', 401);
                $profile = json_decode($gRes, true);
                // Ensure the token was issued for our app
                $expectedAud = get_config_env('GOOGLE_CLIENT_ID', '');
                if ($expectedAud && ($profile['aud'] ?? '') !== $expectedAud) {
                    err('Google authentication failed. Token audience mismatch.', 401);
                }
            } else {
                err('Google authentication failed. No token provided.', 400);
            }

            if (!is_array($profile) || empty($profile['email'])) {
                err('Google authentication failed. Invalid profile.', 401);
            }

            // Use email from Google's response — never trust the client-supplied value
            $email  = strtolower(trim($profile['email']));
            $name   = trim($profile['name'] ?? '');
            $avatar = $profile['picture'] ?? null;

            $rows = query('SELECT * FROM users WHERE email=?', [$email]);
            if ($rows) {
                $user = $rows[0];
            } else {
                $id = genId();
                $dummyHash = password_hash(bin2hex(random_bytes(16)), PASSWORD_BCRYPT);
                // SEC-1: New OAuth users are always clients. Role must be set via admin panel.
                execute(
                    'INSERT INTO users (id,email,password_hash,name,display_name,role,verified,avatar_url,created,updated)
                     VALUES (?,?,?,?,?,?,1,?,NOW(3),NOW(3))',
                    [$id, $email, $dummyHash, $name ?: $email, $name ?: $email, 'client', $avatar]
                );
                $user = query('SELECT * FROM users WHERE id=?', [$id])[0];
            }

            execute('UPDATE users SET last_sign_in=NOW(3) WHERE id=?', [$user['id']]);
            $token = jwtEncode(['id' => $user['id'], 'email' => $user['email'], 'role' => $user['role'], 'exp' => time() + 86400 * 30]);
            unset($user['password_hash'], $user['verification_token'], $user['reset_token']);
            jsonOut(['token' => $token, 'record' => $user]);
        }

        // POST /auth/refresh
        case 'refresh': {
            if ($method !== 'POST') err('Method not allowed', 405);
            $p    = requireAuth();
            $user = query('SELECT id,email,name,display_name,role,verified,phone,country,address,avatar_url,created,updated FROM users WHERE id=?', [$p['id']]);
            if (!$user) err('User not found', 404);
            $token = jwtEncode(['id' => $p['id'], 'email' => $p['email'], 'role' => $p['role'], 'exp' => time() + 86400 * 30]);
            jsonOut(['token' => $token, 'record' => $user[0]]);
        }

        // POST /auth/request-password-reset
        case 'request-password-reset': {
            if ($method !== 'POST') err('Method not allowed', 405);
            $b     = body();
            $email = strtolower(trim($b['email'] ?? ''));
            $rows  = query('SELECT id FROM users WHERE email=?', [$email]);
            if ($rows) {
                $rToken = bin2hex(random_bytes(24));
                execute('UPDATE users SET reset_token=?, reset_token_expiry=? WHERE id=?',
                    [$rToken, date('Y-m-d H:i:s', strtotime('+1 hour')), $rows[0]['id']]);
                $link = APP_URL . '/reset-password?token=' . $rToken;
                sendEmail($email, 'Reset your password — Instant Grow', "
                    <h2>Password Reset</h2>
                    <p>Click below to reset your password (expires in 1 hour):</p>
                    <a href='$link' style='background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none'>Reset Password</a>
                ");
            }
            // Always 200 to avoid email enumeration
            jsonOut(['message' => 'If that email exists, a reset link has been sent.']);
        }

        // POST /auth/confirm-password-reset
        case 'confirm-password-reset': {
            if ($method !== 'POST') err('Method not allowed', 405);
            $b        = body();
            $rToken   = $b['token'] ?? '';
            $password = $b['password'] ?? '';
            if (!$rToken || strlen($password) < 8) err('Token and password required');
            $rows = query('SELECT id FROM users WHERE reset_token=? AND reset_token_expiry > NOW()', [$rToken]);
            if (!$rows) err('Token invalid or expired', 400);
            $hash = password_hash($password, PASSWORD_BCRYPT);
            execute('UPDATE users SET password_hash=?, reset_token=NULL, reset_token_expiry=NULL WHERE id=?', [$hash, $rows[0]['id']]);
            jsonOut(['message' => 'Password updated']);
        }

        // POST /auth/verify-email
        case 'verify-email': {
            if ($method !== 'POST') err('Method not allowed', 405);
            $b = body();
            $email  = strtolower(trim($b['email'] ?? ''));
            $vToken = trim($b['token'] ?? '');

            if ($email !== '') {
                $rows = query('SELECT id FROM users WHERE email=?', [$email]);
                if ($rows) {
                    $token = bin2hex(random_bytes(24));
                    execute('UPDATE users SET verification_token=?, verification_token_expiry=? WHERE id=?',
                        [$token, date('Y-m-d H:i:s', strtotime('+24 hours')), $rows[0]['id']]);
                    $link = APP_URL . '/verify-email?token=' . $token;
                    sendEmail($email, 'Verify your email — Instant Grow', "
                        <h2>Verify your email</h2>
                        <p>Click below to verify your email address:</p>
                        <a href='$link' style='background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none'>Verify Email</a>
                        <p>Link expires in 24 hours.</p>
                    ");
                }
                jsonOut(['message' => 'If that email exists, a verification link has been sent.']);
            }

            if ($vToken === '') err('Token or email required');
            $rows = query('SELECT id FROM users WHERE verification_token=? AND verification_token_expiry > NOW()', [$vToken]);
            if (!$rows) err('Token invalid or expired', 400);
            execute('UPDATE users SET verified=1, verification_token=NULL, verification_token_expiry=NULL WHERE id=?', [$rows[0]['id']]);
            jsonOut(['message' => 'Email verified']);
        }

        // GET /auth/me
        case 'me': {
            if ($method !== 'GET') err('Method not allowed', 405);
            $p    = requireAuth();
            $rows = query('SELECT id,email,name,display_name,role,verified,phone,country,address,avatar_url,created,updated FROM users WHERE id=?', [$p['id']]);
            if (!$rows) err('User not found', 404);
            jsonOut($rows[0]);
        }

        default:
            err('Auth endpoint not found', 404);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// COLLECTIONS  /collections/{name}/records[/{id}]
// ═══════════════════════════════════════════════════════════════════════════
if ($col === 'collections' && $act === 'records') {
    $table = $sub;

    // Allowlist valid tables
    $allowed = [
        'users', 'orders', 'companies', 'documents', 'notifications',
        'payments', 'blogs', 'countries_seo_pages', 'invitations',
        'contact_messages', 'admin_audit_log', 'pages', 'services',
        'order_updates', 'notification_preferences', 'pricing_config',
        'site_content',
        'workspace_members', 'workspaces', 'tracking_integrations',
        'tracking_events', 'tracking_domains', 'tracking_consent',
        'tracking_custom_events', 'tracking_logs',
        'perks',
    ];
    if (!in_array($table, $allowed, true)) err("Collection '$table' not found", 404);

    // ── Per-table column whitelist ────────────────────────────────────────
    // Prevents writing non-existent columns (and gives clear 400 instead of 500).
    $tableColumns = [
        'users'                   => ['email','password_hash','name','display_name','role','verified','phone','country','address','avatar_url','last_sign_in','metadata','verification_token','verification_token_expiry','reset_token','reset_token_expiry'],
        'orders'                  => ['user','order_number','package_name','company_name','company_state','company_type','status','amount','currency','customer_name','customer_email','customer_phone','customer_country','customer_address','business_activity','stripe_session_id','notes'],
        'companies'               => ['user','order','company_name','company_type','state','ein_number','formation_date','registered_agent','renewal_due_date','annual_report_due_date','tax_filing_due_date','registered_agent_renewal_date','compliance_status','compliance_notes','status'],
        'documents'               => ['user','order','company','name','doc_type','file_url','file_name','status','notes'],
        'notifications'           => ['user','type','title','message','link','read','data'],
        'payments'                => ['user','order','service','invoice_id','amount','currency','status','stripe_payment_id','stripe_session_id','stripe_payment_intent_id','stripe_charge_id','stripe_customer_id','stripe_invoice_id','stripe_price_id','stripe_product_id','customer_name','customer_email','company_name','customer_country','invoice_url','receipt_url','notes'],
        'blogs'                   => ['title','slug','excerpt','content','cover_image','author','tags','published','featured','language','title_ar','slug_ar','excerpt_ar','content_ar','created_by'],
        'countries_seo_pages'     => ['slug','country_name','country_code','meta_title','meta_description','hero_title','hero_description','main_keyword','secondary_keywords','pain_points','benefits','best_bank','bank_notes','tax_notes','faq_json','cta_text','featured_image','schema_json','published','created_by'],
        'invitations'             => ['email','company_name','role','token','invited_by','status','expires_at'],
        'contact_messages'        => ['name','email','phone','message','subject','country','service_interest','status'],
        'admin_audit_log'         => ['admin','action','table_name','record_id','details'],
        'pages'                   => ['slug','title_en','title_ar','content_en','content_ar','active'],
        'services'                => ['title_en','title_ar','description_en','description_ar','price','period_en','period_ar','detail_en','detail_ar','badge_en','badge_ar','requires_company','icon','active','sort_order','type','color','bg_color','href','category','stripe_product_id','stripe_price_id','features','benefits','process_steps','faq','testimonials'],
        'perks'                   => ['title_en','title_ar','description_en','description_ar','partner_name','discount_label','promo_code','cta_url','cta_label_en','cta_label_ar','icon','badge_en','badge_ar','color','bg_color','sort_order','active','logo_url','category','claim_type','offer_value'],
        'site_content'            => ['key','value_en','value_ar'],
        'order_updates'           => ['order','status','message','created_by'],
        'notification_preferences'=> ['user','role','order_placed','order_status_changed','document_ready','payment_received','weekly_summary','admin_new_order','admin_payment_failed','admin_status_changed','email_notifications','order_updates','marketing_emails'],
        'pricing_config'          => ['region','plan','price','features_en','features_ar'],
        'workspace_members'       => ['workspace','user','role'],
        'workspaces'              => ['name','owner'],
        'tracking_integrations'   => ['provider','name','category','status','enabled','config','lastSync','verificationStatus'],
        'tracking_events'         => ['name','category','trigger','selector','platform','enabled','value','currency'],
        'tracking_domains'        => ['domain','isPrimary','trackingId','status'],
        'tracking_consent'        => ['enabled','bannerTitle','bannerMessage','acceptAllText','rejectAllText','preferencesText','gdprEnabled','ccpaEnabled','consentModeV2','defaultAnalytics','defaultMarketing'],
        'tracking_custom_events'  => ['event_name','trigger_type','platform','enabled','rules_json'],
        'tracking_logs'           => ['event_name','provider','user','domain','payload','status'],
    ];

    // ── GET list ─────────────────────────────────────────────────────────
    if ($method === 'GET' && $id === '') {
        $page    = max(1, (int)($_GET['page']    ?? 1));
        $perPage = min(500, max(1, (int)($_GET['perPage'] ?? 30)));
        $sort    = $_GET['sort']   ?? '-created';
        $filter  = $_GET['filter'] ?? '';

        // Auth guard
        $auth = getAuthFromHeader();

        if ($table === 'notifications') {
            if (!$auth) err('Unauthorized', 401);
            $uid  = $auth['role'] === 'admin' ? ($_GET['user'] ?? null) : $auth['id'];
            $cond = $uid ? 'user = ?' : '1=1';
            $prms = $uid ? [$uid] : [];
            jsonOut(paginate($table, $cond, $prms, $page, $perPage, $sort));
        }

        if (in_array($table, ['orders', 'documents', 'payments', 'order_updates', 'notification_preferences'])) {
            if (!$auth) err('Unauthorized', 401);
            if ($auth['role'] === 'admin') {
                jsonOut(paginate($table, '1=1', [], $page, $perPage, $sort));
            }
            jsonOut(paginate($table, 'user = ?', [$auth['id']], $page, $perPage, $sort));
        }

        // ── Companies: support server-side compliance filter ──────────────
        if ($table === 'companies') {
            if (!$auth) err('Unauthorized', 401);
            $compliance = trim($_GET['compliance'] ?? 'all');
            $now = date('Y-m-d H:i:s');
            $in30 = date('Y-m-d H:i:s', strtotime('+30 days'));

            $baseCond = ($auth['role'] === 'admin') ? '1=1' : '`user` = ?';
            $baseParams = ($auth['role'] === 'admin') ? [] : [$auth['id']];

            if ($compliance === 'overdue') {
                $compCond = "(
                    (renewal_due_date IS NOT NULL AND renewal_due_date < ?) ||
                    (annual_report_due_date IS NOT NULL AND annual_report_due_date < ?) ||
                    (tax_filing_due_date IS NOT NULL AND tax_filing_due_date < ?) ||
                    (registered_agent_renewal_date IS NOT NULL AND registered_agent_renewal_date < ?)
                )";
                $compParams = [$now, $now, $now, $now];
            } elseif ($compliance === 'due_soon') {
                $compCond = "(
                    (renewal_due_date IS NULL OR renewal_due_date >= ?) AND
                    (annual_report_due_date IS NULL OR annual_report_due_date >= ?) AND
                    (tax_filing_due_date IS NULL OR tax_filing_due_date >= ?) AND
                    (registered_agent_renewal_date IS NULL OR registered_agent_renewal_date >= ?)
                ) AND (
                    (renewal_due_date IS NOT NULL AND renewal_due_date >= ? AND renewal_due_date <= ?) OR
                    (annual_report_due_date IS NOT NULL AND annual_report_due_date >= ? AND annual_report_due_date <= ?) OR
                    (tax_filing_due_date IS NOT NULL AND tax_filing_due_date >= ? AND tax_filing_due_date <= ?) OR
                    (registered_agent_renewal_date IS NOT NULL AND registered_agent_renewal_date >= ? AND registered_agent_renewal_date <= ?)
                )";
                $compParams = [$now,$now,$now,$now, $now,$in30,$now,$in30,$now,$in30,$now,$in30];
            } elseif ($compliance === 'compliant') {
                $compCond = "(
                    renewal_due_date IS NOT NULL OR annual_report_due_date IS NOT NULL OR
                    tax_filing_due_date IS NOT NULL OR registered_agent_renewal_date IS NOT NULL
                ) AND (
                    (renewal_due_date IS NULL OR renewal_due_date > ?) AND
                    (annual_report_due_date IS NULL OR annual_report_due_date > ?) AND
                    (tax_filing_due_date IS NULL OR tax_filing_due_date > ?) AND
                    (registered_agent_renewal_date IS NULL OR registered_agent_renewal_date > ?)
                )";
                $compParams = [$in30,$in30,$in30,$in30];
            } elseif ($compliance === 'no_dates') {
                $compCond = "(
                    renewal_due_date IS NULL AND annual_report_due_date IS NULL AND
                    tax_filing_due_date IS NULL AND registered_agent_renewal_date IS NULL
                )";
                $compParams = [];
            } else {
                $compCond = '1=1';
                $compParams = [];
            }

            $where = "($baseCond) AND ($compCond)";
            $params = array_merge($baseParams, $compParams);
            jsonOut(paginate($table, $where, $params, $page, $perPage, $sort));
        }

        if ($table === 'users') {
            if (!$auth || $auth['role'] !== 'admin') err('Forbidden', 403);
            jsonOut(paginate($table, '1=1', [], $page, $perPage, $sort));
        }

        if (in_array($table, ['blogs', 'countries_seo_pages', 'pages', 'services', 'perks'])) {
            // Public: only published/active records unless admin
            if ($auth && $auth['role'] === 'admin') {
                jsonOut(paginate($table, '1=1', [], $page, $perPage, $sort));
            }
            $col2 = in_array($table, ['services', 'pages', 'perks'], true) ? 'active' : 'published';
            jsonOut(paginate($table, "`$col2` = 1", [], $page, $perPage, $sort));
        }

        if (in_array($table, ['admin_audit_log', 'invitations', 'contact_messages'])) {
            requireAdmin();
            jsonOut(paginate($table, '1=1', [], $page, $perPage, $sort));
        }

        if ($table === 'site_content') {
            jsonOut(paginate($table, '1=1', [], $page, $perPage, $sort));
        }

        if (in_array($table, ['tracking_integrations', 'tracking_events', 'tracking_domains', 'tracking_consent', 'tracking_custom_events', 'tracking_logs'], true)) {
            if (!$auth || $auth['role'] !== 'admin') err('Forbidden', 403);
            jsonOut(paginate($table, '1=1', [], $page, $perPage, $sort));
        }

        // pricing_config — public read, admin-only write (write guards are in POST/PATCH blocks)
        if ($table === 'pricing_config') {
            jsonOut(paginate($table, '1=1', [], $page, $perPage, $sort));
        }

        // workspace tables — require auth
        if (in_array($table, ['workspaces', 'workspace_members'])) {
            if (!$auth) err('Unauthorized', 401);
            if ($auth['role'] === 'admin') {
                jsonOut(paginate($table, '1=1', [], $page, $perPage, $sort));
            }
            // Members can see their own workspace_members rows
            if ($table === 'workspace_members') {
                $expand = $_GET['expand'] ?? '';
                if (str_contains($expand, 'workspace')) {
                    // ── expand=workspace: LEFT JOIN workspaces and embed as expand.workspace ──
                    $filter = $_GET['filter'] ?? '';
                    [$filterWhere, $filterParams] = parsePbFilter($filter);
                    $baseWhere = '`wm`.`user` = ?';
                    $params    = array_merge([$auth['id']], $filterParams);
                    $where     = "($baseWhere) AND ($filterWhere)";

                    $stCount = db()->prepare("SELECT COUNT(*) AS c FROM `workspace_members` wm WHERE $where");
                    $stCount->execute($params);
                    $total = (int)($stCount->fetch()['c'] ?? 0);

                    $offset = ($page - 1) * $perPage;
                    $stRows = db()->prepare(
                        "SELECT wm.*, ws.id AS _ws_id, ws.name AS _ws_name, ws.owner AS _ws_owner,
                                ws.created AS _ws_created, ws.updated AS _ws_updated
                         FROM `workspace_members` wm
                         LEFT JOIN `workspaces` ws ON ws.id = wm.workspace
                         WHERE $where
                         ORDER BY wm.`created` DESC
                         LIMIT $perPage OFFSET $offset"
                    );
                    $stRows->execute($params);
                    $rows = $stRows->fetchAll();

                    $items = array_map(function ($row) {
                        $expand = null;
                        if ($row['_ws_id']) {
                            $expand = [
                                'id'      => $row['_ws_id'],
                                'name'    => $row['_ws_name'],
                                'owner'   => $row['_ws_owner'],
                                'created' => $row['_ws_created'],
                                'updated' => $row['_ws_updated'],
                            ];
                        }
                        unset($row['_ws_id'], $row['_ws_name'], $row['_ws_owner'], $row['_ws_created'], $row['_ws_updated']);
                        $row['expand'] = $expand ? ['workspace' => $expand] : null;
                        return formatRow($row);
                    }, $rows);

                    jsonOut([
                        'page'       => $page,
                        'perPage'    => $perPage,
                        'totalItems' => $total,
                        'totalPages' => max(1, (int)ceil($total / $perPage)),
                        'items'      => $items,
                    ]);
                }
                // No expand — plain paginate
                jsonOut(paginate($table, '`user` = ?', [$auth['id']], $page, $perPage, $sort));
            }
            // For workspaces table, show owned + member workspaces
            jsonOut(paginate($table, '`owner` = ?', [$auth['id']], $page, $perPage, $sort));
        }

        jsonOut(paginate($table, '1=1', [], $page, $perPage, $sort));
    }

    // ── GET single ───────────────────────────────────────────────────────
    if ($method === 'GET' && $id !== '') {
        $auth = getAuthFromHeader();
        $rows = query("SELECT * FROM `$table` WHERE id = ?", [$id]);
        if (!$rows) err('Record not found', 404);
        $row = $rows[0];

        $publicSingle = in_array($table, ['blogs', 'countries_seo_pages', 'pages', 'services', 'pricing_config', 'site_content', 'perks'], true);
        if (!$publicSingle && !$auth) err('Unauthorized', 401);
        if ($auth && $auth['role'] !== 'admin' && isset($row['user']) && $row['user'] !== $auth['id']) {
            err('Forbidden', 403);
        }
        if ($table === 'users' && (!$auth || ($auth['role'] !== 'admin' && $row['id'] !== $auth['id']))) {
            err('Forbidden', 403);
        }
        if (in_array($table, ['tracking_integrations', 'tracking_events', 'tracking_domains', 'tracking_consent', 'tracking_custom_events', 'tracking_logs', 'admin_audit_log', 'invitations', 'contact_messages'], true)) {
            if (!$auth || $auth['role'] !== 'admin') err('Forbidden', 403);
        }
        jsonOut(formatRow($row));
    }

    // ── Shared admin-only table lists (REF-3: single definition for POST / PATCH / DELETE guards) ──
    // Tables that only admins/webhooks may CREATE:
    $_ADMIN_ONLY_CREATE = ['services', 'blogs', 'pricing_config', 'countries_seo_pages', 'pages',
        'site_content', 'admin_audit_log', 'invitations', 'tracking_integrations',
        'tracking_events', 'tracking_domains', 'tracking_consent', 'tracking_custom_events',
        'tracking_logs', 'perks'];
    // Tables that only admins/webhooks may MODIFY:
    $_ADMIN_ONLY_WRITE  = ['services', 'blogs', 'pricing_config', 'countries_seo_pages', 'pages',
        'site_content', 'admin_audit_log', 'invitations', 'contact_messages',
        'tracking_integrations', 'tracking_events', 'tracking_domains', 'tracking_consent',
        'tracking_custom_events', 'tracking_logs', 'perks'];
    // Tables that only admins/webhooks may DELETE:
    $_ADMIN_ONLY_DELETE = ['services', 'blogs', 'pricing_config', 'countries_seo_pages', 'pages',
        'site_content', 'admin_audit_log', 'invitations', 'contact_messages', 'users',
        'orders', 'companies', 'documents', 'payments', 'tracking_integrations',
        'tracking_events', 'tracking_domains', 'tracking_consent', 'tracking_custom_events',
        'tracking_logs', 'perks'];

    // ── POST create ────────────────────────────────────────────────────────────────
    if ($method === 'POST' && $id === '') {
        $auth   = getAuthFromHeader();
        $isWH   = isAdminSecret();
        $b      = body();

        // User Registration via /collections/users/records
        if ($table === 'users') {
            $email = strtolower(trim($b['email'] ?? ''));
            $pass  = $b['password'] ?? $b['passwordConfirm'] ?? '';
            $name  = trim($b['display_name'] ?? $b['name'] ?? '');
            if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) err('Valid email is required');
            if (query('SELECT id FROM users WHERE email=?', [$email])) err('Email already in use');

            $rid   = genId();
            $hash  = $pass ? password_hash($pass, PASSWORD_BCRYPT) : password_hash(bin2hex(random_bytes(16)), PASSWORD_BCRYPT);
            $vToken = bin2hex(random_bytes(24));
            $role  = ($auth && $auth['role'] === 'admin') ? ($b['role'] ?? 'client') : 'client';

            execute(
                'INSERT INTO users (id,email,password_hash,name,display_name,role,verified,verification_token,verification_token_expiry,created,updated)
                 VALUES (?,?,?,?,?,?,?,?,?,NOW(3),NOW(3))',
                [$rid, $email, $hash, $name, $name, $role, 0, $vToken, date('Y-m-d H:i:s', strtotime('+24 hours'))]
            );

            // Send verification email
            $link = APP_URL . '/verify-email?token=' . $vToken;
            sendEmail($email, 'Verify your email — Instant Grow', "
                <h2>Welcome to Instant Grow!</h2>
                <p>Click below to verify your email address:</p>
                <a href='$link' style='background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none'>Verify Email</a>
                <p>Link expires in 24 hours.</p>
            ");

            $user = query('SELECT id,email,name,display_name,role,verified,created,updated FROM users WHERE id=?', [$rid])[0];
            jsonOut(formatRow($user), 201);
        }

        // Allow: admin users, or admin secret (webhook), or specific public tables
        $public = in_array($table, ['contact_messages'], true);
        if (!$auth && !$isWH && !$public) err('Unauthorized', 401);

        // pricing_config is admin-only for writes with smart upsert by (region, plan)
        if ($table === 'pricing_config') {
            if (!$isWH && (!$auth || $auth['role'] !== 'admin')) err('Forbidden', 403);
            $region      = strtolower(trim($b['region'] ?? ''));
            $plan        = strtolower(trim($b['plan'] ?? ''));
            $price       = (float)($b['price'] ?? 0);
            $features_en = is_array($b['features_en'] ?? null) ? json_encode($b['features_en']) : ($b['features_en'] ?? '[]');
            $features_ar = is_array($b['features_ar'] ?? null) ? json_encode($b['features_ar']) : ($b['features_ar'] ?? '[]');

            if (!$region || !$plan) err('Region and plan are required', 400);

            $existing = query('SELECT id FROM pricing_config WHERE region=? AND plan=?', [$region, $plan]);
            if ($existing) {
                $rid = $existing[0]['id'];
                execute(
                    'UPDATE pricing_config SET price=?, features_en=?, features_ar=?, updated=NOW(3) WHERE id=?',
                    [$price, $features_en, $features_ar, $rid]
                );
            } else {
                $rid = genId();
                execute(
                    'INSERT INTO pricing_config (id, region, plan, price, features_en, features_ar, created, updated)
                     VALUES (?, ?, ?, ?, ?, ?, NOW(3), NOW(3))',
                    [$rid, $region, $plan, $price, $features_en, $features_ar]
                );
            }
            $row = query('SELECT * FROM pricing_config WHERE id=?', [$rid])[0];
            jsonOut(formatRow($row), 201);
        }

        $adminOnlyCreateTables = $_ADMIN_ONLY_CREATE;
        if (in_array($table, $adminOnlyCreateTables, true) && !$isWH && (!$auth || $auth['role'] !== 'admin')) {
            err('Forbidden — admin only', 403);
        }

        if ($auth && $auth['role'] !== 'admin' && !$isWH && !$public) {
            // Clients may create their own domain records
            $clientAllowed = ['orders', 'payments', 'documents', 'companies', 'notifications', 'order_updates', 'workspace_members', 'workspaces'];
            if (!in_array($table, $clientAllowed, true)) {
                err('Forbidden', 403);
            }
            // Enforce user ID ownership on client-created records
            if (in_array($table, ['orders', 'payments', 'documents', 'companies', 'notifications'], true)) {
                $b['user'] = $auth['id'];
            }
        }

        // Handle multipart $_FILES if present (for direct document/avatar uploads)
        if (!empty($_FILES['file']['name']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
            // SEC-7: Server-side MIME validation — never trust the client-supplied extension alone.
            $allowedMimes = [
                'application/pdf',
                'image/png', 'image/jpeg', 'image/webp',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ];
            $allowedExts  = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'doc', 'docx'];
            $ext          = strtolower(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));
            $detectedMime = mime_content_type($_FILES['file']['tmp_name']) ?: 'application/octet-stream';
            if (!in_array($ext, $allowedExts, true) || !in_array($detectedMime, $allowedMimes, true)) {
                err('File type not allowed. Accepted: PDF, PNG, JPEG, WEBP, DOC, DOCX.', 415);
            }
            if ($_FILES['file']['size'] > 10 * 1024 * 1024) {
                err('File too large. Maximum size is 10 MB.', 413);
            }

            $uploadDir = __DIR__ . '/uploads';
            if (!is_dir($uploadDir)) {
                @mkdir($uploadDir, 0755, true);
            }
            $safeName   = genId() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', pathinfo($_FILES['file']['name'], PATHINFO_FILENAME)) . ($ext ? '.' . $ext : '');
            $targetPath = $uploadDir . '/' . $safeName;
            if (move_uploaded_file($_FILES['file']['tmp_name'], $targetPath)) {
                $b['file_url']  = '/api/uploads/' . $safeName;
                $b['file_name'] = $_FILES['file']['name'];
            }
        }

        $rid  = genId();
        $cols = ['id'];
        $vals = [$rid];
        $phs  = ['?'];

        // Only write columns that exist in the whitelist for this table
        $allowed_cols = $tableColumns[$table] ?? [];
        foreach ($b as $k => $v) {
            if ($k === 'id') continue;
            if ($allowed_cols && !in_array($k, $allowed_cols, true)) continue; // skip unknown columns
            $cols[] = $k;
            if (is_array($v)) {
                $val = json_encode($v, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            } elseif (is_bool($v)) {
                $val = $v ? 1 : 0;
            } else {
                $val = $v;
            }
            $vals[] = $val;
            $phs[]  = '?';
        }
        $cols[] = 'created'; $phs[] = 'NOW(3)'; // no val
        $cols[] = 'updated'; $phs[] = 'NOW(3)';

        // Build query with unparameterised NOW(3)
        $colList = implode(',', array_map(fn($c) => "`$c`", $cols));
        $phList  = implode(',', $phs);
        try {
            db()->prepare("INSERT INTO `$table` ($colList) VALUES ($phList)")->execute($vals);
        } catch (\PDOException $e) {
            // SEC-10: Only expose DB error details in debug mode.
            $dbErrMsg = DEBUG_MODE ? 'DB error: ' . $e->getMessage() : 'A database error occurred.';
            err($dbErrMsg, 500);
        }
        $row = query("SELECT * FROM `$table` WHERE id=?", [$rid])[0] ?? ['id' => $rid];
        jsonOut(formatRow($row), 201);
    }

    // ── PATCH / PUT update ───────────────────────────────────────────────
    if (in_array($method, ['PATCH', 'PUT']) && $id !== '') {
        $auth = getAuthFromHeader();
        $isWH = isAdminSecret();
        if (!$auth && !$isWH) err('Unauthorized', 401);

        // Admin-only content tables — no user ownership concept
        $adminOnlyTables = $_ADMIN_ONLY_WRITE;
        if (in_array($table, $adminOnlyTables, true)) {
            if (!$isWH && (!$auth || $auth['role'] !== 'admin')) err('Forbidden — admin only', 403);
        }

        $rows = query("SELECT * FROM `$table` WHERE id=?", [$id]);
        if (!$rows) err('Record not found', 404);

        if ($auth && $auth['role'] !== 'admin' && !$isWH) {
            $clientMutableTables = ['notifications', 'notification_preferences', 'workspace_members', 'workspaces', 'users'];
            if (!in_array($table, $clientMutableTables, true)) err('Forbidden', 403);
            if ($table === 'users') {
                if ($id !== $auth['id']) err('Forbidden', 403);
                unset($b['role']); // Non-admins cannot elevate their own role
            }
            if (isset($rows[0]['user']) && $rows[0]['user'] !== $auth['id'] && $table !== 'users') err('Forbidden', 403);
            if ($table === 'workspaces' && isset($rows[0]['owner']) && $rows[0]['owner'] !== $auth['id']) err('Forbidden', 403);
        }
        $b = body();
        if (empty($b)) err('No data provided');
        $sets = [];
        $vals = [];
        // Only update columns that exist in the whitelist for this table
        $allowed_cols = $tableColumns[$table] ?? [];
        foreach ($b as $k => $v) {
            if ($k === 'id') continue;
            if ($allowed_cols && !in_array($k, $allowed_cols, true)) continue; // skip unknown columns
            $sets[] = "`$k` = ?";
            if (is_array($v)) {
                $val = json_encode($v, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            } elseif (is_bool($v)) {
                $val = $v ? 1 : 0;
            } else {
                $val = $v;
            }
            $vals[] = $val;
        }
        if (empty($sets)) err('No valid fields to update', 400);
        $sets[] = '`updated` = NOW(3)';
        $vals[] = $id;
        execute("UPDATE `$table` SET " . implode(', ', $sets) . " WHERE id=?", $vals);
        $row = query("SELECT * FROM `$table` WHERE id=?", [$id])[0];
        jsonOut(formatRow($row));
    }

    // ── DELETE ───────────────────────────────────────────────────────────
    if ($method === 'DELETE' && $id !== '') {
        $auth = getAuthFromHeader();
        $isWH = isAdminSecret();
        if (!$auth && !$isWH) err('Unauthorized', 401);

        // Admin-only content tables
        $adminOnlyTables = $_ADMIN_ONLY_DELETE;
        if (in_array($table, $adminOnlyTables, true)) {
            if (!$isWH && (!$auth || $auth['role'] !== 'admin')) err('Forbidden — admin only', 403);
        } elseif ($auth && $auth['role'] !== 'admin' && !$isWH) {
            // For user-owned tables (notifications, workspace_members)
            $rows = query("SELECT * FROM `$table` WHERE id=?", [$id]);
            if (!$rows) err('Record not found', 404);
            if (in_array($table, ['notifications', 'workspace_members'], true)) {
                if (isset($rows[0]['user']) && $rows[0]['user'] !== $auth['id']) {
                    err('Forbidden', 403);
                }
            } else {
                err('Forbidden', 403);
            }
        }
        // Cascade deletion for tables with foreign dependencies
        if ($table === 'users') {
            execute("DELETE FROM `notifications` WHERE `user`=?", [$id]);
            execute("DELETE FROM `notification_preferences` WHERE `user`=?", [$id]);
            execute("DELETE FROM `workspace_members` WHERE `user`=?", [$id]);
            execute("DELETE FROM `workspaces` WHERE `owner`=?", [$id]);
            execute("DELETE FROM `documents` WHERE `user`=?", [$id]);
            execute("DELETE FROM `payments` WHERE `user`=?", [$id]);
            execute("DELETE FROM `companies` WHERE `user`=?", [$id]);
            execute("DELETE FROM `orders` WHERE `user`=?", [$id]);
            execute("DELETE FROM `admin_audit_log` WHERE `admin`=?", [$id]);
        }
        execute("DELETE FROM `$table` WHERE id=?", [$id]);
        jsonOut(null, 204);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// PROFILE  PATCH /users/{id}
// (PocketBase compat: PATCH /collections/users/records/{id})
// ═══════════════════════════════════════════════════════════════════════════
// (already handled above under collections)

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN  /admin/*
// ═══════════════════════════════════════════════════════════════════════════
if ($col === 'admin') {
    // POST /admin/send-email
    if ($sub === 'send-email' && $method === 'POST') {
        if (!isAdminSecret() && (requireAuth()['role'] ?? '') !== 'admin') err('Forbidden', 403);
        $b = body();
        $ok = sendEmail($b['to'] ?? '', $b['subject'] ?? '', $b['html'] ?? '');
        jsonOut(['sent' => $ok]);
    }
    err('Admin endpoint not found', 404);
}

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS MARK-READ  POST /notifications/mark-read
// ═══════════════════════════════════════════════════════════════════════════
if ($uri === '/notifications/mark-read' && $method === 'POST') {
    $auth = requireAuth();
    $b    = body();
    $ids  = $b['ids'] ?? [];
    if ($ids === 'all') {
        execute('UPDATE notifications SET `read`=1 WHERE user=?', [$auth['id']]);
        jsonOut(['updated' => true]);
    }
    if (is_array($ids) && $ids) {
        $phs  = implode(',', array_fill(0, count($ids), '?'));
        execute("UPDATE notifications SET `read`=1 WHERE user=? AND id IN ($phs)", array_merge([$auth['id']], $ids));
    }
    jsonOut(['updated' => true]);
}

// ═══════════════════════════════════════════════════════════════════════════
// WEBHOOK INGEST  POST /webhook/stripe
// Receives pre-processed data from Cloudflare Worker
// ═══════════════════════════════════════════════════════════════════════════
if ($uri === '/webhook/stripe' && $method === 'POST') {
    if (!isAdminSecret()) err('Forbidden', 403);
    // Body is already parsed data from the CF Worker
    $b = body();
    $action = $b['action'] ?? '';

    if ($action === 'create_order') {
        $rid = genId();
        $o   = $b['order'];
        execute(
            'INSERT INTO orders (id,user,order_number,package_name,company_name,company_state,company_type,status,amount,currency,customer_name,customer_email,customer_phone,customer_country,customer_address,business_activity,stripe_session_id,notes,created,updated)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(3),NOW(3))',
            [
                $rid,
                $o['user'] ?? null,
                $o['order_number'],
                $o['package_name'],
                $o['company_name'] ?? 'N/A',
                $o['company_state'] ?? 'N/A',
                $o['company_type'] ?? 'N/A',
                $o['status'] ?? 'pending',
                $o['amount'] ?? 0,
                $o['currency'] ?? 'USD',
                $o['customer_name'] ?? null,
                $o['customer_email'] ?? null,
                $o['customer_phone'] ?? null,
                $o['customer_country'] ?? null,
                $o['customer_address'] ?? null,
                $o['business_activity'] ?? null,
                $o['stripe_session_id'] ?? null,
                $o['notes'] ?? null,
            ]
        );
        // Auto-create company if not addon
        if (!empty($b['company'])) {
            $c = $b['company'];
            execute(
                'INSERT INTO companies (id,user,`order`,company_name,company_type,state,status,created,updated) VALUES (?,?,?,?,?,?,?,NOW(3),NOW(3))',
                [genId(), $c['user'], $rid, $c['company_name'], $c['company_type'], $c['state'], 'pending']
            );
        }
        // Notification
        if (!empty($o['user'])) {
            execute(
                'INSERT INTO notifications (id,user,type,title,message,link,`read`,created,updated) VALUES (?,?,?,?,?,?,?,NOW(3),NOW(3))',
                [genId(), $o['user'], 'order_status', 'Order Placed Successfully', 'Your order is pending review.', '/client/dashboard', 0]
            );
        }
        jsonOut(['id' => $rid], 201);
    }

    if ($action === 'create_payment') {
        $rid = genId();
        $p   = $b['payment'];
        execute(
            'INSERT INTO payments (id,user,`order`,service,invoice_id,amount,currency,status,stripe_payment_id,stripe_session_id,stripe_payment_intent_id,stripe_charge_id,stripe_customer_id,stripe_invoice_id,customer_name,customer_email,company_name,customer_country,invoice_url,receipt_url,notes,created,updated)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(3),NOW(3))',
            [
                $rid,
                $p['user'] ?? null,
                $p['order'] ?? null,
                $p['service'] ?? '',
                $p['invoice_id'] ?? '',
                $p['amount'] ?? 0,
                $p['currency'] ?? 'USD',
                $p['status'] ?? 'paid',
                $p['stripe_payment_id'] ?? null,
                $p['stripe_session_id'] ?? null,
                $p['stripe_payment_intent_id'] ?? null,
                $p['stripe_charge_id'] ?? null,
                $p['stripe_customer_id'] ?? null,
                $p['stripe_invoice_id'] ?? null,
                $p['customer_name'] ?? null,
                $p['customer_email'] ?? null,
                $p['company_name'] ?? null,
                $p['customer_country'] ?? null,
                $p['invoice_url'] ?? null,
                $p['receipt_url'] ?? null,
                $p['notes'] ?? null,
            ]
        );
        jsonOut(['id' => $rid], 201);
    }

    if ($action === 'update_order') {
        $o   = $b['order'];
        $oid = $o['id'];
        $sets = []; $vals = [];
        foreach (['status','stripe_payment_intent_id','stripe_charge_id','notes'] as $k) {
            if (isset($o[$k])) { $sets[] = "`$k`=?"; $vals[] = $o[$k]; }
        }
        if ($sets) {
            $vals[] = $oid;
            execute('UPDATE orders SET ' . implode(',', $sets) . ',updated=NOW(3) WHERE id=?', $vals);
        }
        jsonOut(['updated' => true]);
    }

    err('Unknown webhook action', 400);
}

// ═══════════════════════════════════════════════════════════════════════════
// FALLBACK
// ═══════════════════════════════════════════════════════════════════════════
err('Not found', 404);

// ─── getAuthFromHeader: soft auth check (returns null instead of erroring) ───
// Uses the same extractBearerToken() helper as requireAuth() so both functions
// read from ALL 4 possible header locations on Hostinger/FastCGI.
// SEC-1: Role comes from the JWT payload (set from DB at login time). No email-pattern override.
function getAuthFromHeader(): ?array {
    $token = extractBearerToken();
    if (!$token) return null;
    $p = jwtDecode($token);
    if (!$p) return null;
    return $p;
}
