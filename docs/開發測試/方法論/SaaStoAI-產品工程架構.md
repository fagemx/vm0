# SaaStoAI 產品工程架構 v0.1

> 2026-02-09 整理。從「校準成本遞減」的核心洞察出發，定義商業模型與工程架構。

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

### 核心流程

```
使用者（OpenClaw / Web / API）
    ↓ user token
Gateway
    ├── 1. 認證：驗 token，查用戶
    ├── 2. 組裝 overlay：從 DB 撈三層 overlay
    │     User overlay（個人偏好）
    │     + Project overlay（當前 carrier 的脈絡）
    │     + Skill overlay（這類任務的標準）
    ├── 3. 路由校準訊號：
    │     風格/邊界 → 注入 system prompt
    │     背景資料 → RAG 檢索注入
    │     好壞例子 → few-shot messages
    │     輸出格式 → response schema
    │     驗證規則 → 後處理
    ├── 4. 打 LLM API（用 gateway 的 key，不是用戶的）
    ├── 5. Deviation check（輸出偏離 overlay？）
    │     Contrastive anchor → embedding 比較（快、便宜）
    │     Semantic anchor → LLM judge（準、稍慢）
    ├── 6. Redact（敏感資訊自動遮蔽）
    └── 7. 回傳結果 + trace 記錄

使用者的動作（接受/拒絕/修改/標記）
    ↓
Gateway 解讀為校準訊號 → 存回 DB → 下次更準
```

### Overlay 三層結構

```
User 層（跨所有工作）
  └── Project 層（跟著一個 carrier 走）
        └── Skill 層（做某類任務的標準）
```

| 層 | 生命週期 | 例子 |
|---|---------|------|
| User | 永久 | 「不要空泛分析」「表格優先」「引用放句尾」 |
| Project | 跟著案件/客戶/專案 | 「這是 IP 案」「法官偏好簡短」「預算 500 萬」 |
| Skill | 跟著任務類型 | 「合約審查先看賠償條款」「判例用 Bluebook 格式」 |

### 四種 Overlay 運算子

| 運算子 | 作用 | 使用者怎麼觸發 |
|--------|------|--------------|
| **Attract** | 靠近這個輸出形狀 | 「好，以後都這樣」「重點看這裡」 |
| **Repel** | 遠離這種模式 | 「不要再給我這種」刪掉某段 |
| **Boundary** | 絕對不能越線 | 「不能漏看保密條款」「不能假設」 |
| **Uncertainty Gate** | 尚未定案 | 「這裡不確定，先標記」 |

使用者不需要知道這些名詞。他在工作流裡的自然動作（接受、拒絕、標記、圈選）被系統解讀成對應的運算子。

### 核心閉環

```
Attach → Assemble → Generate → Check → Fix → Trace → Distill
  │         │          │         │       │       │        │
掛到      組裝       LLM      偏離    修正    記錄     蒸餾成
carrier   overlay    生成     檢測    建議    過程    下次更省的
                                                    overlay
```

**成功指標：同一個 carrier 上，第 N 次的校準成本低於第 1 次。**

量化 KPI：
1. 使用者補充的上下文字量 ↓
2. 糾偏/改寫次數 ↓
3. 達到可用輸出的回合數 ↓

### Pack 結構

Pack = 預校準好的 overlay 組合 + skill 定義。

```json
{
  "name": "合約審查 - 台灣商業合約",
  "version": "1.2",
  "author": "資深律師 XXX",
  "overlays": [
    {"type": "attract", "text": "重點：賠償、保密、終止、管轄權、智財"},
    {"type": "boundary", "text": "每條都要審，漏看的標記為'未審查'"},
    {"type": "repel", "text": "不要籠統說'整體風險中等'"},
    {"type": "attract", "text": "每個風險附上法條或判例引用"},
    {"type": "example_good", "text": "第7條（賠償上限）：風險高。依民法§226..."},
    {"type": "example_bad", "text": "本合約整體而言有幾個值得注意的面向..."}
  ],
  "output_schema": { ... },
  "skills": ["contract-review", "clause-comparison"]
}
```

使用者買了 pack → 從「第 10 次」的品質開始 → 個人校準疊在上面 → 越用越個人化。

---

## 技術棧

### 最小可運行版本

```
前端：Next.js（一個 gateway 設定頁 + carrier 列表 + 對話介面）
後端：Next.js API routes 或 Express
DB：PostgreSQL（users + carriers + overlays + traces）
LLM：直接打 Anthropic / OpenAI API
向量：pgvector 或 SQLite-vec（overlay 相似度檢索）
部署：Vercel / Railway / 一台 VPS
```

不需要：sandbox、Rust、Firecracker、MCP、evidence chain。

### DB Schema（核心三張表）

```sql
-- 使用者的 carrier（案件/客戶/專案）
carriers (
  id, user_id, name, type, created_at, updated_at
)

-- 三層 overlay
overlays (
  id, user_id, layer, carrier_id, skill_id,
  operator, text, embedding, source, created_at
)
-- layer: 'user' | 'project' | 'skill'
-- operator: 'attract' | 'repel' | 'boundary' | 'uncertainty'
-- source: 'manual' | 'accepted' | 'rejected' | 'distilled' | 'pack'

-- 互動紀錄（校準素材）
traces (
  id, user_id, carrier_id, skill_id,
  input, output, overlays_used, user_action, created_at
)
-- user_action: 'accepted' | 'rejected' | 'modified' | 'flagged'
```

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

Gateway 收到請求 → 注入 overlay → 轉發到實際 LLM API → 回傳。
OpenClaw 不用改任何程式碼，完全透明。

---

## 已有零件（不用重寫）

| 零件 | 來源 | 用在哪裡 |
|------|------|---------|
| PolicyEngine（block/redact/require_review） | EmbedGov | Gateway 的 redact + boundary 執行 |
| Evidence Chain（hash chain + Merkle root） | EmbedGov | Trace 的不可篡改紀錄（Phase 2+） |
| wrapOpenAI() interceptor | EmbedGov | Gateway 攔截層的基礎 |
| Schema validation（Zod） | EmbedGov | Overlay + Pack 的格式驗證 |
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
| 先做 prompt + schema 兩條校準路由 | 快速上線 | RAG/工具配置等進階路由 | 兩條路就能驗證核心機制 |
| Pack 用 JSON 而非結構化 DB | 簡單、可攜 | 精細查詢能力 | pack 量小時 JSON 夠用 |
| Distill 先做手動（使用者確認） | 不需要 ML | 自動化 | 先驗證「越用越省」再自動化 |

---

## 執行順序

```
Week 1-2：Gateway MVP
  - OpenAI-compatible proxy endpoint
  - 用戶註冊 + token
  - API key 代管（用戶不碰 key）
  - 基本用量追蹤

Week 3-4：Overlay 基礎
  - User 層 overlay（全局偏好）
  - 手動新增/刪除 overlay
  - System prompt 注入

Week 5-6：Carrier + 三層
  - Carrier 列表（案件/客戶/專案）
  - Project 層 + Skill 層 overlay
  - 三層自動組裝

Week 7-8：校準閉環
  - 使用者動作解讀（接受/拒絕 → overlay）
  - Deviation check（embedding 比較）
  - Fix suggestions（選擇題修正）

Week 9-10：Pack
  - Pack 格式定義
  - Pack 載入 + overlay 合併
  - 第一個 pack（合約審查 or 競品分析）

之後：Workspace UI、marketplace、團隊功能、evidence chain
```
