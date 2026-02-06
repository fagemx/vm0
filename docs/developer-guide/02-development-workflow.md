# 02 - 完整開發流程

## 流程概覽

```
發現問題 → 創建 Issue → Deep Dive → 執行 → 審查 → 合併
```

---

## Phase 1: 發現問題

### 方式 A: TODO/FIXME 搜索（⭐ 最高優先）

> **實戰教訓**：TODO 是作者主動標記的待修項目，是最高效的貢獻發現方式。

```bash
# 每次探索的第一個命令
grep -rn "TODO\|FIXME\|HACK\|XXX" turbo/apps/ --include="*.ts" | grep -v node_modules
```

**分析步驟**：
1. 讀 TODO 上下文（至少前後 30 行）
2. 理解 TODO 描述的問題是否真的存在
3. 追蹤相關代碼流程
4. 判斷是「刪註解」還是「修邏輯」— 表面看起來簡單的 TODO 可能是真正的邏輯缺陷

### 方式 B: 技術債務掃描

```
> tech-debt research
```

Claude Code 會自動：
1. 掃描 TypeScript `any` 使用
2. 找 lint suppression
3. 找大文件 (>1000 行)
4. 找 hardcoded URL
5. 找測試反模式
6. 生成詳細報告

### 方式 C: 對話描述需求

```
> I want to implement a GitHub OAuth Connector feature.
> Users should be able to connect their GitHub account via OAuth flow.
```

### 方式 D: 分析現有 Issue

```bash
gh issue list --repo vm0-ai/vm0 --state open --limit 30
gh issue view {issue-id} --repo vm0-ai/vm0
```

---

## Phase 2: 創建 Issue

### 功能請求

```
> /issue-create feature
```

Claude Code 會：
1. 從對話提取需求
2. 詢問澄清問題
3. 生成結構化 Issue
4. 自動創建 GitHub Issue

### Bug 報告

```
> /issue-create bug
```

### 技術債務

```
> tech-debt issue
```

---

## Phase 3: Deep Dive

### 啟動

```
> /issue-plan {issue-id}
```

例如：
```
> /issue-plan 2442
```

### 3.1 Research Phase（研究）

**目的**：收集信息，理解代碼庫

**可以做**：
- 讀取文件和代碼
- 理解架構和依賴
- 追蹤代碼流程
- 記錄技術約束

**不可以做**：
- ❌ 建議解決方案
- ❌ 實施計劃
- ❌ 任何形式的推薦

**輸出**：`/tmp/deep-dive/{task-name}/research.md`

### 3.2 Innovate Phase（創新）

**目的**：頭腦風暴，探索方案

**可以做**：
- 討論多種解決方案
- 評估優缺點
- 比較技術策略
- 考慮權衡

**不可以做**：
- ❌ 具體實施計劃
- ❌ 代碼實現
- ❌ 最終決策

**輸出**：`/tmp/deep-dive/{task-name}/innovate.md`

### 3.3 Plan Phase（計劃）

**目的**：制定具體實施計劃

**可以做**：
- 創建詳細實施步驟
- 指定文件變更
- 定義任務依賴
- 識別風險

**不可以做**：
- ❌ 實際寫代碼
- ❌ 提交文件
- ❌ 執行測試

**輸出**：`/tmp/deep-dive/{task-name}/plan.md`

### 自動發布

每個階段完成後，Claude Code 會自動：
```bash
gh issue comment {issue-id} --body-file /tmp/deep-dive/{task-name}/{phase}.md
```

---

## Phase 4: 執行

### 啟動

```
> /issue-action
```

### 自動執行流程

1. **讀取 Deep Dive 文檔**
   - `plan.md` - 實施步驟
   - `research.md` - 代碼理解
   - `innovate.md` - 方案選擇

2. **創建/切換 Feature Branch**
   ```bash
   git checkout -b feature/issue-{id}-{description}
   ```

3. **按計劃實施**
   - 逐步執行 plan.md 中的任務
   - 每步後運行測試驗證
   - 使用 Conventional Commits

4. **創建 PR**
   ```bash
   git push origin feature/issue-{id}-{description}
   gh pr create ...
   ```

5. **運行 CI 檢查**
   ```
   > /pr-check
   ```

---

## Phase 4.5: ⭐ 自我審查（Self-Review）

> **關鍵教訓**：PR #2445 的 `vi.unstubAllEnvs()` 問題本可以在推送前被自動發現。

### 啟動

```
> code-quality review
```

### 為什麼需要

```
❌ 不做自我審查 → reviewer 指出問題 → 修改 → 重新 push → 再次 review
✅ 自我審查先做 → 自己修好 → push → reviewer 直接通過
```

### 檢測內容

`code-quality` skill 會檢測 **17 種 Bad Smell**，包括：

| 類別 | 常見問題 |
|------|----------|
| #8 Mock Cleanup | 多餘的 `vi.unstubAllEnvs()`（vitest 自動清理） |
| #12 Direct DB in Tests | 測試中直接操作 `globalThis.services.db` |
| #16 Internal Mock (AP-4) | `vi.mock()` 使用相對路徑 mock 內部模組 |
| #3 Defensive Code | 不必要的 try-catch |
| #9 TypeScript any | 使用 `any` 而非 `unknown` |

### 執行時機

在 `git push` 之前，Phase 4 執行完成之後。

---

## Phase 5: 審查

### 啟動

```
> /pr-review
```

### 自動審查流程

1. **獲取 PR 信息**
2. **調用 code-quality 分析**
3. **檢查 Bad Smells**
   - TypeScript `any`
   - Lint suppressions
   - 測試反模式
   - 等等
4. **生成審查報告**
5. **發布到 PR 評論**

### 審查結果

```markdown
## Code Review: PR #{number}

### Summary
...

### Bad Smell Analysis
| Category | Status |
|----------|--------|
| Internal Code Mock | ✅ Pass |
| TypeScript any | ✅ Pass |
| ...

### Verdict
✅ LGTM / ⚠️ Changes Requested
```

---

## 完整範例：開發 GitHub OAuth Connector

### 1. 描述需求

```
> I want to implement a GitHub OAuth Connector feature.
> Users should be able to connect their GitHub account via OAuth flow
> and store tokens securely for use in GitHub-related skills.
> This is web-only for v1, no CLI support needed.
```

### 2. 創建 Issue

```
> /issue-create feature
```

輸出：`Issue created: https://github.com/vm0-ai/vm0/issues/2442`

### 3. 開始 Deep Dive

```
> /issue-plan 2442
```

等待 3 個階段完成...

### 4. 審核計劃

打開 GitHub Issue #2442，查看：
- Research 評論
- Innovate 評論
- Plan 評論

### 5. 執行實施

```
> /issue-action
```

等待實施完成...

輸出：`PR created: https://github.com/vm0-ai/vm0/pull/2446`

### 6. 審查 PR

```
> /pr-review
```

### 7. 完成

等待維護者合併 PR。

---

## 時間估算

| 階段 | 傳統方式 | Claude Code |
|------|----------|-------------|
| 研究 | 2-4 小時 | 5-10 分鐘 |
| 設計 | 2-4 小時 | 5-10 分鐘 |
| 規劃 | 1-2 小時 | 5-10 分鐘 |
| 實施 | 4-8 小時 | 10-30 分鐘 |
| 審查 | 1-2 小時 | 5 分鐘 |
| **總計** | **10-20 小時** | **30-60 分鐘** |
