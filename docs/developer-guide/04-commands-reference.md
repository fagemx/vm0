# 04 - Commands 參考手冊

## Commands 概覽

Commands 是 Claude Code 中的快捷命令，位於 `.claude/commands/` 目錄。

使用方式：在 Claude Code 中輸入 `/command-name`

---

## Deep Dive Commands

### /deep-research

**用途**：深度研究階段 - 只收集信息

**使用方式**：
```
> /deep-research {task-description}
```

**可以做**：
- ✅ 讀取文件和代碼
- ✅ 詢問澄清問題
- ✅ 理解架構和依賴
- ✅ 追蹤代碼流程
- ✅ 記錄發現到 research.md

**不可以做**：
- ❌ 任何形式的建議
- ❌ 實施想法
- ❌ 計劃或路線圖
- ❌ 解決方案

**輸出**：`/tmp/deep-dive/{task-name}/research.md`

---

### /deep-innovate

**用途**：深度創新階段 - 頭腦風暴方案

**前提**：需要先完成 `/deep-research`

**使用方式**：
```
> /deep-innovate {task-description}
```

**可以做**：
- ✅ 討論多種解決方案
- ✅ 評估優缺點
- ✅ 探索架構替代方案
- ✅ 比較技術策略
- ✅ 記錄到 innovate.md

**不可以做**：
- ❌ 具體實施計劃
- ❌ 偽代碼或實現細節
- ❌ 時間估算
- ❌ 文件級別變更規格

**輸出**：`/tmp/deep-dive/{task-name}/innovate.md`

---

### /deep-plan

**用途**：深度計劃階段 - 制定實施計劃

**前提**：需要先完成 `/deep-research` 和 `/deep-innovate`

**使用方式**：
```
> /deep-plan {task-description}
```

**可以做**：
- ✅ 創建詳細實施步驟
- ✅ 指定文件變更
- ✅ 定義任務依賴和順序
- ✅ 識別風險和阻礙
- ✅ 記錄到 plan.md

**不可以做**：
- ❌ 實際寫代碼
- ❌ 提交或修改文件
- ❌ 運行測試或構建
- ❌ 任何執行操作

**輸出**：`/tmp/deep-dive/{task-name}/plan.md`

---

## 開發環境 Commands

### /dev-start

**用途**：啟動開發服務器

**使用方式**：
```
> /dev-start
```

---

### /dev-stop

**用途**：停止開發服務器

**使用方式**：
```
> /dev-stop
```

---

### /dev-tunnel

**用途**：啟動 tunnel（用於 webhook 測試）

**使用方式**：
```
> /dev-tunnel
```

---

### /dev-auth

**用途**：開發環境認證

**使用方式**：
```
> /dev-auth
```

---

### /dev-logs

**用途**：查看開發日誌

**使用方式**：
```
> /dev-logs
```

---

## PR Commands

### /pr-create

**用途**：創建 Pull Request

**使用方式**：
```
> /pr-create
```

---

## 技術債務 Commands

### /tech-debt-research

**用途**：技術債務研究（`tech-debt research` 的別名）

**使用方式**：
```
> /tech-debt-research
```

---

### /tech-debt-issue

**用途**：從研究結果創建 Issue（`tech-debt issue` 的別名）

**使用方式**：
```
> /tech-debt-issue
```

---

## 其他 Commands

### /preview-envs-cleanup

**用途**：清理 Preview 環境

**使用方式**：
```
> /preview-envs-cleanup
```

---

### /defensive-code-cleanup

**用途**：清理防禦性代碼

**使用方式**：
```
> /defensive-code-cleanup
```

---

## Command 文件結構

每個 Command 位於 `.claude/commands/{command-name}.md`：

```yaml
---
description: Command description
---

# COMMAND NAME MODE

You are entering **Command Name Mode**...

## LANGUAGE REQUIREMENT
...

## CRITICAL RESTRICTIONS
...

## WORKFLOW
...

## TASK
$ARGUMENTS
```

---

## Deep Dive 目錄結構

```
/tmp/deep-dive/
└── {task-name}/
    ├── research.md   # 研究階段輸出
    ├── innovate.md   # 創新階段輸出
    └── plan.md       # 計劃階段輸出
```

**注意**：`{task-name}` 是 Claude Code 根據任務自動生成的短描述名稱。
