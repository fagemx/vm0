# Lancy: Product Builder Patterns

> Research date: 2026-02-07
> Source: vm0-ai/vm0 GitHub (lancy's PRs, commits, issues)
> Purpose: Extract replicable patterns for AI-as-product-builder
> Status: Phase 1-2 complete, Phase 3-4 planned

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

## Phase 2: PR Evolution (Dec 2025 – Feb 2026)

### Monthly Scale

| Month | Merged PRs | Additions | Deletions | Net LOC | Avg PRs/day |
|-------|-----------|-----------|-----------|---------|-------------|
| Dec 2025 | 142 | +54,803 | -17,785 | +37,018 | ~4.7 |
| Jan 2026 | 265 | +84,162 | -66,964 | +17,198 | ~8.5 |
| Feb 2026 (7 days) | 93 | +34,452 | -11,448 | +23,004 | ~13.3 |

**Key insight**: January had nearly 2x the PRs of December, but only half the net LOC. This means January was the refactoring month — massive churn (84k additions, 67k deletions) that restructured the codebase rather than growing it.

### Work Theme Evolution

**December 2025 — Build-Out Phase**
- S3 direct upload endpoints (+4826/-3076)
- Sandbox telemetry collection (+4154/-28)
- Generic proxy for sandbox requests (+2714/-39)
- Scope/namespace system for resource isolation (+2656/-16)
- ts-rest migration sprint (9 PRs, Pattern 4)
- Theme: **Adding capabilities**. Net +37k lines = system growing fast.

**January 2026 — Runner + Refactoring Phase**
- Runner MVP with Firecracker execution (+5189/-281)
- Sandbox scripts Python → TypeScript migration (+4896/-2663)
- E2E test simplification (+5258/-2566)
- Separate E2B and self-hosted runner paths (+1010/-207)
- Remove defensive try-catch blocks (+123/-165)
- Production deployment with Ansible (+662/-652)
- Theme: **Building runner + cleaning up**. Net only +17k despite 265 PRs = heavy refactoring balanced the additions.

**February 2026 (first week) — Expansion Phase**
- GitHub OAuth connector (+3016/-0)
- Server-side GitHub compose API (+3206/-51)
- Multi-model expansion, agent sharing
- Theme: **Opening the platform**. New integrations and access patterns.

### Evolution Arc

```
Dec: Build capabilities (net +37k) → lots of new code, features expanding
Jan: Build runner + refactor (net +17k) → 2x PRs but half the net growth
Feb: Open platform (net +23k/week) → new integrations
```

**Pattern 7: Refactoring Follows Building**

After a build-out phase (Dec), lancy immediately spends the next month refactoring (Jan). He doesn't let tech debt accumulate. The January numbers prove this: 265 PRs that add 84k lines but also delete 67k = systematic restructuring.

### Testing Patterns

81 out of 500 captured PRs (16.2%) have "test" in the title. But this understates testing — many feature PRs include tests without being labeled as test PRs.

**Notable test work**:
- PR #1533: `refactor(test): simplify e2e tests to focus on happy paths` (+5258/-2566) — this was the 2nd largest PR by additions. A massive test overhaul.
- Testing PRs cluster in January, coinciding with the refactoring phase.

**Pattern 8: Test Refactoring at Scale**

Lancy doesn't just write tests — he periodically refactors the entire test suite. His largest test PR deleted 2,566 lines while adding 5,258. He treats test code with the same rigor as production code.

### Self-Direction Ratio

- **200+ self-created issues** (hit the query limit)
- **~13 assigned by others** (from session summary)
- **Ratio: ~94% self-directed**

This confirms lancy operates almost entirely autonomously. e7h4n provides infrastructure and review, but lancy identifies his own work.

**Pattern 9: Self-Directed Discovery**

Lancy doesn't wait for issues to be assigned. He discovers work by building: each feature reveals the next need. The 200+ self-created issues show a builder who generates his own roadmap through execution.

### Abandoned Work Analysis

29 closed-not-merged PRs out of 500+ total. Breakdown:

| Category | Count | Examples |
|----------|-------|---------|
| CI trigger/baseline tests | ~9 | #1280, #1241, #1151, #1080 |
| Duplicate/superseded | ~6 | #865→#851 (redo), #1053→#1252 (redo) |
| Reverted/rollback | ~3 | #515 (revert release 4.7.0) |
| Actually abandoned features | ~8 | #635 (community edition), #2228 (multi-auth) |
| Debug/investigation | ~3 | #546 (debug logging), #525 (telemetry fix) |

**Actual waste rate: ~8/500 = 1.6%**

The "abandoned" features (#635 community edition, #1067 SNI firewall, #2228 multi-auth) likely represent strategic direction changes, not failures. They were started, evaluated, and deliberately shelved.

**Pattern 10: Low Waste Through Iteration**

1.6% waste rate. Lancy rarely starts something he can't finish. When he does abandon work, it's strategic — trying an approach, learning it's wrong, and moving on. The revert-and-redo pattern (Pattern 2) keeps waste low because he catches problems early.

### The January Spike: What 265 PRs/Month Looks Like

Sample from early January (PRs #851–#939):

```
#851  +5189/-281   feat(runner): implement @vm0/runner MVP
#871  +24/-155     chore: adjust poll interval, remove dead code
#897  +431/-43     feat(cli): setup-github respects git root
#912  +100/-88     refactor: simplify pr-pipeline-monitor
#914  +3/-3        fix(runner): use sudo for cleanup
#918  +123/-165    refactor: remove defensive try-catch blocks
#919  +93/-77      fix(runner): nohup for background execution
#923  +83/-18      fix(runner): connect as user not root
#930  +507/-79     feat(runner): add official runner support
#931  +1010/-207   refactor: separate E2B and runner paths
#935  +662/-652    feat(runner): production deployment with Ansible
#936  +3/-16984    chore: add codereviews to gitignore
#937  +172/-0      feat: add pr-comment command
```

This is the **ship-fix-ship pattern at industrial scale**:
1. Ship big feature (#851 runner MVP, +5189)
2. Immediate fixes (#871, #914, #915, #916, #919, #921, #923, #927)
3. Refactor (#918, #931)
4. Next feature layer (#930 official runners)
5. Deploy (#935)
6. Clean up (#936)

**8.5 PRs per day**, with alternating feature/fix/refactor cadence.

### Top 10 Largest PRs

| # | Lines | Date | Description |
|---|-------|------|-------------|
| 1533 | +5258/-2566 | Jan 23 | refactor(test): simplify e2e tests |
| 851 | +5189/-281 | Jan 5 | feat(runner): runner MVP with Firecracker |
| 1252 | +4896/-2663 | Jan 16 | refactor(core): sandbox scripts Python→TS |
| 595 | +4826/-3076 | Dec 19 | feat(api): direct S3 upload endpoints |
| 1105 | +4243/-1 | Jan 14 | feat(schedule): vm0 schedule command |
| 466 | +4154/-28 | Dec 10 | feat: sandbox telemetry collection |
| 2473 | +3206/-51 | Feb 7 | feat(web): github compose api |
| 2446 | +3016/-0 | Feb 7 | feat(connector): github oauth connector |
| 503 | +2714/-39 | Dec 12 | feat(web): generic proxy for sandbox |
| 636 | +2656/-16 | Dec 20 | feat: scope/namespace system |

3 of the top 10 are **refactoring** (not feature additions). Even the largest PRs often delete nearly as much as they add.

---

## Answers to Phase 2 Questions

### Q1: How did lancy's PRs evolve over 3 months?
- **Size**: Consistent mix of tiny fixes (3-line) and large features (5000+ line)
- **Scope**: Dec = build-out, Jan = runner + refactor, Feb = platform expansion
- **Complexity**: Increased over time. Dec was new features. Jan was cross-cutting refactors. Feb was new integration patterns (OAuth, GitHub).

### Q2: What triggers revert vs iterate?
- Revert when the approach is fundamentally wrong (PR #37 → #43 → #44)
- Iterate when the approach is right but incomplete (the #851 → #871-#939 fix chain)
- Supersede when re-implementation is cleaner (PR #1053 → #1252, Python→TS redo)

### Q3: Testing threshold?
- 16.2% of PRs are test-focused (by title)
- Test refactoring happens at scale (PR #1533, 5258 lines)
- Tests cluster around January's refactoring phase, not December's build-out
- **Inference**: Build fast, test during refactoring phase. Don't test during rapid prototyping.

### Q4: Self-directed vs assigned work ratio?
- **94% self-directed** (200+ self-created issues, ~13 assigned)
- e7h4n provides infrastructure and reviews, not task assignments
- Lancy generates his own roadmap through execution

### Q5: How did patterns change from month 1 to month 3?
- Month 1 (Dec): Build new. Big features, lots of net new code
- Month 2 (Jan): Refactor and expand. 2x the PRs, half the net growth. Runner + test overhaul
- Month 3 (Feb): Open up. New integrations (GitHub, OAuth). Platform maturity

---

## AI Skill Mapping

| # | Lancy Pattern | AI Skill | Status |
|---|--------------|----------|--------|
| 1 | Phase-based delivery | Partially in `/pull-request` (phase splitting) | Partial |
| 2 | Revert-and-redo judgment | **`/course-correct`** | TODO (Phase 4) |
| 3 | Critical path execution | **`/critical-path`** | TODO (Phase 4) |
| 4 | Focused sprint mode | **`/sprint-plan`** | TODO (Phase 4) |
| 5 | Net negative refactoring | In `/commit` (Gate 5: LOC check) | ✅ Done |
| 6 | Ship-fix-ship | Cultural, embedded in all skills | Embedded |
| 7 | Refactoring follows building | In `/issue-scan` (detect build/refactor cycle) | Partial |
| 8 | Test refactoring at scale | **`/test-health`** | TODO (Phase 4) |
| 9 | Self-directed discovery | In `/issue-scan` (proactive scanning) | ✅ Done |
| 10 | Low waste through iteration | In `/course-correct` (early detection) | TODO (Phase 4) |

---

## Research Roadmap

### Phase 1: Early Patterns ✅
- First contributions (week 1)
- 6 core patterns identified

### Phase 2: PR Evolution ✅
- Monthly evolution: 142 → 265 → 93 PRs (Dec → Jan → Feb)
- 4 new patterns identified (7-10): Refactoring follows building, test refactoring at scale, self-directed discovery, low waste through iteration
- All 5 open questions answered
- Key finding: January was the refactoring month (2x PRs, half the net LOC)

### Phase 3: Sprint Extraction
- Map all focused sprints (multi-PR sequences)
- Sequencing rules: how does he order related PRs?
- Upfront planning vs discovered sequence?

### Phase 4: Encode into Skills
- `/sprint-plan` — Plan a focused multi-PR sprint for one mission
- `/critical-path` — Identify and execute the minimum path to "it works"
- `/course-correct` — Detect when to revert and redo vs iterate

---

## Open Questions (for Phase 3)

1. How does lancy decide PR boundaries during a sprint? (needs sprint-level granularity)
2. Does lancy plan sprint sequences upfront or discover them?
3. What's the cadence of feature/fix/refactor within a single sprint?
4. Are there "pivot points" where a sprint changes direction mid-stream?
5. How does the runner sprint (Jan) compare structurally to the ts-rest sprint (Dec)?
