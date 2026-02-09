# SaaStoAI Bridge: architecture-plan ↔ v0.4

> 2026-02-09. This document connects two complementary design documents:
> - **architecture-plan.md** — execution layer (PipelineSession, Build/Run, DAG, Skill fork)
> - **SaaStoAI-產品工程架構 v0.4** — calibration layer (OverlayPatch, CalibrationSignal, Router, Merge rules)
>
> Neither document is wrong. They solve different problems at different stages.

---

## One-sentence relationship

**v0.4 defines what happens between the user and the output (calibration loop).
architecture-plan defines what happens between the input and the LLM (execution engine).**

```
User → [one-click button] → v0.4 Gateway → [architecture-plan PipelineSession] → LLM → Output
Output → [v0.4 ChangeCard UI] → User action → [v0.4 CalibrationSignal → Router → Patch] → next run
```

---

## Where each document sits

```
┌──────────────────────────────────────────────────────────────┐
│  v0.4: Calibration Layer (product-facing)                    │
│                                                              │
│  三段式入口 → Carrier → ChangeCard UI → CalibrationSignal    │
│  → Router → OverlayPatch → Merge → Trace events             │
│                                                              │
│  Tech: Next.js / PostgreSQL / Vercel                         │
│  Timeline: Week 1-10 (now)                                   │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        │  v0.4 Gateway calls LLM directly (v0)
                        │  ↓ future: Gateway delegates to PipelineSession
                        │
┌───────────────────────▼──────────────────────────────────────┐
│  architecture-plan: Execution Layer (engine)                  │
│                                                              │
│  PipelineSession → submission_loop → DAG dispatch → Runner   │
│  Skill Registry → Build/Run separation → 3 gates             │
│  Scout/Architect/Gatekeeper/Tester/Publisher                 │
│                                                              │
│  Tech: Rust / vm0-rs / Axum / E2B sandbox / R2               │
│  Timeline: Phase 2+ (after calibration loop validated)        │
└──────────────────────────────────────────────────────────────┘
```

---

## Key question: Why not build architecture-plan first?

Because architecture-plan **assumes the calibration loop already works**.

- PipelineSession executes a DAG — but who decides what patches to inject into each node's prompt? → v0.4's merge rules
- DiffRerun compares input_hash — but who decides the node's input changed because the user calibrated? → v0.4's OverlayPatch
- Skill fork + changelog tracks changes — but what triggers a fork? → v0.4's CalibrationSignal from ChangeCard
- Steer Op lets users modify a running pipeline — but where do users express "this is wrong"? → v0.4's workbench

**v0.4 validates that calibration works at all. architecture-plan scales it.**

---

## Concept mapping

| v0.4 concept | architecture-plan equivalent | Relationship |
|---|---|---|
| **OverlayPatch** | Skill `patch` field + `changelog` | v0.4 patches are runtime calibration; arch-plan patches are build-time skill edits. Future: merge them — user calibration auto-generates skill patch proposals |
| **CalibrationSignal** | `PipelineOp::Steer` | v0.4 signals happen post-output on ChangeCard; arch-plan steer happens mid-pipeline on DAG nodes. Different granularity, same intent |
| **Router** (if/else → ML) | `schema_wirer` + `governance.rs` | v0.4 router decides destination (prompt/schema/validator); arch-plan wirer validates schema compatibility. Complementary |
| **Carrier** | `workspace_id` on `pipeline_runs` | Same concept: a persistent context (case/client/project) that accumulates calibration |
| **Pack** (v0.4: OverlayPatch collection) | **Pack** (arch-plan: pipeline_definition + DAG) | **This is the critical divergence** (see below) |
| **Gateway** (v0.4: OpenAI-compatible proxy) | `vm0-api` (Axum) + `PipelineSession` | v0.4 gateway is simpler (single LLM call + patch assembly). arch-plan has full DAG execution |
| **Trace events** (signal/route/patch) | `PipelineEvent` (RunStatus/NodeStatus/ArtifactReady) | Different granularity. v0.4 traces calibration; arch-plan traces execution. Both needed |
| **Merge rules** (4-layer priority) | N/A | **Only in v0.4.** architecture-plan has no concept of multi-layer patch merging |
| **Deviation check** (validator patches) | 3 gates (SideEffects/Budget/Schema) | v0.4 checks output quality; arch-plan gates check input safety. Complementary |
| **Skill** (v0.4: prompt + card schema + validator + calibration config) | **Skill** (arch-plan: metadata + input/output schema + side_effects + SLO + content) | v0.4 Skill is calibration-oriented (what signals to collect). arch-plan Skill is execution-oriented (what to run). Future: single Skill definition, dual views |

---

## The Pack divergence

This is the biggest gap. The same word means different things:

### v0.4 Pack
- A JSON file containing pre-calibrated OverlayPatches
- Applied at runtime to shape LLM output
- "Someone else's first 10 runs"
- Installed per-Carrier, merged with user's own patches

### architecture-plan Pack
- A pipeline_definition containing a DAG of Skill nodes
- Executed by PipelineSession as a multi-step workflow
- "A product you can buy and run"
- Has input schema, output artifacts, pricing

### Resolution

**They are two layers of the same Pack.**

```
Pack (complete definition)
├── Pipeline layer (architecture-plan)
│   ├── DAG: which Skills to run in what order
│   ├── Input schema: what the user provides
│   ├── Output artifacts: what gets delivered
│   └── Budget/SLO: execution constraints
│
└── Calibration layer (v0.4)
    ├── Pre-calibrated OverlayPatches per Skill node
    ├── Validator rules: what to check in output
    ├── Card schema: how to present results for review
    └── Signal mapping: UI actions → CalibrationSignal
```

For v0, Pack = just the calibration layer (single LLM call, no DAG).
When execution complexity demands it, Pack grows the pipeline layer.

---

## How CalibrationSignal flows through PipelineSession (future)

This is the bridge that neither document fully describes.

```
1. User acts on ChangeCard (v0.4 workbench)
   → CalibrationSignal { kind: "reject", operator: "repel", payload: "too vague" }

2. v0.4 Router routes signal
   → RouteDecision { destination: "prompt", op: "add", strength: "soft" }

3. New OverlayPatch created and stored in DB
   → patch { operator: "repel", destination: "prompt", payload: "不要空泛分析" }

4. Next run on same Carrier:
   v0.4 Gateway assembles patches (merge rules)
   → assembled prompt patches, schema patches, validator patches

5. [If single Skill / single LLM call — v0 stops here]
   Gateway injects assembled patches into LLM call
   → done

6. [If multi-Skill DAG — future, architecture-plan kicks in]
   Gateway passes assembled patches to PipelineSession
   → PipelineSession distributes patches to relevant DAG nodes:
     - prompt patches → injected into each node's system message
     - schema patches → override node's output_schema
     - validator patches → added to node's post-execution check
   → Each node runs with calibrated context
   → Pipeline completes → results go back to ChangeCard UI
```

**Key design decision for future integration:**
- v0.4 patches have `scope_kind` (user/project/skill) — this maps naturally to DAG nodes
- A `scope_kind = "skill"` patch targets a specific Skill node in the DAG
- A `scope_kind = "project"` patch applies to all nodes in that Carrier's pipeline
- A `scope_kind = "user"` patch applies globally

---

## Tech stack reconciliation

| Layer | v0.4 says | architecture-plan says | Resolution |
|---|---|---|---|
| Frontend | Next.js (Carrier + ChangeCard + calibration) | Astro SSG + React islands (RunButton + RunStatus) | **v0: saastoai-ui (Astro) for marketing + Next.js for workbench.** Or: all in Next.js if Astro scope stays marketing-only |
| Backend | Next.js API routes | Rust vm0-api (Axum) + Cloudflare Worker (Hono) | **v0: Next.js API routes** (simplest). Future: migrate Gateway to standalone service if load demands |
| Database | PostgreSQL (4 tables: carriers, overlay_patches, trace_events, pack_installs) | PostgreSQL via vm0-db (4 new tables: skills, pipeline_definitions, pipeline_runs, pipeline_node_runs) | **v0: v0.4's 4 tables.** Future: add arch-plan tables when DAG execution needed |
| LLM call | Direct API call through Gateway | PipelineSession → Runner → E2B sandbox | **v0: direct call.** Future: PipelineSession for multi-step |
| Storage | N/A | Cloudflare R2 | **v0: not needed** (single LLM call, no artifacts). Future: R2 for pipeline artifacts |
| Deployment | Vercel / Railway / VPS | Cloudflare Pages + Worker + vm0-rs on VPS | **v0: Vercel** (Next.js natural home). Future: add vm0-rs when execution engine needed |

---

## What v0 takes from architecture-plan (even without building it)

Even though v0 doesn't build PipelineSession, some architecture-plan concepts improve v0:

1. **Skill metadata separation** — v0.4 Pack JSON should separate metadata (name, version, requires) from patches. architecture-plan's `skills` table design is a good reference.

2. **input_hash for cache** — v0.4 can use canonical JSON + SHA-256 to cache LLM responses when the same input + same patches are used. Saves money.

3. **Steer concept** — v0.4's workbench could offer a "re-run with adjustments" button that's essentially a simplified Steer (no DAG, just "re-run this Skill with these new patches").

4. **Event model alignment** — v0.4's Trace events (signal_emitted, route_decided, patch_applied) should use a similar structure to architecture-plan's PipelineEvent (typed enum + metadata). This makes future integration easier.

---

## What architecture-plan takes from v0.4 (when it's built)

When PipelineSession is eventually built, it should incorporate:

1. **OverlayPatch as first-class input** — Every DAG node should accept assembled patches alongside its regular input. This means `build_node_input()` includes patch context.

2. **CalibrationSignal at node level** — Each node's output can generate ChangeCards for review. User actions on those cards produce signals that target specific nodes (via `scope_kind = "skill"`, `scope_id = skill_id`).

3. **Merge rules in DAG context** — When assembling patches for a node, the 4-layer merge (Skill base < Pack < User < Session) operates per-node, not just globally.

4. **Trace integration** — architecture-plan's PipelineEvent and v0.4's Trace events should share the same event store. A single timeline shows both execution progress and calibration actions.

---

## Migration path: v0 → v0 + execution engine

```
v0 (now):
  User → one-click → Gateway (single LLM call + patch assembly) → output → workbench → calibration

v1 (validated calibration):
  Same as v0, but:
  - Distill automates patch generation
  - RAG destination added (background docs injection)
  - Pack marketplace opens

v2 (multi-step needed):
  User → one-click → Gateway → PipelineSession (DAG) → multiple LLM calls → combined output → workbench
  - Each DAG node gets its own patch assembly
  - CalibrationSignal can target individual nodes
  - DiffRerun skips unchanged nodes
  - architecture-plan's full model activates

v3 (full platform):
  + Assembler (Scout/Architect/Gatekeeper/Tester/Publisher)
  + Third-party Skill marketplace
  + Signal Uplink protocol
  + IDE/OpenClaw integration
```

**The trigger for v2 is not time — it's when a single LLM call can't deliver the Pack's promise.**
Examples: a Pack that needs web research + writing + formatting as separate steps.

---

## Summary for AI sessions

When working on SaaStoAI:
1. **v0.4 is the active spec.** Build from it.
2. **architecture-plan is the future reference.** Don't build it yet, but don't contradict it.
3. **Pack = calibration layer (now) + pipeline layer (later).** Design Pack JSON to be extensible.
4. **CalibrationSignal is the product's heartbeat.** Everything flows from user actions on ChangeCards.
5. **The three-stage model (pre-calibrate → one-click → review-calibrate) is the product entry point.** PipelineSession is an implementation detail of the "one-click" stage.
6. **Workbench = experience extractor.** This is v0.4's core insight. architecture-plan doesn't have this concept — it assumes output is final. v0.4 knows output is always a draft until the user confirms.
