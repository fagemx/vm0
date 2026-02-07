# VM0 Origin Story & Lancy Pattern Research

> Research date: 2026-02-07
> Source: vm0-ai/vm0 GitHub history (commits, PRs, issues)
> Purpose: Understand how vm0 went from zero to working product, extract lancy's core patterns

---

## Phase 1 Findings: How VM0 Started

### Timeline

| Day | Date | Who | What Happened |
|-----|------|-----|---------------|
| 0 | 2025-11-14 | e7h4n | Created repo from "makita" template (USpark sister project) |
| 0 | 2025-11-14 | e7h4n | Removed template leftovers, set up CI/CD |
| 1 | 2025-11-15 | e7h4n | Docker, devcontainer, HTTPS proxy, Clerk auth, release workflow |
| 1 | 2025-11-15 | e7h4n | 1Password integration, Claude Code configs |
| 3 | 2025-11-17 | **lancy joins** | First PR: domain fix (vm0.dev → vm7.ai) |
| 3 | 2025-11-17 | lancy | DB schema + API framework (PR #37 → reverted → redone with tests #44) |
| 3 | 2025-11-17 | lancy | E2B API key configuration |
| 4 | 2025-11-18 | lancy | E2B sandbox hello world → Claude Code in sandbox → webhook API |
| 4 | 2025-11-18 | e7h4n | Bearer token auth migration |
| 5 | 2025-11-19 | lancy | CLI build/run commands, agent names, event streaming |
| 5 | 2025-11-19 | lancy | GitHub issue workflow automation (slash commands) |
| 6 | 2025-11-20 | lancy | Event streaming for `vm0 run` |
| 6 | 2025-11-20 | e7h4n | CLI E2E tests, code reviews |

**100 PRs in 6 days.** Product was functional by day 5.

### Key Insight: The Division of Labor

```
e7h4n (Tech Lead/Infra):     lancy (Product Builder):
Day 0-2: Template + CI/CD    (not yet joined)
Day 3: Auth, environment      DB schema, API framework
Day 4: Token migration         E2B sandbox, webhooks
Day 5: E2E tests, reviews     CLI, event streaming
Day 6: Code reviews            More features
```

**e7h4n built the stage. lancy performed on it.**

e7h4n set up: CI/CD, Docker, dev environment, auth, release automation.
lancy built: database, API, sandbox execution, CLI, webhooks — the actual product.

### How They Started (Not From Scratch)

1. **Template-based**: Started from "makita" template (USpark project), not from zero
2. **Existing patterns**: CI/CD, Docker, database migration patterns all came from USpark
3. **Claude Code from day 0**: Second commit says "Generated with Claude Code"
4. **Fast iteration**: Lancy reverted PR #37 (DB schema) and redid it as #44 with tests — not afraid to undo and redo properly

---

## Lancy's Core Patterns (Early Phase)

### Pattern 1: Phase-Based Delivery

Even in the first week, lancy used explicit phases:
- PR #37: "Phase 1 database schema and API framework"
- PR #46: "Phase 1.5 E2B Service Layer with Hello World"
- PR #58: "Integrate Claude Code execution in E2B sandbox"

Each phase builds on the previous one. Each is independently deployable.

### Pattern 2: Revert and Redo

PR #37 was merged, then reverted in PR #43, then redone in PR #44 with integration tests.

This shows:
- He doesn't hesitate to undo his own work
- Quality (tests) matters more than progress
- Reverting is not failure — it's course correction

### Pattern 3: Build the Critical Path First

Week 1 order:
1. Database schema (data layer)
2. API framework (interface layer)
3. E2B sandbox integration (execution layer)
4. Webhook API (communication layer)
5. CLI commands (user interface)
6. Event streaming (observability)

This is the exact critical path: **data → API → execution → communication → CLI → monitoring**

He didn't build a perfect CLI first, or write comprehensive docs first, or design an elaborate architecture first. He built the minimum path to "agent runs in sandbox and reports back."

### Pattern 4: Massive Focused Sprints

Dec 9-10, 2025 (one weekend):
- PR #453: Migrate /api/secrets to ts-rest (+630/-302)
- PR #458: Migrate /api/agent/composes (+740/-350)
- PR #463: Migrate /api/agent/runs (+617/-300)
- PR #464: Migrate /api/agent/sessions (+275/-72)
- PR #465: Add storages contract (+167/-44)
- PR #466: Implement sandbox telemetry (+4154/-28)
- PR #468: Migrate webhooks and auth (+1064/-525)
- PR #469: Migrate lifecycle events (+718/-839)
- PR #474: Migrate images and cron (+616/-357)

9 PRs, 2 days, one mission: contract-first migration. Each PR migrates one route group. Systematic, not scattered.

### Pattern 5: Net Negative LOC on Refactoring

Same as observed in current work. PR #469: `+718/-839` (net -121 lines). The refactoring simplified, not complexified.

### Pattern 6: Fix-Ship-Fix, Not Plan-Plan-Plan

He shipped PR #37 (DB schema) → found it needed tests → reverted → reshipped with tests. Total time: same day.

Compare to writing a 30-page spec, getting approval, then implementing. Lancy's loop is: **ship → learn → fix → ship again**.

---

## Contributor Scale

| Contributor | Commits | Role |
|-------------|---------|------|
| lancy | 663 | Product builder (38% of all commits) |
| e7h4n | 431 | Infra/tech lead (25%) |
| github-actions | 333 | Automated releases (19%) |
| seven332 | 118 | Systems/Rust (7%) |
| Lunarivibe | 96 | Frontend/UI (6%) |
| hulh122 | 86 | Platform/Slack (5%) |
| fagemx | 13 | Testing/fixes (<1%) |

**Lancy has more commits than the founder.** He IS the product.

---

## Relevance to SaaStoAI

### What vm0's origin teaches us:

1. **Don't start from zero** — vm0 started from a template with existing CI/CD, auth, and patterns
2. **Two roles are enough** — e7h4n (infra) + lancy (product) built a working product in 5 days
3. **Critical path first** — Database → API → Sandbox → Webhook → CLI, in that order
4. **Ship and fix** — Revert is normal, not failure. Perfect is the enemy of shipped.
5. **Claude Code from day 0** — AI was part of the workflow from the very first commit

### For our AI-as-team model:

| vm0 Role | AI Skill Needed | Status |
|----------|----------------|--------|
| e7h4n (issue creation) | `/issue-scan` | ✅ Done |
| e7h4n (PR review) | `/pr-review` | ✅ Done |
| e7h4n (prioritization) | Integrated in `/pull-request` | ✅ Done |
| lancy (critical path execution) | **TODO** | Phase 2 |
| lancy (phase-based delivery) | Partially in `/pull-request` | Partial |
| lancy (revert-and-redo judgment) | **TODO** | Phase 2 |
| lancy (focused sprint mode) | **TODO** | Phase 2 |

---

## Research Phases (Planned)

### Phase 1: Origin Story ✅ (this document)
- How vm0 started
- Early division of labor
- Lancy's first contributions

### Phase 2: Lancy Deep Dive (next)
- Analyze lancy's PR evolution over 3 months
- How his PRs changed in size, scope, and complexity
- What triggers him to revert vs iterate
- His decision-making on what to build next
- His testing patterns (when does he add tests vs skip?)

### Phase 3: Sprint Pattern Extraction
- Map lancy's focused sprints (like the Dec 9-10 ts-rest migration)
- How does he sequence multiple related PRs?
- Does he plan the sequence upfront or discover it?
- Can this be encoded into an AI skill?

### Phase 4: Encode into Skills
- `/sprint-plan` — AI plans a focused multi-PR sprint
- `/critical-path` — AI identifies and executes the minimum path to "it works"
- `/course-correct` — AI detects when to revert and redo vs iterate

---

## Open Questions

1. Did lancy have prior USpark experience? (his first PR fixed a USpark domain reference)
2. How does lancy decide PR boundaries during a sprint? (scope rules)
3. Does lancy plan his sprints or discover the sequence as he goes?
4. What's lancy's testing threshold? (some PRs have tests, some don't)
5. How does e7h4n → lancy handoff work? (does e7h4n file issues for lancy or does lancy self-direct?)
