# Agent Teams 實戰筆記

> 基於 batch #3 實戰經驗撰寫。Agent Teams 是 Claude Code 的實驗性功能，讓多個 Claude Code session 作為 team 平行工作。

---

## 一、啟用方式

Agent Teams 預設關閉，需手動啟用後**重啟 Claude Code session**。

```json
// ~/.claude/settings.json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

重啟後可驗證：`echo $CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` → `1`

---

## 二、運作架構

```
┌──────────────────┐
│   Lead (你)       │  ← 你啟動的 Claude Code session
│  建立 team        │
│  建立 tasks       │
│  派發 teammates   │
│  收集結果         │
└──┬───┬───┬───────┘
   │   │   │    Task tool + team_name 參數
   ▼   ▼   ▼
┌────┐┌────┐┌────┐
│ T1 ││ T2 ││ T3 │  ← 各自獨立的 Claude Code session
│    ││    ││    │     有完整的工具存取能力
└────┘└────┘└────┘
   │   │   │
   ▼   ▼   ▼
  共用檔案系統 + 共用 Task List + Mailbox
```

### 共用的
- **Task List**：`~/.claude/tasks/{team-name}/`，所有 agent 可讀寫
- **Mailbox**：agent 間可互傳訊息（message/broadcast）
- **專案 Context**：CLAUDE.md、skills、MCP servers
- **檔案系統**：同一個 working directory

### 不共用的
- **對話歷史**：teammate 不繼承 lead 的 conversation
- **Context Window**：每個 agent 獨立的 token 空間

---

## 三、完整操作流程（實戰版）

以 batch #3 為例（3 個 API route 測試）：

### Step 1: 建立 Team
```
TeamCreate → team_name: "batch3-tests"
```

### Step 2: 建立 Tasks
```
TaskCreate × 3（每個 route 一個 task，含詳細描述）
```

### Step 3: 派發 Teammates
```typescript
// 每個 teammate 用 Task tool + team_name 派發
Task({
  subagent_type: "general-purpose",
  team_name: "batch3-tests",
  name: "token-tester",
  mode: "bypassPermissions",     // 讓 teammate 不用每步都問你
  run_in_background: true,       // 背景執行
  prompt: "完整的任務描述..."
})
```

**關鍵**：3 個 Task 呼叫放在同一個 message 裡 → 平行啟動。

### Step 4: 等待結果
- Teammates 完成後會自動發送 message 給 lead
- Lead 收到 idle_notification 表示 teammate 已完成當前工作

### Step 5: 驗證 + 收尾
```
1. 跑所有測試確認通過
2. 跑 lint + prettier + type-check
3. Commit + push
```

### Step 6: 關閉 Team
```
SendMessage(type: "shutdown_request") × 3  → 等 teammates 確認
TeamDelete → 清理 team 資源
```

---

## 四、跟 Subagent (Task tool) 的關鍵差異

| 面向 | Subagent (Task tool) | Agent Teams |
|------|---------------------|-------------|
| **本質** | 函式呼叫：dispatch → 回傳結果 | 獨立 session：有完整工具能力 |
| **工具存取** | 有限（依 subagent_type） | 完整（能讀、寫、跑命令） |
| **自修能力** | ❌ 無法跑測試修 bug | ✅ 能跑測試、看錯誤、自己修 |
| **通訊** | 單向：結果回傳 lead | 雙向：teammates 互相溝通 |
| **品質** | 依賴 briefing 品質 | 自主研究 codebase |
| **人工介入** | 高（lead 需組裝 + 修正） | 低（teammate 自行完成） |
| **Token 成本** | 低 | 高（每個 teammate 是完整 instance） |

### 實測數據對比

| 批次 | 方法 | Routes | Tests | 人工修正 | 每 route 耗時 |
|------|------|--------|-------|---------|-------------|
| #2 | Subagent | 3 | 8 | 3 點 + 手動修 2 檔 | ~2.7m |
| #3 | Agent Teams | 3 | 17 | **0** | **~1.3m** |

---

## 五、為什麼 Agent Teams 品質更好

### Subagent 的根本問題（batch #2 教訓）

Subagent 收到 briefing 後**只能靠文字描述理解 codebase**。batch #2 的 agent 1、2 因為沒有工具存取能力：
- 用了不存在的 `testContext.reset()`
- 用了錯誤的 `createTestRequest("GET", "/api/...")` 語法
- 需要 lead 手動修正 2 個檔案

### Agent Teams 的關鍵優勢

每個 teammate 是完整 Claude Code session，能：
1. **自己讀 codebase** → 用 Read/Grep/Glob 研究真實代碼
2. **自己寫檔案** → 直接 Write 測試檔
3. **自己跑測試** → Bash 執行 vitest，看到真實錯誤訊息
4. **自己修 bug** → 根據錯誤訊息調整代碼
5. **自己跑 lint** → 確保代碼品質

batch #3 的 token-tester 甚至自主發現 api-test-helpers.ts 缺少 3 個 helper 函數，自己新增了。

---

## 六、適合使用的場景

### ✅ 強烈推薦

| 場景 | 原因 |
|------|------|
| **平行寫獨立檔案** | 每個 teammate 有自己的輸出檔，無衝突 |
| **需要跑測試驗證** | teammate 能自己跑測試、自己修 bug |
| **需要研究 codebase** | teammate 有完整工具存取能力 |
| **任務複雜度中等以上** | 簡單任務 subagent 就夠，複雜的才值得 Agent Teams 的 overhead |

### ⚠️ 可以但要小心

| 場景 | 注意事項 |
|------|---------|
| **需要改共用檔案** | 指定只有一個 teammate 改，或 lead 統一處理 |
| **需要互相依賴的任務** | 用 Task 依賴關係（blockedBy）控制順序 |

### ❌ 不推薦

| 場景 | 原因 |
|------|------|
| **改同一個檔案** | 無 merge 能力，最後寫入者勝 |
| **簡單的獨立任務** | subagent 更快更省 token |
| **需要 session 恢復** | `/resume` 不會恢復 teammates |

---

## 七、注意事項和陷阱

### 1. Prettier 陷阱（batch #3 教訓）

**問題**：teammates 跑了 lint 但沒跑 prettier → CI 失敗。

**解法**：在 briefing/prompt 中明確要求驗證步驟：
```
1. 跑測試
2. 跑 lint
3. 跑 prettier --check（漏這個就會 CI 失敗）
4. 跑 type check
```

### 2. 筆記檔案遺失

**問題**：筆記只在 `personal/notes` 分支上，切換分支就消失。

**解法**：每次需要筆記時從 `origin/personal/notes` checkout。這是 git 行為，不是 Agent Teams 的問題。

### 3. Staging 區污染

**問題**：從 personal/notes checkout 的筆記檔會進 staging 區，commit 時可能誤帶進去。

**解法**：commit 前一定要 `git reset HEAD -- docs/ AGENTS.md`，只 stage 測試代碼。

### 4. 共用檔案衝突

**問題**：batch #3 的 token-tester 自行修改了 api-test-helpers.ts，如果另一個 teammate 也改就會衝突。

**解法**：
- 預估哪些共用檔案會被改，分配給特定 teammate
- 或在 prompt 中指示 "不要改 api-test-helpers.ts，把需要的 helper 定義回報給 lead"

### 5. 環境變數

**問題**：`DATABASE_URL` 不在 vitest 的 setup.ts 中 stub，需要從環境帶入。

**解法**：在 prompt 中明確寫出完整的測試執行命令：
```
DATABASE_URL=postgresql://ubuntu:vm0dev@localhost:5432/vm0_dev pnpm vitest run <path>
```

### 6. Fork 貢獻者權限

**問題**：fork 貢獻者無法在上游 repo 加 label 或 assign issue。

**解法**：在 issue body 中說明，讓 maintainer 幫忙操作。

---

## 八、Prompt 設計要點

Teammate 不繼承 lead 的對話歷史，所以 spawn prompt 要自給自足。

### 必須包含的資訊

1. **角色定位** — "You are a teammate on the {team} team. Your task is Task #{n}"
2. **工作流程** — 明確的步驟（Research → Write → Test → Fix → Report）
3. **要讀的參考檔** — briefing 路徑、existing test examples、test helpers
4. **完整的執行命令** — 含環境變數的測試/lint 命令
5. **驗證步驟** — 測試 → lint → prettier → type-check
6. **回報方式** — "Mark task as completed and send a message to team lead"

### 避免的錯誤

- ❌ 假設 teammate 知道之前的討論內容
- ❌ 給模糊指示（"follow project conventions"）而不指明哪個檔案
- ❌ 漏掉環境變數或完整命令
- ❌ 不指定驗證步驟 → teammate 跑了測試但漏了 prettier

---

## 九、效率追蹤

| 批次 | 方法 | Routes | Tests | Helpers | 人工修正 | 每 route 耗時 | 加速比 |
|------|------|--------|-------|---------|---------|-------------|--------|
| 基準 | 單一代理 | 1 | 6 | 3 | N/A | 30m | 1x |
| #1 | Subagent | 3 | 12 | 0 | 2 點 | ~1.7m | 18x |
| #2 | Subagent | 3 | 8 | 0 | 3 點 + 修 2 檔 | ~2.7m | 11x |
| #3 | **Agent Teams** | 3 | 17 | 3 | **0** | **~1.3m** | **23x** |

---

## 十、補充心得

### 1. Agent Teams 的核心價值是「自修能力」

Subagent 的最大瓶頸不是速度，而是**產出品質不可控**。因為 subagent 沒有工具存取能力，它只能根據 briefing 的文字描述「猜」正確的 API 用法。Agent Teams 的 teammate 能自己讀代碼、跑測試、看錯誤、修正——這個 feedback loop 是品質的根本保障。

### 2. Token 成本值得

Agent Teams 的 token 成本確實更高（每個 teammate 是完整 instance），但考慮到：
- 零人工修正 = 不需要 lead 花時間 debug 和重寫
- 更多測試覆蓋（17 vs 8）
- 更快完成（4m vs 8m）

**總 TCO 反而更低。**

### 3. Briefing 仍然重要

Agent Teams 不是「什麼都不管就能出好結果」。batch #3 之所以成功，是因為：
- Briefing 經過 batch #1、#2 的迭代優化
- Prompt 包含完整的工作流程和驗證步驟
- 明確指定要讀哪些參考檔案

Briefing 品質 × Agent 能力 = 最終品質。

### 4. 檔案所有權是必須規劃的

batch #3 token-tester 自行修改了 api-test-helpers.ts，恰好沒衝突。但這是運氣好。正確做法是：
- 預先分析哪些共用檔案會被改
- 指定唯一的 owner
- 或讓 lead 統一處理共用檔案修改

### 5. 驗證步驟必須寫死在 prompt 裡

batch #3 的 prettier 失敗教訓：如果你不在 prompt 裡明確列出每一步驗證，teammate 就會漏掉。把所有 CI 會檢查的項目都寫進 prompt。

---

## 更新紀錄

| 日期 | 內容 |
|------|------|
| 2026-02-07 | 初版調查，含可行性、限制、實踐計畫 |
| 2026-02-07 | 根據 batch #3 實戰結果全面改寫，加入操作流程、對比數據、心得 |
