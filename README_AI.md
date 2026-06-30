# Instant Grow — AI Operating Instructions

## For AI Agents Working on This Repository

### First-Time Setup

Before making ANY changes, you MUST read these files in order:

1. **`.ai/context.md`** — Full project context and current state
2. **`.ai/architecture.md`** — System architecture documentation
3. **`.ai/tasks.md`** — Current progress and pending work
4. **`.ai/changelog.md`** — Recent changes
5. **`.ai/bugs.md`** — Known bugs
6. **`.ai/rules.md`** — Engineering standards
7. **`.ai/agent-rules.md`** — AI agent behavior rules (important!)

### How Continuity Works

This repository uses a **persistent AI memory system** in `.ai/`. Every file serves a specific purpose:

| File | Purpose |
|------|---------|
| context.md | Single source of truth for project state |
| architecture.md | System architecture and patterns |
| tasks.md | Task tracking and roadmap |
| decisions.md | Architectural decisions and rationale |
| bugs.md | Bug tracker |
| prompts.md | Reusable prompts for common workflows |
| changelog.md | Chronological change history |
| rules.md | Engineering standards |
| database.md | Database schema and engineering |
| api-rules.md | API standards |
| ui-system.md | UI/UX design system |
| agent-rules.md | AI agent behavior rules |
| deployment.md | Deployment strategy |
| security.md | Security architecture |
| testing.md | Testing strategy |
| performance.md | Performance budgets and optimization |
| observability.md | Monitoring and observability |

### How Architecture Must Be Preserved

1. **Data flow:** Supabase → custom hook → component (never call Supabase directly in components)
2. **Routing:** TanStack Router with explicit route tree in `router.tsx`
3. **i18n:** All user-facing strings through `useLang().t`
4. **Security:** RLS at database level, guards at route level
5. **Styling:** Tailwind CSS with CSS variable theme via `cn()` utility

### How Changelogs Must Be Maintained

Every change must be recorded in `.ai/changelog.md`:
```markdown
## YYYY-MM-DD — Brief Title

### Added
- New features, files, or capabilities

### Changed
- Modifications to existing functionality

### Fixed
- Bug fixes

### Removed
- Deleted files or features
```

### How Tasks Are Tracked

Tasks are tracked in `.ai/tasks.md` using markdown checkboxes:
- `[x]` Completed
- `[~]` In Progress
- `[ ]` Pending

Always update task status when starting or completing work.

### Before Making Changes

1. Read all `.ai/` documentation first
2. Analyze the actual repository state (read current files, not just docs)
3. Continue from latest stable progress (check changelog for most recent work)
4. Never rewrite stable systems unnecessarily
5. Update `changelog.md` after every modification
6. Update `tasks.md` when starting/completing tasks
7. Update `bugs.md` when fixing/discovering bugs

### After Making Changes

1. Run `npm run lint` to ensure code quality
2. Verify the build: `npm run build`
3. Update relevant `.ai/` documentation
4. Update `changelog.md`

### Project Is Production-Ready When

- [ ] TypeScript strict mode enabled
- [ ] All known bugs fixed (see bugs.md)
- [ ] Test suite passes
- [ ] Route-level code splitting implemented
- [ ] Production environment variables configured
- [ ] Edge Functions deployed
- [ ] Security headers verified
- [ ] RLS policies reviewed
- [ ] Database indexes added
- [ ] Backup strategy in place
- [ ] Monitoring configured
