# Thread: platform-ui-fixes

Platform frontend bug fixes and connector setup improvements.

## Scan W07 (2026-02-12, PR #2857~#2912)

### Change Chain
| PR | Title | Scope |
|----|-------|-------|
| #2857 | fix(platform): connector setup + trailing ? fix | +125/-11 |
| #2891 | fix(platform): bash overflow + markdown table | +1033/-6 (903 lines mock data) |
| #2912 | fix: sanitize mock data + rename env var | +4/-4 |

### Technical Gaps
1. #2891 visual test items unchecked
2. #2891 committed real Slack IDs + R2 presigned URLs to git history (#2912 only cleaned HEAD)
