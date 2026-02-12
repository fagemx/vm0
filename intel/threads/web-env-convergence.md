# Thread: web-env-convergence — COMPLETED

process.env 統一為 env() accessor，ESLint rule 防止回歸。

## Upstream Tracking
- Issue: #2839 (closed)

## Scan W07 (2026-02-12, PR #2860~#2873)

### Change Chain
| PR | Title | Scope |
|----|-------|-------|
| #2860 | refactor(web): converge env patterns to env() | +319/-308, 55 files, Zod schema |
| #2870 | fix(web): PLATFORM_URL → NEXT_PUBLIC_PLATFORM_URL | +15/-15, 8 files |
| #2872 | ci: remove redundant platform-url env | -1 line |
| #2873 | fix(web): trigger release for #2870 | -3 lines (JSDoc removal workaround) |

### Technical Gaps
1. #2873 is a workaround — refactor: type doesn't trigger release-please
2. #2860 production verification unchecked
