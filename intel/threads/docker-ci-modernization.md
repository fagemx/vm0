# Thread: docker-ci-modernization — COMPLETED

Docker publish 從 every-push 改為 release-only + native ARM runners。

## Upstream Tracking
- Issue: #2849 (closed)

## Scan W07 (2026-02-12, PR #2856~#2862)

### Change Chain
| PR | Title | Scope |
|----|-------|-------|
| #2856 | ci: publish via release-please with semver tags | +136/-120 |
| #2862 | ci: replace qemu with native arm runners | +188/-40, parallel build matrix |

### Technical Gaps
1. #2862 all test plan items unchecked
2. ubuntu-24.04-arm runner availability not confirmed
