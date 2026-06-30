# Instant Grow — Engineering Rules

## TypeScript Rules

1. **Strict Mode Target:** Code should be written as if `strict: true` is enabled. Avoid `any` types.
2. **No `any`:** Use `unknown` instead of `any` when type is not known. Cast with proper types.
3. **Explicit Returns:** All functions must have explicit return types.
4. **Interface over Type:** Use `interface` for object shapes, `type` for unions/utility types.
5. **Null Safety:** Use `??` over `||` for nullish coalescing. Use optional chaining (`?.`).
6. **Enums:** Use `const` objects with `as const` instead of TypeScript enums.

## File Structure Rules

1. **Max File Size:** No file should exceed 500 lines. Files >500 lines must be refactored.
2. **Single Responsibility:** Each file should export one primary function/component.
3. **Index Exports:** Use `index.ts` barrel files for related component groups.
4. **Consistent Naming:**
   - Components: PascalCase (e.g., `ClientDashboardPage.tsx`)
   - Hooks: camelCase with `use` prefix (e.g., `useAuth.ts`)
   - Utils: camelCase (e.g., `supabase.ts`)
   - Types: PascalCase (e.g., `Order.ts`)
   - Files: Match the exported name

## Architecture Boundaries

1. **No Business Logic in Components:** Extract to hooks or services.
2. **Hooks Call APIs:** Components call hooks. Hooks call Supabase/fetch.
3. **No Direct Supabase in Components:** Use custom hooks for all DB access.
4. **Types in `types/`:** All TypeScript interfaces in `types/` directory.
5. **Components in `components/`:** Reusable UI components only.
6. **Pages in `pages/`:** One file per route. Subdirectories for logical groups.

## API & Data Rules

1. **TanStack Query for all data fetching:** No manual fetch/useState for server data.
2. **Query Keys follow pattern:** `[entity, identifier]` e.g., `['orders', userId]`
3. **Error Handling:** Every query must handle loading, error, and empty states.
4. **Mutations:** Use `useMutation` with `onSuccess` invalidation.
5. **No raw SQL:** Use Supabase client methods (`.select()`, `.insert()`, etc.)

## Environment Rules

1. **All env vars validated at usage:** Check existence before use.
2. **VITE_ prefix for client-side:** Only `VITE_*` vars exposed to frontend.
3. **No hardcoded secrets:** All secrets through environment variables.
4. **Graceful degradation:** Optional features fail gracefully when env vars missing.

## Error Handling

1. **Centralized Error Pattern:** Try/catch at hook level, return error state.
2. **User-Facing Errors:** Generic messages. Never expose internals.
3. **Console Errors:** Always log actual error for debugging.
4. **Error Boundaries:** Wrap page-level components.

## Logging

1. **Edge Functions:** Use `console.log`/`console.error` for all functions.
2. **Frontend:** Use `console.error` for API errors, `console.warn` for degraded features.
3. **No PII in logs:** Never log user email, name, or sensitive data.

## Testing Rules

1. **Test Coverage:** All hooks must have unit tests.
2. **API Mocks:** Mock Supabase client, not the network.
3. **No Side Effects:** Tests should not depend on real Supabase data.
4. **Describe/It Pattern:** Use nested describe blocks for organization.

## Naming Conventions

1. **Components:** `[Section]Page`, `[Component]Widget`, `[Feature]Section`
2. **Hooks:** `use[Entity]` for queries, `use[Mutation]` for mutations
3. **DB Types:** PascalCase matching table names (singular)
4. **DB Columns:** snake_case in database, camelCase in TypeScript (via mapper)
5. **Files:** kebab-case for utilities, PascalCase for components

## State Management Rules

1. **Server State:** TanStack Query (React Query)
2. **Auth State:** useAuth hook (single source of truth)
3. **Form State:** React Hook Form
4. **UI State:** Local useState (no global UI state)
5. **i18n State:** LanguageContext (React Context)
6. **No Redux or Zustand:** Not needed for this application

## Database Access Rules

1. **Client-Side:** Always through RLS (service role never exposed)
2. **Edge Functions:** Use service role key for admin operations
3. **Webhook:** Service role key for creating records
4. **Migrations:** All schema changes through SQL migrations in `supabase/migrations/`
5. **RLS Policies:** Required for every new table
6. **No ON DELETE CASCADE:** Use application-level cleanup (see delete-user function)

## Import Rules

1. **Path Alias:** Use `@/` for all imports from `src/`
2. **No Relative Imports:** Prefer `@/` alias over `../../`
3. **Group Imports:** React/external first, then internal, then styles
4. **No Barrel Cycles:** Avoid circular dependencies in barrel files
