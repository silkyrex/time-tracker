# Time Tracker Backend

Voice-assisted time tracking workflow with a small Node CLI, webhook, and Google Sheets backend.

The intended flow is simple:
1. Speak naturally into ChatGPT, Claude, or another assistant
2. Convert that into a structured time entry
3. Approve the entry
4. Send it through a webhook
5. Store it in Google Sheets

## What this repo contains
- `tracker.js` - CLI for `start`, `stop`, `log-complete`, and `delete-latest`
- `mock-webhook.js` - local test server
- `google-apps-script/Code.gs` - Apps Script endpoint for Google Sheets
- `index.html` - simple local UI

## Quick start

```bash
cp .env.example .env
npm run mock:webhook
```

Then in another terminal:

```bash
node --env-file=.env tracker.js start \
  --activity "Gym" \
  --category Strategic \
  --reason "Improves health, energy, and long-term performance"
```

Stop the latest open entry:

```bash
node --env-file=.env tracker.js stop \
  --end "2026-03-25T19:00:00-07:00"
```

Log a completed entry directly:

```bash
node --env-file=.env tracker.js log-complete \
  --activity "1:1 with Sarah" \
  --start "2026-03-25T14:00:00-07:00" \
  --end "2026-03-25T14:20:00-07:00" \
  --category Strategic \
  --reason "Important relationship and coordination with meaningful leverage"
```

## Google Sheets setup
1. Create a sheet named `Entries`
2. Use this header row:

`Activity | Category | Reason | Date | Start Time | End Time | Duration Hours | Status | Notes | Entry ID`

3. Open `Extensions -> Apps Script`
4. Paste in `google-apps-script/Code.gs`
5. Deploy as a web app
6. Put the web app URL in `.env` as `WEBHOOK_URL`

## Payload shape

Example `start` payload:

```json
{
  "action": "start",
  "entry": {
    "activity": "Gym",
    "startTime": "2026-03-25T18:05:00-07:00",
    "category": "Strategic",
    "reason": "Improves health, energy, and long-term performance",
    "notes": ""
  }
}
```

## Status
Personal productivity tool. Active prototype.
