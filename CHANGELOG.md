# Changelog

## [0.1.2] - 2026-04-29

### Added

- `/demo` route: no-auth wow-factor path — fictional PM team's last 28 days of meetings, scored live in parallel
- `/api/score-batch`: parallel verdict-only scoring (concurrency 8, max 60 events); failed scores default to KEEP to avoid overclaiming savings
- `lib/sampleHistory.ts`: 30 hand-tuned PM-team meetings covering each JTBD pattern (CYA, broadcast, buy-in theater, habit, ambiguity, legit decision)
- `lib/scoring.ts`: savings model (REPLACE = 100%, FIX = 50%, KEEP = 0%) with `aggregateSavings()` returning person-hours and workdays saved
- `lib/scorePrompt.ts`: stripped-down verdict-only system prompt (`VERDICT:` / `REASON:` two-line format)
- `SavingsCounter` component: animated tick-up of person-hours saved + honest-math footnote (counterfactual line for judging)
- `DemoDashboard` component: idle → scoring → done flow; per-card verdict chips and reasons; click-through to full JTBD analysis

### Changed

- Home page header CTA replaced with "See it on a sample team →" (primary, links to `/demo`) plus secondary "Or connect your calendar" link
- `MeetingCard` accepts optional `verdict`, `reason`, and `scoring` props; existing `/meetings` callsite unaffected
- Renamed product from "Meeting Analyst" to "Meet Your TIme" across landing, calendar, demo pages and `<title>`

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
