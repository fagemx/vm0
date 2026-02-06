# 01 - 專案規範速查

> 快速理解 vm0 專案的規範、風格和慣例

## 1. Commit 格式 (Conventional Commits)

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### 規則

| 規則 | 正確 | 錯誤 |
|------|------|------|
| Type 小寫 | `feat:` | `Feat:` |
| Description 小寫開頭 | `add new feature` | `Add new feature` |
| 無句號 | `add feature` | `add feature.` |
| 標題 < 100 字元 | 簡短描述 | 超長描述... |
| 祈使語氣 | `add` | `added` |

### 允許的 Types

```
feat     - 新功能
fix      - Bug 修復
docs     - 文檔
style    - 格式調整（不影響代碼邏輯）
refactor - 重構
test     - 測試
chore    - 雜務（構建、CI 等）
ci       - CI 配置
perf     - 性能優化
build    - 構建系統
revert   - 還原
```

### 常用 Scopes

```
web      - apps/web
cli      - apps/cli
runner   - apps/runner
platform - apps/platform
core     - packages/core
api      - API 相關
slack    - Slack 集成
agent    - Agent 功能
```

### 範例

```bash
# Good
feat(web): add rate limiting to device auth endpoint
fix(cli): normalize agent name to lowercase
refactor(runner): move timing.ts to utils directory
docs: update environment variables documentation

# Bad
Feat(web): Add rate limiting    # 大寫
fix: fixed bug.                 # 過去式 + 句號
```

---

## 2. 代碼風格 (零容忍)

### TypeScript

| 規則 | 說明 |
|------|------|
| ❌ 禁止 `any` | 使用 `unknown` + 類型收窄 |
| ❌ 禁止 `eslint-disable` | 不要抑制 lint 錯誤 |
| ❌ 禁止 `@ts-ignore` | 不要忽略類型錯誤 |
| ❌ 禁止 `await import()` | 用靜態 import |
| ❌ 禁止硬編碼 URL | 用環境變數 |
| ❌ 禁止靜默 fallback | 應 fail fast |

### 命名規範

```typescript
// 變數: camelCase
const userName = "alice";
const maxRetries = 3;

// 常量: UPPER_CASE
const MAX_RETRIES = 3;
const API_BASE_URL = "...";

// 函數: camelCase
function getUserById() {}
async function fetchData() {}

// React 組件: PascalCase
function MyComponent() {}
const UserProfile = () => {};

// 類型/介面: PascalCase
interface UserData {}
type ApiResponse = {};
```

### 文件風格

觀察專案中類似文件的風格，保持一致：

```typescript
// 簡潔的工具文件 (參考 url.ts, feature-switch.ts)
// - 少於 50 行
// - 簡短的頂部註釋
// - 不要過度文檔化

// 中等複雜度文件 (參考 errors.ts)
// - 清晰的分節註釋
// - 類型定義在前
// - 實現在後
```

---

## 3. 測試哲學

> "Write tests. Not too many. Mostly integration." — Kent C. Dodds

| 類型 | 用途 | 優先級 |
|------|------|--------|
| **Integration** | 測試入口點（API、CLI） | ✅ 主要 |
| **E2E** | 只測 happy path | ⚡ 謹慎 |
| **Unit** | 不單獨寫 | ❌ 避免 |

### Mock 規則

```typescript
// ✅ Good: Mock 外部依賴
vi.mock("@clerk/nextjs");
vi.mock("@aws-sdk/client-s3");

// ❌ Bad: Mock 內部代碼
vi.mock("../../lib/user-service"); // 不要！
```

### 測試環境

- 用真實資料庫（Docker PostgreSQL）
- 用真實文件系統（temp dir）
- 用 MSW mock HTTP（不直接 mock fetch）

---

## 4. 環境變數

### 添加新環境變數的步驟

1. **env.ts** - 添加 zod schema
   ```typescript
   DB_POOL_MAX: z.coerce.number().int().positive().default(10),
   ```

2. **env.ts** - 添加 runtimeEnv
   ```typescript
   DB_POOL_MAX: process.env.DB_POOL_MAX,
   ```

3. **turbo.json** - 添加到 globalEnv
   ```json
   "globalEnv": [
     "DB_POOL_MAX",
     ...
   ]
   ```

---

## 5. PR 格式

### 標題

```
<type>(<scope>): <description>
```

### 描述模板

```markdown
## Summary
簡述做了什麼

## Changes
- 列出主要變更

## Testing
- [x] TypeScript passes
- [x] Linter passes
```

### 可選：Self Review

```markdown
## Self Review

- [x] No new dependencies
- [x] Backward compatible
- [x] Follows project patterns
```

---

## 6. 常用命令

```bash
# 進入 turbo 目錄
cd turbo

# 安裝依賴
pnpm install

# 運行所有檢查
pnpm turbo run lint
pnpm check-types
pnpm format
pnpm test

# 運行特定包的檢查
pnpm turbo run check-types --filter=web
pnpm turbo run lint --filter=@vm0/cli

# 排除特定包
pnpm turbo run check-types --filter='!docs' --filter='!site'
```

---

## 7. 目錄結構

```
turbo/
├── apps/
│   ├── web/          # Next.js Web 應用
│   ├── cli/          # CLI 工具
│   ├── runner/       # Runner 服務
│   ├── platform/     # Platform UI
│   ├── docs/         # 文檔站點
│   └── site/         # 官網
├── packages/
│   ├── core/         # 共享核心邏輯
│   ├── ui/           # 共享 UI 組件
│   └── ...
└── turbo.json        # Turborepo 配置
```

---

## 8. 重要維護者

| 用戶 | 專注領域 |
|------|----------|
| **e7h4n** | 基礎設施、整體架構 |
| **lancy** | Agent、Storage、CLI |
| **seven332** | Runner 核心 |
| **hulh122** | Platform UI、Slack |

---

## 9. 快速檢查清單

提交前確認：

- [ ] `pnpm turbo run lint` 通過
- [ ] `pnpm check-types` 通過
- [ ] Commit message 符合 Conventional Commits
- [ ] 無新增 `any` 類型
- [ ] 無 `eslint-disable` 註釋
- [ ] 新環境變數已加到 `turbo.json`
