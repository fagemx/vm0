# Log Detail Polling — Incremental Implementation Plan

> Context: PR #2716 (auto-refresh log detail), Issue #2730 / PR #2746 (signal rewrite), e7h4n comment on polling approaches
>
> **Decision: Incremental (Approach 2)** — e7h4n's choice: "I think incremental would be better"

## Current Architecture (verified on main, post #2746 + #2773 merge)

### File: `log-detail-signals.ts`

```typescript
// Pure async computed — re-evaluates when currentLogId$ changes
export const runDetail$ = computed(async (get) => {
  const logId = get(currentLogId$);
  if (!logId) return null;
  // fetch /api/platform/logs/${logId}
});

// Pure async computed — while-loop fetches ALL pages
export const runEvents$ = computed(async (get, { signal }) => {
  const logId = get(currentLogId$);
  if (!logId) return [] as AgentEvent[];
  // while (hasMore) { fetch page, append, update since }
});

// Artifact download (unchanged by our work)
export const downloadArtifact$ = command(...);
```

### File: `log-detail-state.ts`

```typescript
export const currentLogId$ = computed((get) => {
  const params = get(pathParams$);
  return params?.id ?? null;
});
```

### File: `log-detail-page.ts`

```typescript
export const setupLogDetailPage$ = command(({ set }) => {
  set(updatePage$, createElement(LogDetailPage));
  set(setLogDetailSearchTerm$, "");
});
```

### React usage

```
agent-events-card.tsx:32  → useLoadable(runEvents$)
log-detail-content.tsx:49 → useLoadable(runDetail$)
```

### Key facts
- API: `/api/agent/runs/${runId}/telemetry/agent?limit=30&order=asc&since=${ms}`
- `since` filter is **exclusive** (`_time > datetime(...)`, verified `route.ts:76`)
- Response: `{ events: AgentEvent[], hasMore: boolean, framework: string }`
- Events ordered by `sequenceNumber ASC`
- `useLastLoadable` available in ccstate-react v5 but not currently used

---

## Design: Incremental Polling with Computed-per-Page

### Core Idea

Each "page" of events is a stable `Computed` created via factory, closing over its fetch parameters. Once created, a page computed never re-fetches — ccstate caches its resolved value forever. Polling creates new page computeds for only the new events.

### Signal Graph (target)

```
currentLogId$ (from log-detail-state.ts, unchanged)
    ↓
runDetail$ (async computed + detailReloadTick$ dependency)  ← re-fetches on tick
    ↓
pagedEvents$ : State<Computed<Promise<PageResult>>[]>       ← grows on poll
    ↓ (flattened)
allEvents$   : Computed<Promise<AgentEvent[]>>              ← React reads this
    ↓
setupPolling$ : command — interval that checks for new events, appends page computeds
```

### Type Signatures

```typescript
interface PageResult {
  events: AgentEvent[];
  hasMore: boolean;
}

// Factory: creates one immutable computed per page fetch
function createEventPageComputed(
  runId: string,
  since?: string,
): Computed<Promise<PageResult>>

// Mutable state: list of page computeds for current logId
const pagedEvents$ = state<Computed<Promise<PageResult>>[]>([]);

// Derived: flatten all pages into single event array
export const allEvents$ = computed(async (get) => {
  const pages = get(pagedEvents$);
  const results = await Promise.all(pages.map(p => get(p)));
  return results.flatMap(r => r.events);
});
```

---

## Implementation Steps

### Step 1: Event Page Factory

```typescript
const AGENT_EVENTS_PAGE_LIMIT = 30; // already exists

function createEventPageComputed(
  runId: string,
  since?: string,
): Computed<Promise<PageResult>> {
  return computed(async (get) => {
    const fetchFn = get(fetch$);
    const params = new URLSearchParams({
      limit: String(AGENT_EVENTS_PAGE_LIMIT),
      order: "asc",
    });
    if (since) {
      params.set("since", String(new Date(since).getTime()));
    }
    const response = await fetchFn(
      `/api/agent/runs/${runId}/telemetry/agent?${params.toString()}`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch agent events: ${response.statusText}`);
    }
    const data = (await response.json()) as AgentEventsResponse;
    return { events: data.events, hasMore: data.hasMore };
  });
}
```

Once created, this computed is **immutable** — ccstate caches its resolved value forever (only depends on `fetch$` which is stable). Old pages are never re-fetched.

### Step 2: Replace `runEvents$` with paged approach

Delete the existing `runEvents$` (while-loop). Replace with:

```typescript
const pagedEvents$ = state<Computed<Promise<PageResult>>[]>([]);

export const allEvents$ = computed(async (get) => {
  const pages = get(pagedEvents$);
  if (pages.length === 0) return [] as AgentEvent[];
  const results = await Promise.all(pages.map(p => get(p)));
  return results.flatMap(r => r.events);
});
```

### Step 3: Add `detailReloadTick$` to `runDetail$`

```typescript
const detailReloadTick$ = state(0);

export const runDetail$ = computed(async (get) => {
  get(detailReloadTick$);  // re-fetch when ticked
  const logId = get(currentLogId$);
  if (!logId) return null;
  const fetchFn = get(fetch$);
  const response = await fetchFn(`/api/platform/logs/${logId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch log detail: ${response.statusText}`);
  }
  return (await response.json()) as LogDetail;
});
```

### Step 4: Poll command

```typescript
const pollNewEvents$ = command(async ({ get, set }, runId: string) => {
  const pages = get(pagedEvents$);
  if (pages.length === 0) return;

  const lastPage = await get(pages[pages.length - 1]);
  if (lastPage.events.length === 0) return;

  const lastEvent = lastPage.events[lastPage.events.length - 1];
  const newPage = createEventPageComputed(runId, lastEvent.createdAt);
  const newPageResult = await get(newPage);

  if (newPageResult.events.length > 0) {
    set(pagedEvents$, (prev) => [...prev, newPage]);
  }
});
```

### Step 5: Setup polling with lifecycle

```typescript
const POLL_INTERVAL = 3000;
const MAX_INTERVAL = 30000;

const TERMINAL_STATUSES = ["completed", "failed", "timeout", "cancelled"];

export const setupEventPolling$ = command(async ({ get, set }, signal: AbortSignal) => {
  const logId = get(currentLogId$);
  if (!logId) return;

  // Phase 1: Eager initial load — fetch all existing pages
  const firstPage = createEventPageComputed(logId);
  set(pagedEvents$, [firstPage]);

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

  // Phase 2: Check if already terminal — skip polling
  const detail = await get(runDetail$);
  if (detail && TERMINAL_STATUSES.includes(detail.status)) return;

  // Phase 3: Polling loop
  let polling = false;
  let errorCount = 0;

  const scheduleNext = () => {
    if (signal.aborted) return;
    const interval = Math.min(POLL_INTERVAL * 2 ** errorCount, MAX_INTERVAL);
    const timerId = setTimeout(tick, interval);
    signal.addEventListener("abort", () => clearTimeout(timerId), { once: true });
  };

  const tick = async () => {
    if (polling || signal.aborted) return;
    polling = true;
    try {
      // Re-fetch detail to check terminal status
      set(detailReloadTick$, (x) => x + 1);
      const currentDetail = await get(runDetail$);
      if (currentDetail && TERMINAL_STATUSES.includes(currentDetail.status)) {
        return; // stop polling
      }

      await set(pollNewEvents$, logId);
      errorCount = 0;
    } catch {
      errorCount++;
    } finally {
      polling = false;
      scheduleNext();
    }
  };

  scheduleNext();
});
```

Note: using `setTimeout` chain instead of `setInterval` — this naturally handles backoff by computing interval before each tick.

### Step 6: Update `setupLogDetailPage$`

```typescript
export const setupLogDetailPage$ = command(({ get, set }, signal: AbortSignal) => {
  set(updatePage$, createElement(LogDetailPage));
  set(setLogDetailSearchTerm$, "");

  // Reset polling state
  set(pagedEvents$, []);
  set(detailReloadTick$, 0);

  // Start polling (includes eager initial load)
  set(setupEventPolling$, signal);
});
```

### Step 7: Update React components

**`agent-events-card.tsx`**:
```diff
- import { runEvents$ } from "../../../../signals/logs-page/log-detail-signals.ts";
+ import { allEvents$ } from "../../../../signals/logs-page/log-detail-signals.ts";

- const eventsLoadable = useLoadable(runEvents$);
+ const eventsLoadable = useLastLoadable(allEvents$);
```

**`log-detail-content.tsx`**:
```diff
- const loadable = useLoadable(runDetail$);
+ const loadable = useLastLoadable(runDetail$);
```

Both need `useLastLoadable` from `ccstate-react` import to prevent loading flicker between polls.

---

## Deletion Checklist

| What | Where | Why |
|------|-------|-----|
| `runEvents$` (while-loop computed) | `log-detail-signals.ts:36-82` | Replaced by `allEvents$` + `pagedEvents$` |

That's it. `runDetail$` is modified (not deleted). Everything else is additions.

---

## Test Cases

| Test | What to verify |
|------|---------------|
| Initial load fetches all pages | Given API returns hasMore=true for first page, verify allEvents$ contains events from all pages |
| Poll tick appends new events | After initial load, simulate new events arriving, verify allEvents$ grows |
| Empty poll is no-op | Poll when no new events → pagedEvents$ length unchanged |
| Terminal status stops polling | Set detail status to "completed" → verify no more API calls |
| LogId change resets state | Switch logId → pagedEvents$ resets to [], new pages loaded |
| Error backoff | Simulate API error → verify next poll interval doubles |
| Signal abort cleanup | Abort signal → polling stops, no timers leak |

Testing approach: Mock `fetch$` signal to control API responses. Use ccstate store directly (not React) for signal-level tests.

---

## Files to Modify

| File | Change |
|------|--------|
| `log-detail-signals.ts` | Delete `runEvents$`. Add `detailReloadTick$`, `pagedEvents$`, `allEvents$`, `createEventPageComputed()`, `pollNewEvents$`, `setupEventPolling$`. Modify `runDetail$` to depend on `detailReloadTick$`. |
| `log-detail-page.ts` | Add `signal` param, reset states, call `setupEventPolling$` |
| `agent-events-card.tsx` | `useLoadable(runEvents$)` → `useLastLoadable(allEvents$)` |
| `log-detail-content.tsx` | `useLoadable(runDetail$)` → `useLastLoadable(runDetail$)` |
| `types.ts` | No changes needed |

**Estimated scope:** ~120 lines of signal logic + ~10 lines of React changes

---

## Sequence Diagram

```
User opens log detail page
    │
    ├─ setupLogDetailPage$ fires (with AbortSignal from route)
    │   ├─ render LogDetailPage
    │   ├─ reset pagedEvents$ = [], detailReloadTick$ = 0
    │   ├─ setupEventPolling$ starts
    │   │   ├─ Phase 1: Eager load
    │   │   │   ├─ createEventPageComputed(logId)         → page 0 (events 1-30)
    │   │   │   ├─ hasMore? → createEventPageComputed(logId, since=last.createdAt) → page 1
    │   │   │   └─ hasMore=false → done
    │   │   │
    │   │   ├─ Phase 2: Check terminal → not terminal, start polling
    │   │   │
    │   │   └─ Phase 3: setTimeout chain (3s default, backoff on error)
    │   │       ├─ detailReloadTick$++ → runDetail$ re-fetches
    │   │       ├─ Terminal? → stop (no more setTimeout)
    │   │       └─ pollNewEvents$ → 1 API call
    │   │           ├─ 0 new events → no-op, schedule next
    │   │           └─ N new events → append 1 page computed, schedule next
    │   │
    │   └─ signal.abort (route change) → clearTimeout, stop
    │
    └─ React: useLastLoadable(allEvents$) renders events, no flicker
```

---

## Resolved Questions

1. **`since` filter is exclusive (`>`)** — Verified in `route.ts:76`: `` `| where _time > datetime(...)` ``. No client-side dedup needed.
2. **Initial load: eager** — Consistent with current `runEvents$` behavior (while-loop loads all).
3. **Detail re-fetch: `detailReloadTick$`** — Minimal change to existing `runDetail$`. Only adds one `get(detailReloadTick$)` line.

---

## Decision Record

| Date | Decision | By |
|------|----------|------|
| 2026-02-09 | Start with Approach 1 (reload signal) | Our recommendation |
| 2026-02-09 | Use Approach 2 (incremental) | e7h4n's decision |
| 2026-02-11 | Verified architecture against main (post #2746, #2773) | Codebase audit |

---

*Sources: PR #2716, #2746, #2773, Issue #2730, e7h4n comment on polling approaches, ccstate-react v5 (useLastLoadable), log-detail-signals.ts on main*
