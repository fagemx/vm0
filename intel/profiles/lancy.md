# lancy (Lancy) — Product Direction + Quality Gate

## Role
Product roadmap owner. Most thorough reviewer. Will close PRs conflicting with roadmap.

## Territory
API, CLI, model providers, organization scope, scheduling, email notifications

## Review Preferences
- Test through API, not direct DB operations
- Dual-path architecture for caching (proactive cron + reactive fallback)
- Shares roadmap context when declining contributions
- Formal APPROVED reviews (only maintainer who uses GitHub review status)

## Merge Pattern
- Self-merges own PRs (100%)
- Merged 1 fagemx PR (#2587, with formal review cycle)

## Interaction with fagemx
- Professional and constructive
- Will write detailed review with architecture diagrams (#2587)
- Will politely close PRs conflicting with roadmap (#2552)
- Responds substantively to design proposals (#2607)

## Key Quotes
- #2587: "The new test helpers introduced in this PR violate our web testing guidelines"
- #2587: "LGTM! The dual-path architecture is well implemented"
- #2552: "Thanks for the PR. Our plan is to remove the functionality of passing secrets and vars in the schedule."
- #2607: "We reviewed the trade-offs and decided to keep the current read-time dual-path approach for now"

## Active Features (in progress)
- Organization scope: #2863 (open)
- Email notifications: #2836 (open)

## Activity Log
- **W07 (2026-02-11~12)**: timezone preference (#2866, 32 files full-stack), GLM-5 model (#2889), CLI logs pagination (#2855)
