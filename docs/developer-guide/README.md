# VM0 Developer Guide

> 使用 Claude Code 進行高效開發的完整指南

## 目標

學習 vm0 核心團隊的開發方法論，使用 Claude Code 實現高效的功能開發。

## 文件索引

| 文件 | 用途 |
|------|------|
| [01-claude-code-setup.md](./01-claude-code-setup.md) | Claude Code 環境設置 |
| [02-development-workflow.md](./02-development-workflow.md) | 完整開發流程 |
| [03-skills-reference.md](./03-skills-reference.md) | Skills 參考手冊 |
| [04-commands-reference.md](./04-commands-reference.md) | Commands 參考手冊 |
| [05-best-practices.md](./05-best-practices.md) | 最佳實踐 |

## 核心理念

### 不是等待，而是主動

```
傳統模式：等待 Issue → 認領 → 開發
高效模式：主動發現問題 → 創建 Issue → 自動開發
```

### TODO 搜索是最高效的發現方式

> **實戰教訓**：我們走了彎路，先找硬編碼值和新功能，最後才發現 TODO 註解才是最有價值的切入點。

```bash
# 每次開始前的第一個命令
grep -rn "TODO\|FIXME\|HACK\|XXX" turbo/apps/ --include="*.ts" | grep -v node_modules
```

**關鍵**：不要只看 TODO 表面。深入閱讀上下文（前後 30 行），分析是「刪註解」還是「修邏輯」。

### 自動化一切

| 階段 | 手動 | 自動（Claude Code） |
|------|------|---------------------|
| 發現問題 | **TODO/FIXME 搜索** + 人工審查 | `tech-debt research` |
| 創建 Issue | 手寫 Issue | `issue-create` |
| 研究 | 讀代碼、做筆記 | `/deep-research` |
| 設計 | 討論方案 | `/deep-innovate` |
| 規劃 | 寫實施計劃 | `/deep-plan` |
| 實施 | 寫代碼 | `/issue-action` |
| 測試 | 運行測試 | 自動運行 |
| ⭐ 自我審查 | 人工逐行檢查 | `code-quality review` |
| Review | 人工審查 | `/pr-review` |

## 快速開始

### 1. 啟動 Claude Code

```bash
cd /path/to/vm0
claude
```

### 2. 開發新功能

```
> I want to implement [feature description]
> /issue-create feature
> /issue-plan {issue-id}
> /issue-action
```

### 3. 修復 Bug

```
> I found a bug: [bug description]
> /issue-create bug
> /issue-plan {issue-id}
> /issue-action
```

### 4. 技術債務清理

```
> tech-debt research
> tech-debt issue
> /issue-plan {issue-id}
> /issue-action
```

## 完整開發流程

```
┌─────────────────────────────────────────────────────────────────┐
│                        Phase 1: 發現問題                         │
├─────────────────────────────────────────────────────────────────┤
│ • tech-debt research    → 掃描代碼庫發現技術債務                  │
│ • 對話描述需求          → 從對話中提取功能需求                    │
│ • 分析現有 Issue        → 認領已有的任務                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        Phase 2: 創建 Issue                       │
├─────────────────────────────────────────────────────────────────┤
│ • issue-create feature  → 功能請求                               │
│ • issue-create bug      → Bug 報告                               │
│ • tech-debt issue       → 技術債務 Issue                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        Phase 3: Deep Dive                        │
├─────────────────────────────────────────────────────────────────┤
│ /issue-plan {issue-id}                                           │
│                                                                  │
│ ┌──────────────┐   ┌──────────────┐   ┌──────────────┐          │
│ │  Research    │ → │  Innovate    │ → │    Plan      │          │
│ │  研究代碼庫   │   │  頭腦風暴方案 │   │  制定實施計劃 │          │
│ └──────────────┘   └──────────────┘   └──────────────┘          │
│                                                                  │
│ 輸出：research.md → innovate.md → plan.md                        │
│ 動作：自動發布到 GitHub Issue 作為評論                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        Phase 4: 執行                             │
├─────────────────────────────────────────────────────────────────┤
│ /issue-action                                                    │
│                                                                  │
│ • 創建 feature branch                                            │
│ • 按 plan.md 逐步實施                                            │
│ • 每步運行測試驗證                                               │
│ • 自動 commit（Conventional Commits）                            │
│ • 創建 PR                                                        │
│ • 運行 /pr-check 驗證 CI                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Phase 4.5: ⭐ 自我審查                       │
├─────────────────────────────────────────────────────────────────┤
│ code-quality review                                              │
│                                                                  │
│ • 推送前自動檢測 17 種 Bad Smell                                 │
│ • 提前發現 reviewer 會指出的問題                                 │
│ • 省去 review 來回修改的時間                                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        Phase 5: 審查                             │
├─────────────────────────────────────────────────────────────────┤
│ /pr-review                                                       │
│                                                                  │
│ • 調用 code-quality 分析                                         │
│ • 檢查 Bad Smells                                                │
│ • 發布審查評論到 PR                                              │
└─────────────────────────────────────────────────────────────────┘
```

## 與 Contribution Playbook 的區別

| 項目 | Contribution Playbook | Developer Guide |
|------|----------------------|-----------------|
| **目標** | 外部小貢獻 | 完整功能開發 |
| **方法** | 手動搜索 + 手動實施 | Claude Code 自動化 |
| **範圍** | 小修復、配置化 | 新功能、大型重構 |
| **工具** | grep、git、gh | Claude Code Skills |
| **流程** | 被動認領 Issue | 主動發現 + 創建 |

## 核心 Skills

| Skill | 用途 |
|-------|------|
| `issue-create` | 從對話創建 Issue |
| `issue-plan` | 開始處理 Issue（研究→創新→計劃） |
| `issue-action` | 按計劃執行實施 |
| `pr-review` | PR 代碼審查 |
| `pr-check` | 檢查 PR CI 狀態 |
| `tech-debt` | 技術債務掃描和 Issue 創建 |
| `code-quality` | 代碼質量分析 |
| `testing` | 測試指南 |

## 核心 Commands

| Command | 用途 |
|---------|------|
| `/deep-research` | 研究階段（只收集信息） |
| `/deep-innovate` | 創新階段（頭腦風暴方案） |
| `/deep-plan` | 計劃階段（制定實施計劃） |
| `/dev-start` | 啟動開發服務器 |
| `/dev-stop` | 停止開發服務器 |
| `/pr-create` | 創建 PR |

## 參考資料

- [CLAUDE.md](/CLAUDE.md) - 專案 Claude Code 配置
- [.claude/skills/](.claude/skills/) - Skills 定義
- [.claude/commands/](.claude/commands/) - Commands 定義
