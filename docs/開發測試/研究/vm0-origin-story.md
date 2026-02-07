# VM0 Origin Story

> Research date: 2026-02-07
> Source: vm0-ai/vm0 GitHub history (first 100 PRs, first 30 commits)
> Purpose: Understand how vm0 went from zero to working product

---

## Key Facts

- **Created**: 2025-11-14 by e7h4n (Ethan Zhang, ethan@uspark.ai)
- **Template**: Bootstrapped from "makita" template (USpark sister project)
- **First working product**: Day 5 (2025-11-19)
- **100 PRs in 6 days**
- **Claude Code used from commit #2**
- **Total to date**: 1,746 commits, 1,862 PRs, 7 human contributors

## Timeline

| Day | Date | Who | What Happened |
|-----|------|-----|---------------|
| 0 | 2025-11-14 | e7h4n | Created repo from "makita" template, removed leftovers, set up CI/CD |
| 1 | 2025-11-15 | e7h4n | Docker, devcontainer, HTTPS proxy, Clerk auth, release workflow, 1Password |
| 3 | 2025-11-17 | **lancy joins** | Domain fix, DB schema + API framework, E2B API key |
| 4 | 2025-11-18 | lancy | E2B sandbox → Claude Code in sandbox → webhook API |
| 4 | 2025-11-18 | e7h4n | Bearer token auth migration |
| 5 | 2025-11-19 | lancy | CLI build/run commands, agent names, event streaming |
| 6 | 2025-11-20 | lancy + e7h4n | Event streaming, CLI E2E tests, code reviews |

## Division of Labor

```
e7h4n (Tech Lead / Infra):        lancy (Product Builder):
Day 0-2: Template + CI/CD         (not yet joined)
Day 3:   Auth, environment         DB schema, API framework
Day 4:   Token migration           E2B sandbox, webhooks
Day 5:   E2E tests, reviews        CLI, event streaming
Day 6:   Code reviews              More features
```

**e7h4n built the stage. lancy performed on it.**

## How They Started (Not From Scratch)

1. **Template-based** — CI/CD, Docker, DB migration patterns all came from USpark
2. **Claude Code from day 0** — Second commit: "Generated with Claude Code"
3. **Fast iteration** — Lancy reverted PR #37 and redid it as #44 with tests, same day

## Contributor Scale (to date)

| Contributor | Commits | Role |
|-------------|---------|------|
| lancy | 663 (38%) | Product builder |
| e7h4n | 431 (25%) | Infra / tech lead |
| github-actions | 333 (19%) | Automated releases |
| seven332 | 118 (7%) | Systems / Rust |
| Lunarivibe | 96 (6%) | Frontend / UI |
| hulh122 | 86 (5%) | Platform / Slack |

## Relevance to SaaStoAI

1. **Don't start from zero** — vm0 had USpark patterns; saastoai has vm0 patterns
2. **Two roles are enough** — e7h4n (infra) + lancy (product) = working product in 5 days
3. **Critical path first** — DB → API → Sandbox → Webhook → CLI
4. **Ship and fix** — Revert is course correction, not failure
5. **AI from day 0** — Not an afterthought, part of the workflow

## Open Questions

1. Did lancy have prior USpark experience?
2. Was there a pre-repo planning phase, or did they figure it out as they went?
3. When did other contributors (seven332, hulh122, Lunarivibe) join?
