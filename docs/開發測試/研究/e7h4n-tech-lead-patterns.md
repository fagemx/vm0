# e7h4n Tech Lead Pattern Research

> Research date: 2026-02-07
> Source: vm0-ai/vm0 GitHub (50 issues, 30 PRs, review comments)
> Purpose: Extract replicable patterns for AI-as-tech-lead workflow

## Overview

e7h4n is the de facto tech lead of vm0. In ~1 week (2026-01-31 to 2026-02-07), he:
- Created 50 issues (43 closed, 7 open)
- Merged 28 PRs of his own
- Reviewed 3 PRs (all from fagemx)
- Left 20+ issue comments guiding others

He also uses Claude (Co-authored-by in commits), meaning he's already operating in a human+AI model. The difference: he directs AI for his own tasks, while we want AI to direct the whole project.

---

## Pattern 1: Issue Creation

### Title Format
Strict conventional commit prefix:
```
feat: <description>
bug: <description>
fix: <description>
chore: <description>
refactor: <description>
perf: <description>
ui: <description>
```

### Body Structure
Observed template:
```markdown
## Background
<1-2 sentences of context>

## Evidence
<Screenshot, log output, or code reference>

## What to do
<Numbered steps, each one small and verifiable>
```

### Scope Sizing
- Each issue is **one PR's worth of work**
- No epic-style issues with multiple deliverables
- If something is large, he creates multiple linked issues
- Example: E2B separation was Phase 0 (#2301) + Phase 2 (#2306), not one issue

### Label Strategy
| Label | Count | Usage |
|-------|-------|-------|
| enhancement | 24 | New features, improvements |
| bug | 12 | Broken behavior |
| tech-debt | 6 | Cleanup, consolidation |
| pending | 3 | Blocked or deferred |
| help wanted / good first issue | 1 | External contributor bait |

### Assignment Rules
| Person | Domain | Issue Types |
|--------|--------|-------------|
| hulh122 | Platform UI, Slack | Frontend bugs, Slack features, UI improvements |
| lancy | CLI, Backend, API | CLI features, backend bugs, error monitoring |
| Lunarivibe | Design, Visual | Sidebar, skeleton states, table layout, model provider UI |
| e7h4n (self) | Infra, CI, Security | CI/CD, env vars, tech-debt, architecture decisions |
| (unassigned) | Quick fixes | Small CI/docs fixes, often self-resolved |

**Key insight**: Assignment is by domain expertise, not by availability. He knows who owns what and routes accordingly.

---

## Pattern 2: PR Review

### Style
- **Concise**: 1-2 sentences per comment, never paragraphs
- **Direct**: States the problem, no diplomatic hedging
- **Actionable**: Always points to what to do or where to look
- **Polite start**: "Thanks" / "Thank you" but expects action, not discussion

### What He Catches (Review Checklist)

1. **Hallucinated code**: "commands here contain hallucinations and need to be cross-verified"
2. **Scope creep**: "dashboard should focus on query capabilities, not modification"
3. **Internal mocking**: "avoid mocking the internal service `vi.mock("../../../../../...")`"
4. **Unnecessary code**: "unstub is unnecessary, vitest automatically cleans up"
5. **Naming conventions**: "There is a helper function like uniqueId to help generate it"
6. **Missing tests**: "could you help add a `.test.tsx` test for the log?"

### What He Doesn't Catch (Trusts the Author)
- Code style (relies on prettier/eslint)
- Implementation details (doesn't micromanage how, only what)
- Performance (trusts reasonable defaults)

### Review Template (Extracted)
```
1. Does the PR stay within scope? (no scope creep)
2. Are all referenced entities real? (no hallucinations)
3. Are tests present and following project patterns? (integration, no internal mocks)
4. Is there unnecessary code? (YAGNI)
```

---

## Pattern 3: His Own PRs

### Size Distribution
- **Majority**: < 50 lines changed (quick fixes, config, docs)
- **Medium**: 100-300 lines (refactoring with net deletion)
- **Large**: 500+ lines (always refactoring, always deletes more than adds)

### Signature Move: Delete More Than Add
| PR | Change | Title |
|----|--------|-------|
| #2434 | +860/-1299 | refactor(slack): consolidate test helpers and remove unit tests |
| #2457 | +298/-428 | refactor(web): migrate slack tests to api-based helpers |
| #2306 | +141/-335 | refactor(e2b): remove -dev suffix and hardcode template names |

Net deletion = simplification = senior signal.

### PR Body Template
```markdown
## Summary
- <bullet 1>
- <bullet 2>

## Test plan
- [x] <verified item>
- [ ] <todo item>

Closes #XXXX

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### Phased Delivery
For large changes, breaks into phases:
- Phase 0: Preparation (split workflow, add config)
- Phase 1: Core change
- Phase 2: Cleanup (remove old code, hardcode values)

Each phase is a separate PR, separately reviewable and revertable.

---

## Pattern 4: Decision-Making

### YAGNI Enforcement
- Issue #2514: "We are considering whether to remove Ably... No coverage is needed for this at the moment."
- Translation: Don't invest in code that may be deleted. Wait for direction.

### Strategic Redirection
- Issue #2543: Identified bug → assigned to lancy → lancy decided to remove the feature entirely instead of fixing it → closed the PR
- Translation: Sometimes the right fix is deletion, not patching.

### Quality Gates He Enforces
1. No internal mocks (`vi.mock("../../...")` is banned)
2. Integration tests at entry points, not unit tests on internals
3. Every behavior change needs a test
4. Cross-verify generated code against actual implementations
5. Use project helpers (`uniqueId()`) not ad-hoc solutions (`Date.now()`)

### Communication Style with Team
- To contributors: "Thank you, could you help add a test..." (polite request)
- To team: Direct assignment via issue, no lengthy discussion
- Rejection: Closes issue/PR with brief context, no apology

---

## Pattern 5: AI Collaboration (e7h4n's Own Usage)

### Evidence
- Almost all recent commits: `Co-authored-by: Claude Opus 4.6`
- Some earlier: `Co-authored-by: Claude Sonnet 4.5`
- Automated structured comments under his account (Research/Innovation/Plan phases)

### What This Means
e7h4n already uses AI as his execution layer. He:
1. Defines the issue (human judgment)
2. Lets AI implement (code generation)
3. Reviews the output (quality gate)
4. Merges or redirects (decision)

This is exactly the model we want, but scaled: instead of one human + one AI, we want one human + AI-as-full-team.

---

## Replicable Patterns for AI-as-Tech-Lead

### Issue Creation (AI should do this)
1. Scan codebase for: bugs, tech-debt, missing tests, scope opportunities
2. Write issue with: conventional commit title, Background/Evidence/What-to-do body
3. Size to one PR
4. Label appropriately
5. Present to human for approval before filing

### PR Review (AI should do this)
1. Check scope (does PR match issue scope?)
2. Check reality (are all referenced entities real?)
3. Check testing (integration tests present? no internal mocks?)
4. Check YAGNI (unnecessary code added?)
5. Deliver feedback: concise, direct, actionable, with file references

### Prioritization (AI should do this)
1. Bugs before features
2. Simplification (deletion) over addition
3. Don't invest in code that may be removed
4. Break large work into phases

### What AI Cannot Do (Human Must Decide)
1. Product direction (which feature matters for revenue)
2. Strategic pivots (remove feature vs fix feature)
3. External communication (community, users, partners)
4. Final merge approval (human accountability)

---

## Open Questions for Continued Research

1. How does e7h4n prioritize between issues? (velocity vs impact)
2. Does he have a weekly planning rhythm or is it reactive?
3. How does he handle disagreements? (only seen agreement so far)
4. What's his process for larger architectural decisions? (only seen small ones)
5. How does he onboard new contributors? (CONTRIBUTING.md + guided first issues)

---

## Next Steps

- [ ] Encode issue creation pattern into a skill
- [ ] Encode PR review checklist into a skill
- [ ] Build daily scan workflow: codebase → issues → assign to AI agents
- [ ] Test the pattern on saastoai project
- [ ] Continue observing e7h4n for 1-2 more weeks for edge cases
