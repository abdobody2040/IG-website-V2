# Instant Grow — Testing Strategy

## Current State

**No automated test suite exists.** All testing is currently manual.

## Testing Recommendations

### Unit Testing

**Framework:** Vitest (native Vite integration, fast, TypeScript support)
**Location:** `tests/unit/`

**High-Priority Coverage:**
1. All custom hooks (useAuth, useOrders, useCompanies, useDocuments, useAdminData, etc.)
2. Data mapper functions (mapOrder, mapUser, mapCompany, etc.)
3. Utility functions (cn(), formatDate, etc.)
4. i18n translation lookups
5. Validation logic (password strength, file upload validation)

**Example Test Structure:**
```typescript
// tests/unit/hooks/useOrders.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useOrders } from '@/hooks/useOrders'

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: mockOrders,
            error: null
          }))
        }))
      }))
    }))
  }
}))

describe('useOrders', () => {
  it('returns orders for a given userId', async () => {
    const { result } = renderHook(() => useOrders('user-1'), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={new QueryClient()}>
          {children}
        </QueryClientProvider>
      ),
    })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.orders).toHaveLength(2)
  })
  
  it('handles empty userId (disabled query)', () => {
    const { result } = renderHook(() => useOrders(null))
    expect(result.current.orders).toEqual([])
  })
})
```

### Integration Testing

**Framework:** Vitest + Testing Library
**Location:** `tests/integration/`

**Coverage:**
1. Auth flow (login, signup, OAuth callback)
2. Order wizard (multi-step form submission)
3. Admin CRUD operations
4. Document upload flow
5. Payment flow (checkout → webhook → record)

### E2E Testing

**Framework:** Playwright
**Location:** `tests/e2e/`

**Coverage:**
1. Full user journey: signup → create order → checkout → view dashboard
2. Admin: login → manage orders → upload documents → view analytics
3. Mobile responsiveness
4. RTL/Arabic layout

### API Testing

**Framework:** Vitest (for Edge Functions)
**Location:** `tests/api/`

**Coverage:**
1. create-checkout — validation, session creation, edge cases
2. stripe-webhook — signature verification, idempotency, error handling
3. submit-contact — CAPTCHA verification, validation
4. delete-user — auth check, role check, cleanup flow

### Database Testing

**Framework:** Vitest + Supabase local
**Location:** `tests/db/`

**Coverage:**
1. RLS policy correctness (user vs admin access)
2. Trigger behavior (profile auto-creation)
3. Constraint enforcement (unique stripe_session_id)
4. Migration correctness

## Testing Conventions

1. **Mock Supabase client** — Never hit real Supabase in tests
2. **Use QueryClientProvider wrapper** — All hook tests need this
3. **Test error states** — Mock API errors and verify error handling
4. **Test loading states** — Verify loading spinners/skeletons render
5. **Test empty states** — Verify "no data" messages appear
6. **Test edge cases** — Null values, empty arrays, invalid inputs

## Tools Setup

```bash
# Install testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# Add to package.json scripts
"test": "vitest",
"test:coverage": "vitest --coverage",
"test:e2e": "playwright test"
```

## CI/CD Integration

```yaml
# Add to GitHub Actions
- name: Run tests
  run: npm test
- name: Upload coverage
  uses: codecov/codecov-action@v4
```

## Test Command (to be added)
```bash
npm test          # Run all tests
npm run test:watch  # Watch mode
npm run test:coverage # With coverage report
```
