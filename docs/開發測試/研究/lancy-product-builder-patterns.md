# Lancy: Product Builder Patterns

> Research date: 2026-02-07
> Source: vm0-ai/vm0 GitHub (lancy's PRs, commits, issues)
> Purpose: Extract replicable patterns for AI-as-product-builder
> Status: Phase 1 complete, Phase 2-4 planned

---

## Overview

Lancy is the #1 contributor to vm0 (663 commits, 38% of total). He joined on day 3 and built the core product: database, API, sandbox execution, CLI, webhooks. He has more commits than the founder.

---

## Pattern 1: Phase-Based Delivery

Even in week 1, explicit phases:
- PR #37: "Phase 1 database schema and API framework"
- PR #46: "Phase 1.5 E2B Service Layer with Hello World"
- PR #58: "Integrate Claude Code execution in E2B sandbox"

Each phase builds on the previous. Each is independently deployable.

## Pattern 2: Revert and Redo

PR #37 merged → reverted (PR #43) → redone with tests (PR #44). Same day.

- Doesn't hesitate to undo his own work
- Quality (tests) matters more than progress
- Reverting is course correction, not failure

## Pattern 3: Critical Path First

Week 1 build order:
1. Database schema (data layer)
2. API framework (interface layer)
3. E2B sandbox integration (execution layer)
4. Webhook API (communication layer)
5. CLI commands (user interface)
6. Event streaming (observability)

**data → API → execution → communication → CLI → monitoring**

He didn't build a perfect CLI first, or write docs first, or design elaborate architecture first. He built the minimum path to "agent runs in sandbox and reports back."

## Pattern 4: Focused Sprints

Dec 9-10, 2025 (one weekend, 9 PRs, one mission: ts-rest migration):

| PR | Change | Target |
|----|--------|--------|
| #453 | +630/-302 | /api/secrets |
| #458 | +740/-350 | /api/agent/composes |
| #463 | +617/-300 | /api/agent/runs |
| #464 | +275/-72 | /api/agent/sessions |
| #465 | +167/-44 | storages contract |
| #466 | +4154/-28 | sandbox telemetry |
| #468 | +1064/-525 | webhooks and auth |
| #469 | +718/-839 | lifecycle events |
| #474 | +616/-357 | images and cron |

Each PR migrates one route group. Systematic, not scattered.

## Pattern 5: Net Negative LOC on Refactoring

PR #469: `+718/-839` (net -121 lines). Refactoring simplifies, doesn't complexify.

Current work continues this: PR #2558 `+333/-721`, PR #2538 `+129/-218`.

## Pattern 6: Ship-Fix-Ship

PR #37 (DB schema) → found it needed tests → reverted → reshipped with tests.

Loop: **ship → learn → fix → ship again**. Not: plan → plan → plan → ship.

---

## AI Skill Mapping

| Lancy Pattern | AI Skill | Status |
|--------------|----------|--------|
| Phase-based delivery | Partially in `/pull-request` (phase splitting) | Partial |
| Critical path execution | **`/critical-path`** | TODO (Phase 4) |
| Focused sprint mode | **`/sprint-plan`** | TODO (Phase 4) |
| Revert-and-redo judgment | **`/course-correct`** | TODO (Phase 4) |
| Net negative refactoring | In `/commit` (Gate 5: LOC check) | ✅ Done |
| Ship-fix-ship | Cultural, not a single skill | Embedded |

---

## Research Roadmap

### Phase 1: Early Patterns ✅ (this document)
- First contributions (week 1)
- 6 core patterns identified

### Phase 2: PR Evolution (next)
- How lancy's PRs evolved over 3 months (size, scope, complexity)
- What triggers revert vs iterate?
- Testing threshold: when does he add tests vs skip?
- Self-directed vs e7h4n-assigned work ratio

### Phase 3: Sprint Extraction
- Map all focused sprints (multi-PR sequences)
- Sequencing rules: how does he order related PRs?
- Upfront planning vs discovered sequence?

### Phase 4: Encode into Skills
- `/sprint-plan` — Plan a focused multi-PR sprint for one mission
- `/critical-path` — Identify and execute the minimum path to "it works"
- `/course-correct` — Detect when to revert and redo vs iterate

---

## Open Questions

1. How does lancy decide PR boundaries during a sprint?
2. Does lancy plan sprint sequences upfront or discover them?
3. What's his testing threshold? (some PRs have tests, some don't)
4. How does e7h4n → lancy handoff work? (issue-driven or self-directed?)
5. How did his patterns change from month 1 to month 3?
