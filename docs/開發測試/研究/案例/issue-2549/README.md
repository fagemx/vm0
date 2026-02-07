# Issue #2549 Research Notes (2026-02-07)

## Context
- Anchor issue: https://github.com/vm0-ai/vm0/issues/2549
- Snapshot: open, unassigned (checked on 2026-02-07)
- Issue summary: some `tool_use_result` entries are shown as `unknown` in platform logs.
- Constraint: research only, no product code changes in this branch.

## Anchor Understanding
- Tool result linking happens in platform-side event grouping (`groupEventsIntoMessages`).
- If a `tool_result` cannot find a matching pending `tool_use` by `tool_use_id`, code creates an orphan tool operation with name `"Unknown"`.
- Event stream order is critical for correct linking. Current API query orders by `_time`, while frontend grouping consumes returned order directly.
- This creates a plausible mismatch path when event order is unstable at same timestamp granularity or otherwise reordered.

## Evidence Ledger
- API query orders by `_time` and returns `sequenceNumber` in payload:
  - `turbo/apps/web/app/api/agent/runs/[id]/telemetry/agent/route.ts:81`
  - `turbo/apps/web/app/api/agent/runs/[id]/telemetry/agent/route.ts:107`
- Frontend requests ascending order but still by time-based ordering:
  - `turbo/apps/platform/src/signals/logs-page/logs-signals.ts:164`
- Grouping function processes events in incoming array order:
  - `turbo/apps/platform/src/views/logs-page/log-detail/utils.ts:642`
- Tool result linking only succeeds when `tool_use_id` matches an existing pending operation:
  - `turbo/apps/platform/src/views/logs-page/log-detail/utils.ts:409`
  - `turbo/apps/platform/src/views/logs-page/log-detail/utils.ts:413`
- Unmatched tool result is rendered as orphan with tool name `"Unknown"`:
  - `turbo/apps/platform/src/views/logs-page/log-detail/utils.ts:424`
  - `turbo/apps/platform/src/views/logs-page/log-detail/utils.ts:432`
- UI shows the tool name directly from `ToolSummary`:
  - `turbo/apps/platform/src/views/logs-page/components/tool-summary.tsx:65`
- Existing test covers orphan result content but does not assert user-facing label expectations:
  - `turbo/apps/platform/src/views/logs-page/log-detail/__tests__/utils.test.ts:518`
  - `turbo/apps/platform/src/views/logs-page/log-detail/__tests__/utils.test.ts:540`

## Incidental Findings
1. Stable ordering gap between telemetry source and UI grouping.
   - Evidence:
     - API ordering is `_time`-based while `sequenceNumber` exists in payload.
     - `turbo/apps/web/app/api/agent/runs/[id]/telemetry/agent/route.ts:81`
     - `turbo/apps/web/app/api/agent/runs/[id]/telemetry/agent/route.ts:107`
   - Why it matters:
     - Any out-of-order pair (`tool_result` before `tool_use`) falls into orphan branch and surfaces as `Unknown`.
2. Non-deterministic fallback IDs (`Math.random`) in fallback paths.
   - Evidence:
     - Missing tool-use ID fallback: `turbo/apps/platform/src/views/logs-page/log-detail/utils.ts:382`
     - Orphan fallback ID: `turbo/apps/platform/src/views/logs-page/log-detail/utils.ts:431`
   - Why it matters:
     - Makes debugging and deterministic test assertions harder in edge paths.

## Contribution Suitability
- Finding A (stabilize ordering before grouping + regression test):
  - Impact: high (directly addresses user-visible `Unknown` regression vector).
  - Scope: low to medium (1-3 files).
  - Risk: low (ordering normalization + tests).
  - Testability: high (deterministic out-of-order fixture).
  - OwnershipConflict: low (currently unassigned).
  - Recommendation: do first.
- Finding B (improve orphan fallback label/behavior):
  - Impact: medium.
  - Scope: low.
  - Risk: low.
  - Testability: high.
  - OwnershipConflict: low.
  - Recommendation: optional follow-up or bundled if UX expectation is explicit.

## Suggested PR Shape
- Target files:
  - `turbo/apps/platform/src/views/logs-page/log-detail/utils.ts`
  - `turbo/apps/platform/src/views/logs-page/log-detail/__tests__/utils.test.ts`
  - (optional) `turbo/apps/web/app/api/agent/runs/[id]/telemetry/agent/route.ts`
- Minimal change plan:
  1. Ensure deterministic event ordering for grouping (prefer `sequenceNumber` precedence).
  2. Add regression test where input events are out of order and verify `tool_result` links to correct tool name (e.g., `Bash`) instead of `Unknown`.
  3. Optionally improve orphan fallback naming/message when matching is impossible.
- Required tests:
  - Out-of-order tool events still produce linked tool operation result.
  - True orphan case remains handled without crash.
- Out of scope:
  - Axiom schema changes.
  - Large logs UI redesign.

## Handoff Notes
- What execution agents should do first:
  1. Reproduce with an intentionally out-of-order fixture in `utils.test.ts`.
  2. Implement ordering normalization in the narrowest layer (grouping input or API output) and re-run tests.
- Open questions:
  - Should ordering normalization be done in backend route, frontend grouping, or both?
  - In unmatched-orphan cases, should label be `"Unknown"` or `"Tool result"`?
- Blocking dependencies:
  - None identified.
