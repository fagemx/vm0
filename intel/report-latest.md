# Intel Report: vm0-ai/vm0

**Scan date**: 2026-02-12
**PR range**: #2856 ~ #2913 (23 human PRs)
**Period**: 2026-02-11 ~ 02-12 (~18 hours)
**Type**: First scan (full)

---

## Threads

### 1. runner-rustification (seven332) — ACTIVE

**Chain**: #2858 → #2882 → #2888 → #2890 → #2895 → #2897 → #2903
**Upstream**: #2818 (open), #2477 (open)
**Progress**: setup ✅ build-rootfs ✅ snapshot ✅ doctor ❌ kill ❌ benchmark ❌

Runner 從混合架構（bash + Node.js + PM2）收斂為單一 Rust binary。
七個 PR 在 24 小時內完成 build-rootfs → main.rs 瘦身 → script 重組 → deps 抽取 → factory lifecycle → snapshot。

**Technical gaps**:
- #2903 test plan 5 項全 unchecked（cache hit、cleanup、clippy）
- #2897 `expect()` panics if `startup()` not called, no compile-time enforcement
- #2903 no integration tests for snapshot CLI workflow
- #2858 `command.rs` copied from sandbox-fc, parallel implementation

### 2. web-env-convergence (e7h4n) — COMPLETED

**Chain**: #2860 → #2870 → #2872 → #2873
**Upstream**: #2839 (closed)

`process.env` 統一為 `env()` accessor，ESLint rule 防止回歸。
`PLATFORM_URL` → `NEXT_PUBLIC_PLATFORM_URL` 修復 client-side 可見性。

**Technical gaps**:
- #2873 是 workaround（refactor: type 不觸發 release-please）
- #2860 production verification unchecked

### 3. docker-ci-modernization (e7h4n) — COMPLETED

**Chain**: #2856 → #2862
**Upstream**: #2849 (closed)

Docker publish 從 every-push 改為 release-only + native ARM runners（5-10x 加速）。

**Technical gaps**:
- #2862 all test plan items unchecked
- `ubuntu-24.04-arm` runner 可用性未確認

### 4. guest-download-reliability (seven332) — ACTIVE

**Chain**: #2900 → #2911

#2900 修正只有 404 non-fatal（原本所有錯誤都被吞）。
#2911 加 429 rate limiting retry。

**Technical gaps**:
- 無 exponential backoff 或 Retry-After header 解析
- 固定 sleep 間隔不足以應對持續 rate limiting

### 5. platform-ui-fixes (hulh122) — ACTIVE

**Chain**: #2857 → #2891 → #2912

Connector setup 改進 + bash error overflow 修復 + mock data 清理。

**Technical gaps**:
- #2891 visual test plan 全部 unchecked
- ⚠️ #2891 提交了真實 Slack ID 和 R2 presigned URL 到 git history（#2912 只清了 HEAD）

### 6. ably-subscriber-observability (seven332) — NEW

**Single PR**: #2913
**Upstream**: #2909

Dropped message counter（累積計數 + tracing log）。

**Technical gaps**:
- Counter 不重置（跨 reconnect 累積，可能誤導）
- 無 Prometheus metric export
- 無 alerting threshold

---

## Independent PRs

| PR | Author | Summary | Gaps |
|----|--------|---------|------|
| #2865 | e7h4n | 啟用平行測試 | "database race conditions" unchecked |
| #2866 | lancy | 時區偏好（32 files, full-stack） | 4 manual items unchecked; scope vs user table mismatch |
| #2871 | fagemx | 改善 polling 測試 | Clean, no gaps |
| #2889 | lancy | GLM-5 model + casing fix | casing 變更可能 breaking |
| #2893 | seven332 | CI skip ably-subscriber test | 3 test plan items unchecked |

---

## Maintainer Profiles

### e7h4n (Ethan Zhang) — Architecture Lead

- **Territory**: CI/CD, web, env, ccstate, testing
- **Preferences**: incremental > reload, small scope, anti-hallucination, ccstate patterns
- **fagemx 互動**: 94% exclusive gatekeeper, "cool" = 最高讚, 會介入重寫不符架構的 PR
- **本期焦點**: env 收斂 + Docker CI（均已完成）

### lancy (Lancy) — Product Direction

- **Territory**: API, CLI, model providers, organization, scheduling
- **Preferences**: test through API not DB, will close PRs conflicting with roadmap
- **fagemx 互動**: 專業建設性, formal APPROVED reviews, 但會因路線圖直接關 PR
- **本期焦點**: timezone, GLM-5
- **進行中**: organization scope #2863, email notifications #2836

### seven332 — Independent Infra

- **Territory**: runner, sandbox, guest-agent, guest-download, ably-subscriber
- **Preferences**: many small PRs, AI code review bot, self-merge, zero human review
- **fagemx 互動**: 零互動
- **本期焦點**: runner 全速重構（11 PR / 24h）

### hulh122 (Linghan Hu) — Platform UI

- **Territory**: platform frontend, connector setup
- **Preferences**: high test coverage
- **fagemx 互動**: 零互動

---

## Interaction Patterns

| 觀察 | 證據 |
|------|------|
| fagemx 是唯一需要他人 merge 的貢獻者 | 所有核心成員 100% self-merge |
| e7h4n 是 fagemx 的唯一 gatekeeper | 17/18 merged PRs by e7h4n |
| 小 PR 快速 merge | #2871: +10/-7, 19 min, "cool" |
| 大 PR 可能被接管 | #2716: e7h4n 直接介入重寫 |
| 路線圖衝突 = 直接關閉 | #2552 by lancy, #2374 by e7h4n |

---

## Opportunities

### ⭐⭐⭐⭐ parallel-test-stability — ACTIVE
**Related**: #2865
**Gap**: 啟用平行測試後，"database race conditions" unchecked
**Social**: e7h4n 自己的 PR，follow-up 模式已驗證（#2716→#2871→"cool"）
**Next**: 跑 CI 觀察 flaky tests，找到具體案例後提 fix
**Risk**: 低

### ⭐⭐⭐⭐ runner-snapshot-test-coverage — ACTIVE
**Related**: #2903
**Gap**: test plan 5 項全 unchecked（cache hit, cleanup, clippy, hash differentiation）
**Social**: seven332 領地，但測試 PR 侵入性最低
**Next**: 寫 integration tests，PR 引用 #2903 test plan
**Risk**: 中

### ⭐⭐⭐ guest-download-backoff — ACTIVE
**Related**: #2911
**Gap**: 429 retry 無 exponential backoff 或 Retry-After 解析
**Social**: seven332 領地，無社會信號
**Next**: 先在 issue 詢問是否需要
**Risk**: 中高

### ⭐⭐⭐ release-please-commit-type — ACTIVE
**Related**: #2873
**Gap**: refactor: type 不觸發 release，e7h4n 用 workaround
**Social**: CI 是 e7h4n 領域，低風險討論
**Next**: 開 issue 討論 release-please 配置
**Risk**: 低

### ⭐⭐ ably-subscriber-metrics — ACTIVE
**Related**: #2913
**Gap**: counter 只 log，無 prometheus / alerting
**Social**: seven332 領地，issue #2909 可能有更多脈絡
**Next**: 觀望，低優先
**Risk**: 中

### ❌ runner-snapshot-command — TAKEN
**Related**: #2903
**Note**: seven332 在手動分析後 24h 內完成

---

## Top Recommendation

> **做 parallel-test-stability**：follow-up e7h4n 的 #2865，模式跟 #2871 一樣（follow-up 他的 PR + 測試改進）。風險最低、被接受機率最高、強化「可靠的測試貢獻者」定位。

---

## Social Risks

| Risk | Level | Mitigation |
|------|-------|------------|
| 架構不合 e7h4n 偏好 | HIGH | 避開 ccstate/signals，或先開 issue |
| AI 生成內容被叫出 | HIGH | 驗證每個 CLI 命令和 API endpoint |
| 路線圖衝突 | MEDIUM | 非 trivial feature 先開 issue |
| seven332 領地 | MEDIUM | 測試 PR 可以進，feature PR 避免 |
| Review 瓶頸在 e7h4n | MEDIUM | 保持 PR 小，配合 UTC+8 時區 |

---

*Generated by /intel-scan skill — 2026-02-12*
*State: $APPDATA/gctx/intel/vm0-ai/vm0/state.json*
