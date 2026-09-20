# Instant Grow — API Engineering Standards

## API Architecture

This application uses a custom **Hostinger PHP MySQL REST API** (`api/index.php`) mimicking PocketBase REST endpoints (`/api/collections/...`):

1. **Custom PHP REST API (`api/index.php`)** — Handles authentication, user management, and collection CRUD endpoints against Hostinger MySQL (MariaDB).
2. **Dual-Header FastCGI Auth Strategy** — Client calls send auth tokens in both `Authorization: Bearer <token>` AND `X-Auth-Token: Bearer <token>` to bypass FastCGI header stripping on Hostinger Apache.
3. **Cloudflare Worker Functions** — Serverless endpoints for Stripe Checkout generation and webhook processing.

## Supabase Client API Patterns

### Query Pattern
```typescript
// All data fetching through TanStack Query
const { data, isLoading, error } = useQuery({
  queryKey: ['entity', identifier],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .eq('column', value)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map(mapperFunction)
  },
  enabled: !!identifier, // Only run when identifier available
})
```

### Mutation Pattern
```typescript
const mutation = useMutation({
  mutationFn: async (payload) => {
    const { data, error } = await supabase
      .from('table_name')
      .insert(payload)
    if (error) throw error
    return data
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['related_entity'] })
  },
})
```

### Data Mapping Pattern
```typescript
function mapEntity(row: Record<string, unknown>): EntityType {
  return {
    id: row.id as string,
    // snake_case from DB → camelCase in TypeScript
    userId: row.user_id as string,
    // Handle nulls explicitly
    optionalField: (row.optional_field as string) ?? null,
  }
}
```

## Edge Function API Standards

### Request/Response Format

**Request:**
```json
{
  "mode": "formation|addon",
  "requiredField": "value",
  "optionalField": "value"
}
```

**Success Response (200):**
```json
{
  "url": "https://checkout.stripe.com/...",
  "sessionId": "cs_..."
}
```

**Error Response (4xx/5xx):**
```json
{
  "error": "Human-readable error message"
}
```

### Standard Endpoint Pattern
```typescript
// All Edge Functions follow this pattern:
async function handler(req: Request): Promise<Response> {
  // 1. CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(req) })
  }

  // 2. Method validation
  if (req.method !== "POST") {
    return jsonResponse(req, { error: "Method not allowed" }, 405)
  }

  // 3. Auth / validation
  // 4. Business logic
  // 5. Return response
}

Deno.serve(handler)
```

### CORS Pattern
```typescript
function getCorsOrigin(req: Request): string {
  const allowed = Deno.env.get("ALLOWED_ORIGIN") || ""
  const origin = req.headers.get("origin") || ""
  return allowed && origin === allowed ? origin : ""
}

function corsHeaders(req: Request) {
  return {
    "Access-Control-Allow-Origin": getCorsOrigin(req),
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Vary": "Origin",
  }
}
```

### Validation Functions
```typescript
class ValidationError extends Error {}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new ValidationError(`${field} is required`)
  }
  return value.trim()
}

function requireUrl(value: unknown, field: string): string {
  // Validates URL format + HTTP/HTTPS protocol
}

function requireAmount(value: unknown): number {
  // Validates positive number, returns amount in cents
}
```

## Auth Middleware

### Supabase Client
- RLS policies handle authorization
- `useRequireAuth()` and `useRequireAdmin()` hooks guard frontend routes
- User role resolved from `profiles.role` column

### Edge Functions
- Auth token passed via `Authorization: Bearer <session_token>` header
- Functions verify caller's role via Supabase Admin API
- Example (delete-user function):
```typescript
const authHeader = req.headers.get("authorization")
const callerToken = authHeader.slice(7)
const supabaseAnon = createClient(supabaseUrl, supabaseServiceKey)
const { data: { user } } = await supabaseAnon.auth.getUser(callerToken)
// Then check profiles.role === 'admin'
```

## RBAC Middleware

Not implemented as middleware. Handled by:
- **Database level:** RLS policies on all tables
- **Frontend level:** Route guards (useRequireAdmin)
- **Edge Functions:** Manual role check via Supabase Admin API

## Error Format

**Standard error object:**
```typescript
{ error: string }
```

**Frontend error handling:**
```typescript
if (error) {
  throw new Error("Human-readable message")
  // or return { error: message } for user display
}
```

## Response Formats

**Single entity:**
```typescript
{ id: "...", ...entityFields }
```

**Collection:**
```typescript
[{ id: "...", ...entityFields }, ...]
```

**Pagination** (not yet implemented — recommend adding):
```typescript
{
  data: [...],
  total: number,
  page: number,
  pageSize: number,
  hasMore: boolean
}
```

## Rate Limiting

- **PHP REST API Rate Limiter (`api/name-checker.php`)**: Implemented IP-based rate limiting (10 requests/minute per IP) logged in `company_name_checks` table for `POST /api/company-name/check`.
- **Supabase:** Configure in Authentication → Rate Limits
- **Recommended:** Cloudflare Turnstile on contact form, rate limiting on Edge Functions


## API Versioning

- **Current:** No explicit versioning
- **Edge Functions:** Deployed at `/functions/v1/{name}` (v1 implied)
- **Recommendation:** Use URL path versioning if breaking changes needed

## API Logging

- **Edge Functions:** `console.log()` for info, `console.error()` for errors
- **Supabase Queries:** Logged in Supabase dashboard (PostgreSQL logs)
- **Recommendation:** Add structured JSON logging for Edge Functions
