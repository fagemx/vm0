# 03 - Skills 參考手冊

## Skills 概覽

Skills 是 Claude Code 中可重用的任務定義，位於 `.claude/skills/` 目錄。

---

## Issue 管理

### issue-create

**用途**：從對話上下文創建 GitHub Issue

**操作**：
- `create` - 智能判斷類型
- `bug` - Bug 報告
- `feature` - 功能請求

**使用方式**：
```
> /issue-create feature
> /issue-create bug
> /issue-create create
```

**流程**：
1. 分析對話上下文
2. 確定 Issue 類型
3. 詢問澄清問題
4. 創建結構化 Issue
5. 自動執行 `gh issue create`

---

### issue-plan

**用途**：開始處理 GitHub Issue（Deep Dive 工作流）

**參數**：Issue ID

**使用方式**：
```
> /issue-plan 2442
```

**流程**：
1. 獲取 Issue 詳情
2. 檢查現有 Deep Dive 文檔
3. 執行 Research Phase
4. 發布 research.md 到 Issue
5. 執行 Innovate Phase
6. 發布 innovate.md 到 Issue
7. 執行 Plan Phase
8. 發布 plan.md 到 Issue
9. 添加 `pending` 標籤

**輸出**：
- `/tmp/deep-dive/{task-name}/research.md`
- `/tmp/deep-dive/{task-name}/innovate.md`
- `/tmp/deep-dive/{task-name}/plan.md`

---

### issue-action

**用途**：繼續處理 Issue，執行實施

**使用方式**：
```
> /issue-action
```

**流程**：
1. 從對話獲取 Issue ID
2. 讀取 Deep Dive 文檔
3. 移除 `pending` 標籤
4. 分析反饋
5. 按 plan.md 實施
6. 運行測試
7. 提交 commits
8. 創建 PR
9. 運行 `/pr-check`

---

## PR 管理

### pr-review

**用途**：審查 PR 並發布評論

**使用方式**：
```
> /pr-review
```

**流程**：
1. 確定 PR 編號
2. 獲取 PR 信息
3. 調用 code-quality 分析
4. 生成審查報告
5. 發布到 PR 評論

---

### pr-check

**用途**：監控和修復 PR CI 流程

**使用方式**：
```
> /pr-check
```

**流程**：
1. 監控 CI 狀態
2. 自動修復 lint/format 問題
3. 報告 type/test 錯誤

---

## 代碼質量

### tech-debt

**用途**：技術債務管理

**操作**：
- `research` - 掃描代碼庫
- `issue` - 創建 GitHub Issue

**使用方式**：
```
> tech-debt research
> tech-debt issue
```

**掃描項目**：
- TypeScript `any` 使用
- Lint suppressions
- 大文件 (>1000 行)
- Hardcoded URLs
- 測試反模式
- 等等

---

### code-quality

**用途**：代碼質量分析

**使用方式**：
```
> code-quality review {PR_NUMBER}
```

**檢查項目**：
- Bad Smells (BS-1 到 BS-14)
- Testing Anti-Patterns (AP-1 到 AP-10)

---

### testing

**用途**：測試指南和最佳實踐

**核心原則**：
- Integration Tests Only
- No Unit Tests
- E2E Tests for Happy Path Only
- Only Mock External Dependencies
- Use Real Infrastructure

---

## 開發環境

### dev-server

**用途**：開發服務器管理

**使用方式**：
```
> /dev-start   # 啟動
> /dev-stop    # 停止
> /dev-tunnel  # 啟動 tunnel
> /dev-auth    # 開發環境認證
> /dev-logs    # 查看日誌
```

---

## 其他 Skills

| Skill | 用途 |
|-------|------|
| commit | Commit 規範 |
| cli-design | CLI 設計指南 |
| database-development | 數據庫開發 |
| project-principles | 專案原則 |
| query-axiom-logs | 查詢 Axiom 日誌 |

---

## Skill 文件結構

每個 Skill 位於 `.claude/skills/{skill-name}/SKILL.md`：

```yaml
---
name: skill-name
description: Skill description
context: fork  # 可選
---

# Skill Name

## Workflow

### Step 1: ...

### Step 2: ...
```
