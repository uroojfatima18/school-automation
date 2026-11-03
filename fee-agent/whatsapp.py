import os
from twilio.rest import Client
from sheets import get_due_reminders

def send_whatsapp_message(to_number, message, dry_run=True):
    """Send a WhatsApp message via Twilio. Returns (sid, status)."""
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_WHATSAPP_FROM")

    if dry_run:
        print(f"[DRY RUN] Would send to {to_number}: {message[:80]}...")
        return None, "dry_run"

    if not all([account_sid, auth_token, from_number]):
        raise ValueError("Twilio credentials not configured in .env")

    client = Client(account_sid, auth_token)
    message = client.messages.create(
        body=message,
        from_=from_number,
        to=f"whatsapp:{to_number}"
    )
    return message.sid, message.status

def test_send():
    """Send a test WhatsApp message to verify connection."""
    import gspread
    from google.oauth2.service_account import Credentials

    creds = Credentials.from_service_account_file(
        'fee-agent/service_account.json',
        scopes=['https://www.googleapis.com/auth/spreadsheets']
    )
    client = gspread.authorize(creds)
    sheet = client.open('Fee_Recovery_Demo').worksheet('Fees')
    rows = sheet.get_all_records()
    yes_rows = [r for r in rows if r.get('send_now', '') == 'YES']

    if yes_rows:
        row = yes_rows[0]
        to = row['parent_whatsapp']
        msg = row['message']
    else:
        to = ""
        msg = "Test message - no due rows"

    sid, status = send_whatsapp_message(to, msg, dry_run=False)
    print(f"SID: {sid}")
    print(f"Status: {status}")
    return sid, status

if __name__ == "__main__":
    print("Testing WhatsApp connection...")
    test_send()