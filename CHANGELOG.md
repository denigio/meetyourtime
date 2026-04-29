# Changelog

## [0.1.1] - 2026-04-29

### Added

- Screenshot input: paste flow now accepts up to 4 images (PNG/JPEG/WebP/GIF, ≤5 MB each) via file picker, drag-and-drop, or clipboard paste
- `/api/analyze` accepts `images` (base64 data URLs) alongside `invite`; forwards them to Claude Opus 4.7 as image content blocks

### Changed

- JTBD prompt instructs the analyst to extract invite fields from screenshots and treat unreadable fields as MISSING
- `AnalysisStream` takes optional `images` prop; calendar callers unaffected

## [0.1.0] - 2026-04-29

### Added

- Paste-an-invite landing page with streaming Claude Opus 4.7 analysis
- JTBD system prompt: 4-signal detection, core-job classification, verdict (REPLACE / FIX / KEEP), async artifact, cost counter
- `/api/analyze` streaming endpoint
- Verdict badge parsed live from streamed markdown
- Person-hours cost counter (per-meeting + monthly-if-recurring)
- Google Calendar integration: Auth.js + Google OAuth (calendar.readonly), `/meetings` page lists upcoming 7 days, click any meeting to analyze
- `eventToInviteText()` normalizer so calendar events feed the same analyzer as pasted invites
