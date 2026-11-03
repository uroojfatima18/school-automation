import gspread
from google.oauth2.service_account import Credentials

print('Attempting to connect to Google Sheets...')
print('Service Account: school-automation-access@fee-recovery-automation.iam.gserviceaccount.com')
print()

# 1. Load the service account JSON
creds = Credentials.from_service_account_file(
    'fee-agent/service_account.json',
    scopes=['https://www.googleapis.com/auth/spreadsheets']
)

# 2. Authorize
client = gspread.authorize(creds)

print('Authentication successful!')
print()

try:
    # 3. Open the sheet
    sheet = client.open('Fee_Recovery_Demo').worksheet('Fees')

    # 4. Read all rows
    rows = sheet.get_all_records()

    # 5. Filter rows where send_now == YES (column R)
    yes_rows = [r for r in rows if r.get('send_now', '') == 'YES']

    print('Successfully connected to Google Sheets!')
    print(f'Total rows in Fees tab: {len(rows)}')
    print(f'Rows with send_now=YES: {len(yes_rows)}')
    print()

    if yes_rows:
        print('Rows ready for WhatsApp reminders:')
        for r in yes_rows:
            print(f'  • Fee ID: {r["fee_id"]}')
            print(f'    Student: {r["student_name"]}')
            print(f'    Parent WhatsApp: {r["parent_whatsapp"]}')
            print(f'    Message (first 80 chars): {r["message"][:80]}...')
            print(f'    Stage: {r.get("stage", "N/A")}')
            print(f'    Balance: {r.get("balance", "N/A")}')
            print()
    else:
        print('No rows with send_now=YES found.')
        print('This is expected if using the demo Excel workbook instead of Google Sheet.')
        print('The Excel workbook (School_Automation_Database.xlsx) has a similar structure.')

except Exception as e:
    print('Could not open Google Sheet.')
    print()
    print('This means the sheet has not been shared with the service account.')
    print()
    print('TO FIX:')
    print('1. Open Google Sheet: https://docs.google.com/spreadsheets/d/your-sheet-id/edit')
    print('2. Click "Share" (top-right corner)')
    print('3. Paste the service account email:')
    print('   school-automation-access@fee-recovery-automation.iam.gserviceaccount.com')
    print('4. Set permission to "Editor"')
    print('5. Click "Send"')
    print()
    print(f'Error details: {e}')