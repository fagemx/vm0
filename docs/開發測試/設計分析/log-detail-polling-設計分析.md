# Log Detail Polling Design Analysis

> Context: PR #2716 (auto-refresh log detail), Issue #2730 / PR #2746 (signal rewrite), e7h4n comment on polling approaches

## Current Architecture (post #2746)

```
currentLogId$ (state)
    ↓
logDetail$ (async computed) → /api/platform/logs/:id
allEvents$ (async computed) → while loop fetches all event pages
    ↓
React: useLoadable(logDetail$), useLoadable(allEvents$)
```

Pure computed, no mutable state. `allEvents$` re-evaluates automatically when `currentLogId$` changes.

---

## Three Approaches

### Approach 1: Reload Signal (full re-fetch)

```typescript
const reloadTick$ = state(0);

const logDetail$ = computed(async (get) => {
  get(reloadTick$);
  const logId = get(currentLogId$);
  if (!logId) return null;
  // ... fetch detail
});

const allEvents$ = computed(async (get, { signal }) => {
  get(reloadTick$);
  const logId = get(currentLogId$);
  if (!logId) return [];
  // ... while loop fetch all pages
});

const setupPolling$ = command(({ get, set }, signal: AbortSignal) => {
  const timer = setInterval(() => {
    set(reloadTick$, (x) => x + 1);
  }, 3000);
  signal.addEventListener("abort", () => clearInterval(timer));
});
```

React uses `useLastLoadable` instead of `useLoadable` to avoid loading flicker between polls.

| Pros | Cons |
|------|------|
| Minimal — one state + one command | Re-fetches ALL events every tick |
| Pure computed, no mutable accumulated state | N pages = N API calls per tick |
| `useLastLoadable` retains old data, no flicker | Wasteful for long runs (1000+ events) |
| logId change auto-cleans, no leak | — |
| No dedup needed | — |

### Approach 2: Computed with Arguments (incremental)

Each page is a stable computed created via factory. Polling adds new page computeds.

Type signature: `pagedEvents$: State<Computed<Promise<AgentEvent[]>>[]>`

| Pros | Cons |
|------|------|
| 1 API call per tick (only new events) | `Computed<Computed<Promise<Event[]>>[]>` hard to reason about |
| Old pages cached, zero re-fetching | Mutable state for page list management |
| Bandwidth efficient at scale | Manual cleanup on logId change |
| — | Initial load becomes a command, not pure computed |
| — | Complex error handling (what if one page fails?) |

### Approach 3: Hybrid (pure computed initial + incremental polling state)

Initial load stays as pure computed. Polling appends to a separate `polledEvents$` state. `allEvents$` merges both.

| Pros | Cons |
|------|------|
| Initial load stays pure computed | Introduces mutable state (`polledEvents$`) |
| Polling is incremental | Manual reset on logId change |
| Simpler than Approach 2 | Mixes computed + state in `allEvents$` |

---

## Comparison Matrix

| Dimension | 1: Reload | 2: Computed/Args | 3: Hybrid |
|-----------|-----------|-----------------|-----------|
| Complexity | Very low | High | Medium |
| Purity | Pure computed | Needs mutable state | Needs mutable state |
| API calls/tick | N (all pages) | 1 (new only) | 1 (new only) |
| Small event count | Great | Over-engineered | Fine |
| Large event count | Wasteful | Great | Great |
| ccstate philosophy | Aligned | Mixed | Mixed |
| Error handling | Simple | Complex | Medium |
| logId switch cleanup | Automatic | Manual | Manual |

---

## Risk Points

### 1. Overlapping polls

If the previous fetch hasn't returned and the next interval fires, you get concurrent requests — wasted bandwidth and potential race conditions.

**Mitigation:** In-flight guard. Skip the tick if the previous poll is still pending.

```typescript
let polling = false;
const timer = setInterval(async () => {
  if (polling) return;  // single-flight lock
  polling = true;
  try {
    set(reloadTick$, (x) => x + 1);
    // await settle if needed
  } finally {
    polling = false;
  }
}, 3000);
```

### 2. Dedup / ordering

Even with full re-fetch, need to confirm events are sorted by `sequenceNumber` and that React doesn't duplicate renders. With Approach 1 this is naturally handled — each re-fetch replaces the entire array. But ensure the API always returns events in deterministic order (not just by `createdAt` which can have identical timestamps).

**Mitigation:** API uses `ORDER BY sequenceNumber ASC`. Already the case in current implementation.

### 3. Stop condition

Run transitions to terminal status (completed/failed/timeout/cancelled) — polling must stop reliably to avoid unnecessary requests.

**Mitigation:** Each tick checks `logDetail$` status before bumping `reloadTick$`. But since `logDetail$` is async computed, the check must await the previous resolve. Combine with the in-flight guard:

```typescript
const timer = setInterval(async () => {
  if (polling) return;
  polling = true;
  try {
    const detail = await store.get(logDetail$);
    if (detail && isTerminalStatus(detail.status)) {
      clearInterval(timer);
      return;
    }
    set(reloadTick$, (x) => x + 1);
  } finally {
    polling = false;
  }
}, 3000);
```

### 4. Error backoff

Fixed 3s interval with continuous failures hammers the API. Network blips or server errors need exponential backoff.

**Mitigation:** Track consecutive error count, increase interval:

```typescript
let errorCount = 0;
const BASE_INTERVAL = 3000;
const MAX_INTERVAL = 30000;

// After each tick:
// - Success: errorCount = 0
// - Error: errorCount++, next interval = min(BASE * 2^errorCount, MAX)
```

### 5. Page count growth risk

Currently acceptable (10-200 events = 1-7 pages), but if agent runs grow longer, full re-fetch becomes expensive.

**Mitigation:** Observability. Log per-poll metrics (page count, total fetch duration). Set threshold: if avg pages/tick > 5 or p95 poll duration > 1s, evaluate switching to Approach 3.

---

## Decision

### Short-term: Approach 1 with two guardrails

1. **Single-flight lock** — skip tick if previous poll still in-flight
2. **Basic backoff** — increase interval on consecutive errors (3s → 6s → 12s → max 30s)

### Mid-term: observation threshold

If avg pages/tick > 5 or p95 poll duration > 1s, evaluate Approach 3 (hybrid incremental).

### Not now: Approach 2

Mental overhead and error surface too large. Over-engineered for current needs.

### One-liner

Start with Approach 1 (reload signal) for simplicity and ccstate purity, but add "no overlapping polls + error backoff" guardrails. Upgrade to incremental if metrics prove it necessary.

---

## Open item

e7h4n hasn't decided yet (his comment: "still not very certain"). Need to discuss with him before implementation. Key question: does he accept full re-fetch cost, or insist on incremental from the start?

---

*Sources: PR #2716, #2746, #2773, Issue #2730, e7h4n comment on polling approaches, ccstate docs (computed with arguments, useLastLoadable)*
