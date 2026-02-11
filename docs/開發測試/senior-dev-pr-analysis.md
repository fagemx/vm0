# Senior Developer PR Analysis: e7h4n & lancy

> Source: Systematic analysis of ~120 merged PRs (2026-01 to 2026-02)
> Methodology: Phase A (classify) -> Phase B (deep analyze by category) -> Phase C (synthesize)

---

## Part 1: Architecture Patterns (7 patterns from 5 PRs)

### 1. Eliminate Parallel State -- Derive Instead of Sync
**PRs**: #2773 (logs list signals), #2746 (log detail signals)

If state can be derived from an existing source of truth (URL params, route params), make it a computed derivation instead of maintaining parallel mutable state. This eliminates the "sync problem" where two representations must be kept in agreement.

**Heuristic**: Runtime state should only exist for things that cannot be derived from existing sources.

**Example**: `limit$`, `cursor$`, `search$` changed from `state<number>` atoms manually synced to URL → URL-derived `computed()` reading from `searchParams$`. URL becomes single source of truth.

### 2. Lazify Module-Level Constants
**PR**: #2860 (unified env() access)

Module-level constants reading configuration at import time (`const X = process.env.Y`) bake in values before tests can override them. Converting to lazy functions (`function getX() { return env().Y }`) is a mechanical transformation that fixes test isolation without architecture change.

**Rule**: Pair the migration with a lint rule (`no-restricted-syntax` for `process.env`) to prevent regression.

### 3. Cross-Cutting Concerns Belong in Wrappers
**PR**: #2713 (withErrorHandler for CLI)

The higher-order function pattern adds cross-cutting behavior (error handling, logging, auth checks) at the boundary while preserving the original function's type signature via generics. Preferred over base classes, mixins, or decorators because it composes naturally.

```typescript
export function withErrorHandler<T extends unknown[]>(
  fn: (...args: T) => Promise<void>,
): (...args: T) => Promise<void> { ... }
```

**Result**: 28 commands migrated, net -94 lines despite adding a new module + 8 tests.

### 4. Delete Stored State That Can Be Computed at Read Time
**PRs**: #2538 (session model simplification), #2746 (delete mutable caches)

If you can compute it when needed, don't store it. PR #2538 dropped 4 DB columns by computing values at read time. PR #2746 deleted `Map<string, Computed<...>>` caches by using pure async computeds.

**Benefits**: Reduces schema complexity, eliminates staleness bugs, simplifies write path.

### 5. Big-Bang Refactors Are Safe When Changes Are Mechanical
**PRs**: #2860 (55 files), #2713 (47 files), #2773 (7 files + full test rewrite)

Works when each individual change is mechanical and low-risk (e.g., `process.env.X` -> `env().X`). The safeguard is comprehensive test coverage.

### 6. Net Negative Line Count Is a Quality Signal
Every architecture PR in this set deleted more code than it added: -89, -59, -233, -443. When a refactor achieves same/better functionality with fewer lines, it validates the improvement.

### 7. Lint Rules Prevent Architectural Regression
Any architectural migration should end with a lint/build rule that prevents the old pattern from creeping back. Without it, developers write new code from habit.

---

## Part 2: Reusable Code Patterns (6 patterns from 6 PRs)

| # | Pattern | Source PR | When to Use |
|---|---------|-----------|-------------|
| 1 | Custom ESLint Rule as Policy | #2748, #2470 | Convention violated repeatedly in reviews, expressible as AST pattern |
| 2 | Integration Tests via API Boundaries | #2470 | Tests brittle to schema changes or bypassing business logic |
| 3 | Stdout-as-Interface Shell Scripts | #2480 | Same infra setup needed by multiple dev scripts |
| 4 | Polling-to-Callback with HMAC | #2829 | Long-running async process hitting timeout limits |
| 5 | Reference-Driven Secret Resolution | #2599 | Multiple credential sources with precedence rules |
| 6 | Start-Early / Wait-Late Parallelism | #2647 | Background task bottlenecked by timeout |

### Pattern 1: Custom ESLint Rule as Policy Enforcement
Encode team conventions into AST-level lint rules scoped to specific file types. Use `eslint-disable + reviewer tag` for justified exceptions.

**Examples in vm0**:
- `no-relative-vi-mock` — forbids `vi.mock("../../...")` paths
- `no-direct-db-in-tests` — forbids `globalThis.services.db` in test files
- `setup-page-render` — enforces `withoutRender: true` in signal tests

### Pattern 2: Polling-to-Callback with HMAC Webhooks
Replace polling loops with registered callback URLs + per-callback encrypted HMAC secrets.

```
Before: Start run -> Poll in after() [blocks 13min] -> Post reply
After:  Start run + Register callback -> Return 200 immediately
        Agent completes -> Dispatch callback with HMAC -> Endpoint posts reply
```

Security: `timestamp.payload` signed with HMAC-SHA256, 5-minute replay window, timing-safe comparison.

### Pattern 3: Start-Early / Wait-Late Parallelism
Split sequential task into non-blocking `start()` at beginning and `wait(timeout)` at end. Main command's execution time becomes free parallelism.

```typescript
// At command start — spawn but don't wait
await startSilentUpgrade(__CLI_VERSION__);
// ... command execution (30+ seconds) ...
// At command end — now wait with timeout
await waitForSilentUpgrade();
```

### Pattern 4: Reference-Driven Secret Resolution
Scan config for explicit `${{ secrets.* }}` references first, then resolve only those from available sources with clear precedence (user > platform > connector). Prevents unintended credential leakage.

---

## Part 3: Testing Principles (10 from 6 PRs)

### 1. Test at Entry Points Only
API routes (`GET`, `POST`, `PUT` handlers), CLI commands (`command.parseAsync()`), server actions. **Never** test internal service functions directly.

### 2. Mock Only External Dependencies
`vi.mock("@slack/web-api")`, `vi.mock("@clerk/nextjs/server")`. If a mock path starts with `../../`, it is wrong.

### 3. No HTTP Leaks
Set `onUnhandledRequest: "error"` on the global MSW server. Every external HTTP call must be explicitly handled. Unintercepted = test failure.

### 4. Single Global MSW Server
No local `setupServer()` in test files. Register handlers via `server.use(...)` in `beforeEach`. Global server handles lifecycle in `setup.ts`.

### 5. Fixtures Through Real API Flows
BDD-style `given*` helpers that call actual route handlers with mocked external services. Catches integration bugs (schema changes, validation) automatically.

```typescript
// Good: calls real OAuth callback route
const workspace = await givenSlackWorkspaceInstalled();
// Bad: direct DB insert bypassing validation
await db.insert(slackInstallations).values({...});
```

### 6. Module-Level Mocks for SDK Clients
For SDK clients like `@slack/web-api`, mock the module to return a singleton. Simpler and faster than intercepting HTTP via MSW. Assert on mock calls with typed objects.

### 7. Enforce Test Architecture via Lint Rules
Signal tests vs view tests have different rendering requirements. Encode as ESLint rules, not review conventions.

### 8. CLI Testing Pattern
- Entry point: `command.parseAsync(["node", "cli", ...args])`
- External APIs: MSW
- Subprocess orchestration: mock `spawn`, verify argument arrays
- Output: `vi.spyOn(process, "exit")` and `vi.spyOn(console, "log")`
- File operations: real filesystem with temp directories

### 9. Delete Unit Tests When Integration Tests Exist
If route-level integration tests exercise the same code paths, internal unit tests are redundant and create coupling to implementation details.

### 10. Use `uniqueId()` for Test Isolation
Never `Date.now()`. Use project's `uniqueId("prefix")` for deterministic, collision-free test data.

---

## Part 4: Process Lessons (10 from 3 PR Series)

### Series Analyzed
1. **e7h4n CI Series** (#2851 -> #2856 -> #2862): 3 PRs in 61 minutes, restructuring CI pipeline
2. **lancy Connector Series** (#2570 -> #2582 -> #2584 -> #2599 -> #2602): 5 PRs over 14 hours
3. **lancy CLI Design Guideline** (#2605): Documentation consolidation, net -488 lines

### Lesson 1: One Concern per PR, Not One Task per PR
e7h4n had 4 tasks in issue #2849. He created 3 PRs by **concern**: structure (#2851), publishing model (#2856), performance (#2862). Each can be understood, reviewed, tested, and rolled back independently.

### Lesson 2: File an Issue Before Coding, Even for Discovered Bugs
Every PR in the connector series closes a numbered issue. When lancy discovered connector secrets weren't being injected, she filed #2583 with root cause analysis and comparison table before fixing.

### Lesson 3: Issues Should Contain Enough Detail That the PR Is Predictable
Issue #2565 specified: exact output format, table columns, error behavior, file paths to create/modify, which backend APIs exist. The PR had no surprises.

### Lesson 4: Ship the Simplest Correct Thing, Then Iterate
PR #2584 used unconditional auto-injection. PR #2599 refined to explicit-reference-only injection 11 hours later. Don't design the perfect solution upfront.

### Lesson 5: Start at the User-Visible Surface, Work Inward
Connector series: CLI commands first (#2570, #2582) -> backend injection (#2584). Starting at the surface: (a) delivers user value immediately, (b) exercises the system end-to-end revealing integration gaps, (c) keeps each PR's scope narrow.

### Lesson 6: PR Descriptions Should Explain the Change Model
The best PRs include Before/After tables or "What Changed" sections explaining the behavioral shift. A reviewer can evaluate the design decision without reading the diff.

### Lesson 7: Rapid Sequential Merges Are Fine When Each PR Is Clean
3 PRs in 61 minutes (e7h4n), 2 PRs 53 minutes apart (lancy). Natural result of small, independently correct pieces. Key constraint: each PR lands on stable main before the next builds on it.

### Lesson 8: Consolidation PRs Are Valuable Maintenance
PR #2605 added zero features but reduced documentation from 6+1 files to 1+1 files (net -488 lines). Scattered knowledge is a liability.

### Lesson 9: Follow Existing Patterns Religiously
PR #2570 created `domains/connectors.ts` "following the established pattern from `secrets.ts` and `model-providers.ts`." When the codebase has a convention, follow it exactly.

### Lesson 10: Test Plans Are Checklists, Not Prose
Every PR has a "Test plan" with checkboxes — concrete, verifiable assertions. Many include checked boxes indicating author verified each item.

---

## Quick Reference Card

### Before Writing Code
- [ ] File an issue with enough detail that the PR is predictable
- [ ] Search for existing patterns in the codebase
- [ ] Decompose by concern, not by task

### While Writing Code
- [ ] Test at entry points (routes, CLI commands), not internal functions
- [ ] Mock only external dependencies (package names, never `../../`)
- [ ] Derive state from existing sources instead of parallel state
- [ ] Delete what can be computed at read time

### Before Submitting PR
- [ ] One concern per PR
- [ ] PR description explains the change model (Before/After)
- [ ] Test plan with checkboxes
- [ ] Net negative lines when possible
- [ ] Lint rule to prevent regression (for architectural changes)

### After PR Merged
- [ ] Iterate based on real-world usage
- [ ] File issues for discovered problems with root cause analysis
