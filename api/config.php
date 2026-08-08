<?php
// ─── api/config.php ──────────────────────────────────────────────────────────
// All configuration. DO NOT commit real secrets to git.
// Set these as Hostinger Environment Variables (hPanel → Advanced → PHP Config)
// or just edit the defaults below for quick start.

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
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'ig_jwt_9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d');

// ── Admin webhook key ────────────────────────────────────────────────────────
// Cloudflare Worker sends this header: X-Admin-Secret: <value>
// Must match ADMIN_SECRET env var in Cloudflare
define('ADMIN_SECRET', getenv('ADMIN_SECRET') ?: 'ig_sec_8f91a2b3c4d5e6f7a8b9c0d1e2f3a4b5');

// ── Resend email ─────────────────────────────────────────────────────────────
define('RESEND_API_KEY', getenv('RESEND_API_KEY') ?: '');
define('FROM_EMAIL',  'noreply@instantgrow.net');
define('FROM_NAME',   'Instant Grow');

// ── App ──────────────────────────────────────────────────────────────────────
define('APP_URL',  getenv('APP_URL')  ?: 'https://instantgrow.net');
define('API_URL',  getenv('API_URL')  ?: 'https://instantgrow.net/api');

// ── Debug ────────────────────────────────────────────────────────────────────
define('DEBUG_MODE', (bool)(getenv('DEBUG_MODE') ?: false));
