# SaaStoAI 設計演化記錄

> 2026-02-09 整理。目的：讓任何 AI（或人）接手時，不重新發明輪子。
> 這份文件記錄的是「同一個人的同一個洞察，在不同 AI 對話裡被翻譯成不同工程語言」的過程。
> **不是多個方向，是一個方向的演化。**

---

## 核心洞察（從頭到尾沒變過）

**AI 對同一個人、同一個工作，應該越用越準。**

使用者用 ChatGPT 做專業工作，每次要重新教它格式、語氣、重點、邊界。這個「重新教」的成本就是校準成本。目前沒有產品在解決這個問題。

---

## 演化時間線

### 第一階段：plan1 → organized（與 GPT 討論，最早期產品思考）

**檔案位置**：`saastoai-ui/docs/docs_early/organized/00-index.md` 起，共 16 份

**核心表達**：
- 四層架構：SaaStoAI（交付）→ APC（治理）→ VM0（執行）→ 隔離驅動
- 「可攜的工作法 + 可被信任的執行 + 不降低效率的交付」
- Lite vs Secure 分層：差異在 Runtime Profile，不在 Skill 格式
- Level 0→6 升級路線圖

**「越用越準」怎麼表達**：
- Workspace Profile（色系/語氣/禁忌詞）— 第二次用不要重設
- 差分產出 — 只重跑變更步驟，前面結果復用
- 可重現 — 同素材同設定可完全重跑

**涵蓋但後續文件遺失的內容**：
- 安全模型完整設計（Capabilities Manifest, cosign, Secrets 三層隔離）
- 合規三段分工（Connector → VM0 → APC）
- 醫療/司法產業應用分析
- iOS Lite 版設計 + 三種用戶旅程
- 市場動態（Claude Cowork Legal 2850 億美元事件）
- 商業模型 / 存活指標定義

---

### 第二階段：plan2 + plan3 + plan3GPT（存活計畫）

**檔案位置**：`saastoai-ui/docs/docs_early/plan2生存計畫.md`、`plan3.md`、`plan3GPT.md`

**核心表達**：
- 兩條腿：saastoai-ui 賣 pack（腿1），vm0-rs 完成 API 升級雲端執行（腿2）
- 8 週衝刺計畫：W1 品質 → W2 UI → W3-4 API → W5 定價 → W6 Workspace → W7 歷史 → W8 第二產線
- 存活 DoD：8 週內 MRR ≥ $2K / 週活 ≥ 50 / 重跑率 ≥ 40%（任兩條）

**「越用越準」怎麼表達**：
- 重跑率 ≥ 40% — 用戶會回來，因為系統記住了
- Brand Profile 一次設定、每次套用
- 「重跑率是'產線'vs'工具'的分水嶺」（plan3GPT 原話）

**新增價值**：第一次定義了商業存活的量化標準

---

### 第三階段：plan4（Meta-agent 架構）

**檔案位置**：`saastoai-ui/docs/docs_early/plan4Meta-agent架構.md`

**核心表達**：
- 「代理的代理」— Skill Registry + Composer + Evaluator + Governance
- Skill = input schema + output schema + side effects + SLO
- 組合拆兩層：機械式可串（schema 對接）+ 語義式補線（LLM 只做最小 mapping）
- 測試三件套：效果/速度/邊界

**「越用越準」怎麼表達**：
- **User Overlay Skill**（fork + patch + parent）— 每個人的用法不一樣，系統記住差異
- 差分重跑：只重跑受影響的下游節點
- 自動升級 log：upstream 更新 → 自動回歸 → 安全升級

**這是 v0.3 OverlayPatch 的直接前身。**

---

### 第四階段：architecture-plan.md（工程收斂 — 執行基礎設施）

**檔案位置**：`saastoai-ui/docs/docs_early/architecture-plan.md`

**核心表達**：
- 整合 5 份文件（pack-design, orchestrator-agent, plan4, plan5codex, plan6pi）
- 雙層架構：Assembler（本地 Pi 化）+ Executor（線上 Host 化）
- PipelineSession：單一 submission_loop + Op queue + Event bus
- Build/Run 路徑分離（Run path 禁止 LLM 判斷）
- 三道硬閘：SideEffects / Budget / Schema
- Skill 漸進式披露：KV → DB → R2
- 8 週實作計畫 + SQL schema + Rust 模組結構

**「越用越準」怎麼表達**：
- Skill fork + patch + changelog + parent_id lineage — DB 級版本追蹤
- DiffRerun Op + input_hash — pipeline 級差分重跑
- Workspace + brand_profile JSONB

**收斂了什麼**：執行基礎設施（pipeline、sandbox、runner、skill registry）
**沒收斂的**：安全模型完整設計、合規三段分工、醫療/司法、Lite vs Secure、iOS、商業模型、存活指標、校準閉環機制

**這份文件被 saastoai Rust monorepo 實際實作。** sai-api、sai-runner、sai-sandbox、pipeline DAG 拓撲排序、skills 表都來自這份。

---

### 第五階段：SaaStoAI-產品工程架構.md v0.3（校準閉環 — 產品機制）

**檔案位置**：`vm0-notes/docs/開發測試/方法論/SaaStoAI-產品工程架構.md`

**核心表達**：
- Web 工作檯為主入口（因為 Gateway 拿不到校準訊號）
- OverlayPatch：結構化補丁，帶 operator / destination / op / strength / scope
- CalibrationSignal：使用者的自然動作（接受/拒絕/改寫/標記）= 校準
- Router：v0 用 if/else（6 條規則），每次決策寫 trace，v1 從數據學
- 合併規則：4 層優先（Skill base < Pack < User < Session）+ hard/soft + 衝突處理
- ChangeCard：UI 上可操作的最小單位
- Trace 三事件：signal_emitted / route_decided / patch_applied
- Carrier：案件/客戶/專案
- Uncertainty Gate：防止暫定偏好被固化成硬規則

**「越用越準」怎麼表達**：
- OverlayPatch 從 accept/reject/modify 訊號累積
- Pack = 「別人幫你跑完前 10 次」的結果（預校準）
- 成功指標：同一個 carrier 上，第 N 次校準成本 < 第 1 次
- KPI：補充字量 ↓、糾偏次數 ↓、達到可用輸出的回合數 ↓

**明確說不需要**：sandbox、Rust、Firecracker、MCP、evidence chain、向量 DB

**新增價值**：
- 第一次把「越用越準」轉化成可實作的工程機制（不只是概念）
- 第一次定義了 UI 操作 → Signal → Patch 的完整映射
- 第一次有可量化的校準 KPI
- 第一次把 Diff/Drift Review 作為第一個 Skill 的完整設計

---

## 同一概念在不同階段的命名對照

| 你的原意 | organized (plan1) | plan3GPT | plan4 | architecture-plan | v0.3 |
|---|---|---|---|---|---|
| 記住用戶偏好 | Workspace Profile | Brand Profile | User Overlay Skill | Skill fork + patch | OverlayPatch + 三層 scope |
| 下次更好 | 差分產出 | 重跑率 ≥ 40% | 差分重跑下游節點 | DiffRerun + input_hash | 第 N 次校準成本 < 第 1 次 |
| 可賣的經驗包 | Pack（prompt chain + zip） | $29-49 pack | — | Pipeline DAG + skill 列表 | OverlayPatch JSON 集合 |
| 品質控制 | 安全掃描 + Badge | — | Evaluator 三件套 | Gatekeeper + Tester + 三道閘 | Validator patches + Deviation check |
| 安全治理 | Capabilities Manifest + APC | — | runtime approval | 三道硬閘 | hard/soft + 衝突處理 + Trace |
| 使用者的工作單位 | Workspace | 客戶/專案 | — | workspace_id | Carrier（案件/客戶/專案） |

---

## 兩份核心文件的互補關係

```
architecture-plan.md          v0.3（產品工程架構）
────────────────────          ────────────────────
解決「怎麼執行」              解決「怎麼校準」
Pipeline DAG + Runner         CalibrationSignal + Router
Skill Registry + fork         OverlayPatch + 合併規則
PipelineSession               ChangeCard + Trace
Build/Run 分離                Uncertainty Gate
E2B/Firecracker sandbox       不需要 sandbox

Pack = 可執行的流水線          Pack = 預校準的經驗
成功 = E2E 跑通               成功 = 第 N 次成本 < 第 1 次
```

**它們不是競爭方案，是同一個產品的不同層。**
- architecture-plan 是「手」— 能做什麼、怎麼做
- v0.3 是「腦」— 為什麼做、什麼才算做對

---

## 尚未橋接的缺口（兩份文件都沒解決）

1. **校準閉環 × 執行平台**：CalibrationSignal 在 PipelineSession 裡怎麼流動？OverlayPatch 跟 Skill fork 是同一張表還是兩張表？
2. **Connector**：organized/06 定義了資料閘道，兩份文件都沒設計
3. **Distill 自動化**：v0.3 說「先手動」，但沒有任何自動蒸餾設計
4. **現有 codebase 怎麼用**：vm0（Next.js）、saastoai（Rust）、saastoai-ui（Astro）分別做什麼？
5. **商業存活指標**：plan3 有（MRR ≥ $2K），兩份技術文件都沒帶進去
6. **iOS / 行動端**：organized 有完整設計，後續文件全跳過
7. **使用者獲取**：第一批用戶從哪來？saastoai-ui 的 SEO 怎麼導到工作檯？

---

## 給下一次 AI 對話的提醒

**如果你是新的 AI session，讀到這裡，請注意：**

1. 這個人的核心洞察從第一天就沒變過：「AI 對同一個人應該越用越準」
2. 不同文件用不同工程語言表達同一件事，不要當成不同方向
3. 已經有兩份成熟的工程文件（architecture-plan + v0.3），不要再從零設計
4. 缺的是「橋接文件」— 把校準閉環放到執行平台上
5. 任何新提案必須回答：它解決了上面哪個缺口？它跟已有的兩份文件怎麼接？
6. 不要再產出第三份獨立架構文件
