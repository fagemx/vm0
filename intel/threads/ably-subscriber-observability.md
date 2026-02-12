# Thread: ably-subscriber-observability — NEW

Backpressure observability for ably message subscriber.

## Upstream Tracking
- Issue: #2909

## Scan W07 (2026-02-12, PR #2913)

### Change Chain
| PR | Title | Scope |
|----|-------|-------|
| #2913 | feat(ably-subscriber): dropped message counter | +7/-1 |

### Technical Gaps
1. Counter is cumulative, never resets across reconnections
2. No Prometheus metric export (only tracing log)
3. No alerting threshold mechanism
