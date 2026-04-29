# Meet Your TIme

Paste a meeting invite → get the real "job" it's hired to do, a verdict (🔴 REPLACE / 🟡 FIX / ✅ KEEP), an async replacement or tightened invite, and a person-hours cost counter.

Powered by Claude Opus 4.7 + the Jobs-To-Be-Done framework.

## Run it

```bash
npm install
cp .env.example .env.local       # fill in real values
npm run dev                      # http://localhost:3000
```

### Required env

| Var                                         | What for                                                                 |
| ------------------------------------------- | ------------------------------------------------------------------------ |
| `ANTHROPIC_API_KEY`                         | The analyst itself (Claude Opus 4.7)                                     |
| `AUTH_SECRET`                               | Auth.js signing secret — `openssl rand -base64 32`                       |
| `NEXTAUTH_URL`                              | `http://localhost:3000` in dev, your deploy URL in prod                  |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional. Enables `/meetings` (Calendar pull). Paste flow works without. |

For Google: create OAuth credentials in Google Cloud Console, add redirect URI `http://localhost:3000/api/auth/callback/google`, enable the **Google Calendar API**, request the `calendar.readonly` scope.

## What's where

```
app/page.tsx                 paste flow (landing)
app/meetings/page.tsx        Calendar-connected list
app/api/analyze/route.ts     streaming Claude endpoint
app/api/calendar/events      pulls next 7 days
auth.ts                      Auth.js config (Google + access_token in JWT)
lib/prompt.ts                the JTBD system prompt
lib/calendar.ts              Google event → invite text normalizer
components/AnalysisStream    streams + parses verdict + cost
```

## Deploy

Push to GitHub, import in Vercel, set the env vars above, add the Vercel domain as an OAuth redirect URI in Google Cloud. Done.
