# 改善建議與優先級

## 優先級定義

| 優先級 | 說明 | 時間框架 |
|--------|------|---------|
| **P0** | 立即處理 - 阻礙生產部署或有重大安全風險 | 1-2 週 |
| **P1** | 短期處理 - 影響可靠性或效能 | 1 個月 |
| **P2** | 中期處理 - 技術債務或改善項目 | 1 季度 |

---

## 🔴 P0 - 立即處理

### 1. 修復 N+1 查詢

**問題**: 列出 runs 需要 3 次資料庫查詢
**影響**: +150ms 延遲，高併發下資料庫壓力
**檔案**: `turbo/apps/web/app/api/agent/runs/route.ts:70-101`

**修復方案**:
```typescript
// 使用 JOIN 替代多次查詢
const runsWithDetails = await db
  .select({
    id: agentRuns.id,
    status: agentRuns.status,
    composeName: agentComposes.name,
  })
  .from(agentRuns)
  .innerJoin(agentComposeVersions, eq(agentRuns.agentComposeVersionId, agentComposeVersions.id))
  .innerJoin(agentComposes, eq(agentComposeVersions.composeId, agentComposes.id))
  .where(eq(agentRuns.userId, userId))
  .limit(query.limit);
```

**驗收標準**:
- [ ] 單一資料庫查詢
- [ ] API 延遲 < 100ms (p95)
- [ ] 添加對應的單元測試

---

### 2. 清理掛起的 Runs

**問題**: pending 狀態的 run 永久佔用併發配額
**影響**: 用戶可能永久無法執行新 run
**檔案**: `turbo/apps/web/src/lib/run/run-service.ts:35-37`

**修復方案**:
```typescript
// 1. 修改併發檢查，排除過期的 pending runs
const PENDING_TTL = 24 * 60 * 60 * 1000; // 24 小時

const activeRuns = await db
  .select({ count: count() })
  .from(agentRuns)
  .where(and(
    eq(agentRuns.userId, userId),
    inArray(agentRuns.status, ["pending", "running"]),
    gt(agentRuns.createdAt, new Date(Date.now() - PENDING_TTL)),
  ));

// 2. 添加 cron job 清理過期的 pending runs
// 新檔案: turbo/apps/web/app/api/cron/cleanup-stale-runs/route.ts
```

**驗收標準**:
- [ ] 過期的 pending runs 自動標記為 failed
- [ ] Cron job 每小時執行
- [ ] 添加 Axiom 日誌記錄清理數量

---

### 3. 修復大檔案 OOM 問題

**問題**: 大日誌檔案一次性讀入記憶體
**影響**: 沙箱 OOM 崩潰
**檔案**: `turbo/packages/core/src/sandbox/scripts/src/lib/upload-telemetry.ts:35-74`

**修復方案**:
```typescript
// 使用串流讀取
import { createReadStream } from "fs";

export async function* streamFileFromPosition(
  filePath: string,
  startPos: number,
): AsyncGenerator<string> {
  const stream = createReadStream(filePath, {
    start: startPos,
    highWaterMark: 64 * 1024, // 64KB chunks
  });

  for await (const chunk of stream) {
    yield chunk.toString("utf-8");
  }
}
```

**驗收標準**:
- [ ] 記憶體使用恆定 (< 100MB)
- [ ] 支援 1GB+ 日誌檔案
- [ ] 添加記憶體使用測試

---

### 4. 添加 Rate Limiting

**問題**: 認證端點無速率限制
**影響**: 暴力破解風險
**檔案**: 所有 `/api/cli/auth/*` 端點

**修復方案**:
```typescript
// 使用 Upstash Ratelimit
import { Ratelimit } from "@upstash/ratelimit";

const authRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  prefix: "ratelimit:auth",
});

// 在所有認證端點添加檢查
const { success } = await authRatelimit.limit(ip);
if (!success) {
  return Response.json({ error: "Too many requests" }, { status: 429 });
}
```

**驗收標準**:
- [ ] 每分鐘最多 5 次登入嘗試
- [ ] 返回 429 狀態碼和 Retry-After header
- [ ] 添加 rate limit bypass 供測試使用

---

### 5. CLI Token 雜湊存儲

**問題**: Token 以明文存儲在資料庫
**影響**: 資料庫洩漏時所有 token 暴露
**檔案**: `turbo/apps/web/src/db/schema/cli-tokens.ts`

**修復方案**:
```typescript
// 1. 修改 schema
export const cliTokens = pgTable("cli_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  tokenHash: text("token_hash").unique().notNull(), // SHA-256 雜湊
  tokenPrefix: varchar("token_prefix", { length: 10 }).notNull(), // 用於識別
  expiresAt: timestamp("expires_at").notNull(),
});

// 2. 建立遷移
// 3. 更新驗證邏輯使用 timingSafeEqual
```

**驗收標準**:
- [ ] 資料庫只存儲 token 雜湊
- [ ] 舊 token 自動遷移
- [ ] 驗證使用常數時間比較

---

## 🟠 P1 - 短期處理

### 6. 實現斷路器模式

**問題**: 服務初始化失敗無恢復機制
**影響**: 單點故障導致整個實例掛掉
**檔案**: `turbo/apps/web/src/lib/init-services.ts`

**修復方案**:
- 使用 `opossum` 實現斷路器
- 添加健康檢查端點
- 實現部分降級能力

**驗收標準**:
- [ ] 資料庫斷開後自動重連
- [ ] 健康檢查端點 `/api/health`
- [ ] Axiom 日誌記錄斷路器狀態

---

### 7. S3/資料庫一致性補償

**問題**: S3 和資料庫可能不一致
**影響**: 檔案遺失或孤立記錄
**檔案**: `turbo/apps/web/app/api/storages/commit/route.ts`

**修復方案**:
- 實現一致性檢查 cron job
- 添加補償邏輯（標記無效版本）
- 添加手動修復工具

**驗收標準**:
- [ ] 每 6 小時執行一致性檢查
- [ ] 自動標記無效版本
- [ ] CLI 工具 `vm0 storage repair`

---

### 8. 整合 OpenTelemetry

**問題**: 缺乏分佈式追蹤
**影響**: 難以診斷生產問題
**檔案**: 整個應用

**修復方案**:
```typescript
// 1. 安裝依賴
// pnpm add @opentelemetry/api @opentelemetry/sdk-node

// 2. 初始化 tracer
// turbo/apps/web/src/lib/telemetry.ts

// 3. 在 API 端點添加 span
```

**驗收標準**:
- [ ] 所有 API 端點有 trace ID
- [ ] 跨服務請求可追蹤
- [ ] 整合 Axiom 或其他 APM

---

### 9. 提高測試覆蓋率

**問題**: 測試覆蓋率僅 ~25%
**影響**: 回歸風險高
**檔案**: 整個應用

**修復方案**:
```typescript
// vitest.config.ts
coverage: {
  thresholds: {
    lines: 70,
    functions: 70,
    branches: 60,
  },
},
```

**驗收標準**:
- [ ] 整體覆蓋率 > 70%
- [ ] 關鍵路徑 (auth, crypto) 100%
- [ ] CI 強制覆蓋率檢查

---

### 10. 修復 PID 競態條件

**問題**: PID 可能在檢查和清理之間被重複使用
**影響**: 可能誤刪活躍的 runner
**檔案**: `turbo/apps/runner/src/lib/firecracker/netns-pool.ts`

**修復方案**:
- 在持有鎖時執行所有操作
- 或使用 cgroup 追蹤進程

**驗收標準**:
- [ ] 原子性清理操作
- [ ] 添加競態條件測試
- [ ] 日誌記錄清理操作

---

## 🟡 P2 - 中期處理

### 11. API 快取策略

**問題**: 缺少 HTTP 快取
**檔案**: 所有 GET API

**修復方案**:
- 添加 ETag 支援
- 配置 Cache-Control
- 實現應用層快取

---

### 12. 連接池可配置

**問題**: 連接池 max:10 硬編碼
**檔案**: `init-services.ts`

**修復方案**:
```typescript
max: parseInt(process.env.DB_POOL_MAX ?? "20", 10),
```

---

### 13. 依賴版本策略文檔化

**問題**: 覆蓋原因不明確
**檔案**: `package.json`

**修復方案**:
- 添加 DEPENDENCIES.md 說明版本策略
- 註解每個 override 的原因

---

### 14. Vercel 密鑰隔離

**問題**: 保護旁路密鑰傳入沙箱
**檔案**: `e2b-executor.ts`

**修復方案**:
- 使用生命週期受限的 token
- 或透過 API 代理

---

### 15. 複雜函數重構

**問題**: 587 行的 create 函數
**檔案**: `runs/route.ts`

**修復方案**:
- 拆分為多個職責單一的函數
- 添加單元測試

---

## 實施路線圖

```
Week 1-2 (P0):
├── #1 N+1 查詢修復
├── #2 掛起 runs 清理
└── #3 大檔案串流

Week 3-4 (P0):
├── #4 Rate Limiting
└── #5 Token 雜湊

Month 2 (P1):
├── #6 斷路器模式
├── #7 一致性補償
├── #8 OpenTelemetry
└── #9 測試覆蓋率

Month 3 (P1 + P2):
├── #10 PID 競態修復
├── #11 API 快取
├── #12 連接池配置
├── #13 依賴文檔
├── #14 密鑰隔離
└── #15 函數重構
```

---

## 監控指標建議

實施改善後，建議監控以下指標：

| 指標 | 目標值 | 告警閾值 |
|------|--------|---------|
| API p95 延遲 | < 200ms | > 500ms |
| 資料庫連接使用率 | < 70% | > 90% |
| 沙箱 OOM 率 | < 0.1% | > 1% |
| 認證失敗率 | < 5% | > 20% |
| S3/DB 不一致數 | 0 | > 10 |
| 測試覆蓋率 | > 70% | < 60% |
