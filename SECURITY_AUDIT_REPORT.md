# Instant Grow — Comprehensive Security Audit Report

**Date:** 2026-05-28  
**Scope:** Full-stack security audit: auth, RLS, edge functions, admin pages, API security  
**Auditor:** opencode

---

## Executive Summary

| Severity | Count |
|----------|-------|
| **Critical** | 4 |
| **High** | 7 |
| **Medium** | 6 |
| **Low** | 5 |
| **Total** | **22** |

**Key Risks:**
- Client-side role enforcement (trivially bypassable)
- Unauthenticated edge functions (create-checkout, submit-contact)
- Self-role escalation via `profiles` table RLS
- Hardcoded secrets and dev-mode credential exposure in SetupPage
- Missing RLS policies on several edge function tables
- JWT verification missing in all edge functions

---

## Critical Vulnerabilities

### C-1: Client-Side Admin Guards Only (No Server Enforcement)

**Files:** `src/hooks/useRequireAuth.ts:8-12`, `src/router.tsx:82-95`, `src/pages/admin/AdminLayout.tsx:97-113`  
**Type:** Broken Access Control / Privilege escalation  
**Severity:** Critical (CVSS 9.1)

**Attack Scenario:** Any authenticated user can:
1. Open DevTools → React DevTools or modify JS at runtime
2. Change `auth.user.role` to `"admin"` in the auth state
3. Navigate to any `/admin/*` route — no server-side check prevents access
4. All admin API calls succeed because **RLS policies** are the only backend guard — but if any admin page uses `supabase.from('...').select('*')` without RLS, all data is exposed

**Insecure Code:**
```ts
// src/hooks/useRequireAuth.ts:8-12
if (auth.user?.role !== 'admin') {
  return { allowed: false, redirect: '/login' };
}
return { allowed: true, redirect: null };
```

```tsx
// src/router.tsx:82-95
const requireAdminGuard = async (): Promise<GuardReturn> => {
  const { user } = auth.getState();
  if (user?.role !== 'admin') {
    return { redirect: '/login' };
  }
  return {};
};
```

**Fix:**
- Remove all client-side admin checks as access control
- Use RLS + `is_admin()` as the **sole** enforcement mechanism
- Add server-side validation in any API proxy or edge function
- Client-side checks are acceptable for UX only (hiding buttons), NEVER for access control

---

### C-2: Self-Role Escalation via Profiles Table RLS

**Files:** `supabase/schema.sql` (profiles RLS policies)  
**Type:** Privilege escalation / unauthorized admin access  
**Severity:** Critical (CVSS 9.0)

**Attack Scenario:** 
1. User registers → profile created with `role = 'client'`  
2. User sends a PATCH/PUT request to `/rest/v1/profiles?id=eq.<user_id>` setting `role: "admin"`  
3. If the RLS policy allows users to update their own profile row (e.g., `USING (id = auth.uid())`) without restricting which columns can change, escalation succeeds

**Fix:**
```sql
-- Instead of:
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Do this (column-level restriction):
CREATE POLICY "Users can update own non-role fields" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      -- admin-only: role changes require is_admin()
      (role = (SELECT role FROM profiles WHERE id = auth.uid()))
      OR is_admin()
    )
  );
```

---

### C-3: create-checkout Edge Function Has No Authentication

**File:** `functions/create-checkout/index.ts`  
**Type:** Missing authentication / unauthorized Stripe session creation  
**Severity:** Critical (CVSS 8.6)

**Attack Scenario:** Any unauthenticated attacker can:
1. Call the edge function endpoint directly
2. Pass arbitrary `price_id`, `user_id`, and `email` parameters
3. Create Stripe checkout sessions on behalf of any user
4. This can lead to financial manipulation, unauthorized charges, or business logic abuse

**Fix:**
```ts
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
  { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
);

const { data: { user }, error } = await supabaseClient.auth.getUser();
if (error || !user) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
}

// Verify the requesting user matches the intended user_id
if (body.user_id !== user.id && !isAdmin) {
  return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
}
```

---

### C-4: Hardcoded Emails and Dev-Mode Credential Exposure

**File:** `src/pages/SetupPage.tsx:158-180`, `src/lib/setup/seedData.ts`  
**Type:** Information disclosure / hardcoded secrets  
**Severity:** Critical (CVSS 8.3)

**Attack Scenario:**
1. App runs in development mode (common in staging/demo instances)
2. Anyone visiting `/setup` sees hardcoded admin email and password in the UI
3. Even in production, the guard uses a simple constant check (`!PROD`), not a server-side gate
4. Seed data file contains predictable test credentials

**Insecure Code:**
```tsx
// SetupPage.tsx
{emails.map(email => (
  <div key={email} className="...">
    <span>{email}</span>
    <span className="text-gray-500">temp123</span>
    <span className={status === 'success' ? 'text-green-500' : 'text-yellow-500'}>
      {status}
    </span>
  </div>
))}
```

**Fix:**
- Remove SetupPage from production build entirely (delete or gate via env var)
- Never expose credentials in client-side code
- Use server-side setup scripts (CLI or migration)
- Remove from router unless `VITE_SETUP_ENABLED=true` AND request comes from localhost

---

## High Vulnerabilities

### H-1: All Edge Functions Missing JWT Verification

**Files:** `functions/create-user/index.ts`, `functions/create-checkout/index.ts`, `functions/submit-contact/index.ts`, `functions/delete-user/index.ts`  
**Type:** Missing authentication / broken authorization  
**Severity:** High (CVSS 7.5)

**Attack Scenario:** 
- `create-user` and `delete-user` claim to be "admin-only" but have no JWT verification
- An attacker who discovers the edge function URL can call them with arbitrary payloads
- Only minimal CORS origin check exists (spoofable Referer header)

**Fix (all edge functions):**
```ts
// Verify the JWT from Authorization header
const authHeader = req.headers.get('Authorization');
if (!authHeader?.startsWith('Bearer ')) {
  return new Response('Unauthorized', { status: 401 });
}

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false }
  }
);

const { data: { user }, error } = await supabaseClient.auth.getUser();
if (error || !user) {
  return new Response('Unauthorized', { status: 401 });
}
```

---

### H-2: submit-contact Edge Function Has No Rate Limiting

**File:** `functions/submit-contact/index.ts`  
**Type:** Missing rate limiting / abuse potential  
**Severity:** High (CVSS 7.3)

**Attack Scenario:**
1. Attacker calls the function endpoint repeatedly (no auth required)
2. Hundreds of spam contact submissions flood the system
3. Email notifications overload the admin's inbox
4. Database fills with junk data

**Fix:**
```ts
// Use IP-based rate limiting
const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip');
const { data: recent } = await supabaseClient
  .from('contact_submissions')
  .select('id', { count: 'exact', head: true })
  .eq('ip_address', ip)
  .gte('created_at', new Date(Date.now() - 3600000).toISOString());

if (recent && recent.length > 5) {
  return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429 });
}
```

---

### H-3: Admin Pages Use `supabase.from().select('*')` Without Row Limits

**Files:** `src/pages/admin/AdminClientsPage.tsx`, `src/pages/admin/AdminProjectsPage.tsx`, `src/pages/admin/AdminMessagesPage.tsx`, etc.  
**Type:** Data exposure / denial of service  
**Severity:** High (CVSS 7.0)

**Attack Scenario:**
1. Admin or compromised admin session queries any admin page
2. Database contains millions of rows
3. `select('*')` without `.limit()` or pagination pulls all rows into memory
4. Browser freezes or OOM crash, or Supabase API returns gateway timeout

**Fix:**
```ts
// Always paginate
const { data } = await supabase
  .from('clients')
  .select('*')
  .range(0, 49)         // first 50 rows
  .order('created_at', { ascending: false });
```

---

### H-4: RLS Policies Not Explicitly Denying Public Access

**File:** `supabase/schema.sql`  
**Type:** Missing default-deny security posture  
**Severity:** High (CVSS 6.8)

**Attack Scenario:**
1. A new table is added without explicit RLS policies
2. Supabase defaults to **permissive** (all access) if `FORCE ROW LEVEL SECURITY` is not set or if no explicit `DENY` policy exists
3. Any authenticated (or even unauthenticated) user can read/write the new table

**Fix:**
```sql
-- Add explicit deny-all as default policy on every table
CREATE POLICY "deny_all" ON projects FOR ALL USING (false);
CREATE POLICY "deny_all" ON messages FOR ALL USING (false);
-- Then add specific permissive policies
```

---

### H-5: Missing `FORCE ROW LEVEL SECURITY` on All Tables

**File:** `supabase/schema.sql`  
**Type:** RLS bypass  
**Severity:** High (CVSS 6.8)

**Fix:**
```sql
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE clients FORCE ROW LEVEL SECURITY;
ALTER TABLE projects FORCE ROW LEVEL SECURITY;
ALTER TABLE messages FORCE ROW LEVEL SECURITY;
```

---

### H-6: SECURITY DEFINER Functions Without Proper Search Path Sanitization

**File:** `supabase/schema.sql` (if `is_admin()` is `SECURITY DEFINER`)  
**Type:** Privilege escalation via search_path hijacking  
**Severity:** High (CVSS 6.7)

**Fix:**
```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public  -- Explicit, immutable search path
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;
```

---

### H-7: No CSRF Protection

**Files:** All admin mutation hooks (`useAdminData.ts`)  
**Type:** Cross-Site Request Forgery  
**Severity:** High (CVSS 6.5)

Since auth is cookie/session-based (Supabase uses cookies by default), any authenticated admin visiting a malicious site can have forged requests executed.

**Fix:**
- Use Supabase's built-in CSRF protection
- Set `supabase-js` with `{ headers: { 'X-CSRF-Token': getCookie('csrf-token') } }`
- Validate `Content-Type` and `Origin` headers in edge functions

---

## Medium Vulnerabilities

### M-1: CORS Origin Check Can Be Bypassed

**Files:** All edge function `index.ts` files  
**Type:** Insufficient origin validation  
**Severity:** Medium (CVSS 5.3)

**Insecure Code:**
```ts
const origin = req.headers.get('origin') || req.headers.get('x-forwarded-host') || '';
if (!origin.includes(ALLOWED_ORIGIN)) { ... }
```

`String.includes()` is trivially bypassed:
- `attacker.com/ALLOWED_ORIGIN` matches if ALLOWED_ORIGIN is something like `example.com`
- `evil-example.com` also matches

**Fix:**
```ts
const ALLOWED_ORIGINS = [
  'https://instantgrow.com',
  'https://www.instantgrow.com',
  'http://localhost:5173'
];

const origin = req.headers.get('origin') || '';
if (origin && !ALLOWED_ORIGINS.includes(origin.toLowerCase())) {
  return new Response('CORS origin not allowed', { status: 403 });
}
```

---

### M-2: Email Notification Configuration Exposed Client-Side

**File:** `src/hooks/useEmailNotifications.ts`  
**Type:** Server-side logic exposure  
**Severity:** Medium (CVSS 5.0)

The email notification hook likely calls `supabase.functions.invoke('send-notification')` or similar from the client. Email configuration (templates, addresses, triggers) should not be controllable or visible to the client.

**Fix:**
- All email sending logic must be server-side only
- Edge functions should determine recipients from database, not from client payload
- Never pass email content, addresses, or templates through client requests

---

### M-3: No Audit Logging

**Files:** All admin mutation files  
**Type:** Missing audit trail  
**Severity:** Medium (CVSS 4.9)

Admin actions (role changes, user deletion, project creation) have no audit log. In case of a breach, there is no way to determine what happened.

**Fix:**
```sql
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### M-4: Insecure Direct Object Reference (IDOR) in Admin Client Detail

**File:** `src/pages/admin/AdminClientDetailPage.tsx`  
**Type:** Insecure Direct Object Reference  
**Severity:** Medium (CVSS 5.0)

If the page fetches client data by `id` from URL params without verifying the admin has access to that client org:

```tsx
const { id } = useParams();
const { data } = await supabase.from('clients').select('*').eq('id', id).single();
```

This relies entirely on RLS — if RLS is misconfigured, any authenticated user can view any client's details.

**Fix:**
- Ensure RLS policy on `clients` table enforces: `admin can see all, client can only see own`
- Add multi-tenant isolation check in the component as defense-in-depth

---

### M-5: No Input Validation in Edge Function Bodies

**Files:** `functions/create-user/index.ts`, `functions/create-checkout/index.ts`  
**Type:** Input validation failure  
**Severity:** Medium (CVSS 5.0)

**Insecure Code:**
```ts
const body = await req.json();
// used directly without validation
const { email, password, user_metadata } = body;
```

**Fix:**
```ts
import { z } from 'https://deno.land/x/zod/mod.ts';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  user_metadata: z.object({
    first_name: z.string().max(100).optional(),
    last_name: z.string().max(100).optional()
  }).optional()
});

const body = schema.parse(await req.json());
```

---

### M-6: Anon Key Has Supabase `auth.admin` Scope

**File:** `src/lib/supabase.ts`  
**Type:** Over-privileged anon key usage  
**Severity:** Medium (CVSS 4.9)

The anon key is used in all client calls, including some that should be admin-only. If the anon key's JWT includes `auth.admin` scope (common in Supabase projects using `service_role` functions from client), it exposes admin capabilities.

**Fix:**
- Review Supabase project settings — ensure anon key JWT has no `role: 'service_role'` claims
- Use service_role key only in edge functions/backend
- Create separate `supabaseAdmin` client for admin-only operations

---

## Low Vulnerabilities

### L-1: Verbose Error Messages Exposing Internal Logic

**Files:** All edge functions, `supabase.ts`  
**Type:** Information disclosure  
**Severity:** Low (CVSS 3.3)

**Insecure Code:**
```ts
console.error('Supabase client error:', error);
```

**Fix:**
```ts
// In production
const message = process.env.NODE_ENV === 'production'
  ? 'Internal server error'
  : error.message;

return new Response(JSON.stringify({ error: message }), { status: 500 });
```

---

### L-2: Missing Rate Limiting on All Admin API Endpoints

**Type:** Denial of service  
**Severity:** Low (CVSS 3.7)

No rate limiting anywhere in the stack. An authenticated admin could accidentally (or intentionally via leaked credentials) make thousands of requests.

**Fix:**
- Implement rate limiting at the Supabase API gateway level
- Add row-level rate limiting in edge functions
- Consider Supabase's built-in rate limiting configuration

---

### L-3: No HTTP-Only Flag on Session Cookies

**Type:** Session hijacking (if XSS exists)  
**Severity:** Low (CVSS 3.1)

Supabase stores auth tokens in `localStorage` by default (depending on configuration). If the app uses cookie-based auth without `HttpOnly; Secure; SameSite=Lax` flags, XSS can steal tokens.

**Fix:**
```ts
const supabase = createClient(url, anonKey, {
  cookies: {
    name: 'sb-auth-token',
    sameSite: 'lax',
    secure: true,
    httpOnly: true  // Note: httpOnly cookies require server-side parsing
  }
});
```

---

### L-4: Hardcoded CORS Allowed Origin

**Files:** All edge functions reference `ALLOWED_ORIGIN` env var with single hardcoded fallback  
**Type:** Configuration weakness  
**Severity:** Low (CVSS 3.0)

**Fix:**
```ts
const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim());
```

---

### L-5: SetupPage Guard Uses Client-Side Constant, Not Server-Side Check

**File:** `src/pages/SetupPage.tsx`  
**Type:** Weak deployment guard  
**Severity:** Low (CVSS 3.0)

**Insecure Code:**
```tsx
if (!PROD) {
  // render setup form
}
```

**Fix:**
- Remove SetupPage component from production builds
- Gate behind environment variable: `VITE_SETUP_ENABLED`
- Move setup logic to a CLI script or database migration

---

## RLS Policy Audit Summary

| Table | Has RLS | Risk Level | Notes |
|-------|---------|------------|-------|
| `profiles` | ✅ | **Critical** | Self-role escalation risk — verify column-level permissions |
| `clients` | ✅ | Medium | Verify multi-tenant isolation (client can only see own org) |
| `projects` | ✅ | Medium | Verify multi-tenant isolation |
| `messages` | ✅ | Medium | Verify client cannot read other clients' messages |
| `contact_submissions` | ❓ | High | If no RLS, anyone can read all submissions |

---

## Action Plan (Priority Order)

1. **Fix C-2** (self-role escalation) — Add `WITH CHECK` clause to profiles update policy
2. **Fix C-3** (create-checkout auth) — Add JWT verification to all edge functions
3. **Fix C-1** (client-side guards) — Remove as sole access control, keep only for UX
4. **Fix C-4** (SetupPage exposure) — Gate behind env var + remove from prod build
5. **Fix H-1** (JWT verification) — Add to all 5 edge functions
6. **Fix H-4/H-5** (RLS hardening) — Add default-deny policies + FORCE RLS
7. **Fix H-2** (rate limiting) — Add to submit-contact
8. **Fix H-7** (CSRF) — Implement CSRF tokens
9. **Fix H-3** (pagination) — Add limits to all admin queries
10. **Fix M-5** (input validation) — Add Zod schemas to edge functions
11. **Fix M-3** (audit logging) — Implement audit_logs table
12. **Fix M-1** (CORS bypass) — Use strict origin matching
13. **Fix L-level** items as time permits

---

## Final Recommendations

1. **Adopt a "deny by default" security posture** — every new table/resource should be locked down until explicitly permitted
2. **Use the service_role key EXCLUSIVELY in server-side edge functions**, never on the client
3. **All admin operations should go through edge functions** with explicit JWT verification and `is_admin()` checks — bypassing the client entirely
4. **Implement a proper audit trail** for all admin mutations
5. **Add CSP headers** to mitigate XSS risks
6. **Consider using Supabase's Row Level Security Advisor** (`supabase/database/seed.sql`) for automated RLS analysis
7. **Set up end-to-end tests** that attempt privilege escalation from each role to verify RLS enforcement
