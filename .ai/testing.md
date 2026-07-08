# Instant Grow — Testing Strategy

## Current State

We have implemented a comprehensive unit/integration test suite using **Vitest** and end-to-end (E2E) testing using **Playwright**.
- **Unit & Integration Suite**: Located in `src/test/` and `src/**/*.test.ts`, covering Stripe payment sessions, webhook routing, security validation, and database helpers.
- **E2E Test Suite**: Located in `tests/e2e/`, fully sanitized to run with environment variables (`process.env.PB_ADMIN_EMAIL`/`process.env.PB_ADMIN_PASSWORD`) and safe generic test defaults (`admin@example.local` / `AdminTestPassword123!`), covering:
  - `auth.spec.ts`: User authentication, basic toggle language, and logout sequence.
  - `order-flow.spec.ts`: End-to-end order wizard completion (6 distinct steps).
  - `admin-panel.spec.ts`: Admin logging, navigation, payment lists, and CSV/PDF downloads.
  - `rtl-and-mobile.spec.ts`: Specialized layout tests validating `dir="rtl"` toggling, bilingual Arabic translations, and mobile viewport hamburger sidebar overlay visibility.
- **Database Test Scripts**: Programmatic seed sync tests (`scripts/ensure-admin-user.mjs`, etc.) updated to construct the admin account dynamically using safe environment-driven parameters.
- **Validation**: Full E2E verification successfully ran on July 7, 2026, with all 6 specs passing cleanly against a clean PocketBase test instance.


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

// Mock PocketBase client
vi.mock('@/lib/pocketbase', () => ({
  pb: {
    collection: vi.fn(() => ({
      getList: vi.fn(() => Promise.resolve({
        items: mockOrders,
        totalItems: mockOrders.length
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

**Framework:** Vitest + PocketBase local
**Location:** `tests/db/`

**Coverage:**
1. Access rules correctness (user vs admin access)
2. Sync trigger behavior (e.g. syncLastSignIn)
3. Constraint enforcement (unique stripe_session_id)
4. Migration correctness

## Testing Conventions

1. **Mock PocketBase client** — Never hit real PocketBase in tests
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
