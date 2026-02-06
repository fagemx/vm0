# 01 - Claude Code 環境設置

## 安裝 Claude Code

```bash
# 安裝 Claude Code CLI
curl -fsSL https://claude.ai/install.sh | bash

# 驗證安裝
claude --version
```

## 啟動 Claude Code

```bash
# 進入專案目錄
cd /path/to/vm0

# 啟動 Claude Code
claude
```

## 界面說明

```
╭─────────────────────────────────────────────────────────────────╮
│ ✻ Welcome to Claude Code!                                       │
│                                                                 │
│   /help for available commands                                  │
│   /plan to see current task plan                                │
╰─────────────────────────────────────────────────────────────────╯

>
```

## 常用命令

| 命令 | 說明 |
|------|------|
| `/help` | 顯示幫助 |
| `/plan` | 查看當前計劃 |
| `/usage` | 查看使用量 |
| `/deep-research` | 開始研究階段 |
| `/deep-innovate` | 開始創新階段 |
| `/deep-plan` | 開始計劃階段 |

## 專案配置

### CLAUDE.md

專案根目錄的 `CLAUDE.md` 定義了：
- 開發環境說明
- 全局服務模式
- 架構設計原則
- 測試指南
- Commit 規範
- Pre-commit 檢查

### .claude/skills/

定義了可用的 Skills：

```
.claude/skills/
├── issue-create/     # 創建 Issue
├── issue-plan/       # Issue 規劃
├── issue-action/     # Issue 執行
├── pr-review/        # PR 審查
├── pr-check/         # PR CI 檢查
├── tech-debt/        # 技術債務管理
├── code-quality/     # 代碼質量分析
├── testing/          # 測試指南
└── ...
```

### .claude/commands/

定義了快捷命令：

```
.claude/commands/
├── deep-research.md  # 研究階段
├── deep-innovate.md  # 創新階段
├── deep-plan.md      # 計劃階段
├── dev-start.md      # 啟動開發服務器
├── dev-stop.md       # 停止開發服務器
├── pr-create.md      # 創建 PR
└── ...
```

## 環境要求

### 必要工具

| 工具 | 用途 | 檢查命令 |
|------|------|----------|
| Node.js | 運行時 | `node --version` |
| pnpm | 包管理 | `pnpm --version` |
| Git | 版本控制 | `git --version` |
| GitHub CLI | GitHub 操作 | `gh --version` |

### GitHub CLI 認證

```bash
# 登入 GitHub
gh auth login

# 驗證狀態
gh auth status
```

## 首次使用檢查清單

- [ ] Claude Code 已安裝
- [ ] 專案已 clone
- [ ] GitHub CLI 已認證
- [ ] 環境變數已配置（`.env.local`）
- [ ] 依賴已安裝（`cd turbo && pnpm install`）
- [ ] 資料庫已遷移（`pnpm db:migrate`）
