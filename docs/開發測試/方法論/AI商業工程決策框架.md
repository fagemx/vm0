# AI 商業工程決策框架

> 從 2026-02-08 與 Claude Opus 4.6 的對話中提煉。核心發現：商業決策和工程決策不能分開做，工程事實決定商業可行性。

---

## 背景：我有什麼

| 專案 | 本質 | 核心能力 |
|------|------|---------|
| **SaaStoAI** | AI agent 執行平台 | Rust rebuild、contract-first、sandbox（E2B/Firecracker）、排程 |
| **EmbedGov** | 嵌入式 AI 治理內核 | PolicyEngine、Evidence Chain（hash chain + Merkle root）、wrapOpenAI() 一行嵌入 |
| **vm0 貢獻** | 開源社群經驗 | 理解 agent runtime 的實際架構、用戶體驗、瓶頸 |

這三個不是三個產品，是同一個故事的不同層。

---

## 對 AI 的指令

### 禁止事項

- **不要當分析師** — 不要列風險矩陣然後說「需要注意」
- **不要說不可能** — 我一個人做了三個專案，不需要你告訴我什麼做不到
- **不要用 YC 教科書** — 「找第一個客戶」「先做 MVP」這些我知道，不需要你教
- **不要把商業和工程分開討論** — 工程架構決定商業路徑，反過來也是
- **不要預設 SaaS 時代的分類** — 「賣內容 / 賣平台 / 賣企業軟體」這種三選一是過時的框架

### 必須做的事

- **先確認工程事實** — 這個工作流真的需要 agent 嗎？一次 API call 能不能解決？如果不需要 agent，runtime 層就是成本不是優勢
- **挑戰前提** — 不接受任何預設分類，從第一原理思考
- **置換視角** — 「如果你是 lancy（務實工程主管），你怎麼看？」「如果你是那個設計師，你在意什麼？」
- **架構要從第一天就能長到十萬用戶** — 0-1 不夠，要一次想到 0→1→100→1000→10000→100000
- **小白不等於給爛東西** — 小白可能是設計師、法官、醫生，專業人士只是不會寫 code

---

## 核心提問模式（lancy 式）

每次討論商業方向時，用這些問題檢驗：

1. **這個工作流真的需要 agent 嗎？** — 如果一次 LLM call 就夠，你的 runtime 架構太重了
2. **使用者在意的是結果還是過程？** — 設計師要的是設計簡報，不是看 agent 跑 8 個 step
3. **收錢的點在哪？** — 工具免費到處嵌，商業價值在上層（Anthropic 模式：Claude Code 免費，API 收費）
4. **架構改不改？** — 從 1 個用戶到 10 萬用戶，底層架構能不能不動？如果要重寫，現在就設計錯了
5. **你依賴誰？** — 依賴 vm0？依賴 OpenAI？依賴 E2B？每個依賴都是風險點

---

## 已確認的工程事實

### vm0 實測數據（2026-02-08）

| 指令 | 時間 | 結論 |
|------|------|------|
| `vm0 agent list` | 1.8s | API 類指令很快 |
| `vm0 usage` | 1.5s | API 類指令很快 |
| `vm0 run`（簡單任務） | 27-40s | sandbox 啟動 ~14s + LLM ~3s/turn |

- Sandbox cold start 14 秒是架構限制，不是 CLI 問題
- 即時互動場景 sandbox 不適合，MCP/本機優先
- 批次/無人值守場景 sandbox 有價值

### MCP vs 雲端 sandbox

| 考量 | MCP（本機） | 雲端 sandbox |
|------|------------|-------------|
| 延遲 | 毫秒級 | 14s+ 啟動 |
| 資料安全 | 不離開內網 | 經過第三方 |
| 互動性 | 即時 | 跑完才拿結果 |
| 隔離性 | 低（你的電腦） | 高（容器） |
| 適合場景 | 查詢/對話/小步迭代 | 批次/爬網/無人值守 |

### EmbedGov 已有能力

- PolicyEngine：block / redact / require_review / replace_output
- Evidence Chain：hash chain + Merkle root，不可篡改
- Explain 可重放：同 input + 同 policy → 同 decision
- Verify：事後驗證完整證據鏈
- SDK wrapper：`wrapOpenAI()` 一行嵌入
- Schema：Zod validated，event_version 版本化
- 多租戶：schema 已有 org_id / project_id / tenant_id

---

## 商業路徑（進行中）

### 方向：賣「AI 做事 + 證明 AI 做對了」

不是賣 pack、不是賣 runtime、不是賣治理。三個合在一起才是完整商品。

### 待解決的關鍵問題

1. **哪些工作流真的需要 agent？** — 決定 runtime 層的必要性
2. **第一個工作流選哪個職業？** — 設計師？法律？醫療？
3. **嵌入策略** — wrapOpenAI 只是開始，要做到每個 AI SDK 都有 EmbedGov（Anthropic 模式）

### 架構要求

```
使用者介面（Web / Line bot / Slack / 插件 — 任何入口）
    ↓
SaaStoAI（調度、判斷用 API call 還是 agent、選 MCP 還是雲端）
    ↓
EmbedGov（每一步都有紀錄、可驗證、可回放）
    ↓
輸出（結果 + 證據）
```

- 1 用戶 → 雲端、SQLite
- 100 用戶 → PostgreSQL、訂閱制
- 1000 小團隊 → 多租戶、權限
- 10000 企業 → self-hosted、合規報告
- 100000 → 平台化、別人做模板你收費

架構不變，開的功能不同，收的錢不同。

---

## 對話品質規則

好的對話長這樣：
- 工程事實 → 商業推論 → 置換視角檢驗 → 結論
- 不是：風險列表 → 建議保守 → 等你準備好再說

如果 AI 開始列風險矩陣或說「現階段不可行」，直接打斷，要求用 lancy 視角重新提問。
