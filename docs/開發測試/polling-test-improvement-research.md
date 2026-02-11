# Polling Test Improvement Research

> 來源：PR #2716 e7h4n comment，2026-02-11
> Issue: 現有 polling test 用 100ms interval + 永遠 running 的 status，polling loop 不會自然停止

## e7h4n 的建議

> use a very short polling interval like 0ms, and once MSW receives a request with `since` and returns the result, the run detail will show that the entire run has successfully completed. this should stop the polling and avoid exhausting loop resources.

## 現有測試的問題

```
detail handler → 永遠回 status: "running"
events handler → since 有值時回 "Polled event"
poll interval  → 100ms
```

問題：polling loop 永遠不會自然停止（沒有 terminal status），只能靠 test 結束時 abort signal 或 timeout 來停。
- 浪費資源（loop 一直跑到 test cleanup）
- 需要 15s timeout 以防萬一
- 不測試「polling 正常停止」這個重要行為

## 改進方案

### 核心思路：讓 MSW 有狀態轉換

用 closure 變數追蹤 poll 是否已經回傳過新 events，一旦回傳過，detail handler 就轉成 `completed`：

```typescript
let polledEventServed = false;

server.use(
  http.get("*/api/platform/logs/:id", () => {
    return HttpResponse.json({
      ...baseDetail,
      status: polledEventServed ? "completed" : "running",
      completedAt: polledEventServed ? "2024-01-01T00:00:10Z" : null,
    });
  }),
  http.get("*/api/agent/runs/:id/telemetry/agent", ({ request }) => {
    const url = new URL(request.url);
    const since = url.searchParams.get("since");

    if (!since) {
      return HttpResponse.json({ events: [initialEvent], hasMore: false });
    }

    polledEventServed = true;  // 下次 detail 會回 completed
    return HttpResponse.json({ events: [polledEvent], hasMore: false });
  }),
);
```

### 執行流程

```
Phase 1: Initial load
  → GET /telemetry/agent (no since) → "Initial event"
  → hasMore=false → done

Phase 2: Terminal check
  → GET /logs/:id → status: "running" (polledEventServed=false)
  → 不是 terminal → 進入 polling loop

Phase 3: Poll cycle #1
  → delay(0ms)
  → GET /logs/:id → status: "running" (polledEventServed=false)
  → GET /telemetry/agent?since=... → "Polled event" + polledEventServed=true

Phase 3: Poll cycle #2
  → delay(0ms)
  → GET /logs/:id → status: "completed" (polledEventServed=true)
  → isTerminalStatus("completed") → return ← polling 自然停止！
```

### 為什麼 0ms 不會卡死

之前 0ms/1ms 會卡死是因為 **loop 永遠不停**（status 永遠是 running）。
現在 loop 只跑 2-3 個 cycle 就因為 terminal status 而 `return`，不會耗盡 event loop。

### 測試的驗證點

1. "Initial event" 出現在 DOM
2. "Polled event" 自動出現在 DOM（polling 正常運作）
3. Polling 自然停止（不需要手動 abort）— 隱含在 test 正常結束、不 timeout

### 好處

- **測真實場景**：agent 跑完 → polling 偵測到 → 自動停止
- **不需要長 timeout**：幾個 cycle 就結束，默認 5s timeout 足夠
- **不浪費資源**：polling 自然結束，不用等 cleanup abort
- **interval 可設 0ms**：因為 loop 很快結束，不會 starve event loop

## 實作 checklist

- [ ] 改 MSW handlers 加 `polledEventServed` 狀態轉換
- [ ] poll interval 設 0ms（`context.store.set(setPollInterval$, 0)`）
- [ ] detail handler 根據 `polledEventServed` 回 running/completed
- [ ] 移除 15_000 timeout（默認 5s 夠了）
- [ ] 驗證 test 在 CI 穩定通過
