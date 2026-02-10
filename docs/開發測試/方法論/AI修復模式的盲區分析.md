# AI 修復模式的盲區分析

> 來源：PR #2715 (vitest v4 upgrade) → Issue #2721 (node type pollution) — 2026-02-10

## 背景

vitest v3 → v4 升級，85 個檔案、大量 breaking changes 需要修復。AI（Claude）在高壓修復模式下做了一個看似無害但破壞了架構護欄的改動。

## 事件還原

### 升級前的狀態

| Package | tsconfig `types` | `@types/node` devDep | Node globals 可用？ |
|---------|-----------------|---------------------|-------------------|
| platform | `["vite/client"]` | 有 (`^22`) | **否** — types 欄位限制了自動載入 |
| core | `["vitest/globals"]` | 無 | **否** — types 欄位限制了自動載入 |

TypeScript 有兩個獨立機制：
1. **Global type auto-loading**（tsconfig `types` 欄位）— 控制 `Buffer`、`process` 等全域變數是否可見
2. **Module resolution**（`@types/node` 在 `node_modules`）— 控制 `import from "fs"` 能否 resolve

升級前，platform 雖然有 `@types/node` devDep，但 `types: ["vite/client"]` 阻止了 Node globals 自動注入。**這是刻意的護欄。**

### AI 做的修復

遇到 type error（`Cannot find name 'Buffer'` 等）後：

| 改動 | platform | core |
|------|----------|------|
| tsconfig `types` 加 `"node"` | ✅ 做了（**不必要**） | ✅ 做了（**不必要**） |
| 加 `@types/node` devDep | 已有 | ✅ 做了（**正確**） |

### 實際需要的修復

| | platform | core |
|---|----------|------|
| 實際需要 | **什麼都不用做** | 只加 `@types/node` devDep |
| 不需要 | tsconfig 加 `"node"` | tsconfig 加 `"node"` |

驗證：移除兩個 tsconfig 的 `"node"` 後，`pnpm turbo run check-types` 零錯誤。

### 後果

browser-only 的 platform 可以寫 `process.env.FOO`、`Buffer.from()` 不報錯。型別系統的護欄被拆掉了。

### 修復成本

PR #2726 修復 Phase A：3 行改動（移除 tsconfig `"node"` + 移除 devDep + 一個 ESLint rule 改用字串操作）。

**我們 95% 的工作完全正確且必要，問題出在 2 行 tsconfig 改動。** 這是增量修復，不是重做。

## 分析：為什麼 AI 沒發現？

### 直接原因

AI 處於「讓 CI 變綠」模式：
- 上一個 session 的改動遺失，80+ 檔案要從頭重做
- automock 移除、constructor 語法、Date.now 無限遞迴、S3Client.send 等多個問題排隊等待修復
- tsconfig 改動只是眾多修復中的一個，type error 消失就往下走了

**AI 做了「讓錯誤消失」而不是「理解錯誤在告訴我什麼」。**

### 根本原因

AI 沒有區分 TypeScript 的兩個機制（global auto-loading vs module resolution），把「加 `"node"` 到 types」和「加 `@types/node` 到 devDependencies」視為等價的修復手段。

這正是「約束放寬紅旗原則」的實例 — 遇到 type error 就把約束拆掉，沒有問約束為什麼存在。

### AI vs 人類的責任分配

| 角色 | 應該做什麼 | 為什麼沒做到 |
|------|-----------|------------|
| **AI** | 改 tsconfig `types` 時應觸發「約束放寬」檢查 | 在趕進度修 CI，沒有 pause |
| **人類** | 架構層面的守門（review 階段） | 85 檔 diff 中一行 tsconfig 改動很難注意到 |

**結論：這主要是 AI 應該發現的問題。** AI 有知識、是改動的執行者、也有足夠的 context。問題不是能力不足，是沒有在正確的時機觸發正確的思考。

## 提取的教訓

### 1. 「修 CI」模式的盲區

當 AI 進入高壓修復循環時，會退化成 pattern matching：「type error → 加 types」「module not found → 加 dependency」。失去了「這個修復是否破壞了其他不變量」的判斷力。

**對策：** 修復 config 檔時，無論壓力多大，強制 pause 一輪。

### 2. Config 改動 ≠ Code 改動

修改 tsconfig、eslint config、CORS 設定、IAM 權限等**約束性設定**時，影響範圍是全域的。不能用跟改一個函數一樣的心態處理。

**對策：** 每次修改約束性設定時觸發檢查清單：
- [ ] 這個約束原本為什麼存在？
- [ ] 我的修復影響範圍是否超過問題本身？
- [ ] 有沒有更精確的修復方式？

### 3. 「錯誤消失 ≠ 問題解決」

type error 消失不代表修復正確。可能只是把護欄拆了，讓原本會報錯的東西不報錯了。

**對策：** 修復後問一個反向問題：「如果有人在 platform 裡寫 `import fs from 'fs'`，現在會報錯嗎？」— 如果答案從「會」變成「不會」，你可能拆了護欄。

## 與「約束放寬紅旗原則」的關係

本案例是該原則的 **origin story**。原則本身在 `約束放寬紅旗原則.md` 中。本文聚焦於 **AI 特有的失敗模式** — 在高壓修復循環中喪失對約束語義的判斷力 — 以及相應的防護機制。

---

*PR #2715 的 85 個檔案改動中，95% 完全正確。問題出在 2 行 tsconfig 改動。修復成本是 3 行增量修改（PR #2726），不需要重做。*
