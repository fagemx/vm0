# Issue #2516 Research Notes (2026-02-07)

## Scope
- Goal: investigate GitHub issue `#2516` and determine whether performance concerns are valid and actionable.
- Constraint: research only, no code changes.
- Repository context: local branch `personal/notes` does not include PR `#2473` implementation yet, so implementation evidence was collected from GitHub PR/commit content.

## Issue Summary
- Issue: `perf: create pre-built e2b template with vm0 cli for compose jobs`
- Claim: compose-from-github jobs spend ~12.5s in `npm install -g @vm0/cli@latest`, which is ~45% of total job time.
- Source: `gh issue view 2516 --repo vm0-ai/vm0`

## Research Process
1. Read issue metadata and full body from GitHub CLI.
2. Located current local E2B/template infrastructure and workflow build steps.
3. Confirmed local branch does not contain PR `#2473` files.
4. Pulled PR `#2473` metadata and diff to identify exact compose-from-github implementation.
5. Pulled source content from PR commit `44d8fb0718f55ab2bfdf4395e6975dc1a61c5d54` for precise line-level evidence.
6. Cross-checked latest `main` for incidental bug persistence.
7. Assessed contribution suitability for incidental finding.

## Evidence Ledger

### A. #2516 core performance claim
- Evidence: PR `#2473` compose sandbox script installs CLI on every run.
  - File (PR commit): `turbo/apps/web/app/api/compose/from-github/route.ts:155`
  - Code path: `execSync('npm install -g @vm0/cli@latest', ...)`
- Conclusion: issue claim is valid; repeated CLI installation is a direct and significant hot path.

### B. Template usage in compose-from-github API
- Evidence: compose job sandbox uses default template.
  - File (PR commit): `turbo/apps/web/app/api/compose/from-github/route.ts:244`
  - Code path: `Sandbox.create(e2bConfig.defaultTemplate, ...)`
- Evidence: default template is `vm0-claude-code`.
  - File (local): `turbo/apps/web/src/lib/e2b/config.ts:14`
- Evidence: `vm0-claude-code` template installs Claude CLI but not `@vm0/cli`.
  - File (local): `turbo/scripts/e2b/vm0-claude-code/template.ts:11`
- Conclusion: current compose path does not use a prebuilt template with `vm0` CLI.

### C. Infrastructure readiness for template-based fix
- Evidence: template build scripts already exist and support multiple aliases.
  - File (local): `turbo/package.json:20`
  - File (local): `turbo/package.json:22`
  - File (local): `turbo/scripts/e2b/vm0-claude-code-github/build.ts:17`
- Evidence: CI/release workflows already build E2B templates in dev/prod accounts.
  - File (local): `.github/workflows/turbo.yml:1396`
  - File (local): `.github/workflows/release-please.yml:651`
- Conclusion: no new platform is needed; prebuilt compose template can be integrated into existing pipelines.

## Main Recommendations (for branch agents)
1. Introduce a compose-dedicated E2B template with preinstalled `@vm0/cli` and required git tooling.
2. Route `compose/from-github` sandbox creation to the compose-specific template (avoid generic default template).
3. Keep a fallback path:
   - If `vm0` command missing or incompatible (`--porcelain` unsupported), run one-time install in sandbox and retry once.
4. Pin CLI version in template and rebuild on release to reduce drift risk.

## Incidental Finding (separate contribution candidate)

### Finding
- In cleanup cron, update query inside per-job loop does not filter by current `job.id`.
- File (latest `main`): `turbo/apps/web/app/api/cron/cleanup-compose-jobs/route.ts:71`
- Current `where` clause:
  - `inArray(composeJobs.status, ["pending", "running"])`
  - `lt(composeJobs.createdAt, cutoffTime)`
- It updates all stale jobs each loop iteration, while logs/results are per job.

### Why this matters
- Functional impact: final state often still becomes `failed`, so severe user-facing breakage is limited.
- Correctness/observability impact: per-job result accounting can be misleading.
- Performance impact: redundant repeated updates under large stale-job sets.

### Contribution Suitability Assessment
- Suitability: **high** for a focused bug-fix PR.
- Scope: small, isolated endpoint.
- Risk: low-to-medium.
- Testability: good (integration test can assert exact row updates and response counts).

## Suggested PR Shape for Incidental Finding
1. Update cleanup query to target the current row explicitly (include `eq(composeJobs.id, job.id)`).
2. Preserve status guard to avoid race-condition overwrite.
3. Add/adjust tests for:
   - Multiple stale jobs cleaned once each.
   - `cleaned` and `results` consistency.
   - Non-stale jobs untouched.

## Commands Used (audit trail)
- `gh issue view 2516 --repo vm0-ai/vm0`
- `gh pr view 2473 --repo vm0-ai/vm0 --json number,title,state,author,body,headRefName,baseRefName,files,commits`
- `gh pr diff 2473 --repo vm0-ai/vm0`
- `gh api repos/vm0-ai/vm0/contents/turbo/apps/web/app/api/compose/from-github/route.ts?ref=44d8fb0718f55ab2bfdf4395e6975dc1a61c5d54 --jq .content`
- `gh api repos/vm0-ai/vm0/contents/turbo/apps/web/app/api/cron/cleanup-compose-jobs/route.ts?ref=main --jq .content`

## Status
- Completed: research + contribution feasibility analysis.
- Not done: no code change, no tests modified, no PR opened.
