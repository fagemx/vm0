# 04 - 驗證與測試指南

> 修改完成後，如何驗證代碼品質

## 1. 必須通過的檢查

### TypeScript 類型檢查

```bash
cd turbo

# 檢查所有包
pnpm check-types

# 檢查特定包
pnpm turbo run check-types --filter=web
pnpm turbo run check-types --filter=@vm0/cli

# 排除有問題的包（如果需要）
pnpm turbo run check-types --filter='!docs' --filter='!site'

# 只檢查修改的文件
npx tsc --noEmit path/to/modified/file.ts
```

### ESLint 檢查

```bash
# 檢查所有包
pnpm turbo run lint

# 檢查特定包
pnpm turbo run lint --filter=web

# 常見錯誤
# - turbo/no-undeclared-env-vars: 新環境變數需加到 turbo.json
# - @typescript-eslint/no-explicit-any: 不能使用 any
```

### Prettier 格式化

```bash
# 檢查格式
pnpm format --check

# 自動修復
pnpm format
```

### Knip 未使用代碼檢查

```bash
pnpm knip
```

---

## 2. 快速驗證命令

```bash
# 一次運行所有檢查
cd turbo
pnpm check-types && pnpm turbo run lint && pnpm format --check
```

---

## 3. 測試驗證

### 運行測試

```bash
# 運行所有測試
pnpm test

# 運行特定包的測試
pnpm turbo run test --filter=web
pnpm turbo run test --filter=@vm0/cli

# 運行特定測試文件
pnpm vitest run path/to/test.test.ts
```

### 測試覆蓋（可選）

如果添加了新功能，考慮添加測試：

```typescript
// 測試文件命名: xxx.test.ts 或 __tests__/xxx.test.ts

import { describe, it, expect } from "vitest";

describe("myFunction", () => {
  it("should do something", () => {
    expect(myFunction()).toBe(expectedValue);
  });
});
```

---

## 4. 常見錯誤及修復

### 錯誤 1: turbo/no-undeclared-env-vars

```
warning  DB_POOL_MAX is not listed as a dependency in turbo.json
```

**修復**: 在 `turbo/turbo.json` 的 `globalEnv` 添加環境變數：

```json
{
  "globalEnv": [
    "DB_POOL_MAX",
    ...
  ]
}
```

### 錯誤 2: @typescript-eslint/no-explicit-any

```
error  Unexpected any. Specify a different type
```

**修復**: 使用具體類型或 `unknown`：

```typescript
// Bad
function process(data: any) {}

// Good
function process(data: unknown) {
  if (typeof data === "string") {
    // data is now string
  }
}
```

### 錯誤 3: Type 不匹配

```
Type 'X' is not assignable to type 'Y'
```

**修復**: 檢查類型定義，確保一致

### 錯誤 4: 格式問題

```
Prettier found differences
```

**修復**: 運行 `pnpm format`

---

## 5. 手動驗證

### 向後相容性

如果添加了新的環境變數：

- [ ] 有預設值嗎？
- [ ] 不設置時行為跟之前一樣嗎？

### 代碼風格

- [ ] 變數命名符合規範？
- [ ] 沒有新增 `any` 類型？
- [ ] 沒有 `eslint-disable` 註釋？
- [ ] 代碼風格與周圍代碼一致？

### 文檔

- [ ] 需要更新文檔嗎？
- [ ] 註釋清晰嗎？

---

## 6. 自我代碼審查（Self-Review）

> ⭐ **關鍵教訓**：PR #2445 的 `vi.unstubAllEnvs()` 問題本可以在提交前被發現。

### 使用 code-quality skill

專案內建 `code-quality` skill（`.claude/skills/code-quality/SKILL.md`），會檢測 17 種 Bad Smell：

| 類別 | 檢測內容 |
|------|----------|
| Bad Smell #8 | 測試 Mock 清理問題（如多餘的 `vi.unstubAllEnvs()`） |
| Bad Smell #12 | 測試中直接 DB 操作（應使用 API helper） |
| Bad Smell #16 | Mock 內部代碼（AP-4 反模式） |
| Bad Smell #3 | 防禦性 try-catch |
| Bad Smell #9 | TypeScript `any` 使用 |
| ... | 共 17 種 |

### 如何執行

在 Claude Code 中：
```
> code-quality review
```

### 為什麼重要

```
❌ 不做自我審查 → reviewer 指出問題 → 修改 → 重新 push → 再次 review
✅ 自我審查先做 → 自己修好 → push → reviewer 直接通過
```

一次自我審查能省去 1-2 輪 review 來回。

---

## 7. Git 提交前檢查

### 檢查修改的文件

```bash
# 查看修改了哪些文件
git diff --name-only

# 查看具體修改
git diff

# 查看暫存的修改
git diff --cached
```

### 確認只提交必要的文件

```bash
# 不要提交
# - .env 文件
# - node_modules/
# - 個人配置文件
# - 無關的修改
```

---

## 8. 驗證檢查清單

### 提交前必須確認

- [ ] `pnpm check-types` 通過
- [ ] `pnpm turbo run lint` 通過
- [ ] `pnpm format --check` 通過
- [ ] 新環境變數已加到 `turbo.json`
- [ ] 沒有新增 `any` 類型
- [ ] 沒有 `eslint-disable` 註釋
- [ ] 已執行 `code-quality review` 自我審查（⭐ 避免 review 來回）

### 建議確認

- [ ] 測試通過（如果改動影響測試）
- [ ] 代碼風格與專案一致
- [ ] 向後相容
- [ ] 不包含無關修改

---

## 9. 常見問題排查

### 問題: CI 通過但本地失敗

可能原因：
- 本地環境不是最新
- 緩存問題

解決：
```bash
# 清除緩存
rm -rf node_modules turbo/node_modules
pnpm install

# 清除 turbo 緩存
pnpm turbo run lint --force
```

### 問題: 本地通過但 CI 失敗

可能原因：
- 環境差異
- 缺少依賴聲明

解決：
- 檢查 CI 日誌
- 確保所有依賴都在 package.json
