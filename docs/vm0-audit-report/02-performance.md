# 效能審查報告

## 🔴 高風險問題

### 1. N+1 查詢問題

**位置**: `turbo/apps/web/app/api/agent/runs/route.ts:70-101`

**問題**: 列出 runs 時需要 3 次獨立的資料庫查詢，造成不必要的網路延遲。

```typescript
// runs/route.ts - 當前實現
list: async ({ query, headers }) => {
  // 第 1 次查詢：獲取 runs
  const runs = await db
    .select({
      id: agentRuns.id,
      status: agentRuns.status,
      agentComposeVersionId: agentRuns.agentComposeVersionId,
      // ...
    })
    .from(agentRuns)
    .where(and(eq(agentRuns.userId, userId), ...))
    .orderBy(desc(agentRuns.createdAt))
    .limit(query.limit);

  // 獲取不同的 versionIds
  const versionIds = [...new Set(runs.map((r) => r.agentComposeVersionId))];

  // 第 2 次查詢：批量獲取版本
  const versions = await db
    .select({
      id: agentComposeVersions.id,
      composeId: agentComposeVersions.composeId,
    })
    .from(agentComposeVersions)
    .where(inArray(agentComposeVersions.id, versionIds));

  // 獲取 composeIds
  const composeIds = [...new Set(versions.map((v) => v.composeId))];

  // 第 3 次查詢：批量獲取 compose
  const composes = await db
    .select({
      id: agentComposes.id,
      name: agentComposes.name,
    })
    .from(agentComposes)
    .where(inArray(agentComposes.id, composeIds));

  // 手動關聯...
};
```

**效能影響**:
- 3 次資料庫往返 (RTT)
- 假設每次 50ms，共 150ms 額外延遲
- 高併發下資料庫連接壓力增加

**建議**: 使用 JOIN 在單一查詢中完成

```typescript
// 建議的改法：使用 JOIN
const runsWithDetails = await db
  .select({
    id: agentRuns.id,
    status: agentRuns.status,
    createdAt: agentRuns.createdAt,
    // compose 資訊
    composeName: agentComposes.name,
    composeId: agentComposes.id,
    // version 資訊
    versionId: agentComposeVersions.id,
  })
  .from(agentRuns)
  .innerJoin(
    agentComposeVersions,
    eq(agentRuns.agentComposeVersionId, agentComposeVersions.id)
  )
  .innerJoin(
    agentComposes,
    eq(agentComposeVersions.composeId, agentComposes.id)
  )
  .where(eq(agentRuns.userId, userId))
  .orderBy(desc(agentRuns.createdAt))
  .limit(query.limit);

// 單一查詢，單一 RTT
```

---

### 2. 大檔案一次性讀取導致 OOM

**位置**: `turbo/packages/core/src/sandbox/scripts/src/lib/upload-telemetry.ts:35-74`

**問題**: 系統日誌檔案被一次性讀入記憶體，大檔案會導致 OOM。

```typescript
// upload-telemetry.ts - 當前實現
export function readFileFromPosition(
  filePath: string,
  posFile: string,
): [string, number] {
  // ...
  if (fs.existsSync(filePath)) {
    const fd = fs.openSync(filePath, "r");
    const stats = fs.fstatSync(fd);
    const bufferSize = stats.size - lastPos;

    if (bufferSize > 0) {
      // ⚠️ 危險：一次性配置整個檔案大小的 buffer
      const buffer = Buffer.alloc(bufferSize);
      fs.readSync(fd, buffer, 0, bufferSize, lastPos);

      // ⚠️ 再次複製：字串轉換會建立新的記憶體副本
      newContent = buffer.toString("utf-8");
      newPos = stats.size;
    }
    fs.closeSync(fd);
  }
  return [newContent, newPos];
}
```

**效能影響**:
- 100MB 日誌 = 100MB buffer + 100MB string = 200MB 記憶體峰值
- 沙箱資源受限時容易 OOM
- GC 壓力增加

**建議**: 使用串流處理

```typescript
// 建議的改法：使用 streaming
import { createReadStream } from "fs";
import { createInterface } from "readline";

export async function* streamFileFromPosition(
  filePath: string,
  startPos: number,
): AsyncGenerator<string, number, unknown> {
  const stream = createReadStream(filePath, {
    start: startPos,
    encoding: "utf-8",
    highWaterMark: 64 * 1024, // 64KB chunks
  });

  const rl = createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  let bytesRead = startPos;

  for await (const line of rl) {
    bytesRead += Buffer.byteLength(line, "utf-8") + 1; // +1 for newline
    yield line;
  }

  return bytesRead;
}

// 使用方式
for await (const line of streamFileFromPosition(filePath, lastPos)) {
  // 逐行處理，記憶體使用恆定
  processLine(line);
}
```

---

### 3. 掛起的 Runs 永久封鎖併發配額

**位置**: `turbo/apps/web/src/lib/run/run-service.ts:35-37`

**問題**: `pending` 狀態的 run 不會被清理，永久佔用用戶的併發配額。

```typescript
// run-service.ts - 代碼中的 TODO 註解
/**
 * TODO: cleanup-sandboxes cron job only cleans up "running" runs, not "pending" runs.
 * If a run gets stuck in "pending" status, it will block the user's concurrent limit forever.
 * Need to add cleanup logic for stale pending runs.
 */

// 併發檢查邏輯
const [result] = await globalThis.services.db
  .select({ count: count() })
  .from(agentRuns)
  .where(
    and(
      eq(agentRuns.userId, userId),
      // ⚠️ 包括掛起的 runs，若永遠不清理會永久封鎖
      inArray(agentRuns.status, ["pending", "running"]),
    ),
  );

if (result.count >= effectiveLimit) {
  throw concurrentRunLimit();
}
```

**效能影響**:
- 用戶可能永久無法執行新 run
- 需要 DBA 手動干預
- 隨時間累積會有越來越多被封鎖的用戶

**建議**: 添加 TTL 清理機制

```typescript
// 建議的改法：排除過期的掛起 runs
const PENDING_RUN_TTL_HOURS = 24;

const [result] = await globalThis.services.db
  .select({ count: count() })
  .from(agentRuns)
  .where(
    and(
      eq(agentRuns.userId, userId),
      inArray(agentRuns.status, ["pending", "running"]),
      // 只計算最近 24 小時內建立的 runs
      gt(agentRuns.createdAt, new Date(Date.now() - PENDING_RUN_TTL_HOURS * 60 * 60 * 1000)),
    ),
  );

// 同時添加 cron job 清理過期的掛起 runs
// turbo/apps/web/app/api/cron/cleanup-stale-runs/route.ts
export async function GET() {
  const staleRuns = await db
    .update(agentRuns)
    .set({
      status: "failed",
      error: "Run timed out in pending state",
      completedAt: new Date(),
    })
    .where(
      and(
        eq(agentRuns.status, "pending"),
        lt(agentRuns.createdAt, new Date(Date.now() - PENDING_RUN_TTL_HOURS * 60 * 60 * 1000)),
      )
    )
    .returning({ id: agentRuns.id });

  return Response.json({ cleaned: staleRuns.length });
}
```

---

## 🟠 中風險問題

### 4. JSONL 解析無串流處理

**位置**: `turbo/packages/core/src/sandbox/scripts/src/lib/upload-telemetry.ts:100-120`

**問題**: 整個 JSONL 內容被 split 成陣列，記憶體峰值高。

```typescript
// upload-telemetry.ts
export function readJsonlFromPosition(
  filePath: string,
  posFile: string,
): [JsonEntry[], number] {
  const [content, newPos] = readFileFromPosition(filePath, posFile);

  const entries: JsonEntry[] = [];
  if (content) {
    // ⚠️ 建立完整的行陣列
    for (const line of content.trim().split("\n")) {
      if (line) {
        try {
          entries.push(JSON.parse(line) as JsonEntry);
        } catch {
          // 忽略無效行
        }
      }
    }
  }
  return [entries, newPos];
}
```

**建議**: 配合上面的串流改法逐行處理

---

### 5. PID 檢查競態條件

**位置**: `turbo/apps/runner/src/lib/firecracker/netns-pool.ts:298-380`

**問題**: PID 可能在檢查和清理之間被作業系統重複使用。

```typescript
// netns-pool.ts
private static async cleanupOrphanedAndAllocate(
  registry: RegistryFile,
  runnerName: string,
): Promise<string> {
  // 第 1 次掃描：在不持有鎖的情況下查找孤立的 runners
  const orphanedData = await registry.withLock(async (read) => {
    const data = read();
    const orphaned: {...}[] = [];

    for (const [runnerIdx, runner] of Object.entries(data.runners)) {
      // ⚠️ 只是檢查 PID，不清理
      if (!isPidAlive(runner.pid)) {
        orphaned.push({...});
      }
    }
    return orphaned;
  });

  // ⚠️ 在沒有鎖的情況下執行清理
  // 此時 PID 可能已被新進程重複使用！
  if (orphanedData.length > 0) {
    await Promise.all(
      orphanedData.map(async ({ runnerIdx, namespaces }) => {
        // 清理...
      }),
    );
  }

  // 第 2 次掃描：重新檢查
  return registry.withLock(async (read, write) => {
    // ⚠️ PID 可能已被重複使用，仍然會錯誤刪除
    if (runner && !isPidAlive(runner.pid)) {
      delete data.runners[runnerIdx];
    }
  });
}
```

**建議**: 在持有鎖時執行所有操作，或使用更可靠的進程追蹤機制（如 cgroup）。

---

### 6. iptables 並行執行競態

**位置**: `turbo/apps/runner/src/lib/firecracker/netns-pool.ts:494-509`

**問題**: 並行執行 iptables 命令可能相互干擾。

```typescript
// netns-pool.ts
const iptablesRules = [
  `iptables -t nat -A POSTROUTING -s ${vethNsIp}/30 ...`,
  `iptables -A FORWARD -i ${vethHost} -o ${defaultIface} ...`,
  `iptables -A FORWARD -i ${defaultIface} -o ${vethHost} ...`,
];

// ⚠️ 並行執行可能導致規則順序錯誤或衝突
await Promise.all(iptablesRules.map((rule) => execCommand(rule)));
```

**建議**: 使用 iptables-restore 批量應用

```typescript
// 建議的改法
const rules = `
*nat
-A POSTROUTING -s ${vethNsIp}/30 -o ${defaultIface} -j MASQUERADE
COMMIT
*filter
-A FORWARD -i ${vethHost} -o ${defaultIface} -j ACCEPT
-A FORWARD -i ${defaultIface} -o ${vethHost} -m state --state RELATED,ESTABLISHED -j ACCEPT
COMMIT
`;

await execCommand(`echo "${rules}" | iptables-restore -n`);
```

---

### 7. 缺少 API 快取策略

**位置**: 所有 API endpoints

**問題**: 沒有使用 HTTP 快取頭，重複請求無法利用快取。

```typescript
// 當前：每次都執行完整查詢
export async function GET(request: Request) {
  const composes = await db.select().from(agentComposes)...;
  return Response.json({ data: composes });
}
```

**建議**: 添加 ETag 和 Cache-Control

```typescript
// 建議的改法
import { createHash } from "crypto";

export async function GET(request: Request) {
  const composes = await db.select().from(agentComposes)...;

  // 計算 ETag
  const etag = createHash("md5")
    .update(JSON.stringify(composes))
    .digest("hex");

  // 檢查 If-None-Match
  const ifNoneMatch = request.headers.get("If-None-Match");
  if (ifNoneMatch === etag) {
    return new Response(null, { status: 304 });
  }

  return Response.json(
    { data: composes },
    {
      headers: {
        "ETag": etag,
        "Cache-Control": "private, max-age=60", // 60 秒快取
      },
    }
  );
}
```

---

### 8. 資料庫連接池容量過小

**位置**: `turbo/apps/web/src/lib/init-services.ts:52-65`

**問題**: 連接池 max: 10 在高併發下不足。

```typescript
// init-services.ts
if (isNeon) {
  _pool = new NeonPool({
    connectionString: this.env.DATABASE_URL,
    max: 10, // ⚠️ 只有 10 個連接
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  });
} else {
  _pool = new PgPool({
    connectionString: this.env.DATABASE_URL,
    max: 10, // ⚠️ 只有 10 個連接
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
}
```

**建議**: 改為可配置，並根據環境調整

```typescript
// 建議的改法
const poolConfig = {
  connectionString: this.env.DATABASE_URL,
  max: parseInt(process.env.DB_POOL_MAX ?? "20", 10),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT ?? "30000", 10),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT ?? "10000", 10),
};
```

---

## 效能指標估計

| 問題 | 當前影響 | 改善後 |
|------|---------|--------|
| N+1 查詢 | +150ms 延遲 | 單一 RTT (~50ms) |
| 大檔案讀取 | 200MB 記憶體峰值 | ~64KB 恆定 |
| 連接池 max:10 | 高併發下連接等待 | max:20+ 降低等待 |
| 無 API 快取 | 每次完整查詢 | 304 回應 ~5ms |
