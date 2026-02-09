# SaaStoAI 產品工程架構 v0.2

> 2026-02-09 v0.2。從 v0.1 升級：加入 OverlayPatch 模型、Router 合約、合併規則、Gateway 護欄、Trace 事件。
> 所有工程段落用「能施工」的語言寫，可直接作為開發規格。

---

## 一句話定義

**讓 AI 在你的工作脈絡裡越用越對、越用越省。**

不是幫你做完一件事，是讓你每天的工作越來越順。

---

## 問題：SaaS 和 Raw AI 之間的缺口

```
SaaS：固定輸出 → 零校準 → 但不智能（查庫存、填表、CRUD）
Raw AI（ChatGPT）：任意輸出 → 高校準 → 而且每次重來

缺口：需要一個系統能在推論階段累積對齊，使校準成本隨使用遞減。
```

使用者用 ChatGPT 做專業工作，每次要重新教它：格式、語氣、重點、邊界。這個「重新教」的成本就是校準成本。目前沒有產品在解決這個問題。

---

## 商業模型

### 入口：OpenClaw Gateway

OpenClaw（176k stars）用戶的最大痛點：API key 管理和安全。

```
現狀（OpenClaw 用戶）：
  自己申請 API key → 貼進設定 → key 洩漏到 prompt 裡 → 安全問題

我們的 Gateway：
  用戶註冊 → 拿 token → 貼進 OpenClaw → 完事
  API key 在 gateway 端，agent 永遠碰不到
```

Gateway 解決用戶最痛的問題（安全 + 簡化），同時把所有流量引到我們這裡。

### 收入結構

| 層 | 內容 | 定價 |
|---|------|------|
| 免費 | 每月基礎額度，基本模型 | $0 |
| Pro | 更多額度 + 更強模型 + overlay 校準 | $20/月 |
| Pack | 預校準好的職業工作流（合約審查、競品分析等） | $X 一次買 / 訂閱 |
| Team | 全團隊共享校準 + 管理後台 | $Z/月/人 |

收入來源：
1. **LLM token 差價**（跟 OpenRouter 一樣，中間抽成）
2. **校準服務**（overlay / pack 是付費功能）
3. **Pack marketplace**（社群/專家製作的 pack 抽成）

### 成長路徑

```
Phase 1：Gateway（安全 + 簡化） → 吸引 OpenClaw 用戶
Phase 2：Overlay（越用越準） → 留住用戶，形成黏性
Phase 3：Pack marketplace（預校準工作流） → 社群 + 變現
Phase 4：Workspace（carrier + 多 skill） → 從工具變成工作平台
```

---

## 工程架構

### 核心概念

**Overlay 不是文字，是 Patch（補丁）。**

v0.1 的 overlay 只有 `{ operator, text }`，所有校準只能塞進 prompt。但「每個風險附法條」這句話同時需要影響 schema（加必填欄位）和 validator（檢查有沒有引用）。只有一個 `text` 欄位做不到。

v0.2 的 overlay 是 OverlayPatch — 帶有「去哪裡」和「怎麼作用」的結構化補丁。內容仍然是自然語言（不欄位化業務），但控制面標準化。

### OverlayPatch 結構

```typescript
interface OverlayPatch {
  id: string;                    // uuid
  destination: Destination;      // 要影響系統的哪個面向
  op: PatchOp;                   // 怎麼影響
  strength: "soft" | "hard";     // soft 可被高層覆蓋，hard 不可
  scope_kind: string;            // v0: "user" | "project" | "skill"（用 string 不用 enum，未來可擴充）
  scope_id: string | null;       // user 層為 null，project/skill 有具體 id
  payload: string;               // 自然語言，不限格式（opaque）
  source: PatchSource;           // 怎麼來的
  ttl: "session" | "permanent";  // v0 只做這兩種
  created_at: string;            // ISO 8601
}

// 7 個出口，v0 只實作前 3 個
type Destination =
  | "prompt"       // v0：風格、語氣、禁區、指令
  | "schema"       // v0：輸出結構、必填欄位
  | "validator"    // v0：完整性檢查、硬規則
  | "rag"          // v1：背景資料注入
  | "fewshot"      // v1：好壞例子
  | "ui_gate"      // v1：需要人確認才能繼續
  | "tool_config"; // v1：工具/資料源選擇

// v0 最小操作集
type PatchOp =
  | "add"          // 新增一條校準
  | "remove"       // 移除一條校準
  | "replace"      // 替換同位置的校準
  | "constrain";   // 加硬限制（不可被 soft 覆蓋）

type PatchSource =
  | "manual"       // 使用者手動新增
  | "accepted"     // 從 trace 中「接受」動作蒸餾
  | "rejected"     // 從 trace 中「拒絕」動作蒸餾
  | "distilled"    // 系統自動蒸餾
  | "pack";        // 從 pack 安裝
```

**關鍵設計決策**：`scope_kind` 用 `string` 不用 `enum`。v0 只允許 `"user" | "project" | "skill"` 三個值（程式碼層做 validation），但資料庫欄位接受任意 string。未來加 `"team"` 或 `"document"` 只需放寬 validation，不用 migration。

### 四種 Operator

Operator 定義校準的語義方向，和 `destination` / `op` 是不同維度：

| Operator | 語義 | 使用者怎麼觸發 | 對 destination 的影響 |
|----------|------|--------------|---------------------|
| **Attract** | 靠近這個輸出形狀 | 「好，以後都這樣」 | prompt: 加正面指令；schema: 加欄位 |
| **Repel** | 遠離這種模式 | 「不要再這樣」、刪掉某段 | prompt: 加禁止指令；fewshot: 加壞例子 |
| **Boundary** | 絕對不能越線 | 「不能漏看保密條款」 | validator: 加必檢項（hard strength） |
| **Uncertainty Gate** | 尚未定案，不要當成已知 | 「這裡不確定，先標記」 | prompt: 加「不要假設」指令。**永遠不進 validator。** |

**Uncertainty Gate 是一等公民。** 它存在的目的是防止 Distill 把暫定的偏好固化成硬規則（poisoning）。規則很簡單：帶 uncertainty operator 的 patch 永遠 `destination = prompt`，永遠 `strength = soft`，永遠不會被蒸餾成 `constrain` op。

使用者不需要知道這些名詞。他在工作流裡的自然動作（接受、拒絕、標記、圈選）被系統解讀成對應的 operator。

### Overlay 三層 Scope

```
User 層（跨所有工作）
  └── Project 層（跟著一個 carrier 走）
        └── Skill 層（做某類任務的標準）
```

| 層 | scope_kind | scope_id | 生命週期 | 例子 |
|---|-----------|----------|---------|------|
| User | `"user"` | `null` | 永久 | 「不要空泛分析」「表格優先」 |
| Project | `"project"` | carrier_id | 跟著案件/客戶/專案 | 「這是 IP 案」「法官偏好簡短」 |
| Skill | `"skill"` | skill_id | 跟著任務類型 | 「合約審查先看賠償條款」 |

每個 patch 有兩個座標：`scope_kind`（屬於誰）和 `destination`（影響哪裡）。例如：

- 「每個風險附法條」→ `scope_kind = "skill"`, `destination = "schema" + "validator"`
- 「陳案是 IP 案」→ `scope_kind = "project"`, `destination = "rag"`（v1 才實作）
- 「不要空泛分析」→ `scope_kind = "user"`, `destination = "prompt"`

---

## Router

### Router 合約

Router 是一個函數，接收校準訊號，回傳路由決策：

```typescript
interface CalibrationSignal {
  kind: string;        // "accept" | "reject" | "modify" | "comment" | "flag"
  operator: string;    // "attract" | "repel" | "boundary" | "uncertainty"
  payload: string;     // 使用者的原始輸入 / 動作描述
  scope_kind: string;  // "user" | "project" | "skill"
  scope_id: string | null;
}

interface RouteDecision {
  destination: Destination;
  op: PatchOp;
  strength: "soft" | "hard";
  confidence: number;    // 0-1，v0 幾乎永遠 1.0（因為規則寫死）
  reason_code: string;   // 小枚舉，10 個以內
}

// Router interface — v0 用 if/else，v1 可換成 ML model
function route(signal: CalibrationSignal): RouteDecision[];
```

**v0 的 Router 就是一組 if/else。** 外部呼叫方式不變，以後換成 LLM 判斷或 ML model，呼叫方式一樣。每一次 if/else 的決策都記錄在 trace，讓 v1 有數據可以學。

### v0 Routing Policy（6 條規則）

1. **預設 destination = `prompt`。** 大部分校準都塞 prompt，這是最安全的起始路由。
2. **使用者明確表達格式/結構要求 → `schema`。** 例如「輸出要有引用欄」「用表格」。
3. **使用者明確表達必檢項/完整性要求 → `validator`。** 例如「漏看的標記未審查」「每條都要審」。
4. **`uncertainty` operator 永遠走 `prompt`。** 不進 validator，不固化為 constraint。UI 端標記為「暫定」。
5. **每次路由都寫入 `route_decided` trace 事件。** 記錄 signal + destination + reason_code。
6. **使用者動作「接受不改」→ 正向訊號。** 不產生新 patch，但記錄在 trace（`kind = "accept"`）。Distill 需要知道什麼是好的，不只知道什麼要改。

**reason_code 枚舉（v0）：**
```
default_prompt     — 預設路由
explicit_format    — 使用者明確要求格式
explicit_check     — 使用者明確要求檢查
uncertainty_guard  — uncertainty 保護
accept_no_change   — 接受無修改
reject_content     — 拒絕內容
modify_partial     — 部分修改
flag_for_review    — 標記待確認
boundary_hard      — 硬邊界
manual_override    — 手動指定
```

---

## 合併規則

### 層級優先順序（由低到高）

```
1. Skill base（骨架，最低優先）
2. Pack（預校準）
3. User（個人偏好）
4. Session（本次臨時，最高優先）
```

v0 只有這 4 層。未來加 Team 層插在 Pack 和 User 之間。

### 確定性合併規則

1. **`hard` 永遠壓過 `soft`。** 無論來自哪一層。
2. **高層壓低層。** Session > User > Pack > Skill base。
3. **同層同 destination 衝突：** `constrain > replace > add/remove`。
4. **不允許默默覆蓋 hard：** 如果低層有 `hard` patch，高層試圖用 `soft` 覆蓋它 → 合併失敗，產生衝突。
5. **衝突處理：** 衝突的 patch 暫存，不套用，記錄在 trace，標記為 `needs_resolution`。v0 用 log 警告 + 保留原有 hard patch。v1 實作 `ui_gate` 讓使用者選擇。

### 組裝順序

```
1. 從 DB 撈出目標 carrier 的所有 active patch
2. 按 scope 分組：skill_base → pack → user → session
3. 同組內按 destination 分桶
4. 每個桶內按合併規則疊加
5. 衝突的標記出來，不套用
6. 最終產出每個 destination 的 assembled patches
```

---

## Gateway 核心流程

```
使用者（OpenClaw / Web / API）
    ↓ user token
Gateway
    ├── 1. 認證：驗 token，查用戶，檢查 rate limit / spending cap
    ├── 2. 組裝 overlay：
    │     從 DB 撈三層 patch → 按合併規則疊加
    │     衝突的 patch 標記但不套用
    ├── 3. 路由：
    │     把 assembled patches 按 destination 分配：
    │       prompt patches → 注入 system message
    │       schema patches → 設定 response format
    │       validator patches → 存起來給第 5 步用
    ├── 4. 打 LLM API（用 gateway 的 key，不是用戶的）
    ├── 5. Deviation check：
    │     validator patches → 檢查輸出完整性
    │     Contrastive anchor → embedding 比較（快、便宜）
    │     Semantic anchor → LLM judge（準、稍慢，v1）
    ├── 6. Redact（敏感資訊自動遮蔽）
    └── 7. 回傳結果 + 寫入 trace

使用者的動作（接受/拒絕/修改/標記）
    ↓
Gateway 解讀為 CalibrationSignal → route() → 產生新 patch → 存回 DB
```

### Gateway 護欄（Day 1 必做）

| 護欄 | 做什麼 | 為什麼 |
|------|--------|--------|
| **Rate limit** | per-user per-minute 請求數上限 | 防止單用戶燒光 quota |
| **Spending cap** | per-user 每日/每月 token 消費上限 | 成本可控 |
| **Abuse detection** | 異常高頻、異常長輸入、重試風暴 → 自動限速 | 防惡意使用 |
| **Key vault** | 上游 API key 只在 gateway 進程記憶體中，不出現在 log / trace / response | 核心安全承諾 |
| **Upstream failover** | 同家重試 → 降級模型 → 回傳錯誤 | 可靠性 |
| **Request idempotency** | 相同 request_id 不重複扣費 | 防重試雙重計費 |

---

## Trace 事件模型

每次互動產生 3 種事件，全部寫入 traces 表：

### 1. signal_emitted

使用者動作被捕捉為校準訊號。

```typescript
{
  event_type: "signal_emitted",
  signal: CalibrationSignal,
  timestamp: string,
  run_id: string,       // 哪一次 LLM 呼叫
  carrier_id: string,
}
```

### 2. route_decided

Router 對訊號做出路由決策。

```typescript
{
  event_type: "route_decided",
  signal_id: string,         // 對應哪個 signal
  decisions: RouteDecision[],
  router_version: string,    // "v0-rules" — 未來換 ML 時追溯用
  timestamp: string,
}
```

### 3. patch_applied

Patch 被套用到某次 run，或被 validator 擋下，或被衝突凍結。

```typescript
{
  event_type: "patch_applied",
  patch_id: string,
  run_id: string,
  applied: boolean,          // 有沒有真的生效
  blocked_by: string | null, // 被哪個衝突擋了
  validator_result: "pass" | "fail" | "skip" | null,
  timestamp: string,
}
```

**為什麼需要這三個事件：** Distill 階段要回答「哪些校準真的有效」。沒有 `route_decided`，你不知道系統為什麼做了某個決策。沒有 `patch_applied`，你不知道那個決策有沒有改善輸出。沒有 `signal_emitted`（包含「接受不改」），你只看到修正，不知道什麼是好的。

---

## 核心閉環

```
Attach → Assemble → Generate → Check → Fix → Trace → Distill
  │         │          │         │       │       │        │
掛到      組裝       LLM      偏離    修正    記三種     蒸餾成
carrier   patches    生成     檢測    建議    事件     下次更省的
         (合併規則)                  (validator          patch
                                    patches)
```

**成功指標：同一個 carrier 上，第 N 次的校準成本低於第 1 次。**

量化 KPI：
1. 使用者補充的上下文字量 ↓
2. 糾偏/改寫次數 ↓
3. 達到可用輸出的回合數 ↓

---

## Pack

### 定義

Pack = 預校準好的 OverlayPatch 集合 + 薄 header。使用者買了 pack → 從「第 10 次」的品質開始 → 個人校準疊在上面 → 越用越個人化。

### v0 Pack 結構

仍然是單一 JSON 檔，不是軟體包。但加了身份識別和版本追蹤：

```json
{
  "pack_id": "contract-review-tw-commercial",
  "name": "合約審查 - 台灣商業合約",
  "version": "1.2.0",
  "author": "資深律師 XXX",
  "requires": {
    "destinations": ["prompt", "schema", "validator"]
  },
  "patches": [
    {
      "operator": "attract",
      "destination": "schema",
      "op": "add",
      "strength": "soft",
      "payload": "輸出必須包含：條款編號、風險等級（高/中/低）、法條引用"
    },
    {
      "operator": "boundary",
      "destination": "validator",
      "op": "constrain",
      "strength": "hard",
      "payload": "每條都要審，漏看的標記為'未審查'"
    },
    {
      "operator": "repel",
      "destination": "prompt",
      "op": "add",
      "strength": "soft",
      "payload": "不要籠統說'整體風險中等'，每個風險要具體"
    },
    {
      "operator": "attract",
      "destination": "prompt",
      "op": "add",
      "strength": "soft",
      "payload": "每個風險附上法條或判例引用"
    }
  ]
}
```

### Pack 安裝紀錄

DB 記錄哪個 user/carrier 裝了哪個 pack@version：

```sql
pack_installs (
  id, user_id, carrier_id,
  pack_id, pack_version,
  installed_at, uninstalled_at
)
```

### v0 不做的

- Tests / signature / rollback — 等有 10 個 pack 再加
- manifest + patches + tests 拆分成多檔案 — v0 一個 JSON 夠用
- 自動升級 — v0 手動重裝

### 未來會加的（留接口）

- `requires` 欄位已經預留，未來可檢查 host 是否支援所需 destination
- `pack_id` 不可變，支持未來的版本管理
- DB 有 `pack_version` 欄位，支持未來的升級追蹤

---

## DB Schema

### 核心四張表

```sql
-- 使用者的 carrier（案件/客戶/專案）
carriers (
  id         uuid PRIMARY KEY,
  user_id    uuid NOT NULL,
  name       text NOT NULL,
  type       text,            -- 自由文字，不限定
  created_at timestamptz,
  updated_at timestamptz
)

-- OverlayPatch（校準補丁）
overlay_patches (
  id          uuid PRIMARY KEY,
  user_id     uuid NOT NULL,
  operator    text NOT NULL,  -- attract | repel | boundary | uncertainty
  destination text NOT NULL,  -- prompt | schema | validator | rag | fewshot | ui_gate | tool_config
  op          text NOT NULL,  -- add | remove | replace | constrain
  strength    text NOT NULL,  -- soft | hard
  scope_kind  text NOT NULL,  -- user | project | skill（string，不用 enum）
  scope_id    uuid,           -- null for user scope
  payload     text NOT NULL,  -- 自然語言，opaque
  source      text NOT NULL,  -- manual | accepted | rejected | distilled | pack
  pack_id     text,           -- 從哪個 pack 安裝的（null = 非 pack 來源）
  ttl         text NOT NULL DEFAULT 'permanent', -- session | permanent
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
)

-- Trace 事件（校準閉環的數據基礎）
trace_events (
  id          uuid PRIMARY KEY,
  user_id     uuid NOT NULL,
  carrier_id  uuid,
  event_type  text NOT NULL,  -- signal_emitted | route_decided | patch_applied
  run_id      uuid,           -- 哪一次 LLM 呼叫
  data        jsonb NOT NULL, -- 事件內容（依 event_type 不同結構）
  created_at  timestamptz NOT NULL DEFAULT now()
)

-- Pack 安裝紀錄
pack_installs (
  id           uuid PRIMARY KEY,
  user_id      uuid NOT NULL,
  carrier_id   uuid,
  pack_id      text NOT NULL,
  pack_version text NOT NULL,
  installed_at  timestamptz NOT NULL DEFAULT now(),
  uninstalled_at timestamptz
)
```

### 與 v0.1 的差異

| v0.1 | v0.2 | 為什麼改 |
|------|------|---------|
| `overlays` 表有 `text` + `operator` | `overlay_patches` 表有完整 patch 結構 | overlay 是 patch 不是 text |
| `traces` 表記錄 user_action | `trace_events` 表記錄 3 種結構化事件 | Distill 需要知道路由決策和套用結果 |
| 沒有 pack_installs | 新增 pack_installs | 追蹤安裝版本 |

---

## 技術棧

### v0

```
前端：Next.js（gateway 設定頁 + carrier 列表 + 對話介面）
後端：Next.js API routes
DB：PostgreSQL（carriers + overlay_patches + trace_events + pack_installs）
LLM：直接打 Anthropic / OpenAI API
部署：Vercel / Railway / 一台 VPS
```

不需要：sandbox、Rust、Firecracker、MCP、evidence chain、向量資料庫（v0 不做 RAG）。

### Gateway 對接 OpenClaw

OpenClaw 支援自訂 provider。用戶只需改一行設定：

```json
{
  "providers": {
    "saastoai": {
      "type": "openai-compatible",
      "baseUrl": "https://gateway.saastoai.com/v1",
      "apiKey": "${SAASTOAI_TOKEN}"
    }
  }
}
```

Gateway 收到請求 → 組裝 patches → 注入 prompt/schema → 轉發到實際 LLM API → validator 檢查 → 回傳。OpenClaw 不用改任何程式碼，完全透明。

---

## 內部 Patch 格式（IPF）

**不是外部標準（ORS），是內部一致格式。**

v0 沒有任何外部互通需求。不發布規格、不追求完備。但內部的 overlay/pack/trace 必須格式一致，否則資料散掉未來整合不了。

IPF 的範圍就是本文件定義的：
- OverlayPatch 結構（7 destination + 4 op + soft/hard + scope_kind）
- CalibrationSignal 結構
- RouteDecision 結構
- Trace 三事件格式
- 合併規則

未來如果需要和第三方互通，從 IPF 提煉成 ORS。但那是有 100 個真實校準案例之後的事。

---

## 已有零件（不用重寫）

| 零件 | 來源 | 用在哪裡 |
|------|------|---------|
| PolicyEngine（block/redact/require_review） | EmbedGov | Gateway 的 redact + boundary validator |
| Evidence Chain（hash chain + Merkle root） | EmbedGov | Trace 的不可篡改紀錄（Phase 2+） |
| wrapOpenAI() interceptor | EmbedGov | Gateway 攔截層的基礎 |
| Schema validation（Zod） | EmbedGov | OverlayPatch + Pack 的格式驗證 |
| Contract-first validator | SaaStoAI | Output schema 驗證 |

---

## 10 個職業的 Workspace 樣貌

| 職業 | Carrier | 日常 Skill | User 層校準 | Project 層校準 |
|------|---------|-----------|------------|--------------|
| 律師 | 案件 | 合約審查、判例研究、書狀起草 | 引用風格、分析深度 | 管轄區、法官特性、對造策略 |
| 業務 | 客戶/Deal | 提案、會議紀錄、跟進郵件 | 溝通風格、報價策略 | 客戶產業、決策者偏好 |
| 研究員 | 研究主題 | 文獻搜尋、摘要、論文撰寫 | 引用格式、論證風格 | 研究邊界、已確認假說 |
| 編劇 | 作品 | 場景撰寫、角色對話、一致性檢查 | 敘事節奏、對話風格 | 世界觀規則、角色性格、伏筆 |
| 顧問 | 客戶專案 | 訪談摘要、分析報告、簡報 | 簡報風格、分析框架 | 客戶產業、內部術語 |
| PM | 產品 | PRD、競品分析、回饋分類 | 文件風格、優先級框架 | 技術限制、用戶 persona |
| 記者 | 報導專題 | 資料蒐集、事實查核、撰稿 | 語調標準、新聞價值判斷 | 專題背景、敏感邊界 |
| 教師 | 課程/班級 | 教案、出題、批改 | 教學風格、解釋偏好 | 班級程度、常見誤解 |
| 設計師 | 品牌/專案 | 文案、風格參考、修改回饋 | 審美傾向、排版習慣 | 品牌規範、客戶偏好 |
| 財務 | 客戶/報表 | 報表整理、異常標記、合規檢查 | 報表風格、判斷偏好 | 會計科目、稅務邏輯 |

---

## 風險與取捨

| 決策 | 選擇 | 放棄的 | 為什麼 |
|------|------|--------|--------|
| 入口選 OpenClaw gateway | 現成 176k 用戶 | 自建用戶群 | 驗證速度 > 品牌建設 |
| 不做 sandbox | 延遲 2-3s | 程式碼執行能力 | 80% 工作流不需要跑程式 |
| v0 只做 prompt + schema + validator 三條路由 | 快速上線 | RAG/fewshot/ui_gate/tool_config | 三條路就能驗證核心機制 |
| Pack 用 JSON + thin header | 簡單、可追蹤版本 | 完整 package manager | 先跑起來，有 10 個 pack 再加 |
| Distill 先做手動（使用者確認） | 不需要 ML | 自動蒸餾 | 先驗證「越用越省」再自動化 |
| Router 用 if/else | 可預測、可除錯 | 自動路由的智慧 | 每次決策都記 trace，v1 從數據學 |
| 不做 ORS 外部標準 | 專注產品 | 生態互通 | 零用戶時標準化是空談 |
| scope_kind 用 string 不用 enum | 未來可擴充 | 編譯期安全 | 資料表示寬鬆，程式碼驗證嚴格 |

---

## 執行順序

```
Week 1-2：Gateway MVP
  - OpenAI-compatible proxy endpoint
  - 用戶註冊 + token
  - API key 代管（用戶不碰 key）
  - Rate limit + spending cap + abuse detection
  - Request idempotency
  - 基本用量追蹤

Week 3-4：OverlayPatch + Router
  - overlay_patches 表（完整 patch 結構）
  - User 層 patch（scope_kind = "user"）
  - 手動新增/刪除 patch
  - route() 函數（if/else，6 條規則）
  - prompt destination：注入 system message
  - trace_events 表（3 種事件）

Week 5-6：Carrier + 三層 + 合併
  - carriers 表
  - Project 層 + Skill 層 patch
  - 合併規則實作（4 層優先 + hard/soft）
  - schema destination：設定 response format
  - validator destination：輸出完整性檢查

Week 7-8：校準閉環
  - 使用者動作解讀（接受/拒絕 → CalibrationSignal）
  - route() 產生新 patch → 存入 DB
  - Deviation check（embedding 比較）
  - 「接受不改」作為正向訊號記錄

Week 9-10：Pack
  - Pack JSON 格式（thin header + patches）
  - pack_installs 表
  - Pack 載入 → 合併到 patch 組裝流程
  - 第一個 pack（合約審查 or 競品分析）

之後：Workspace UI、Distill 自動化、RAG destination、fewshot destination、
      ui_gate destination、marketplace、團隊功能、evidence chain
```
