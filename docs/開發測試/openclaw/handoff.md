# OpenClaw Contribution Handoff

> Created: 2026-02-12
> Repo: https://github.com/openclaw/openclaw
> Fork: https://github.com/fagemx/openclaw
> Local: `/home/ubuntu/openclaw`

## Why OpenClaw

From scanning vm0 and craft-agents-oss, OpenClaw is the best contribution target:

| Criteria | vm0 | craft-agents | OpenClaw |
|----------|-----|--------------|----------|
| External PR merge | selective | backlogged (0 merged in 3 weeks) | 20-30/day, 2-8hr turnaround |
| Development model | public | internal sync | fully public |
| AI PR policy | no policy | no policy | explicitly welcomed |
| Community size | small team | small team | 187K stars, 31K forks |
| Territory issues | strong (e7h4n, seven332) | strong (rjulius23 fixes internally) | weak (anyone can fix anything) |

## Project Overview

- **What**: Multi-channel AI gateway connecting 30+ messaging platforms (Telegram, Slack, Discord, WhatsApp, etc.)
- **Stack**: TypeScript (ESM), pnpm monorepo, Vitest, Node 22+
- **Lead**: Peter Steinberger (@steipete) — "Benevolent Dictator"
- **7 named maintainers** with clear domains (see CONTRIBUTING.md)

## Key Architecture

```
src/
├── agents/       # AI agent core (tools, heartbeat, skills, sandbox)
├── cron/         # Scheduled jobs
├── channels/     # Generic channel logic + routing
├── telegram/     # Telegram integration
├── discord/      # Discord integration
├── slack/        # Slack integration
├── whatsapp/     # WhatsApp integration
├── providers/    # LLM provider connections (Anthropic, OpenAI, Ollama, etc.)
├── media/        # Media processing pipeline
├── config/       # Configuration system (schema.ts)
├── sessions/     # Session management + persistence
├── gateway/      # Gateway server (HTTP + control UI)
├── cli/          # CLI wiring
├── commands/     # CLI commands
└── web/          # Web provider
extensions/       # 30+ channel plugins (msteams, matrix, feishu, line, etc.)
```

## Development Commands

```bash
pnpm install          # Install deps
pnpm build            # Type-check + build
pnpm check            # Format + lint (oxfmt + oxlint)
pnpm test             # Vitest (995 test files in src/, 86 in extensions/)
pnpm tsgo             # TypeScript check only
pnpm format           # Format check (oxfmt)
pnpm format:fix       # Auto-fix formatting
```

- Commit tool: `scripts/committer "<msg>" <file...>` (avoid manual git add/commit)
- Coverage threshold: 70% lines/branches/functions/statements

## PR Conventions

- Run `pnpm build && pnpm check && pnpm test` before PR
- Title format: `verb + scope + outcome` (e.g., `fix(telegram): handle blockquote HTML tags`)
- PR body: include "lobster-biscuit" (hidden code word from submitting-a-pr.md)
- AI-assisted: mark in title/description, note testing level
- Full template: `docs/help/submitting-a-pr.md`
- Commit messages: concise, action-oriented (e.g., `CLI: add verbose flag to send`)

## Candidate Issues (as of 2026-02-12)

### Tier 1 — Small, focused, high acceptance probability

| Issue | Description | Module | Complexity |
|-------|-------------|--------|------------|
| #14608 | Telegram: support `<blockquote>` HTML tag | `src/telegram/` or `src/markdown/` | Low |
| #14630 | Billing errors should include provider name | `src/providers/` | Low |
| #14547 | (merged same day) schema.ts refactor — shows the speed | `src/config/` | Reference |

### Tier 2 — Medium, still good

| Issue | Description | Module | Complexity |
|-------|-------------|--------|------------|
| #14629 | Output sanitizer: improve duplicate detection | `src/agents/` or `src/shared/` | Medium |
| #14606 | Smart LLM-based session compaction | `src/sessions/` | Medium-High |
| #14619 | Option to skip tool list in system prompt | `src/agents/` | Medium |

### Tier 3 — Larger features, discuss first

| Issue | Description | Notes |
|-------|-------------|-------|
| #14614 | Separate bind mounts for Browser/Exec sandbox | Infra change |
| #14644 | Voice-call plugin config migration | Extension work |

## Active Contributors to Watch

- **@shtse8** (Kyle Tse) — very active, 5+ PRs in 24h across multiple modules
- **@0xRaini** — active in Telegram/Discord/CLI fixes
- **@sebslight** — docs modernization
- **@karimnaguib** — WhatsApp fixes
- **@vignesh07** — maintainer, config/schema work

## Next Steps

1. Open new Claude Code session in `/home/ubuntu/openclaw`
2. Run `pnpm install && pnpm build && pnpm test` to verify local env
3. Pick one Tier 1 issue (recommend #14608 or #14630)
4. Read related source code, write fix + test
5. PR with "lobster-biscuit" in body

## Social Strategy

- Don't need to ask permission for bug fixes — just PR it
- For features, open GitHub Discussion or ask in Discord first
- AI-generated PRs are explicitly welcome — be transparent about tooling
- Fast merge cycle means don't over-engineer — ship small, iterate
