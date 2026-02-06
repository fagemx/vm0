# 架構與治理審查報告

## 🔴 高風險 - 單點故障 (SPOF)

### 1. 全局服務單例無重試機制

**位置**: `turbo/apps/web/src/lib/init-services.ts:11-18, 88-97`

**問題**: 使用全局單例模式，初始化失敗後整個實例無法恢復。

```typescript
// init-services.ts
let _env: Env | undefined;
let _pool: PgPool | NeonPool | undefined;
let _db: NodePgDatabase | NeonDatabase | undefined;
let _services: Services | undefined;

// ⚠️ 若初始化失敗，所有後續請求都會失敗
Object.defineProperty(globalThis, "services", {
  get() {
    if (!_services) {
      throw new Error("Services not initialized. Call initServices() first.");
    }
    return _services;
  },
  configurable: true,
});

// 初始化函數
export async function initServices(): Promise<Services> {
  // ...初始化各種服務...
  // ⚠️ 任何一個失敗都會導致整個初始化失敗
  // ⚠️ 沒有重試機制
  // ⚠️ 沒有部分降級能力
}
```

**影響**:
- 資料庫連接失敗 → 整個實例掛掉
- serverless 冷啟動時特別脆弱
- 沒有自動恢復機制

**建議**: 實現斷路器模式和延遲初始化

```typescript
// 建議的改法：使用斷路器模式
import CircuitBreaker from "opossum";

const dbCircuitBreaker = new CircuitBreaker(
  async () => {
    const pool = new PgPool(config);
    await pool.query("SELECT 1"); // 健康檢查
    return pool;
  },
  {
    timeout: 5000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
  }
);

dbCircuitBreaker.fallback(() => {
  // 降級：返回只讀模式或快取資料
  return createReadOnlyPool();
});

// 延遲初始化
class LazyService<T> {
  private instance: T | undefined;
  private initPromise: Promise<T> | undefined;

  constructor(private factory: () => Promise<T>) {}

  async get(): Promise<T> {
    if (this.instance) return this.instance;
    if (!this.initPromise) {
      this.initPromise = this.factory().then((instance) => {
        this.instance = instance;
        return instance;
      });
    }
    return this.initPromise;
  }

  reset(): void {
    this.instance = undefined;
    this.initPromise = undefined;
  }
}
```

---

### 2. Axiom 日誌初始化失敗無恢復

**位置**: `turbo/apps/web/src/lib/logger.ts:45-73`

**問題**: Axiom 初始化失敗後無法重試，重要日誌會遺失。

```typescript
// logger.ts
let axiomLogger: AxiomLogger | null = null;
let axiomInitialized = false;

function getAxiomLogger(): AxiomLogger | null {
  if (axiomInitialized) return axiomLogger;
  axiomInitialized = true; // ⚠️ 只嘗試一次

  const token = process.env.AXIOM_TOKEN;
  if (!token) {
    // ⚠️ 靜默失敗，日誌遺失
    return null;
  }

  try {
    const axiom = new Axiom({ token });
    axiomLogger = axiom.logger(getAxiomDataset(), {
      onError: (err) => {
        console.error("[axiom] Failed to send logs:", err);
      },
    });
    return axiomLogger;
  } catch (err) {
    // ⚠️ 失敗後無法重試
    console.error("[axiom] Failed to initialize:", err);
    return null;
  }
}
```

**建議**: 添加重試機制和健康檢查

```typescript
// 建議的改法
class AxiomLoggerWithRetry {
  private logger: AxiomLogger | null = null;
  private lastAttempt = 0;
  private readonly retryInterval = 60000; // 1 分鐘重試

  async getLogger(): Promise<AxiomLogger | null> {
    if (this.logger) return this.logger;

    const now = Date.now();
    if (now - this.lastAttempt < this.retryInterval) {
      return null; // 冷卻期內不重試
    }

    this.lastAttempt = now;

    try {
      const axiom = new Axiom({ token: process.env.AXIOM_TOKEN! });
      this.logger = axiom.logger(getAxiomDataset());
      console.log("[axiom] Successfully initialized");
      return this.logger;
    } catch (err) {
      console.error("[axiom] Init failed, will retry:", err);
      return null;
    }
  }

  reset(): void {
    this.logger = null;
    this.lastAttempt = 0;
  }
}
```

---

## 🔴 高風險 - 資料一致性

### 3. S3 與資料庫缺乏最終一致性保證

**位置**: `turbo/apps/web/app/api/storages/commit/route.ts:142-164`

**問題**: S3 和資料庫之間沒有補償機制，可能出現不一致狀態。

```typescript
// commit/route.ts
// 驗證 S3 檔案存在
const s3Exists = await verifyS3FilesExist(
  bucketName,
  existingVersion.s3Key,
  existingVersion.fileCount,
);

if (!s3Exists) {
  // ⚠️ 返回錯誤但沒有自動修復機制
  return {
    status: 409 as const,
    body: {
      error: {
        type: "conflict",
        message: "S3 files not found for existing version",
      },
    },
  };
}

// 後續更新資料庫...
// ⚠️ 若資料庫更新成功但 S3 檔案後來被刪除，會出現不一致
```

**建議**: 實現 Saga 模式或補償機制

```typescript
// 建議的改法：添加補償機制
class StorageConsistencyChecker {
  async checkAndRepair(storageId: string): Promise<ConsistencyReport> {
    const storage = await db.query.storages.findFirst({
      where: eq(storages.id, storageId),
      with: { versions: true },
    });

    const report: ConsistencyReport = {
      storageId,
      issues: [],
      repaired: [],
    };

    for (const version of storage.versions) {
      const s3Exists = await this.checkS3(version.s3Key);
      const dbExists = true; // 已經從 DB 查到

      if (dbExists && !s3Exists) {
        report.issues.push({
          type: "orphaned_db_record",
          versionId: version.id,
        });

        // 自動修復：標記版本為無效
        await db.update(storageVersions)
          .set({ isValid: false })
          .where(eq(storageVersions.id, version.id));

        report.repaired.push(version.id);
      }
    }

    return report;
  }
}

// 定期執行一致性檢查
// cron: 0 */6 * * * (每 6 小時)
```

---

### 4. HEAD 指針更新競態條件

**位置**: `turbo/apps/web/app/api/storages/commit/route.ts:166-175`

**問題**: 檢查和更新 HEAD 之間沒有樂觀鎖。

```typescript
// commit/route.ts
// ⚠️ 時間窗口：其他請求可能在此期間更新 HEAD
if (storage.headVersionId !== versionId) {
  await globalThis.services.db
    .update(storages)
    .set({
      headVersionId: versionId,
      updatedAt: new Date(),
    })
    .where(eq(storages.id, storage.id));
  // ⚠️ 沒有檢查更新是否成功（可能被其他請求覆蓋）
}
```

**建議**: 使用樂觀鎖

```typescript
// 建議的改法：樂觀鎖
const result = await globalThis.services.db
  .update(storages)
  .set({
    headVersionId: versionId,
    updatedAt: new Date(),
    version: sql`${storages.version} + 1`, // 遞增版本號
  })
  .where(
    and(
      eq(storages.id, storage.id),
      eq(storages.version, storage.version), // 樂觀鎖條件
    )
  )
  .returning({ updated: storages.id });

if (result.length === 0) {
  // 並發衝突，需要重試
  throw new ConcurrentModificationError("Storage was modified by another request");
}
```

---

### 5. 事務設計缺陷

**位置**: `turbo/apps/web/app/api/storages/commit/route.ts:250-290`

**問題**: `onConflictDoNothing()` 的行為不明確，可能導致靜默失敗。

```typescript
// commit/route.ts
await globalThis.services.db.transaction(async (tx) => {
  // 插入版本，衝突時不做任何事
  await tx
    .insert(storageVersions)
    .values({
      id: versionId,
      storageId: storage.id,
      // ...
    })
    .onConflictDoNothing(); // ⚠️ 靜默忽略衝突

  // 驗證版本是否存在
  const [version] = await tx
    .select()
    .from(storageVersions)
    .where(eq(storageVersions.id, versionId))
    .limit(1);

  // ⚠️ 若另一個事務同時插入相同 versionId，這裡可能找到別人的版本
  if (!version) {
    throw new Error(`Version ${versionId} not found after insert`);
  }

  // 更新 HEAD
  await tx
    .update(storages)
    .set({ headVersionId: versionId })
    .where(eq(storages.id, storage.id));
});
```

**建議**: 明確處理衝突情況

```typescript
// 建議的改法
await globalThis.services.db.transaction(async (tx) => {
  // 使用 RETURNING 確認插入成功
  const [inserted] = await tx
    .insert(storageVersions)
    .values({
      id: versionId,
      storageId: storage.id,
      createdBy: userId,
      // ...
    })
    .onConflictDoNothing()
    .returning({ id: storageVersions.id, createdBy: storageVersions.createdBy });

  if (!inserted) {
    // 衝突發生，檢查現有版本的所有者
    const [existing] = await tx
      .select()
      .from(storageVersions)
      .where(eq(storageVersions.id, versionId));

    if (existing.createdBy !== userId) {
      throw new Error("Version ID conflict with another user's upload");
    }
    // 同一用戶的重複上傳，可以安全繼續
  }

  // 繼續更新 HEAD...
});
```

---

## 🟠 中風險 - 可觀測性

### 6. 缺乏分佈式追蹤

**位置**: 整個應用

**問題**: 沒有使用 OpenTelemetry 或類似工具，難以追蹤跨服務請求。

```typescript
// 當前：沒有 trace ID
export async function POST(request: Request) {
  // 無法追蹤這個請求在各個服務間的流動
  const result = await runService.create(...);
  return Response.json(result);
}
```

**建議**: 整合 OpenTelemetry

```typescript
// 建議的改法
import { trace, context, SpanStatusCode } from "@opentelemetry/api";

const tracer = trace.getTracer("vm0-api");

export async function POST(request: Request) {
  const traceId = request.headers.get("x-trace-id") ?? generateTraceId();

  return tracer.startActiveSpan("POST /api/agent/runs", async (span) => {
    try {
      span.setAttribute("user.id", userId);
      span.setAttribute("trace.id", traceId);

      const result = await runService.create(...);

      span.setStatus({ code: SpanStatusCode.OK });
      return Response.json(result, {
        headers: { "x-trace-id": traceId },
      });
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      throw error;
    } finally {
      span.end();
    }
  });
}
```

---

### 7. 記錄的指標未使用

**位置**: `turbo/apps/web/app/api/agent/runs/route.ts:120`

**問題**: `apiStartTime` 被記錄但從未使用。

```typescript
// runs/route.ts
create: async ({ body, headers }) => {
  const apiStartTime = Date.now(); // ⚠️ 記錄了但從未使用！

  // ... 複雜的邏輯 ...

  // ⚠️ 沒有計算 duration 或記錄延遲指標
  return { status: 201, body: result };
};
```

**建議**: 實際使用這些指標

```typescript
// 建議的改法
create: async ({ body, headers }) => {
  const apiStartTime = Date.now();

  try {
    // ... 邏輯 ...

    const duration = Date.now() - apiStartTime;
    log.info("Run created", {
      runId: result.id,
      durationMs: duration,
      userId,
    });

    // 發送到指標系統
    metrics.histogram("api.runs.create.duration", duration, {
      status: "success",
    });

    return { status: 201, body: result };
  } catch (error) {
    const duration = Date.now() - apiStartTime;
    metrics.histogram("api.runs.create.duration", duration, {
      status: "error",
      errorType: error.name,
    });
    throw error;
  }
};
```

---

## 🟠 中風險 - 測試覆蓋

### 8. 測試覆蓋率不足

**統計**:
- 總檔案數: 650 個 TypeScript 檔案
- 測試檔案數: 162 個
- 估計覆蓋率: ~25%

**問題區域**:

```
❌ turbo/apps/web/app/api/agent/runs/route.ts (587 行)
   - 標記為 "TODO: refactor complex function"
   - 沒有對應的測試檔案

❌ turbo/apps/web/app/api/storages/commit/route.ts
   - 複雜的事務邏輯
   - 缺少併發測試

❌ turbo/apps/runner/src/lib/firecracker/netns-pool.ts
   - 複雜的資源管理邏輯
   - 缺少競態條件測試

❌ 資料庫遷移 (69 個遷移檔案)
   - 沒有遷移測試
   - 沒有回滾測試
```

**vitest 配置問題**:

```typescript
// turbo/vitest.config.ts
coverage: {
  provider: "v8",
  reporter: ["text", "json", "html"],
  // ⚠️ 沒有配置：
  // - 最小覆蓋率閾值
  // - 分支覆蓋目標
},
```

**建議**: 設定覆蓋率要求

```typescript
// 建議的 vitest.config.ts
coverage: {
  provider: "v8",
  reporter: ["text", "json", "html", "lcov"],
  exclude: [
    "**/*.spec.ts",
    "**/*.test.ts",
    "**/node_modules/**",
    "**/dist/**",
  ],
  // 強制覆蓋率要求
  thresholds: {
    lines: 70,
    functions: 70,
    branches: 60,
    statements: 70,
  },
  // 關鍵檔案需要更高覆蓋率
  perFile: true,
  100: [
    "src/lib/crypto/**",
    "src/lib/auth/**",
  ],
},
```

---

## 🟡 低風險 - 依賴管理

### 9. 版本策略不一致

**位置**: `turbo/package.json`

```json
{
  "devDependencies": {
    "@vitest/coverage-v8": "3.2.4",      // 固定版本
    "@vitest/ui": "^3.2.4",              // 浮動版本 ❓
    "vitest": "^3.2.4",                  // 浮動版本 ❓
    "typescript": "5.9.2",               // 固定版本
  },
  "pnpm": {
    "overrides": {
      "fast-xml-parser": "^5.3.4"        // ❓ 為什麼覆蓋？
    }
  }
}
```

**建議**: 文檔化版本策略

```json
{
  "comments": {
    "fast-xml-parser": "Pinned to 5.3.4+ due to CVE-2024-XXXXX in earlier versions"
  },
  "pnpm": {
    "overrides": {
      "fast-xml-parser": "^5.3.4"
    }
  }
}
```

---

## 代碼品質問題

### 10. 需要重構的複雜函數

**位置**: `turbo/apps/web/app/api/agent/runs/route.ts:118`

```typescript
// ⚠️ 被標記為需要重構
// eslint-disable-next-line complexity -- TODO: refactor complex function
create: async ({ body, headers }) => {
  // 587 行的複雜函數
  // 混合了：
  // - 認證邏輯
  // - 參數驗證
  // - 資料庫查詢
  // - 業務邏輯
  // - 錯誤處理
}
```

**建議**: 拆分為多個職責單一的函數

```typescript
// 建議的結構
create: async ({ body, headers }) => {
  // 1. 認證
  const userId = await authenticateRequest(headers);

  // 2. 驗證輸入
  const validatedInput = validateCreateRunInput(body);

  // 3. 解析 agent 引用
  const agentRef = await resolveAgentReference(validatedInput.agent, userId);

  // 4. 準備執行上下文
  const context = await prepareExecutionContext(agentRef, validatedInput);

  // 5. 檢查併發限制
  await checkConcurrencyLimit(userId);

  // 6. 建立 run
  const run = await createRunRecord(context);

  // 7. 啟動執行
  await startExecution(run);

  return { status: 201, body: formatRunResponse(run) };
};
```
