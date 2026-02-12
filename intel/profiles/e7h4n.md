# e7h4n (Ethan Zhang) — Architecture Lead

## Role
Architecture lead / gatekeeper. Final decision authority on architecture.

## Territory
CI/CD, web app, env configuration, ccstate/signals, testing infrastructure

## Review Preferences
- incremental > full re-fetch
- Small PR scope (no scope creep)
- ccstate computed-with-arguments pattern
- Anti-hallucination: verify CLI commands actually exist
- `user.paste` > `user.type` in tests
- `signal.throwIfAborted()` next line after `await`

## Merge Pattern
- Self-merges own PRs (100%)
- Exclusive gatekeeper for fagemx (94%, 17/18 merged PRs)
- "cool" = highest praise, means ship it
- Timezone hint: UTC+8

## Interaction with fagemx
- Trust level: medium-high
- Pattern: assign direction → fagemx implements → "cool" → merge
- Will take over PRs that don't fit architecture (#2716 → #2730)
- Will close PRs with explanation, no blame (#2374)
- Expects contributors to follow technical direction precisely

## Key Quotes
- #2716: "I think this PR requires some rewriting before it can be merged. This isn't your fault."
- #2716: "I'll temporarily take over this PR, leave some comments, and then hand it back to you."
- #2716: "I think incremental would be better"
- #2716: "we can merge this first, as this PR has been separated for too long"
- #2574: "the commands here contain hallucinations and need to be cross-verified"
- #2871: "cool"

## Activity Log
- **W07 (2026-02-11~12)**: CI/Docker pipeline refactor (#2851, #2856, #2862), web env convergence (#2860, #2870-#2873), parallel test (#2865), platform test (#2848)
