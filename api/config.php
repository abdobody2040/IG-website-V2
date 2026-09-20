<?php

// Helper to safely get environment variables across CGI/FastCGI/Apache
function get_config_env($key, $default = '') {
    return $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key) ?: $default;
}

// ── Database ─────────────────────────────────────────────────────────────────
define('DB_HOST', get_config_env('DB_HOST', 'localhost'));
define('DB_NAME', get_config_env('DB_NAME', 'u238131962_instantgrowllc'));
define('DB_USER', get_config_env('DB_USER', 'u238131962_instantgrowllc')); // Update with Hostinger DB User
define('DB_PASS', get_config_env('DB_PASS', ''));                          // Update with Hostinger DB Password
define('DB_CHARSET', 'utf8mb4');


// ── Auth ─────────────────────────────────────────────────────────────────────
// SECURITY: No hardcoded fallback. If JWT_SECRET is not set as an env var on
// Hostinger (hPanel → Advanced → PHP Config), the API will refuse to start.
$_jwtSecret = get_config_env('JWT_SECRET', '');
if (!$_jwtSecret) {
    http_response_code(500);
    echo json_encode(['code' => 500, 'message' => 'Server misconfiguration: JWT_SECRET env var is not set.']);
    exit;
}
define('JWT_SECRET', $_jwtSecret);

// ── Admin webhook key ────────────────────────────────────────────────────────
// Cloudflare Worker sends this header: X-Admin-Secret: <value>
// Must match ADMIN_SECRET env var in Cloudflare and Hostinger.
$_adminSecret = get_config_env('ADMIN_SECRET', '');
if (!$_adminSecret) {
    http_response_code(500);
    echo json_encode(['code' => 500, 'message' => 'Server misconfiguration: ADMIN_SECRET env var is not set.']);
    exit;
}
define('ADMIN_SECRET', $_adminSecret);

// ── Resend email ─────────────────────────────────────────────────────────────
define('RESEND_API_KEY', getenv('RESEND_API_KEY') ?: '');
define('FROM_EMAIL',  'noreply@instantgrow.net');
define('FROM_NAME',   'Instant Grow');

// ── Companies House API (UK Name Search) ──────────────────────────────────────
define('COMPANIES_HOUSE_API_KEY', get_config_env('COMPANIES_HOUSE_API_KEY', ''));


// ── App ──────────────────────────────────────────────────────────────────────
define('APP_URL',  getenv('APP_URL')  ?: 'https://instantgrow.net');
define('API_URL',  getenv('API_URL')  ?: 'https://instantgrow.net/api');

// ── Debug ────────────────────────────────────────────────────────────────────
define('DEBUG_MODE', (bool)(getenv('DEBUG_MODE') ?: false));
