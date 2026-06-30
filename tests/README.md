# Instant Grow — Tests

This directory will contain the automated test suite.

## Planned Structure

```
tests/
├── unit/               # Unit tests for hooks, utils, mappers
│   ├── hooks/
│   │   ├── useAuth.test.ts
│   │   ├── useOrders.test.ts
│   │   └── useCompanies.test.ts
│   ├── utils/
│   │   └── mappers.test.ts
│   └── i18n/
│       └── translations.test.ts
├── integration/        # Integration tests for pages/flows
│   ├── auth/
│   │   └── LoginPage.test.tsx
│   └── order/
│       └── OrderWizard.test.tsx
├── e2e/                # Playwright E2E tests
│   ├── auth.spec.ts
│   ├── order-flow.spec.ts
│   └── admin-panel.spec.ts
├── api/                # Edge Function tests
│   ├── create-checkout.test.ts
│   └── stripe-webhook.test.ts
├── db/                 # Database/Rls tests
│   └── policies.test.ts
└── README.md
```

## Running Tests

```bash
npm test              # Run all unit/integration tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
npm run test:e2e      # Playwright E2E tests
```

## Testing Conventions

1. All tests should mock Supabase client
2. Use QueryClientProvider wrapper for hook tests
3. Test loading, error, and empty states
4. Test both English and Arabic locales
5. Test admin and client role scenarios
