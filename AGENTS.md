# Fee Recovery Agent: Project Rules

Small private schools in Pakistan. Goal: send WhatsApp fee reminders automatically from a Google Sheet.
Scope: **fee recovery only.** Build the smallest thing that works. Target: working demo in under 2 hours.

## Stack (fixed, do not add more)
- Python 3.11+
- `openai-agents` (OpenAI Agents SDK) for the agent and its function tools
- `gspread` + `service_account.json` for Google Sheets
- `twilio` for WhatsApp (sandbox for demo)
- `python-dotenv` for secrets

No n8n. No frontend. No database. No extra frameworks.

## Data source: Google Sheet `Fee_Recovery_Demo`
Tabs: `README`, `Dashboard`, `Config`, `Students`, `Fees`, `Logs`.

**The sheet already does all the logic with formulas. The code must NOT recompute it.**

`Fees` tab columns (row 1 = headers):
- `A fee_id`, `B student_id`, `C student_name`, `D class`, `E parent_name`, `F parent_whatsapp`, `G send_enabled`, `H month`
- `I amount_due`, `J due_date`, `K amount_paid`, `L balance`, `M status`, `N days_to_due`, `O stage`
- `P last_reminder_date`, `Q reminder_count`  <- the agent writes these two only
- `R send_now` (YES/NO), `S message` (ready text, English then Urdu)
- `T paid_date`, `U payment_method`, `V defaulter_rank`

`Config` tab: key/value pairs (school_name, reminder_before_days, overdue_repeat_days, max_reminders, payment_info, whatsapp_from, demo_date_override, today). Read settings from here. Never hardcode them.

`Logs` tab headers: `timestamp, fee_id, student_name, to_number, type, message, twilio_sid, delivery_status`.

## Core flow (the only thing Phase 1 must do)
1. Read `Fees`, take rows where `R == "YES"`.
2. For each row, send `S` (message) to `F` (number) via Twilio WhatsApp.
3. Only if the send succeeded:
   - set `P` = today's date (use `Config!today`, so demo_date_override works)
   - set `Q` = `Q + 1`
   - append one row to `Logs` (`type` = value of column `O`, `delivery_status` = Twilio status)
4. If a send fails, do not touch `P` or `Q`. Log the error and continue with the next row.

## Hard rules
1. **Only send when `R == "YES"`.** Never send to any other row, even if asked.
2. **Never edit formula columns** (`C-G`, `L-O`, `R`, `S`, `V`) or any formula in other tabs. The agent writes only `P`, `Q` and new `Logs` rows.
3. **No duplicates:** right before sending, re-read that row and skip it if `R` is no longer `YES` or `P` already equals today.
4. **Dry run first:** every send function takes `dry_run` (default `True`). Dry run prints what would be sent and writes nothing. Real sending needs an explicit `dry_run=False`.
5. **Date writing:** write `P` using `value_input_option="USER_ENTERED"` with an ISO date (`YYYY-MM-DD`) so Sheets stores a real date. The formula in `R` compares `P` with `Config!today`.
6. **Do not rewrite messages.** The message text in `S` is final. The LLM must not edit, translate, shorten or invent message content. Fee amounts and dates must come from the sheet only.
7. **Secrets** live in `.env` only (`OPENAI_API_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`, `SHEET_NAME`, `OPENAI_MODEL`). Never in code, never printed, never committed. Add `.env` and `service_account.json` to `.gitignore`.
8. **Official channels only** for WhatsApp: Twilio (sandbox now), WhatsApp Cloud API later. Never use unofficial libraries (Baileys, Puppeteer, etc.).

## The agent
One agent, a few small function tools. Keep it simple.

Tools:
- `get_due_reminders()`: returns the rows with `send_now == YES` (fee_id, student_name, to, stage, balance). Read only.
- `send_reminders(dry_run: bool = True)`: runs the core flow above and returns a short result (sent / failed / skipped).
- `get_summary()`: reads the `Dashboard` tab and returns the key numbers (billed, collected, pending, collection rate, overdue, defaulters).

Agent instructions (short): "You help school office staff with fee reminders. Always run a dry run first and show what will be sent. Only send for real when the user clearly confirms. Answer fee questions only from tool results; never guess numbers. Reply in simple language (English or Roman Urdu, match the user)."

The LLM's job is to understand the request and call tools. All sending logic lives in plain Python functions, not in the prompt.

## Project structure
```
fee-agent/
  AGENTS.md
  .env
  .gitignore
  service_account.json
  requirements.txt
  sheets.py     # open sheet, read Fees/Config, write P/Q, append Logs
  whatsapp.py   # send via Twilio, return sid + status
  tools.py      # function tools used by the agent
  agent.py      # agent definition + simple chat loop
```

## Build order (give OpenCode one step at a time, test after each)
1. `sheets.py`: connect with the service account, print the rows where `send_now == YES`.
2. `whatsapp.py`: send one test WhatsApp message to your own number (sandbox joined).
3. `tools.py`: `send_reminders` in dry run, then real mode on 1-2 rows (check `P`, `Q` and `Logs` update).
4. `agent.py`: wire the tools into an Agents SDK agent with a terminal chat loop.
5. Optional: a daily schedule (cron or Task Scheduler) that runs `send_reminders(dry_run=False)`.

## Demo checklist
- Rows with fake numbers must have `send_enabled = No` (otherwise Twilio error 63015).
- Everyone re-sends `join <code>` to the sandbox 15-20 minutes before the demo (session expires; 24-hour window needed).
- Test with `Config!demo_date_override` to simulate other days. Clear it afterwards.
- Reset `P` and `Q` on test rows before the real demo.

## Out of scope (do not build now)
Marks and result cards, attendance, announcements, approval workflow, frontend or dashboard UI, multi-school support, payment gateway, AI-written messages, reply handling. Add later only if asked.

## Later (production, not now)
Move from Twilio sandbox to an official WhatsApp sender with Meta-approved templates (one per stage: Before Due, Due Today, Overdue). Restrict sheet access to the service account and named office staff.
