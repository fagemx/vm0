# Research-to-Contribution Methodology

## Goal
Use an existing issue as an entry point to understand the codebase and identify high-value incidental findings that can be shipped as independent contributions.

## Core Principle
Treat the issue as a **research anchor**, not a mandatory implementation target.

## Workflow
1. Frame the anchor issue.
2. Build an evidence ledger (`file:line` for every key conclusion).
3. Trace adjacent paths (same route/service/schema/cron/tests).
4. Extract incidental findings from that path only.
5. Score findings and pick one for a small PR.
6. Produce handoff-ready notes for execution agents.

## Hard Gates
1. No conclusion without code evidence.
2. No broad exploration until anchor path is mapped end-to-end.
3. No mixed-scope PRs (anchor and incidental changes must stay separate).

## Incidental Finding Scorecard
Rate each item as `high/medium/low`:
- `Impact`: correctness, reliability, observability, or performance.
- `Scope`: can it be fixed in 1-3 files?
- `Risk`: likelihood of regression.
- `Testability`: can we add/adjust integration tests?
- `OwnershipConflict`: likely overlap with assigned core work.

Recommended selection rule:
- Prefer `high Impact`, `high Testability`, `low OwnershipConflict`.

## PR Strategy
1. Open a focused PR only for the incidental finding.
2. Keep change surface minimal and explicit.
3. Add regression tests that fail before and pass after.
4. Include a short evidence summary in PR description.

## Case Folder Convention
Each case lives under:
- `docs/開發測試/研究/案例/issue-<id>/`

Minimum file:
- `README.md` (use the case template).

Optional files:
- `evidence.md`
- `options.md`
- `handoff.md`

## Done Criteria
- Anchor issue is understood with evidence.
- At least one incidental finding is scored.
- One recommended contribution is clearly defined with PR shape and tests.
