# Time Tracker Backend

This is a minimal backend for a voice-assisted time tracker.

The idea is:

1. You speak naturally into ChatGPT, Claude, or another tool.
2. The assistant turns that into a structured draft entry.
3. You approve it.
4. This backend sends the approved entry to a webhook.
5. The webhook writes the data to Google Sheets.

## Files

- `tracker.js`: CLI that sends approved entries to a webhook
- `mock-webhook.js`: local test server so you can verify the webhook flow before using Google Sheets
- `google-apps-script/Code.gs`: Apps Script webhook for Google Sheets

## Spreadsheet Columns

Create a Google Sheet with this first row:

`Entry ID | Date | Start Time | End Time | Duration Minutes | Activity | Category | Reason | Status | Notes`

The Apps Script expects that header order.

## Local Test

If you want to save your webhook URL once:

```bash
cp .env.example .env
```

Then put your URL in `.env` like:

```bash
WEBHOOK_URL=https://your-web-app-url
```

Start the mock webhook:

```bash
npm run mock:webhook
```

In another terminal, send a start entry:

```bash
node --env-file=.env tracker.js start \
  --activity "Gym" \
  --category Strategic \
  --reason "Improves health, energy, and long-term performance"
```

Stop the open entry:

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

If you do not want to use `.env`, omit `--env-file=.env` and add `--webhook http://localhost:8787` to each command.

Delete the latest entry:

```bash
node --env-file=.env tracker.js delete-latest
```

## Google Sheets Setup

1. Open a new Google Sheet.
2. Rename the first sheet to `Entries`.
3. Add the header row shown above.
4. Open `Extensions -> Apps Script`.
5. Paste in `google-apps-script/Code.gs`.
6. Deploy it as a web app:
   - Execute as: `Me`
   - Who has access: `Anyone with the link`
7. Copy the web app URL.
8. Use that URL as `--webhook` in `tracker.js`.

## Payload Shape

The CLI sends JSON like this:

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

For `stop`, the payload is:

```json
{
  "action": "stop",
  "entry": {
    "endTime": "2026-03-25T19:00:00-07:00"
  }
}
```

For `log-complete`, the payload includes both `startTime` and `endTime`.

For `delete-latest`, the payload is:

```json
{
  "action": "delete_latest",
  "entry": {}
}
```

## Notes

- The webhook assumes only one open activity at a time.
- `stop` closes the most recent row whose status is `Open`.
- Duration is stored in whole minutes.
- If you omit `--start` on `start`, the CLI uses the current local time.
- If you omit `--end` on `stop`, the CLI uses the current local time.
