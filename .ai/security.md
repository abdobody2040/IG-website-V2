# Instant Grow — Security Architecture & Hardening Report

## Security Posture Summary

A comprehensive two-pass security audit and codebase hardening was completed on **2026-08-15**. 
All 12 backend/architecture vulnerabilities were eliminated, 8 dependency vulnerabilities were patched (bringing `npm audit` to **0 vulnerabilities**), and code cleanups were applied.

---

## Security Audit & Vulnerability Resolution (2026-08-15)

| Ref | Severity | Issue | Resolution | Status |
|---|---|---|---|---|
| **SEC-1** | Critical | Admin email-pattern privilege escalation (`instantgrow.net@gmail.com` / `@instantgrow.net` bypass) | Completely removed email pattern checks across login, Google OAuth, and header auth. Auto-create admin only applies if `users` table is completely empty (first-run bootstrap). | ✅ Fixed |
| **SEC-2** | High | Silent password reset / overwrite on login with admin pattern | Removed silent password reset logic. Passwords must always match `password_verify()`. | ✅ Fixed |
| **SEC-3** | High | Insecure CORS (`Access-Control-Allow-Origin: *` with credentials) | Replaced with strict origin allowlist (`instantgrow.net`, `www.instantgrow.net`, `localhost:5173/3000`). Wildcard header removed from `.htaccess`. | ✅ Fixed |
| **SEC-4** | High | Unauthenticated `/debug/tables` and `/debug/auth` endpoints exposing DB structure and tokens | Auth-gated with `requireAdmin()`. Non-admins and unauthenticated requests receive `403 Forbidden`. | ✅ Fixed |
| **SEC-5** | Critical | Unauthenticated backdoor script `api/make-admin.php` | Permanently deleted from filesystem. | ✅ Fixed |
| **SEC-6** | High | Hardcoded fallback secrets in `api/config.php` for `JWT_SECRET` and `ADMIN_SECRET` | Removed fallback secrets. API fails fast with `500 Server misconfiguration` if environment variables are not supplied. | ✅ Fixed |
| **SEC-7** | High | Arbitrary file upload without server-side MIME verification | Added server-side MIME type check via `mime_content_type()`, extension whitelist, randomized filenames, and `.htaccess` execution denial in `uploads/` (`php_flag engine off`, `Options -ExecCGI`). | ✅ Fixed |
| **SEC-8** | Medium | Dependency CVEs in `brace-expansion`, `fast-uri`, `ws` | Applied npm overrides (`brace-expansion` `^5.0.9`, `fast-uri` `^3.1.5`) and ran `npm audit fix` → 0 vulnerabilities. | ✅ Fixed |
| **SEC-9** | Medium | Verbose MySQL PDO error leaks in JSON responses | Detailed error messages are gated behind `DEBUG_MODE`. Production returns generic safe error messages. | ✅ Fixed |
| **SEC-10** | Low | Unhandled PHP Exception trace disclosure | Exception handler sanitizes error output in production when `DEBUG_MODE` is disabled. | ✅ Fixed |
| **SEC-11** | Medium | DOMPurify XSS vulnerability (CVE-2025-26791 / CVE-2024-45801) | Bumped `dompurify` to `^3.4.13` and updated overrides. | ✅ Fixed |
| **SEC-12** | High | Client-controlled email trust in Google OAuth (`/auth/google`) | Implemented server-side token validation: PHP verifies `access_token` against `https://www.googleapis.com/oauth2/v3/userinfo` (or `id_token` against `https://oauth2.googleapis.com/tokeninfo`). Email is extracted directly from Google API response. | ✅ Fixed |
| **SEC-13** | Low | Missing Strict-Transport-Security & nosniff headers on API responses | Added `Header always set Strict-Transport-Security` and `Header always set X-Content-Type-Options "nosniff"` in `api/.htaccess`. | ✅ Fixed |
| **SEC-14** | Medium | Legacy localhost fallback in `functions/delete-user/index.ts` | Replaced legacy `http://127.0.0.1:8090` fallback with dynamic `env.API_URL || env.PB_URL` resolution and 500 error if missing. | ✅ Fixed |

---

## Authentication & Authorization

| Aspect | Implementation |
|---|---|
| **Backend Engine** | Custom PHP REST API (`api/index.php`) via PDO + MySQL |
| **Authentication Flow** | Email/password (BCrypt hashed) & Google OAuth (Server-side verified token) |
| **Token Mechanism** | HS256 JWT (`jwtEncode`/`jwtDecode`) passed via `Authorization: Bearer <token>` or `X-Auth-Token` (Apache FastCGI fallback) |
| **Password Hashing** | `PASSWORD_BCRYPT` with dynamic cost |
| **Role-Based Access (RBAC)** | Two roles: `client` and `admin` |
| **Authorization Guards** | `getAuthFromHeader()`, `requireAdmin()`, `isAdminSecret()` (Webhook secret for Cloudflare Workers) |
| **Admin Table Guards** | Centralized `$_ADMIN_ONLY_CREATE`, `$_ADMIN_ONLY_WRITE`, `$_ADMIN_ONLY_DELETE` constants protect critical tables (`services`, `blogs`, `pricing_config`, `pages`, `admin_audit_log`, `tracking_*`, `perks`, etc.) |

---

## CORS & Header Security

1. **Origin Allowlist**:
   ```php
   $_allowedOrigins = [
       'https://instantgrow.net',
       'https://www.instantgrow.net',
       'http://localhost:5173',
       'http://localhost:3000',
   ];
   ```
2. **Dynamic Origin Echo**: Origin header is only reflected back if explicitly present in the allowlist; otherwise omitted.
3. **Apache FastCGI Preservation**: `CGIPassAuth On` and `SetEnvIf Authorization` rules preserve authentication headers across proxy/FastCGI boundaries.
4. **Direct File Protection**: Direct HTTP access to `api/config.php` and execution of scripts in `api/uploads/` are strictly blocked via `.htaccess`.

---

## Upload Security (`api/index.php` & `api/uploads/`)

- **Extension Allowlist**: `pdf`, `png`, `jpg`, `jpeg`, `webp`, `doc`, `docx`
- **MIME Verification**: Checked via `mime_content_type($_FILES['file']['tmp_name'])` against allowed MIME list (`application/pdf`, `image/png`, `image/jpeg`, `image/webp`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`).
- **Path Sanitization**: Names generated with random ID prefix and sanitized character set: `genId() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', ...)`.
- **PHP Execution Prevention**: `.htaccess` inside `api/` configures:
  ```apache
  <Directory "uploads">
    php_flag engine off
    Options -ExecCGI -Indexes
    AddType text/plain .php .php5 .phtml .phar
  </Directory>
  ```

---

## Tracking & Data Privacy (REF-2)

- Console logs in `src/lib/tracking/eventTracker.ts` are strictly gated behind `import.meta.env.DEV` to prevent leaking internal analytics payloads to production browser consoles.
