# Instant Grow — AI Agent Rules

## Mandatory Pre-Work Checklist

BEFORE making ANY changes to this repository, ALL AI agents MUST:

1. **Read .ai/context.md** — Understand project state and priorities
2. **Read .ai/architecture.md** — Understand system architecture
3. **Read .ai/tasks.md** — Know what's in progress and pending
4. **Read .ai/changelog.md** — Know what changed recently
5. **Read .ai/bugs.md** — Know known issues
6. **Read .ai/rules.md** — Follow engineering standards
7. **Read .ai/agent-rules.md** — Follow these rules (current file)
8. **Read .ai/decisions.md** — Understand why decisions were made

## Architecture Preservation

1. **Never rewrite stable systems.** If a system works and follows the existing patterns, don't rewrite it.
2. **Preserve architecture consistency.** New code must match the patterns in `architecture.md`.
3. **Preserve data flow.** PocketBase → custom hooks → components. No direct PocketBase calls in components.
4. **Preserve routing patterns.** TanStack Router with defined route structure.
5. **Preserve i18n pattern.** All user-facing strings through `useLang().t` translations.
6. **Preserve RLS security model.** Never bypass Row-Level Security from client code.

## Change Management

1. **Update changelog.md** after every modification. Include what changed, why, and when.
2. **Update tasks.md** when completing or starting tasks.
3. **Update bugs.md** when fixing or discovering bugs.
4. **Update context.md** if project state significantly changes.
5. **Minimize diffs.** Make surgical changes, not bulk rewrites.

## Code Quality Rules

1. **No duplicate logic.** If a pattern exists, reuse it. Extract shared logic into reusable utilities.
2. **Follow repository patterns.** New hooks, components, and pages must match existing structure.
3. **Minimize technical debt.** Clean up as you go. Don't leave TODO/FIXME comments without tracking them.
4. **Add types.** Every function parameter and return value should be typed.
5. **Handle all states.** Every component must handle: loading, data, empty, error.

## Communication Rules

1. **Be concise.** Answer directly. Don't explain code unless asked.
2. **Reference file paths.** When mentioning code, include the file path.
3. **State what you changed.** After modifications, summarize what files were changed and why.
4. **Flag concerns.** If you see potential issues, mention them immediately.

## Prohibited Actions

1. **NEVER hardcode secrets or API keys.**
2. **NEVER disable RLS policies.**
3. **NEVER add `dangerouslySetInnerHTML`** (unless absolutely unavoidable and audited).
4. **NEVER add `eval()` or `new Function()`.**
5. **NEVER add console.log of user PII.**
6. **NEVER create files outside the repository structure** (no temp files, no build artifacts).
7. **NEVER commit secrets, .env files, or build output.**

## Session Continuity

1. **Read before writing.** Always read the latest file versions before making changes.
2. **Assume concurrent changes possible.** Check .ai/changelog.md for recent edits.
3. **Continue from latest stable progress.** Don't restart work that's already done.
4. **If uncertain, ask.** Don't assume or hallucinate implementation details.
5. **Preserve AI continuity.** The .ai/ system is designed for future AI agents. Leave it better than you found it.
