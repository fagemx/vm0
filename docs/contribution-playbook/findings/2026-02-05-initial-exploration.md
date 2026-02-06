# 探索報告 - 2026-02-05

> 探索代理: 主代理（初始探索）
> 探索方向: TODO + 硬編碼 + Issue 分析

## 探索方法

- [x] TODO 註解搜索
- [x] 硬編碼值搜索
- [x] Issue 分析
- [x] PR 趨勢分析
- [ ] 代碼審查

---

## 已完成的貢獻

### ✅ PR #2373: 連接池可配置化

| 項目 | 內容 |
|------|------|
| **類型** | 硬編碼值可配置化 |
| **位置** | `apps/web/src/lib/init-services.ts` |
| **結果** | ✅ 合併 |
| **學習** | 需要同時更新 `turbo.json` |

### ❌ PR #2374: Rate Limiting

| 項目 | 內容 |
|------|------|
| **類型** | 安全功能 |
| **位置** | `apps/web/app/api/cli/auth/device/route.ts` |
| **結果** | ❌ 關閉 |
| **學習** | 架構決策需先討論，維護者選擇用 Vercel 層面實現 |

### ⏳ PR #2445: Stale Pending Runs 邏輯修復

| 項目 | 內容 |
|------|------|
| **類型** | TODO → 邏輯修復（不只是刪註解） |
| **位置** | `apps/web/src/lib/run/run-service.ts` |
| **結果** | ⏳ Review 中 |
| **學習** | TODO 表面是「過時註解」，深入分析後是真正的邏輯缺陷 |

### ⏳ PR #2465: CLI Scope 測試反模式修復

| 項目 | 內容 |
|------|------|
| **類型** | 測試反模式 AP-4 修復 |
| **位置** | `apps/cli/src/commands/scope/__tests__/` |
| **結果** | ⏳ Review 中 |
| **學習** | 用 `vi.stubEnv()` 取代 `vi.mock()` 內部模組 |

---

## 發現的貢獻候選

### 候選 1: Proxy Port 自動發現

| 項目 | 內容 |
|------|------|
| **類型** | TODO |
| **位置** | `apps/runner/src/lib/config.ts:67` |
| **難度** | ⭐ |
| **預估時間** | 2h |
| **風險** | 低 |
| **建議 PR 標題** | `feat(runner): allow port 0 for auto-discovery` |

**詳細說明**:

TODO 註解說明需要允許 port 為 0 來自動發現可用端口。

```typescript
// TODO: Allow 0 to auto-find available port
port: z.number().int().min(1024).max(65535).default(PROXY_DEFAULTS.port),
```

**風險評估**: 這是 runner 相關的改動，seven332 專注這個領域，可能需要先確認方向。

---

### 候選 2: ✅ Stale Pending Runs 邏輯修復 → PR #2445

| 項目 | 內容 |
|------|------|
| **類型** | TODO → 邏輯修復（不只是刪註解） |
| **位置** | `apps/web/src/lib/run/run-service.ts` |
| **難度** | ⭐⭐ |
| **預估時間** | 2h |
| **風險** | 低 |
| **實際 PR 標題** | `fix(web): exclude stale pending runs from concurrency check` |

**初始分析（錯誤）**:

最初以為這只是「刪除過時 TODO 註解」，建議 PR 標題是 `chore(web): remove outdated TODO comment`。

**深入分析（正確）**:

深入閱讀代碼後發現：
1. cron job 確實已處理 pending runs（5 分鐘 TTL），但 TODO 指出的問題是**如果 cron job 失敗**，stale pending runs 會永久佔用並發額度
2. `checkRunConcurrencyLimit` 查詢同時計算 `pending` 和 `running` 狀態，但沒有排除過時的 pending runs
3. 這是一個**防禦性邏輯缺陷**，需要修改查詢條件而非僅刪除註解

**實際修改**:
- 修改 Drizzle 查詢：`running` 永遠計算 + `pending` 只計算 15 分鐘內的
- 新增 2 個整合測試驗證 TTL 行為
- 創建 `insertStalePendingRun` 測試 helper

**教訓**: ⚠️ 不要只看 TODO 表面，要深入分析上下文才能判斷真正需要的修改。

---

## 不建議的項目

### 項目 1: 複雜函數重構

- **位置**: 多處 `eslint-disable-next-line complexity`
- **原因**: 改動太大，風險高，需要深入理解代碼

### 項目 2: @ts-rest/core 升級

- **位置**: `packages/core/src/contracts/index.ts:11`
- **原因**: 需要等上游發布穩定版本

### 項目 3: 文檔改進 (#785)

- **原因**: 維護者標記為 "after 100 stars"

---

## Issue 分析結果

| Issue | 標題 | 適合度 | 備註 |
|-------|------|--------|------|
| #2017 | docs(runner): document paths | ❌ | 已分配給 seven332 |
| #785 | docs: improve contribution guide | ❌ | "after 100 stars" |
| #2386 | feat: integrate sentry | ⚠️ | 需要添加新依賴 |

大多數開放的 Issue 都是複雜功能或 Runner 相關，不太適合新貢獻者。

---

## PR 趨勢觀察

| 方向 | 活躍度 | 主要貢獻者 |
|------|--------|-----------|
| Sentry 集成 | 🔥 高 | hulh122, e7h4n |
| 重構 | 🔥 高 | lancy, seven332 |
| Platform UI | ⚡ 中 | hulh122, Lunarivibe |
| CLI | ⚡ 中 | lancy |

---

## 建議優先順序

1. ~~**候選 2: Stale Pending Runs**~~ → ✅ 已提交 PR #2445
2. **候選 1: Proxy Port** - 需要先確認是否適合外部貢獻

---

## 下一步建議

- [x] ~~驗證 run-service.ts 的 TODO 是否確實過時~~ → 不是過時，是真正的邏輯缺陷
- [x] ~~提交修復 PR~~ → PR #2445
- [ ] 繼續搜索新的 TODO/FIXME 標記
- [ ] 觀察新的 Issue 和 PR
