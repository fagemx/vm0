# Thread: guest-download-reliability

Guest download error handling and retry logic improvements.

## Scan W07 (2026-02-12, PR #2900~#2911)

### Change Chain
| PR | Title | Scope |
|----|-------|-------|
| #2900 | fix(guest-download): only treat 404 as non-fatal | +39/-15, adds status_code to DownloadError |
| #2911 | fix(guest-download): retry on 429 rate limiting | +2/-1, adds 429 to retriable set |

### Technical Gaps
1. No exponential backoff or Retry-After header parsing for 429
2. Fixed sleep interval may be insufficient under sustained rate limiting
