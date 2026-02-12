# Thread: runner-rustification

Runner 從混合架構（bash + Node.js + PM2 + Ansible）收斂為單一 Rust binary。

## Upstream Tracking
- Epic: #2477 (open)
- Parity: #2818 (open)

## Progress
- setup ✅
- build-rootfs ✅
- snapshot ✅ (#2903)
- doctor ❌
- kill ❌
- benchmark ❌

## Scan W07 (2026-02-12, PR #2858~#2903)

### Change Chain
| PR | Title | Scope |
|----|-------|-------|
| #2858 | feat(runner): add build-rootfs command | +643, new build_rootfs.rs, command.rs |
| #2882 | refactor(runner): slim down main.rs | +128/-148, thin CLI dispatch |
| #2888 | refactor(runner): split verify logic | +185/-123, separate verify-rootfs.sh |
| #2890 | refactor(runner): move rootfs scripts | pure rename |
| #2895 | refactor(runner): extract deps.rs | +83/-49, centralize versions/URLs |
| #2897 | refactor(sandbox): factory lifecycle | +94/-48, startup()/shutdown() trait |
| #2903 | feat(runner): snapshot subcommand | +268/-15, content-addressable caching |

### Technical Gaps
1. #2903 test plan 5 items unchecked (cache hit, cleanup, clippy, hash diff, manual snapshot)
2. #2897 `expect()` panics if startup() not called — no compile-time enforcement
3. #2903 no integration tests for snapshot CLI workflow
4. #2858 command.rs copied from sandbox-fc (parallel implementation)
5. #2858 original bash scripts still exist alongside Rust version
