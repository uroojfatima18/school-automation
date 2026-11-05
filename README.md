# Fee Recovery Agent

A small terminal assistant for school office staff. It reads fee reminder
information and collection metrics from the `Fee_Recovery_Demo` Google Sheet and
answers questions using those sheet values.

## Current functionality

- Lists fee rows in the `Fees` tab where `send_now` is exactly `YES`.
- Reads billed, collected, pending, collection rate, overdue, and defaulter
  metrics from the `Dashboard` tab.
- Answers in simple English or Roman Urdu.
- Does not calculate fee values itself or write to the spreadsheet.

**WhatsApp sending is not wired into the agent yet.** `python agent.py` only
answers questions; it will not send reminders or update the sheet.

## How the fee-recovery automation works

The Google Sheet is the source of truth and performs the fee calculations. The
Python agent reads the results; it must not recalculate balances, reminder
stages, or message text.

1. Staff maintain student and fee/payment information in the Google Sheet.
2. The sheet's formulas use fee data and its `Config` settings (including
   reminder timing and limits) to calculate each fee's balance, status, days to
   due, reminder stage, `send_now` decision, and ready-to-send message.
3. `get_due_reminders` reads only rows whose `send_now` value is exactly `YES`.
   It returns the fee ID, student name, WhatsApp number, stage, and balance.
4. `get_summary` reads the totals and collection metrics already shown on the
   `Dashboard` tab.
5. The terminal agent uses these tool results to answer staff questions. It
   does not invent fee figures or compose reminder messages.

### What is and is not automated in this version

**Working now:** reading eligible reminder rows and dashboard metrics from
Google Sheets, then answering questions in the terminal.

**Not yet an end-to-end automated send flow:** the agent does not send the
sheet's message through WhatsApp, re-check a row immediately before sending,
update `last_reminder_date` or `reminder_count`, or append delivery results to
`Logs`. Although `whatsapp.py` contains a separate Twilio helper, `agent.py`
does not call it. Do not treat a reminder as sent based on the agent's current
responses.

## Requirements

- Python 3.11 or newer
- Access to the project Google Sheet
- A Google service-account JSON key with access to that sheet
- A Gemini API key for the language model

## Setup

Run these commands from the repository root in PowerShell:

```powershell
cd fee-agent
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Create `fee-agent\.env` with:

```env
GEMINI_API_KEY=your_gemini_api_key
SHEET_NAME=Fee_Recovery_Demo
SHEET_ID=your_google_sheet_id
```

Put the service-account key at `fee-agent\service_account.json`. In the Google
Sheet's **Share** dialog, grant access to the exact `client_email` listed in
that JSON file. Viewer access is sufficient for the current read-only code.
The collaborator's personal Google account permission does not replace the
service account's access.

## Run

From the `fee-agent` directory, activate the virtual environment if needed, then
run:

```powershell
python sheets.py
```

This checks the Google Sheets connection and prints the rows marked
`send_now = YES`. To start the chat assistant:

```powershell
python agent.py
```

Ask questions such as:

- `Which reminders are due?`
- `What is the collection rate?`
- `Overdue balance kitna hai?`

Type `exit` or `quit` to close the assistant.

## Secrets and student data

- Never commit `.env`, `service_account.json`, API keys, or service-account
  private keys to GitHub.
- Share service-account keys only through a secure channel with collaborators
  who need them. Revoke and replace a key if it is exposed.
- Keep Google Sheet access limited to authorized staff and the service account.
- Use fake student data for demos and tests where possible.

## Troubleshooting

- **Missing `.env` value:** Check that `.env` is inside `fee-agent` and includes
  `GEMINI_API_KEY`, `SHEET_NAME`, and `SHEET_ID`.
- **Credentials file not found:** Confirm the filename and path are exactly
  `fee-agent\service_account.json`.
- **Permission denied or spreadsheet not found:** Confirm the sheet is shared
  with the JSON file's exact `client_email` and that `SHEET_ID` is correct.
- **Wrong sheet name:** `SHEET_NAME` must match the title of the spreadsheet
  identified by `SHEET_ID`.
- **Google API error:** Make sure Google Sheets API is enabled for the Google
  Cloud project that owns the service account.

## Project files

```text
fee-agent/
  agent.py                 # Terminal chat assistant
  config.py                # Gemini model configuration
  sheets.py                # Read-only Google Sheets access
  tools.py                 # Read-only agent tools
  whatsapp.py              # Separate Twilio helper; not used by agent.py
  requirements.txt         # Python dependencies
  .env                     # Local secrets and sheet settings (not committed)
  service_account.json     # Local Google credentials (not committed)
```
