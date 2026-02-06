# VM0 Contribution Playbook

> 外部貢獻者的入門指南 - 系統性地發現小型貢獻機會

## 定位

本指南適用於**外部貢獻者**，專注於：
- 小型修復和改進
- 低風險貢獻
- 不需要深入理解整體架構

> 💡 **想要進行完整功能開發？**
> 請參閱 [Developer Guide](../developer-guide/README.md)，學習使用 Claude Code 進行高效開發。

## 目標

在 1-2 個月內，透過多個代理協作，持續為 vm0 專案提供高品質的貢獻。

## 文件索引

| 文件 | 用途 | 使用者 |
|------|------|--------|
| [01-project-conventions.md](./01-project-conventions.md) | 專案規範速查 | 所有代理 |
| [02-exploration-guide.md](./02-exploration-guide.md) | 探索貢獻機會 | 探索代理 |
| [03-pre-contribution-checklist.md](./03-pre-contribution-checklist.md) | 開始前檢查清單 | 實作代理 |
| [04-validation-guide.md](./04-validation-guide.md) | 驗證與測試 | 實作代理 |
| [05-submission-guide.md](./05-submission-guide.md) | 提交與推送 | 主代理 |

## 工作流程

```
┌─────────────────────────────────────────────────────────────────┐
│                        主代理 (Coordinator)                      │
│  - 分配任務                                                      │
│  - 最終驗證                                                      │
│  - 推送 PR                                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   探索代理 A     │ │   探索代理 B     │ │   探索代理 C     │
│  - 搜索 TODO    │ │  - 分析 Issues  │ │  - 代碼審查     │
│  - 找硬編碼值   │ │  - 追蹤 PR 趨勢 │ │  - 找重複代碼   │
└─────────────────┘ └─────────────────┘ └─────────────────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ▼
                    ┌─────────────────┐
                    │    貢獻候選清單   │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   實作代理       │
                    │  - 實現修改      │
                    │  - 本地驗證      │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   主代理驗證     │
                    │  - 規範檢查      │
                    │  - 推送 PR       │
                    └─────────────────┘
```

## 快速開始

### 對於探索代理

1. 閱讀 [01-project-conventions.md](./01-project-conventions.md) 了解專案規範
2. 按照 [02-exploration-guide.md](./02-exploration-guide.md) 探索貢獻機會
3. 將發現記錄到 `findings/` 目錄

### 對於實作代理

1. 閱讀 [01-project-conventions.md](./01-project-conventions.md) 了解專案規範
2. 按照 [03-pre-contribution-checklist.md](./03-pre-contribution-checklist.md) 檢查
3. 實現修改
4. 按照 [04-validation-guide.md](./04-validation-guide.md) 驗證

### 對於主代理

1. 審核實作代理的修改
2. 按照 [05-submission-guide.md](./05-submission-guide.md) 推送 PR
3. 追蹤 PR 狀態

## 成功指標

- [ ] PR 被合併
- [ ] 無 CI 失敗
- [ ] 符合專案規範
- [ ] 獲得維護者正面反饋

## 與 Developer Guide 的區別

| 項目 | Contribution Playbook | Developer Guide |
|------|----------------------|-----------------|
| **適用對象** | 外部貢獻者 | 核心開發者 |
| **貢獻範圍** | 小修復、配置化、文檔 | 新功能、大型重構 |
| **方法** | 手動搜索 + 手動實施 | Claude Code 自動化 |
| **工具** | grep、git、gh | Claude Code Skills |
| **流程** | 被動認領 Issue | 主動發現 + 創建 |
| **風險** | 低 | 可控 |

## 經驗記錄

| 日期 | PR | 結果 | 學習 |
|------|-----|------|------|
| 2026-02-05 | #2373 連接池可配置化 | ✅ 合併 | 需要更新 turbo.json |
| 2026-02-05 | #2374 Rate Limiting | ❌ 關閉 | 架構決策需先討論 |
| 2026-02-06 | #2445 Pending Run TTL | ⏳ Review 中 | TODO 是最佳切入點 |
| 2026-02-06 | #2465 CLI Scope 測試修復 | ⏳ Review 中 | 測試反模式 AP-4 修復 |

## 關鍵教訓

### 🔑 TODO 搜索必須是第一步

我們走了彎路：先找硬編碼值（#2373），再嘗試新功能（#2374 被關閉），最後才發現 `run-service.ts` 裡的 TODO 才是最有價值的貢獻機會。

**教訓**：`TODO`/`FIXME`/`HACK` 是作者主動標記的待修項目，應該永遠是探索的第一步。

```bash
# 每次探索的第一個命令
grep -rn "TODO\|FIXME\|HACK\|XXX" turbo/apps/ --include="*.ts" | grep -v node_modules
```

### 🔑 深入分析 TODO，不要只看表面

`run-service.ts` 的 TODO 表面上看像是「刪除過時註解」，但深入分析後發現是一個**真正的邏輯缺陷**：stale pending runs 會佔用並發額度。最終的 PR 修改了查詢邏輯，而非僅刪除註解。

### 🔑 提交前必須自我審查（Self-Review）

PR #2445 的 reviewer 指出 `vi.unstubAllEnvs()` 在 vitest 中是多餘的。這個問題**本可以在提交前被發現**。

專案內建了 `code-quality` skill，可以檢測 17 種 Bad Smell：

```
❌ 我們的流程：寫代碼 → 推送 → 等 reviewer 來抓問題
✅ 正確的流程：寫代碼 → 自我審查 → 修好 → 推送
```

**教訓**：`.claude/skills/code-quality/` 和 `.claude/skills/pr-review/` 是專案內建的自動審查工具。在推送 PR 之前先跑一次，能省去 review 來回修改的時間。

### 🔑 Reviewer 反饋是學習機會

PR #2445 的 reviewer 指出 `vi.unstubAllEnvs()` 在 vitest 中是多餘的（vitest 會自動清理）。這類細節只有通過實際 review 才能學到。
