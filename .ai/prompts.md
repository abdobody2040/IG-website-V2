# Instant Grow — Reusable AI Prompts

## Continuing Development

```
You are continuing development on the Instant Grow repository.
Before working:
1. Read .ai/context.md for full context
2. Read .ai/architecture.md for architecture
3. Read .ai/tasks.md for current progress
4. Read .ai/changelog.md for recent changes
5. Read .ai/bugs.md for known bugs
6. Read .ai/rules.md for engineering standards
7. Read .ai/agent-rules.md for AI behavior rules

Analyze the current state and continue from latest stable progress.
Never rewrite stable systems unnecessarily.
Update .ai/changelog.md after each modification.
```

## Debugging

```
Find and fix bugs in the Instant Grow codebase.
1. Read .ai/bugs.md for known issues
2. Check the relevant source directory
3. Identify root cause (not just symptoms)
4. Fix without breaking existing functionality
5. Update .ai/changelog.md
6. Update .ai/bugs.md with fix details
```

## Refactoring

```
Refactor [component/file] in the Instant Grow codebase.
Rules:
- Preserve all existing functionality
- Follow patterns in .ai/rules.md
- Follow architecture in .ai/architecture.md
- No duplicate logic
- Update .ai/changelog.md
- Run lint:types and lint:js after refactoring
```

## Feature Building

```
Build [feature description] for Instant Grow.
Before coding:
1. Read .ai/context.md for project understanding
2. Read .ai/architecture.md for architecture patterns
3. Read .ai/rules.md for engineering standards
4. Read .ai/ui-system.md for design guidelines
5. Read .ai/api-rules.md for API standards

Implementation requirements:
- Follow existing patterns in src/
- Use same tech stack (React, TypeScript, Tailwind, Supabase)
- Add proper TypeScript types
- Handle loading, error, and empty states
- Follow accessibility guidelines
- Support EN/AR i18n
- Update .ai/changelog.md
- Update .ai/tasks.md
```

## Architecture Review

```
Review the architecture of [system/component] in Instant Grow.
Check:
1. Alignment with .ai/architecture.md
2. Clean separation of concerns
3. Proper error handling
4. TypeScript type safety
5. Performance implications
6. Security implications
7. Scalability
8. Testability
```

## Testing

```
Write tests for [component/hook/function] in Instant Grow.
- Read .ai/testing.md for testing strategy
- Follow existing test patterns
- Cover: happy path, error states, edge cases
- Mock Supabase client where needed
```

## Database Changes

```
Plan and implement database changes for Instant Grow.
1. Read .ai/database.md for DB architecture
2. Create migration in supabase/migrations/
3. Update schema.sql if needed
4. Update .ai/database.md documentation
5. Update types/db.ts
6. Update hooks that use affected tables
7. Create RLS policy if needed
8. Update .ai/changelog.md
```

## Deployment

```
Deploy Instant Grow to production.
1. Read .ai/deployment.md for deployment strategy
2. Verify all environment variables are set
3. Run npm run build
4. Deploy dist/ to hosting provider
5. Deploy Edge Functions to Supabase
6. Run smoke tests
7. Update .ai/changelog.md
```

## Optimization

```
Optimize [aspect] of Instant Grow for performance.
1. Read .ai/performance.md for performance budgets
2. Measure current performance
3. Apply optimizations
4. Verify no functionality broken
5. Document improvements in .ai/changelog.md
```

## Security Review

```
Perform security review of Instant Grow.
1. Read .ai/security.md for security architecture
2. Read .ai/context.md for previous audit
3. Check for common vulnerabilities:
   - XSS
   - SQL injection
   - CSRF
   - Insecure direct object references
   - Missing auth checks
   - Exposed secrets
   - Weak RLS policies
4. Document findings in .ai/security.md and .ai/bugs.md
```

## AI Session Continuation

```
Continue previous AI development session on Instant Grow.
Load context:
1. Read .ai/context.md — full project state
2. Read .ai/architecture.md — system architecture
3. Read .ai/tasks.md — current progress
4. Read .ai/changelog.md — recent changes
5. Read .ai/bugs.md — known issues
6. Read .ai/decisions.md — architectural decisions

The previous session was working on [summary of last task].
Continue from that point without losing context.
```

## Documentation Update

```
Update documentation for Instant Grow.
1. Update .ai/changelog.md with recent changes
2. Update .ai/context.md if project state changed
3. Update .ai/tasks.md if tasks completed
4. Update .ai/bugs.md if bugs fixed
5. Update relevant .ai/ files for any architecture changes
```
