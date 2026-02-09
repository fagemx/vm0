# SaaStoAI v0.3 Limiting Factor Audit

> 2026-02-09. Using the Limiting Factor Loop methodology to evaluate SaaStoAI-產品工程架構.md v0.3.

---

## Plan Assessment: SaaStoAI 產品工程架構 v0.3

### What the plan gets right

1. **問題定義清晰** — 「校準成本隨使用遞減」一句話就把 SaaS 和 Raw AI 的缺口說明白了
2. **技術設計一致性高** — OverlayPatch / Router / Trace / 合併規則環環相扣，835 行文件修了 7 次不一致之後已經自洽
3. **風險與取捨表誠實** — 明確說了「放棄什麼」「為什麼」，沒有假裝什麼都能做
4. **scope_kind 用 string 不用 enum** — 資料表示寬鬆、程式碼驗證嚴格，正確的 v0 決策
5. **SaaStoAI Skill 是 Claude Skill 超集** — 不切斷生態，可以吃 Claude Skill 進來

### Limiting factor the plan misses

**核心互動假設未驗證。** 使用者是否真的會在 ChangeCard 上「接受/拒絕/改寫/標記」，而且這些訊號累積後真的能讓第 N 次比第 1 次省？整個架構建立在這個假設上，但 0 個原型、0 個使用者測過。

### Recommended change

**把 Week 1-2 從 Gateway 底座改成互動原型驗證。** 詳見下方完整報告。

---

## Step 0: Throughput

文件寫的成功指標是：「同一個 carrier 上，第 N 次的校準成本低於第 1 次。」

但這是**產品指標**，不是**公司吞吐**。公司吞吐應該是：

> **每週有多少真實使用者在工作檯上產生校準訊號？**

v0 的吞吐更具體：**多快能讓第一個真實使用者跑通校準閉環？**

## Step 1: System Flow

```
設計 → 建 Gateway → 建 Web UI → 建 Skill → 建 Router → 建合併 → 接通閉環 → 找到使用者 → 使用者操作 → 訊號回流 → 驗證 KPI
```

文件的執行順序：
```
設計(已完成) → Gateway底座(W1-2) → Skill+UI(W3-4) → Router+合併(W5-6) → 閉環驗證(W7-8) → Pack(W9-10)
```

## Step 2: Current Limiting Factor

**核心互動未驗證：零使用者在 ChangeCard 上操作過，零證據證明「卡片操作 → 校準訊號 → patch 累積 → 越用越省」這個閉環成立。**

兩個判準：

1. 如果只解一個，哪個最能讓吞吐上升？→ 驗證核心互動
2. 如果不解，其他改善會被浪費？→ Gateway、Router、合併規則、Trace、Pack 全部建在未驗證假設上

## Step 3: Evidence

**可觀測症狀**：

1. **835 行架構文件，0 個可互動原型。** 文件定義了 OverlayPatch 7 欄位、Router 6 條規則、合併 4 層優先、Trace 3 事件、ChangeCard 7 欄位 — 但沒有任何東西可以讓一個真人貼兩段文字、看到卡片、按接受或拒絕。
2. **閉環驗證排在 Week 7-8。** 文件自己寫的成功指標「同一個 carrier 上，第 N 次的校準成本低於第 1 次」— 最快 7 週後才能測。如果到時候發現使用者不想在卡片上操作，前 6 週全部浪費。
3. **Week 1-2 做 Gateway 底座（rate limit、spending cap、key vault、idempotency）。** 這些是「有 1000 個使用者」才需要的護欄。0 個使用者時，率先做這些是在優化非約束。
4. 我們不知道 LLM 產出的 ChangeCard 品質是否足以讓人做有意義的操作。
5. 我們不知道「接受/拒絕/改寫/標記」這些動作在真實工作流裡自然不自然。

**Counter-evidence (what would prove me wrong)**：

- 如果團隊已經在其他場景（紙上原型、Wizard of Oz、其他產品）驗證過「卡片式操作能產生有效校準訊號」，那核心互動就不是未驗證假設
- 如果 Gateway 底座有不可替代的技術前置依賴（例如沒有 proxy 就完全無法產出 ChangeCard），那先做 Gateway 有道理
- 如果自己已經用 ChatGPT 做過版本 diff，而且確實會做「這條好、這條不對、這裡不確定」的操作 → 部分驗證（但「自己」≠「目標使用者」）

## Step 4: Attack

**資源與注意力只往瓶頸灌，其他做「維持不壞」即可。**

- **Action**: 用 1-2 天做一個最小互動原型。不要 Gateway、不要 DB、不要 overlay 系統。就是：貼兩段文字 → LLM 產出 ChangeCard JSON → 前端渲染卡片 → 每張可按接受/拒絕/改寫/標記 → console.log 訊號。找 3 個真人用它比對一份真文件。
- **Not doing**: Gateway 底座、rate limit、key vault、spending cap、Router if/else、合併規則、Trace 事件、Pack 安裝。這些全部等互動驗證通過再做。
- **Success signal**: 3 個使用者各操作 5+ 張卡片，且操作分布不是全部按「接受」（全接受 = 卡片沒有提供決策價值）。至少 1 個使用者說「這比我自己讀兩份文件快」。
- **Timeline**: 1-2 days (aggressive — 50% chance)

原型驗證的是：
- LLM 產出的 ChangeCard 品質夠不夠？
- 使用者會不會自然地在卡片上操作？
- 哪些操作最常被使用？（接受 >> 拒絕？還是改寫最多？）
- 使用者操作完的感覺是「省了時間」還是「多了一步」？

如果驗證通過 → 10 週計畫照走，有信心。
如果驗證不通過 → 重新設計互動模型，省下 10 週。

## Step 5: Next Likely Bottleneck

互動驗證通過後，下一個約束可能是：

1. **LLM diff 品質** — 粗粒度 diff 能不能穩定產出有意義的 ChangeCard（不遺漏重要變更、不產出空泛卡片）。可以用 validator hard patch 攻擊，正好驗證 schema + validator destination 的設計。
2. **分發** — 使用者怎麼找到你？（Web-first 沒有自帶流量）
3. **留存** — 第一次用完會不會回來？（Diff/Drift 的「又有新版本」假設是否成立）

---

## Summary Table

| LFL Question | Answer |
|---|---|
| Throughput | Time to first real user completing the calibration loop |
| Current Limiting Factor | Core interaction (card-based diff review → calibration signal) is unvalidated |
| Evidence | 0 users, 0 prototypes, 0 real interaction data |
| Attack | 1-2 day minimal prototype, test with 3 real users |
| Next Bottleneck | LLM diff quality / distribution / retention |

**One sentence: The 835-line architecture doc is solid design, but the limiting factor is not design — it's validation. 2 days on a prototype unblocks more than 10 weeks of building.**
