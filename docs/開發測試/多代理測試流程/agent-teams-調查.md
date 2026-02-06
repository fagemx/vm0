# Agent Teams 可行性調查 (2026-02-07)

## 一、環境可行性

| 項目 | 狀態 |
|------|------|
| Claude Code 版本 | 2.1.34 ✅（2.1.32 起支援） |
| 環境變數 | 未設定，需手動啟用 |
| settings.json | 不存在，需建立 |
| tmux | 未確認，但 in-process 模式不需要 |

**結論：可用，需啟用。**

---

## 二、啟用方式

### 方案 A：環境變數（臨時）
```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

### 方案 B：settings.json（持久）
```bash
mkdir -p ~/.claude
echo '{ "env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" } }' > ~/.claude/settings.json
```

### 方案 C：專案級設定
加到 `.claude/settings.json`（會被 git 追蹤，不適合實驗性功能）

**建議：先用方案 A 測試，確認可行後改方案 B。**

---

## 三、運作架構

```
┌──────────────┐
│   Lead       │  ← 你啟動的 Claude Code session
│  (協調者)     │
└──┬───┬───┬───┘
   │   │   │    TeammateTool（自然語言派發）
   ▼   ▼   ▼
┌────┐┌────┐┌────┐
│ T1 ││ T2 ││ T3 │  ← 獨立 Claude Code instance
└────┘└────┘└────┘
   │   │   │
   ▼   ▼   ▼
  共用檔案系統 + 共用 Task List + Mailbox
```

### 共用的
- **Task List**：所有 agent 可見，含依賴追蹤，file locking 防搶
- **Mailbox**：agent 間可互傳訊息或廣播
- **專案 Context**：CLAUDE.md、skills、MCP servers
- **檔案系統**：同一個 working directory

### 不共用的
- **對話歷史**：teammate 不會繼承 lead 的 conversation
- **Context Window**：每個 agent 獨立的 token 空間
- **記憶體狀態**：無共用變數

---

## 四、操作方式

### 派發（自然語言）
```
Create a team with 3 teammates to write tests for these routes in parallel:
- Teammate 1: test api/cli/auth/device
- Teammate 2: test api/model-providers/[type] (delete)
- Teammate 3: test api/model-providers/[type]/set-default
Use Sonnet for each teammate to save tokens.
```

### 鍵盤快捷鍵
| 按鍵 | 功能 |
|------|------|
| `Shift+Up/Down` | 切換/選擇 teammate |
| `Enter` | 查看 teammate session |
| `Escape` | 中斷 teammate |
| `Ctrl+T` | 開啟 shared task list |
| `Shift+Tab` | Delegate mode（lead 只協調不實作） |

### 顯示模式
- `in-process`：同一終端內（推薦，不需 tmux）
- `tmux`：分割視窗（需安裝 tmux）
- `auto`：自動選擇

---

## 五、已知限制與陷阱

### 硬限制
1. **無 session 恢復** — `/resume` 不會恢復 teammates，需重新 spawn
2. **單一團隊** — 一個 session 只能管一個 team
3. **無巢狀** — teammate 不能再 spawn teammates
4. **權限鎖定** — teammate 繼承 lead 的權限模式

### 操作陷阱
5. **Lead 搶活做** — Lead 常常自己開始寫 code 而不等 teammates
   - 解法：用 delegate mode（`Shift+Tab`）或明確指示 "Wait for teammates"
6. **Task 狀態延遲** — teammate 有時忘記標記 task 完成，阻塞後續任務
   - 解法：等 10-15 秒再判斷，手動 nudge
7. **檔案衝突** — 兩個 teammate 改同一檔案 = 最後寫入者勝（無 merge）
   - 解法：**每個 teammate 只碰自己的檔案，共用檔案由 lead 處理**
8. **Spawn 缺 context** — teammate 不繼承對話歷史，spawn prompt 不夠詳細會做錯
   - 解法：spawn 時把 briefing 完整內容餵進去
9. **Token 成本** — 每個 teammate 是完整 instance，3 人 team = 3x tokens
   - 解法：用 Sonnet 而非 Opus；限制 2-3 人；避免廣播

---

## 六、跟我們 briefing 方案的對比

| 面向 | 方案 A: briefing + Task tool | 方案 B: Agent Teams |
|------|---------------------------|-------------------|
| **啟用** | 立即可用 | 需啟用 experimental flag |
| **穩定性** | 穩定（Task tool 已成熟） | 實驗性，有已知 bug |
| **協調方式** | 手動收集 output → 組裝 | 自動 Task List + Mailbox |
| **共用檔案處理** | Phase 2 手動合併 | 需規劃檔案所有權避免衝突 |
| **Context 傳遞** | briefing.md 完整餵入 | spawn prompt 需手動帶入 |
| **Token 成本** | 較低（subagent 用 haiku） | 較高（每個 teammate 完整 instance） |
| **監控能力** | 讀 output file | Shift+Up/Down 即時切換 |
| **適合場景** | 獨立任務、產出合併 | 需要互相溝通的複雜任務 |

---

## 七、實踐計畫

### 階段 1: 安全驗證（先做這個）

**目標**：確認 Agent Teams 在此環境能正常運作，不碰專案代碼。

```
步驟：
1. export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
2. 重新啟動 claude
3. 請求建立一個 2 人 team 做簡單任務（如讀檔 + 摘要）
4. 觀察：
   - teammate 是否成功 spawn？
   - task list 是否正常運作？
   - messaging 是否正常？
   - 資源消耗如何？
5. 記錄結果
```

### 階段 2: 只讀任務測試

**目標**：用 Agent Teams 做不修改檔案的任務，驗證協調能力。

```
任務：平行分析 3 個未測試的 route
- Teammate 1: 讀 api/cli/auth/device/route.ts，列出所有分支和測試案例
- Teammate 2: 讀 api/model-providers/[type]/route.ts，同上
- Teammate 3: 讀 api/model-providers/[type]/set-default/route.ts，同上
- Lead: 收集三份分析，驗證品質
```

### 階段 3: 寫入任務測試

**目標**：用 Agent Teams 實際寫測試，驗證檔案衝突處理。

```
關鍵設計：
- 每個 teammate 只寫自己的 __tests__/route.test.ts
- api-test-helpers.ts 由 lead 統一修改（避免衝突）
- teammate 只產出「需要的 helper 定義」文字，不直接改檔案
```

### 階段 4: 跟方案 A 對比

**目標**：量化兩套方案的效率差異。

```
用同樣的 3 個 route，分別用兩套方案各跑一次：
- 記錄：時間、品質、token 消耗、人工介入次數
- 決定哪套方案更適合我們的場景
```

---

## 八、風險評估

| 風險 | 影響 | 緩解 |
|------|------|------|
| experimental 功能不穩定 | 浪費時間 debug 工具本身 | 階段 1 先驗證基本功能 |
| token 成本暴增 | 預算消耗過快 | 用 Sonnet、限制 team size |
| 檔案衝突損壞代碼 | 需要 git 恢復 | 每次測試前 commit/stash |
| spawn context 不足導致產出品質差 | 需要重做 | briefing 完整帶入 spawn prompt |

---

## 更新紀錄

| 日期 | 內容 |
|------|------|
| 2026-02-07 | 初版調查，含可行性、限制、實踐計畫 |
