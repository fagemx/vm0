# Agent Briefing: API Route Integration Test

你的任務是為一個 API route 撰寫 integration tests。請嚴格遵守以下慣例。

---

## 1. 測試檔位置

測試檔放在 route 同層的 `__tests__/route.test.ts`。

例如 route 在：
```
turbo/apps/web/app/api/cli/auth/device/route.ts
```
測試檔在：
```
turbo/apps/web/app/api/cli/auth/device/__tests__/route.test.ts
```

---

## 2. 必要的 Mock

所有 web route 測試都需要以下 mock：

```typescript
vi.mock("@clerk/nextjs/server");
vi.mock("@e2b/code-interpreter");
vi.mock("@aws-sdk/client-s3");
vi.mock("@aws-sdk/s3-request-presigner");
vi.mock("@axiomhq/js");
```

---

## 3. 測試骨架

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "../route";  // 或 GET, PUT, DELETE
import {
  createTestRequest,
  // ...其他需要的 helper
} from "../../../../../../src/__tests__/api-test-helpers";
import {
  testContext,
  type UserContext,
} from "../../../../../../src/__tests__/test-helpers";

vi.mock("@clerk/nextjs/server");
vi.mock("@e2b/code-interpreter");
vi.mock("@aws-sdk/client-s3");
vi.mock("@aws-sdk/s3-request-presigner");
vi.mock("@axiomhq/js");

const context = testContext();

describe("METHOD /api/path/to/route", () => {
  let user: UserContext;

  beforeEach(async () => {
    context.setupMocks();
    user = await context.setupUser();
  });

  it("should ...", async () => {
    // Arrange
    const request = createTestRequest("http://localhost:3000/api/path", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ... }),
    });

    // Act
    const response = await POST(request);

    // Assert
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.xxx).toBe("yyy");
  });
});
```

---

## 4. Import 路徑計算

從測試檔到 `src/__tests__/` 的相對路徑取決於 route 的深度。

常見對照：
| Route 位置 | import 前綴 |
|-----------|------------|
| `app/api/xxx/route.ts` | `../../../../src/__tests__/` |
| `app/api/xxx/yyy/route.ts` | `../../../../../src/__tests__/` |
| `app/api/xxx/yyy/zzz/route.ts` | `../../../../../../src/__tests__/` |
| `app/v1/xxx/route.ts` | `../../../../src/__tests__/` |
| `app/v1/xxx/[id]/route.ts` | `../../../../../src/__tests__/` |

---

## 5. 已有的 Test Helper 函數

在 `api-test-helpers.ts` 中已有：

| 函數 | 用途 |
|------|------|
| `createTestRequest(url, options?)` | 建立 NextRequest |
| `createTestSandboxToken(userId, runId)` | 產生 sandbox JWT |
| `createTestDeviceCode(options)` | 插入 device code |
| `findTestDeviceCode(code)` | 查詢 device code |
| `findTestCliToken(token)` | 查詢 CLI token |
| `createTestCliToken(userId, expiresAt?)` | 建立 CLI token |
| `deleteTestCliToken(token)` | 刪除 CLI token |
| `createTestScope(slug)` | 透過 API 建立 scope |
| `createTestCompose(agentName, options?)` | 透過 API 建立 compose |
| `createTestModelProvider(type, secretValue, selectedModel?)` | 建立 model provider |
| `deleteTestModelProvider(type)` | 刪除 model provider |
| `listTestModelProviders()` | 列出 model providers |
| `createTestRun(composeId, prompt, options?)` | 建立 run |
| `completeTestRun(userId, runId)` | 完成 run |
| `createTestArtifact(name, options?)` | 建立 artifact |
| `createTestVolume(name, options?)` | 建立 volume |
| `listTestSecrets()` | 列出 secrets |
| `createTestPermission(composeId, granteeType, granteeEmail?)` | 建立 permission |

**重要**：不要在測試檔中直接用 `globalThis.services.db`，ESLint 會報錯。所有 DB 操作必須透過 helper。

---

## 6. 測試案例設計原則

1. **覆蓋所有分支**：讀 route.ts 的每個 if/switch/return，每個分支一個 test
2. **Happy path + Error cases**：成功路徑必測，每個錯誤回應也要測
3. **DB 副作用驗證**：如果 route 會新增/刪除 DB 資料，用 find helper 驗證
4. **不要測 framework 本身**：不需要測 Zod validation 或 ts-rest 行為

---

## 7. 帶參數的 Route（[id], [type], [name]）

如果 route 接受 URL 參數（如 `[type]`），確認 route handler 的 signature：

```typescript
// 如果是 ts-rest handler（用 createHandler），參數從 body/query 來
// 如果是直接 export function，第二個參數是 { params: Promise<{ id: string }> }
```

---

## 8. 產出格式

請產出以下兩個區塊：

### 區塊 1: 測試檔完整內容
```
路徑: turbo/apps/web/app/api/.../___tests__/route.test.ts
```
（完整可執行的 .test.ts 內容）

### 區塊 2: 需要的新 Helper
如果需要新 helper 函數，提供：
- 函數定義（完整 TypeScript）
- 需要新增的 import（如 schema import）

如果不需要新 helper，寫「無需新 helper」。

---

## 9. 已知陷阱（必讀）

1. **vi.mock 清單要完整** — 缺少任何一個都可能導致奇怪錯誤
2. **不要直接用 globalThis.services.db** — ESLint 規則會擋
3. **non-null assertion (!) 要確保型別正確** — helper return type 要明確
4. **import 路徑數 `../` 的層數要正確** — 從 __tests__ 目錄算起
5. **不要 mock 內部模組** — 只 mock 外部依賴（@clerk, @e2b, @aws-sdk 等）

---

## 10. 程式碼風格

1. **提取 local helper** — 如果同一個 `createTestRequest(...)` 呼叫出現 2 次以上，提取成像 `makeDeviceRequest()` 或 `deleteProvider(type)` 的小 helper，放在 `describe` 之前
2. **每個測試都驗 response.status** — 即使是 error case 也要先 `expect(response.status).toBe(xxx)`
3. **error case 驗 body** — 401/404 等測試除了驗 status，也要驗 `body.error.code`（如 `"UNAUTHORIZED"`、`"NOT_FOUND"`）
4. **success case 驗 shape** — 成功回應除了驗特定欄位值，加一個結構斷言（如 `not.toHaveProperty("error")`）
