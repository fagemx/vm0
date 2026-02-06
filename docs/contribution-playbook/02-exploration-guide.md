
# 02 - 探索貢獻機會指南

> 系統性地發現可以貢獻的地方

## 探索策略優先級

| 優先級 | 策略 | 難度 | 被接受率 |
|--------|------|------|----------|
| 1 | TODO 註解 | ⭐ 低 | 高 |
| 2 | 硬編碼值可配置化 | ⭐ 低 | 高 |
| 3 | 文檔改進 | ⭐ 低 | 高 |
| 4 | 小 Bug 修復 | ⭐⭐ 中 | 高 |
| 5 | 跟隨 PR 趨勢 | ⭐⭐ 中 | 中 |
| 6 | Issue 認領 | ⭐⭐ 中 | 中 |
| 7 | 複雜重構 | ⭐⭐⭐ 高 | 低 |

---

## 策略 1: 搜索 TODO 註解 ⭐ 最高優先級

> **實戰教訓**：TODO 是作者主動標記的待修項目，是最高效的貢獻發現方式。
> 我們曾繞路先找硬編碼值和新功能，後來才發現 `run-service.ts` 裡的 TODO 才是最有價值且最容易被接受的貢獻。

### 命令

```bash
# ⭐ 每次探索的第一個命令 — 搜索所有標記
grep -rn "TODO\|FIXME\|HACK\|XXX" turbo/apps/ --include="*.ts" | grep -v node_modules | head -30

# 按目錄搜索
grep -rn "TODO\|FIXME" turbo/apps/web/src --include="*.ts"
grep -rn "TODO\|FIXME" turbo/apps/cli/src --include="*.ts"
grep -rn "TODO\|FIXME" turbo/apps/runner/src --include="*.ts"

# 排除複雜度相關的 TODO（通常是大改動）
grep -rn "TODO" turbo/ --include="*.ts" | grep -v "complexity"
```

### ⚠️ 深入分析，不要只看表面

> **實戰教訓**：`run-service.ts` 的 TODO 表面上像是「刪除過時註解」，
> 但深入閱讀代碼後發現是**真正的邏輯缺陷**（stale pending runs 佔用並發額度）。
> 最終的 PR 修改了查詢邏輯 + 加了測試，遠不只是刪註解。

**分析步驟**：
1. 讀 TODO 上下文（至少前後 30 行）
2. 理解 TODO 描述的問題是否真的存在
3. 追蹤相關代碼流程（如 cron job、API route）
4. 判斷是「刪註解」還是「修邏輯」

### 評估標準

| 類型 | 適合度 | 說明 |
|------|--------|------|
| `TODO: refactor complex function` | ❌ 不適合 | 大改動 |
| `TODO: add cleanup logic` | ✅ 適合 | 小功能 |
| `TODO: upgrade to stable version` | ❌ 不適合 | 等上游 |
| `TODO: make configurable` | ✅ 適合 | 小改動 |
| `TODO: cleanup X not handled` | ✅ 適合 | 可能是邏輯缺陷，需深入分析 |

### 輸出格式

```markdown
## TODO 發現報告

### 候選 1: [文件路徑]
- **位置**: `file.ts:123`
- **內容**: TODO: xxx
- **表面分析**: 看起來是 [刪註解/小改動/邏輯修復]
- **深入分析**: 讀了上下文後發現 [實際問題描述]
- **難度**: ⭐
- **建議**: 適合/不適合
- **原因**: ...
```

---

## 策略 2: 硬編碼值可配置化

### 搜索命令

```bash
# 搜索硬編碼的數字
grep -rn "max: [0-9]" turbo/apps/web/src/lib --include="*.ts"
grep -rn "timeout.*[0-9]" turbo/apps/web/src/lib --include="*.ts"
grep -rn "limit.*[0-9]" turbo/apps/web/src/lib --include="*.ts"

# 搜索硬編碼的字串
grep -rn "https://" turbo/apps/web/src --include="*.ts" | grep -v "import"
```

### 評估標準

| 情況 | 適合度 |
|------|--------|
| 連接池大小 | ✅ 適合 |
| 超時時間 | ✅ 適合 |
| 重試次數 | ✅ 適合 |
| API URL | ⚠️ 需確認是否已有環境變數 |
| 魔術數字 | ✅ 適合 |

### 輸出格式

```markdown
## 硬編碼值發現報告

### 候選 1: [描述]
- **位置**: `file.ts:123`
- **當前值**: `max: 10`
- **建議環境變數**: `XXX_MAX`
- **難度**: ⭐
- **影響範圍**: 低/中/高
```

---

## 策略 3: 文檔改進

### 檢查項目

```bash
# 檢查 README 是否有過時內容
cat turbo/apps/web/README.md

# 檢查環境變數文檔
grep -rn "env" docs/ --include="*.md"

# 檢查 CONTRIBUTING.md
cat CONTRIBUTING.md
```

### 常見改進機會

- 新功能的文檔缺失
- 環境變數說明不完整
- 安裝步驟過時
- 範例代碼錯誤

---

## 策略 4: 追蹤 PR 趨勢

### 命令

```bash
# 查看最近合併的 PR
gh pr list --repo vm0-ai/vm0 --state merged --limit 20

# 查看特定作者的 PR
gh pr list --repo vm0-ai/vm0 --author lancy --state merged --limit 10

# 查看特定標籤
gh pr list --repo vm0-ai/vm0 --label "good first issue"
```

### 分析要點

1. **熱門方向**：最近什麼類型的 PR 最多？
2. **活躍貢獻者**：誰在做什麼方向？
3. **合併速度**：什麼類型的 PR 最快被合併？

### 輸出格式

```markdown
## PR 趨勢報告

### 最近一週統計
| 方向 | PR 數量 | 主要貢獻者 |
|------|---------|-----------|
| runner | 5 | seven332 |
| cli | 3 | lancy |

### 建議方向
1. xxx - 原因
2. xxx - 原因
```

---

## 策略 5: Issue 分析

### 命令

```bash
# 查看開放的 Issues
gh issue list --repo vm0-ai/vm0 --state open --limit 30

# 查看特定標籤
gh issue list --repo vm0-ai/vm0 --label "good first issue"
gh issue list --repo vm0-ai/vm0 --label "help wanted"

# 查看 Issue 詳情
gh issue view <issue_number> --repo vm0-ai/vm0
```

### 評估標準

| 標籤 | 適合度 |
|------|--------|
| `good first issue` | ✅ 優先 |
| `help wanted` | ✅ 適合 |
| `enhancement` | ⚠️ 需評估 |
| `later` | ❌ 暫緩 |
| `pending` | ❌ 暫緩 |
| 已有 Assignee | ❌ 已被認領 |

---

## 策略 6: 代碼審查

### 搜索命令

```bash
# 搜索潛在問題
grep -rn "eslint-disable" turbo/ --include="*.ts"
grep -rn "@ts-ignore" turbo/ --include="*.ts"
grep -rn "any" turbo/apps/web/src --include="*.ts"

# 搜索重複代碼模式
# (需要人工分析)
```

### 常見改進機會

- 移除不必要的 `eslint-disable`
- 替換 `any` 為具體類型
- 提取重複的工具函數

---

## 探索報告模板

每次探索後，產出以下格式的報告：

```markdown
# 探索報告 - [日期]

## 探索方法
- [x] TODO 搜索
- [x] 硬編碼值搜索
- [ ] Issue 分析

## 發現的貢獻候選

### 候選 1: [標題]
- **類型**: TODO / 硬編碼 / Bug / 文檔
- **位置**: `path/to/file.ts:123`
- **難度**: ⭐ / ⭐⭐ / ⭐⭐⭐
- **預估時間**: 1h / 2h / 4h
- **風險**: 低 / 中 / 高
- **建議 PR 標題**: `feat(web): xxx`
- **詳細說明**: ...

### 候選 2: ...

## 不建議的項目

### 項目 1: [標題]
- **原因**: 太複雜 / 已有人做 / 需要討論

## 建議優先順序

1. 候選 X - 原因
2. 候選 Y - 原因
```

---

## 注意事項

### ⚠️ 避免的方向

| 方向 | 原因 |
|------|------|
| 大型重構 | 需要深入理解代碼，風險高 |
| 新增依賴 | 需要維護者同意 |
| 架構變更 | 需要先開 Issue 討論 |
| Runner 核心 | 需要深入理解，seven332 專注 |

### ✅ 推薦的方向

| 方向 | 原因 |
|------|------|
| 環境變數可配置化 | 低風險，已有成功案例 |
| 小 Bug 修復 | 價值明確 |
| 文檔改進 | 安全，容易被接受 |
| CLI 小功能 | 獨立性高 |
