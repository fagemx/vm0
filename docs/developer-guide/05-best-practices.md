# 05 - 最佳實踐

## 開發原則

### YAGNI (You Aren't Gonna Need It)

**核心**：不要添加目前不需要的功能

- ❌ 不要預先添加「以防萬一」的參數
- ❌ 不要為單次使用創建工具函數
- ❌ 不要過度設計
- ✅ 從最簡單的解決方案開始
- ✅ 積極刪除未使用的代碼

### 避免防禦性編程

**核心**：讓異常自然傳播

- ❌ 不要用 try/catch 包裹所有東西
- ❌ 不要只是 log 然後重新拋出
- ✅ 只在能有意義地處理時才 catch
- ✅ 讓錯誤冒泡到適當的處理位置

### 嚴格類型檢查

- ❌ 絕對不使用 `any`
- ❌ 不要用 `as` 類型斷言（除非絕對必要）
- ✅ 為所有參數提供顯式類型
- ✅ 使用 `unknown` 代替 `any`

### 零容忍 Lint 違規

- ❌ 不要添加 `eslint-disable`
- ❌ 不要添加 `@ts-ignore`
- ✅ 修復根本問題
- ✅ 所有 lint 規則都有存在的理由

---

## 測試原則

### 核心原則

> "Write tests. Not too many. Mostly integration." — Kent C. Dodds

### 規則

| 規則 | 說明 |
|------|------|
| Integration Tests Only | 在入口點（CLI、API）測試，不測內部函數 |
| No Unit Tests | 整合測試已經覆蓋所有內部邏輯 |
| E2E for Happy Path Only | E2E 只測試快樂路徑，錯誤在整合測試中測 |
| Mock External Only | 如果 `vi.mock()` 路徑以 `../../` 開頭，就是錯的 |
| Real Infrastructure | 使用真實數據庫、真實文件系統、MSW 模擬 HTTP |

### 測試反模式

| 反模式 | 說明 |
|--------|------|
| AP-1 | 測試 Mock 調用而非行為 |
| AP-2 | 直接 Mock Fetch（應使用 MSW） |
| AP-3 | Mock 文件系統（應使用真實 temp 目錄） |
| AP-4 | Mock 內部代碼（相對路徑） |
| AP-5 | 使用 Fake Timers |
| AP-6 | 部分內部 Mock |
| AP-7 | 測試實現細節 |
| AP-8 | 過度測試 |
| AP-9 | Mock Console 但不驗證 |
| AP-10 | 直接渲染組件 |

---

## Commit 規範

### 格式

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 規則

- ✅ type 必須小寫：`feat:`，不是 `Feat:`
- ✅ description 開頭小寫：`add new feature`
- ✅ 結尾無句號
- ✅ 標題少於 100 字符
- ✅ 使用祈使語氣：`add`，不是 `added`

### Types

| Type | 用途 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修復 |
| `docs` | 文檔 |
| `style` | 代碼風格 |
| `refactor` | 重構 |
| `test` | 測試 |
| `chore` | 構建/工具 |
| `ci` | CI 配置 |
| `perf` | 性能 |

### 範例

- ✅ `feat: add user authentication system`
- ✅ `fix: resolve database connection timeout`
- ✅ `docs(api): update endpoint documentation`
- ❌ `Fix: Resolve database connection timeout.`
- ❌ `added user auth`

---

## PR 檢查

### 必須通過的檢查

```bash
cd turbo
pnpm turbo run lint      # ESLint
pnpm check-types         # TypeScript
pnpm format              # Prettier
pnpm vitest              # 測試
pnpm knip                # 未使用代碼
```

### 零容忍跳過測試

- ❌ 不要添加 `skip` 標誌
- ❌ 不要修改 CI 跳過測試
- ✅ 如果測試超時，修復根本問題
- ✅ 如果測試失敗，修復代碼

---

## Deep Dive 最佳實踐

### Research Phase

1. **全面但聚焦**
   - 理解相關的代碼
   - 不要分析整個代碼庫

2. **記錄發現**
   - 技術約束
   - 依賴關係
   - 潛在風險

3. **保持客觀**
   - 只記錄事實
   - 不提建議

### Innovate Phase

1. **至少 2-3 個方案**
   - 不要只提一個方案
   - 探索不同方向

2. **權衡分析**
   - 優點
   - 缺點
   - 適用場景

3. **不做決定**
   - 展示選項
   - 讓用戶選擇

### Plan Phase

1. **具體步驟**
   - 文件路徑
   - 行號
   - 代碼片段

2. **依賴順序**
   - 哪些任務先做
   - 哪些可以並行

3. **測試策略**
   - 遵循 `/testing` 規範
   - 指定測試文件位置

---

## 常見錯誤

### 1. 不搜索 TODO 就開始找功能

**錯誤**：直接找新功能或硬編碼值來改

**正確**：先搜索 `TODO`/`FIXME`/`HACK`，這些是作者標記的待修項目，被接受率最高

```bash
grep -rn "TODO\|FIXME\|HACK\|XXX" turbo/apps/ --include="*.ts" | grep -v node_modules
```

### 2. 只看 TODO 表面

**錯誤**：看到 TODO 就以為是「刪註解」

**正確**：深入閱讀上下文（前後 30 行），追蹤相關代碼流程，判斷是否有真正的邏輯缺陷

> **實戰案例**：`run-service.ts` 的 TODO 看起來像「刪過時註解」，深入分析後發現是 stale pending runs 佔用並發額度的邏輯缺陷。

### 3. 不做自我審查就推送

**錯誤**：寫完代碼就 `git push`，等 reviewer 來抓問題

**正確**：推送前先跑 `code-quality review`，自己發現並修好 Bad Smells

> **實戰案例**：PR #2445 的 `vi.unstubAllEnvs()` 問題，`code-quality` 的 Bad Smell #8（Test Mock Cleanup）可以自動偵測到。如果提交前先跑一次自我審查，就不需要額外的 review 來回。

### 4. 跳過 Deep Dive

**錯誤**：直接開始寫代碼

**正確**：先 `/issue-plan` 完成研究、創新、計劃

### 5. 不審核計劃

**錯誤**：`/issue-plan` 後立即 `/issue-action`

**正確**：打開 GitHub Issue 審核計劃，確認後再執行

### 6. 忽略 CI 失敗

**錯誤**：CI 失敗後嘗試跳過測試

**正確**：分析失敗原因，修復代碼

### 7. 過大的 PR

**錯誤**：一個 PR 包含多個功能

**正確**：每個功能一個 PR，保持原子性

### 8. 不同步上游

**錯誤**：基於舊代碼創建分支

**正確**：
```bash
git fetch upstream
git reset --hard upstream/main
```

---

## 效率提示

### 1. 使用 Auto-Continue

`/issue-plan` 會自動執行 research → innovate → plan，不需要手動干預。

### 2. 批量處理

如果有多個相關的小改動，可以：
1. 創建一個 Issue 包含所有改動
2. 一次性 `/issue-plan`
3. 一次性 `/issue-action`

### 3. 利用現有文檔

- 檢查 `/tmp/deep-dive/` 是否已有相關研究
- 可以復用之前的 research.md

### 4. 監控 CI

使用 `/pr-check` 自動監控和修復 CI 問題。
