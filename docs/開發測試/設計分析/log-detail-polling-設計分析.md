# Log Detail Polling — Incremental Implementation Plan

> Context: PR #2716 (auto-refresh log detail), Issue #2730 / PR #2746 (signal rewrite), e7h4n comment on polling approaches
>
> **Decision: Incremental (Approach 2)** — e7h4n's choice: "I think incremental would be better"

## Current Architecture (post #2746)

```
getOrCreateLogDetail$(logId)  → Computed<Promise<LogDetail>>
getOrCreateAgentEvents$(runId) → Computed<Promise<AgentEventsResponse>>
  ↓
initAccumulatedEvents$  → sets internalAgentEventsAccumulated$ (state)
loadMoreAgentEvents$    → appends to accumulated state via `since` param
  ↓
React: useLoadable(detail$), agentEventsAccumulated$ for display
```

Key facts:
- API endpoint: `/api/agent/runs/${runId}/telemetry/agent?limit=30&order=asc&since=${ms}`
- `since` param filters events after given timestamp (ms)
- Response: `{ events: AgentEvent[], hasMore: boolean, framework: string }`
- Events ordered by `sequenceNumber ASC` (deterministic)
- `AgentEvent` has: `sequenceNumber`, `eventType`, `eventData`, `createdAt`

---

## Design: Incremental Polling with Computed-per-Page

### Core Idea

Each "page" of events is a stable `Computed` created via factory, closing over its fetch parameters. Once created, a page computed never re-fetches — its result is permanently cached by ccstate. Polling creates new page computeds for only the new events.

### Signal Graph

```
currentLogId$ (from log-detail-state.ts)
    ↓
pagedEvents$ : State<Computed<Promise<AgentEvent[]>>[]>
    ↓ (flattened)
allEvents$   : Computed<Promise<AgentEvent[]>>   ← React reads this
    ↓
logDetail$   : per-logId computed (already exists via getOrCreateLogDetail$)

setupPolling$ : command — interval that checks for new events, appends page computeds
```

### Type Signatures

```typescript
// Factory: creates one immutable computed per page fetch
function createEventPageComputed(
  runId: string,
  since?: string,     // ISO timestamp of last known event
  limit?: number,
): Computed<Promise<{ events: AgentEvent[]; hasMore: boolean }>>

// Mutable state: list of page computeds for current logId
const pagedEvents$ = state<Computed<Promise<{ events: AgentEvent[]; hasMore: boolean }>>[]>([]);

// Derived: flatten all pages into single event array
const allEvents$ = computed(async (get) => {
  const pages = get(pagedEvents$);
  const results = await Promise.all(pages.map(p => get(p)));
  return results.flatMap(r => r.events);
});

// Derived: are there more events to poll?
const hasMoreEvents$ = computed(async (get) => {
  const pages = get(pagedEvents$);
  if (pages.length === 0) return false;
  const lastPage = await get(pages[pages.length - 1]);
  return lastPage.hasMore;
});
```

### Implementation Steps

#### Step 1: Event Page Factory

```typescript
const EVENTS_PAGE_LIMIT = 30;

function createEventPageComputed(
  runId: string,
  since?: string,
): Computed<Promise<{ events: AgentEvent[]; hasMore: boolean }>> {
  return computed(async (get) => {
    const fetchFn = get(fetch$);
    const params = new URLSearchParams({
      limit: String(EVENTS_PAGE_LIMIT),
      order: "asc",
    });
    if (since) {
      params.set("since", String(new Date(since).getTime()));
    }
    const response = await fetchFn(
      `/api/agent/runs/${runId}/telemetry/agent?${params.toString()}`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.statusText}`);
    }
    const data = (await response.json()) as AgentEventsResponse;
    return { events: data.events, hasMore: data.hasMore };
  });
}
```

Once created, this computed is **immutable** — ccstate caches its resolved value forever (no dependencies change). This is the key insight: old pages are never re-fetched.

#### Step 2: Initial Load (command)

```typescript
const initEventPages$ = command(({ get, set }, runId: string) => {
  // Create first page (no `since` param)
  const firstPage = createEventPageComputed(runId);
  set(pagedEvents$, [firstPage]);
});
```

Unlike the current `allEvents$` pure computed (while-loop), initial load is now a command that creates the first page computed. This is a deliberate trade-off: we lose automatic re-evaluation on logId change, but gain incremental polling capability.

**Note:** The first page returns up to 30 events. If `hasMore` is true, we need to load remaining pages eagerly before polling starts. This is done in the setup command (Step 4).

#### Step 3: Poll Tick — Append New Pages

```typescript
const pollNewEvents$ = command(async ({ get, set }, runId: string) => {
  const pages = get(pagedEvents$);
  if (pages.length === 0) return;

  // Resolve the last page to get its last event's timestamp
  const lastPage = await get(pages[pages.length - 1]);
  if (lastPage.events.length === 0) return;

  const lastEvent = lastPage.events[lastPage.events.length - 1];
  const since = lastEvent.createdAt;

  // Create a new page computed for events after `since`
  const newPage = createEventPageComputed(runId, since);
  const newPageResult = await get(newPage);

  // Only append if there are actually new events
  if (newPageResult.events.length > 0) {
    set(pagedEvents$, (prev) => [...prev, newPage]);
  }
});
```

Each poll tick: 1 API call. Old pages untouched.

#### Step 4: Setup Polling (command with AbortSignal)

```typescript
const POLL_INTERVAL = 3000;
const MAX_INTERVAL = 30000;

const setupPolling$ = command(async ({ get, set }, signal: AbortSignal) => {
  const logId = get(currentLogId$);
  if (!logId) return;

  // Phase 1: Eager initial load — fetch all existing pages
  set(initEventPages$, logId);
  let keepLoading = true;
  while (keepLoading && !signal.aborted) {
    const pages = get(pagedEvents$);
    const lastPage = await get(pages[pages.length - 1]);
    if (lastPage.hasMore && lastPage.events.length > 0) {
      const lastEvent = lastPage.events[lastPage.events.length - 1];
      const nextPage = createEventPageComputed(logId, lastEvent.createdAt);
      set(pagedEvents$, (prev) => [...prev, nextPage]);
    } else {
      keepLoading = false;
    }
  }

  // Phase 2: Check if already terminal — skip polling if so
  const detail$ = set(getOrCreateLogDetail$, logId);
  const detail = await get(detail$);
  if (detail && isTerminalStatus(detail.status)) return;

  // Phase 3: Polling loop
  let polling = false;
  let errorCount = 0;
  let interval = POLL_INTERVAL;

  const timer = setInterval(async () => {
    if (polling || signal.aborted) return;
    polling = true;
    try {
      // Re-fetch log detail to check status (detail is NOT cached per-page,
      // so we need a reload mechanism for it — see Step 5)
      const currentDetail = await refetchLogDetail(get, set, logId);
      if (currentDetail && isTerminalStatus(currentDetail.status)) {
        clearInterval(timer);
        return;
      }

      // Fetch new events
      await set(pollNewEvents$, logId);
      errorCount = 0;
      interval = POLL_INTERVAL;
    } catch {
      errorCount++;
      interval = Math.min(POLL_INTERVAL * 2 ** errorCount, MAX_INTERVAL);
      clearInterval(timer);
      // Reschedule with backoff (simplified — real impl uses dynamic timer)
    } finally {
      polling = false;
    }
  }, interval);

  signal.addEventListener("abort", () => clearInterval(timer));
});

function isTerminalStatus(status: string): boolean {
  return ["completed", "failed", "timeout", "cancelled"].includes(status);
}
```

#### Step 5: Log Detail Re-fetch

Log detail (status, timing, etc.) changes during a run. Unlike events (append-only), detail must be **re-fetched** each tick to detect terminal status.

Two options:
- **Option A:** Use a `reloadTick$` signal on `logDetail$` only (not events). Lightweight — 1 extra API call per tick for just the detail endpoint.
- **Option B:** Create a new `logDetail$` computed each tick and replace in cache. But this defeats caching.

**Recommendation: Option A** — add `reloadTick$` to the detail computed only. Events stay incremental.

```typescript
const detailReloadTick$ = state(0);

// Modified detail factory
function createLogDetailComputed(logId: string): Computed<Promise<LogDetail>> {
  return computed(async (get) => {
    get(detailReloadTick$);  // re-fetch when ticked
    const fetchFn = get(fetch$);
    const response = await fetchFn(`/api/platform/logs/${logId}`);
    if (!response.ok) throw new Error(`Failed: ${response.statusText}`);
    return (await response.json()) as LogDetail;
  });
}
```

React uses `useLastLoadable(logDetail$)` to avoid flicker on detail re-fetch.

#### Step 6: LogId Change Cleanup

When user navigates to a different log, we must reset `pagedEvents$`:

```typescript
const setupLogDetailPage$ = command(({ get, set }, signal: AbortSignal) => {
  const logId = get(currentLogId$);

  // Reset page state for new logId
  set(pagedEvents$, []);
  set(detailReloadTick$, 0);

  if (!logId) return;

  // Start polling (includes initial load)
  set(setupPolling$, signal);
});
```

This is a **command**, not a pure computed. The cleanup is explicit, not automatic. This is the trade-off we accept for incremental efficiency.

---

## React Integration

```typescript
// In LogDetailPage component
const allEventsLoadable = useLastLoadable(allEvents$);
const logDetailLoadable = useLastLoadable(logDetail$);

// useLastLoadable keeps showing previous data while new data loads
// No loading flicker between polls
```

Key: `useLastLoadable` (not `useLoadable`) for both detail and events. This prevents the UI from flickering to a loading state on each poll tick.

---

## Risk Points & Mitigations (adapted for incremental)

### 1. Overlapping polls

Same risk as before. The `polling` flag (single-flight lock) prevents concurrent poll ticks.

### 2. Dedup / ordering

With incremental, dedup is critical: if `since` returns events overlapping with the previous page, we get duplicates.

**Mitigation:** The API's `since` parameter is exclusive (events strictly after the timestamp). But if two events share the same `createdAt`, we could miss or duplicate. The API orders by `sequenceNumber ASC`, which is deterministic. The `since` filter works on timestamp, not sequenceNumber.

**Action needed:** Verify the API's `since` filter is exclusive (`> since`, not `>= since`). If inclusive, add client-side dedup by `sequenceNumber`:

```typescript
// In allEvents$ computed, after flatMap:
const seen = new Set<number>();
return allResults.flatMap(r => r.events).filter(e => {
  if (seen.has(e.sequenceNumber)) return false;
  seen.add(e.sequenceNumber);
  return true;
});
```

### 3. Stop condition

Handled by re-fetching `logDetail$` each tick (via `detailReloadTick$`) and checking terminal status before polling new events.

### 4. Error backoff

Same exponential backoff pattern. Consecutive errors increase interval (3s -> 6s -> 12s -> max 30s). Success resets to 3s.

### 5. Empty poll optimization

Most poll ticks return 0 new events (agent is thinking, not emitting). The `pollNewEvents$` command handles this by checking `newPageResult.events.length > 0` before appending. No empty page computeds accumulate.

### 6. Memory — page computed accumulation

Each poll that finds new events creates a new `Computed`. For very long runs (1000+ events, 30+ pages), this means 30+ computeds in memory.

**Assessment:** Acceptable. Each resolved computed holds a small array (30 events). The ccstate garbage collector handles unreferenced computeds. When `pagedEvents$` is reset on logId change, old computeds become unreferenced.

---

## Files to Modify

| File | Change |
|------|--------|
| `logs-signals.ts` | Add `pagedEvents$`, `allEvents$`, `createEventPageComputed()`, `pollNewEvents$`, `setupPolling$`, `detailReloadTick$` |
| `logs-signals.ts` | Modify `createLogDetailComputed()` to depend on `detailReloadTick$` |
| `logs-signals.ts` | Add `setupLogDetailPage$` command for cleanup on logId change |
| `log-detail-page.ts` | Call `setupLogDetailPage$` instead of manual fetch setup |
| React components | Switch from `useLoadable` to `useLastLoadable` for detail + events |
| `types.ts` | No changes needed (AgentEvent, AgentEventsResponse already defined) |

**Estimated scope:** ~150 lines of signal logic + ~20 lines of React wiring

---

## Sequence Diagram

```
User opens log detail page
    │
    ├─ setupLogDetailPage$ fires
    │   ├─ reset pagedEvents$ = []
    │   ├─ setupPolling$ starts
    │   │   ├─ Phase 1: Eager load
    │   │   │   ├─ createEventPageComputed(logId)         → page 0 (events 1-30)
    │   │   │   ├─ hasMore? → createEventPageComputed(logId, since=event30.createdAt) → page 1 (events 31-60)
    │   │   │   └─ hasMore=false → done
    │   │   │
    │   │   ├─ Phase 2: Check terminal → not terminal, start polling
    │   │   │
    │   │   └─ Phase 3: Every 3s
    │   │       ├─ Re-fetch logDetail$ (detailReloadTick$++)
    │   │       ├─ Terminal? → stop
    │   │       └─ pollNewEvents$ → 1 API call
    │   │           ├─ 0 new events → no-op
    │   │           └─ N new events → append 1 new page computed
    │   │
    │   └─ signal.abort → clearInterval
    │
    └─ React: useLastLoadable(allEvents$) renders events, no flicker
```

---

## Open Questions

1. **`since` filter inclusivity** — Need to verify API uses `>` not `>=` on the `since` timestamp. If `>=`, need client-side sequenceNumber dedup.
2. **Initial load: eager vs lazy** — Current plan eagerly loads all pages on mount. Alternative: load first page, show it, then load rest in background. Which UX does e7h4n prefer?
3. **Detail re-fetch approach** — Using `detailReloadTick$` on the detail computed. Alternative: separate `pollingDetail$` state that replaces each tick. The tick approach is simpler but makes the detail computed impure (depends on mutable counter). e7h4n may have opinions on this.

---

## Decision Record

| Date | Decision | By |
|------|----------|------|
| 2026-02-09 | Start with Approach 1 (reload signal) | Our recommendation |
| 2026-02-09 | Use Approach 2 (incremental) | e7h4n's decision |

---

*Sources: PR #2716, #2746, #2773, Issue #2730, e7h4n comment on polling approaches, ccstate docs (computed with arguments, useLastLoadable), logs-signals.ts current implementation*
