# Issue #2548 Research Notes (2026-02-07)

## Context
- Anchor issue: https://github.com/vm0-ai/vm0/issues/2548
- Snapshot: open, unassigned (checked on 2026-02-07)
- Issue summary: collapse consecutive same-type tool calls in platform logs view.
- Constraint: research only, no product code changes in this branch.

## Anchor Understanding
- Current logs detail flow:
  - Load events from API.
  - Group raw events into `GroupedMessage[]`.
  - Render tool operations one by one inside each assistant card.
- Existing grouping merges consecutive assistant tool-only events into the previous assistant card, but does not collapse repeated tool types into a single expandable group.
- Current UI behavior already detects "same tool as next" only for connector style (dashed), not semantic grouping/collapse.

## Evidence Ledger
- Event rendering pipeline calls grouping helper directly:
  - `turbo/apps/platform/src/views/logs-page/log-detail/components/formatted-events-view.tsx:24`
- Grouped message model keeps a flat `toolOperations[]` list (no "tool group" structure):
  - `turbo/apps/platform/src/views/logs-page/log-detail/utils.ts:46`
  - `turbo/apps/platform/src/views/logs-page/log-detail/utils.ts:67`
- Grouping logic merges tool-only assistant events into previous assistant message, but still appends individual tool operations:
  - `turbo/apps/platform/src/views/logs-page/log-detail/utils.ts:563`
  - `turbo/apps/platform/src/views/logs-page/log-detail/utils.ts:567`
- Renderer iterates and renders every tool operation as an independent `ToolSummary`:
  - `turbo/apps/platform/src/views/logs-page/components/grouped-message-card.tsx:406`
  - `turbo/apps/platform/src/views/logs-page/components/grouped-message-card.tsx:430`
- "Same tool type" is currently used only to choose dashed connector line:
  - `turbo/apps/platform/src/views/logs-page/components/grouped-message-card.tsx:423`
- Existing tests verify merge-into-card behavior but do not implement collapsed same-type groups:
  - `turbo/apps/platform/src/views/logs-page/log-detail/__tests__/utils.test.ts:569`
  - `turbo/apps/platform/src/views/logs-page/log-detail/__tests__/utils.test.ts:620`

## Incidental Findings
1. Missing UI-level regression coverage for collapsed/grouped tool display.
   - Evidence:
     - Existing log detail page tests focus on general rendering and data presence.
     - `turbo/apps/platform/src/views/logs-page/__tests__/log-detail-page.test.tsx:284`
   - Why it matters:
     - New collapse behavior can regress without dedicated assertions (count badge, expand/collapse state, grouped content visibility).
2. Adjacent bug vector in same path: orphan `tool_result` is rendered as `"Unknown"` tool.
   - Evidence:
     - `turbo/apps/platform/src/views/logs-page/log-detail/utils.ts:432`
   - Why it matters:
     - UX confusion in logs is directly related to this issue's readability objective and can overlap with grouping changes.

## Contribution Suitability
- Finding A (implement same-type collapse in logs tool list):
  - Impact: high (direct readability improvement in dense logs).
  - Scope: medium (2-3 files in platform logs detail view).
  - Risk: medium (render behavior + interaction state changes).
  - Testability: high (deterministic fixtures in logs tests).
  - OwnershipConflict: low (currently unassigned).
  - Recommendation: strong candidate.
- Finding B (add UI-level regression tests for grouped/collapsed behavior):
  - Impact: medium.
  - Scope: low.
  - Risk: low.
  - Testability: high.
  - OwnershipConflict: low.
  - Recommendation: do together with Finding A or as immediate follow-up.

## Suggested PR Shape
- Target files:
  - `turbo/apps/platform/src/views/logs-page/components/grouped-message-card.tsx`
  - `turbo/apps/platform/src/views/logs-page/log-detail/utils.ts` (only if helper extraction is needed)
  - `turbo/apps/platform/src/views/logs-page/__tests__/log-detail-page.test.tsx`
  - `turbo/apps/platform/src/views/logs-page/log-detail/__tests__/utils.test.ts`
- Minimal change plan:
  1. Add "consecutive same-type tool operation" grouping at rendering stage (or pre-render helper), preserving original order.
  2. Render summary row with count and collapsible details for each group.
  3. Keep single-call groups unchanged to avoid unnecessary UI churn.
  4. Add regression tests for collapsed groups and expand behavior.
- Required tests:
  - Consecutive same-type operations collapse into one summary with count.
  - Non-consecutive same-type operations remain separate groups.
  - Expanded group reveals original operation list in original order.
- Out of scope:
  - Backend telemetry contract changes.
  - Cross-page logs UI redesign outside log detail event rendering.

## Handoff Notes
- What execution agents should do first:
  1. Start from `GroupedMessageCard` render loop and introduce a local grouping helper for `toolOperations`.
  2. Lock behavior with tests before visual refinements.
- Open questions:
  - Should groups be collapsed by default or expanded when search matches?
  - Should duplicate key params (same file/path repeatedly) be deduplicated or shown verbatim?
- Blocking dependencies:
  - None identified.
