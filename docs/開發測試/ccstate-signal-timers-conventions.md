# ccstate & signal-timers 開發規範

> 來源：PR #2716 review（e7h4n），2026-02-11

## 背景

- **ccstate**：e7h4n 開發的狀態管理 library（[GitHub](https://github.com/e7h4n/ccstate)）
- **signal-timers**：e7h4n 開發的 abort-aware timer library
- 兩者都是他設計的，review 時他是在確認有沒有照他定的架構來寫

## ccstate 三個 Primitive

| Primitive | 用途 | 規則 |
|-----------|------|------|
| `state()` | 可讀寫的值 | **不能直接 export**（`ccstate/no-export-state`），要包 command |
| `computed()` | 衍生值，支援 async，自動 cache | 純讀取，不能有副作用 |
| `command()` | 副作用操作（寫入、API 呼叫） | 可以 get + set |

## ccstate Lint Rules（必遵守）

### 1. `ccstate/no-export-state`
```typescript
// ❌ 錯誤
export const pollInterval$ = state(3000);

// ✅ 正確：private state + exported command
const pollInterval$ = state(3000);
export const setPollInterval$ = command(({ set }, ms: number) => {
  set(pollInterval$, ms);
});
```

### 2. `ccstate/signal-check-await`
每個沒有傳 AbortSignal 的 await 後面，下一行要加 `signal.throwIfAborted()`：
```typescript
// ✅
const detail = await get(runDetail$);
signal.throwIfAborted();
```

但如果 await 的函數本身接受 signal 就不需要（signal-timers 的 delay 就是這種情況，但 eslint rule 還是會要求加）。

### 3. `ccstate/no-catch-abort`
catch block 裡必須用 `throwIfAbort(error)` 函數（從 `../utils.ts` import），不是 `signal.throwIfAborted()`：
```typescript
// ❌ 錯誤
catch {}

// ❌ 錯誤
catch (error) { signal.throwIfAborted(); }

// ✅ 正確
catch (error) {
  throwIfAbort(error);
}
```

### 4. `ccstate/no-package-variable`
不能在 module scope 用 mutable 變數。

## signal-timers 用法

```typescript
import { delay } from "signal-timers";

// ✅ 取代手寫的 delay — 支援 AbortSignal 取消
await delay(3000, { signal });
signal.throwIfAborted();

// ❌ 不要自己寫 delay 函數
function delay(ms, signal) { ... } // 已有現成的
```

注意 signal-timers 的 `delay` 簽名是 `delay(ms, { signal })`（options object），不是 `delay(ms, signal)`。

## 測試中覆寫 poll interval

因為 `state()` 不能 export，用 command wrapper 讓測試可以調整：
```typescript
// signals file
const pollInterval$ = state(3000);
export const setPollInterval$ = command(({ set }, ms: number) => {
  set(pollInterval$, ms);
});

// test file
context.store.set(setPollInterval$, 100); // 不要設太小（1ms 會卡死 event loop）
```

## 路由生命週期 + AbortSignal

- setup command 從路由系統拿 `AbortSignal`
- 頁面離開時 signal abort → 所有 polling / delay 自動取消
- 用 `detach(promise, Reason.Daemon)` 處理 floating promise

## 教訓

1. **不要手寫已有的 utility** — 先搜 codebase 有沒有現成的（e7h4n 一眼就看出該用 signal-timers）
2. **poll interval 測試不要設 1ms** — 會佔滿 event loop，100ms 夠快又穩定
3. **推送前跑 prettier** — `pnpm format` 別忘了，CI 的 `lint-format` 會擋
4. **e7h4n 的 review = 規則比對** — 他是 ccstate/signal-timers 作者，不是在讀你的邏輯，是在確認 convention 有沒有被遵守
