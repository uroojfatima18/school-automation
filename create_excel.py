import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

wb = openpyxl.Workbook()
wb.remove(wb.active)  # Remove default blank sheet

# ─────────────────────────────────────────────────────────────
# Theme & Styling Tokens
# ─────────────────────────────────────────────────────────────
BRAND_GREEN = "1C4E38"       # Deep Emerald Green
ACCENT_GREEN = "2F6B4F"      # Primary Forest Green
ACCENT_ORANGE = "E8833A"     # Vibrant Amber
BG_LIGHT = "F7F3EA"          # Soft warm paper background
SURFACE_WHITE = "FFFFFF"

FONT_TITLE = Font(name="Segoe UI", size=15, bold=True, color=BRAND_GREEN)
FONT_SUBTITLE = Font(name="Segoe UI", size=9, italic=True, color="6B7266")
FONT_SECTION = Font(name="Segoe UI", size=11, bold=True, color=BRAND_GREEN)
FONT_HEADER = Font(name="Segoe UI", size=10, bold=True, color="FFFFFF")
FONT_REGULAR = Font(name="Segoe UI", size=10, color="1F2A24")
FONT_BOLD = Font(name="Segoe UI", size=10, bold=True, color="1F2A24")
FONT_MUTED = Font(name="Segoe UI", size=9, color="71717A")

FILL_HEADER = PatternFill(start_color=BRAND_GREEN, end_color=BRAND_GREEN, fill_type="solid")
FILL_SUBHEADER = PatternFill(start_color="E3F0E8", end_color="E3F0E8", fill_type="solid")
FILL_CARD = PatternFill(start_color=BG_LIGHT, end_color=BG_LIGHT, fill_type="solid")

FILL_PAID = PatternFill(start_color="D1E7DD", end_color="D1E7DD", fill_type="solid")       # Soft Green
FILL_PENDING = PatternFill(start_color="FFF3CD", end_color="FFF3CD", fill_type="solid")    # Soft Amber
FILL_OVERDUE = PatternFill(start_color="F8D7DA", end_color="F8D7DA", fill_type="solid")    # Soft Rose

BORDER_THIN = Border(
    left=Side(style="thin", color="E0D7C6"),
    right=Side(style="thin", color="E0D7C6"),
    top=Side(style="thin", color="E0D7C6"),
    bottom=Side(style="thin", color="E0D7C6")
)
BORDER_TOP_THICK = Border(
    top=Side(style="medium", color=BRAND_GREEN),
    left=Side(style="thin", color="E0D7C6"),
    right=Side(style="thin", color="E0D7C6"),
    bottom=Side(style="thin", color="E0D7C6")
)

def apply_banner(ws, title_text, subtitle_text):
    """Adds a modern executive header banner at Row 1 and 2."""
    ws.views.sheetView[0].showGridLines = True
    ws.cell(row=1, column=1, value=title_text).font = FONT_TITLE
    ws.cell(row=2, column=1, value=subtitle_text).font = FONT_SUBTITLE
    ws.row_dimensions[1].height = 24
    ws.row_dimensions[2].height = 18

def style_table_header(ws, row_idx, col_count):
    """Styles the column header row with forest green fill and white bold text."""
    ws.row_dimensions[row_idx].height = 26
    for c in range(1, col_count + 1):
        cell = ws.cell(row=row_idx, column=c)
        cell.fill = FILL_HEADER
        cell.font = FONT_HEADER
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = BORDER_THIN

def autofit(ws, start_row=3, max_col=15):
    """Autofits column widths with clean padding."""
    for col_idx in range(1, max_col + 1):
        col_letter = get_column_letter(col_idx)
        max_len = 0
        for row in range(start_row, ws.max_row + 1):
            val = str(ws.cell(row=row, column=col_idx).value or "")
            if not val.startswith("="):
                max_len = max(max_len, len(val))
            else:
                max_len = max(max_len, 10)
        ws.column_dimensions[col_letter].width = max(max_len + 4, 13)


# ═════════════════════════════════════════════════════════════
# TAB 1: EXECUTIVE KPI DASHBOARD (Live Formulas)
# ═════════════════════════════════════════════════════════════
ws_kpi = wb.create_sheet(title="Dashboard_KPIs")
apply_banner(ws_kpi, "APEX ACADEMY — EXECUTIVE AUTOMATION DASHBOARD",
             "Live institutional performance metrics calculated in real-time from active records.")

# Metric Cards
kpi_cards = [
    ("TOTAL STUDENTS", '=COUNTA(Students!A4:A100)', "Enrolled Active Students"),
    ("FEES COLLECTED (PKR)", '=SUMIF(Fees!I4:I100, "paid", Fees!G4:G100)', "Current Month Collection"),
    ("PENDING & OVERDUE (PKR)", '=SUMIF(Fees!I4:I100, "<>paid", Fees!G4:G100)', "Unpaid Receivables"),
    ("COLLECTION RATE", '=C5/(C5+C6)', "Fee Recovery Efficiency"),
    ("OVERDUE DEFAULTERS", '=COUNTIF(Fees!I4:I100, "overdue")', "Actionable Accounts"),
    ("WHATSAPP MESSAGES LOGGED", '=COUNTA(Logs!A4:A100)', "Total Dispatched Alerts"),
]

row_start = 4
for idx, (title, formula, subtitle) in enumerate(kpi_cards, start=row_start):
    ws_kpi.cell(row=idx, column=2, value=title).font = FONT_BOLD
    ws_kpi.cell(row=idx, column=2).fill = FILL_SUBHEADER
    ws_kpi.cell(row=idx, column=2).border = BORDER_THIN
    
    val_cell = ws_kpi.cell(row=idx, column=3, value=formula)
    val_cell.font = Font(name="Segoe UI", size=13, bold=True, color=BRAND_GREEN)
    val_cell.alignment = Alignment(horizontal="right", vertical="center")
    val_cell.border = BORDER_THIN
    
    if "COLLECTION RATE" in title:
        val_cell.number_format = "0.0%"
    elif "PKR" in title:
        val_cell.number_format = "Rs #,##0"
    else:
        val_cell.number_format = "#,##0"

    sub_cell = ws_kpi.cell(row=idx, column=4, value=subtitle)
    sub_cell.font = FONT_MUTED
    sub_cell.border = BORDER_THIN
    ws_kpi.row_dimensions[idx].height = 24

ws_kpi.column_dimensions["B"].width = 30
ws_kpi.column_dimensions["C"].width = 24
ws_kpi.column_dimensions["D"].width = 32


# ═════════════════════════════════════════════════════════════
# TAB 2: CONFIGURATION & INTEGRATIONS (Dynamic Rules)
# ═════════════════════════════════════════════════════════════
ws_cfg = wb.create_sheet(title="Config")
apply_banner(ws_cfg, "APEX ACADEMY — SYSTEM CONFIGURATION & INTEGRATIONS",
             "Global institutional parameters, dynamic grading rules, and WhatsApp API configuration.")

cfg_sections = [
    # General Config
    ("1. INSTITUTIONAL SETTINGS", [
        ("School Name", "Apex Academy", "Brand name displayed on fee vouchers, report cards & messages"),
        ("School ID", "school-001", "Tenant identifier for multi-school API support"),
        ("Campus Address", "Main Campus, Phase 5, DHA, Lahore", "Physical campus location"),
        ("Helpline Phone", "+92 300 1234567", "Official school helpline number"),
        ("Currency Code", "PKR", "Currency unit for billing and vouchers"),
        ("Default Due Day", 10, "Day of the month when monthly fees become overdue (e.g. 10th)"),
    ]),
    # Dynamic Grading Rules
    ("2. DYNAMIC GRADING RULES (Referenced by Marks Tab)", [
        ("Grade A+ (Outstanding)", 90, "Threshold: Percentage >= 90%"),
        ("Grade A (Excellent)", 80, "Threshold: Percentage >= 80%"),
        ("Grade B (Very Good)", 70, "Threshold: Percentage >= 70%"),
        ("Grade C (Good)", 60, "Threshold: Percentage >= 60%"),
        ("Grade D (Pass)", 50, "Threshold: Percentage >= 50%"),
        ("Grade F (Fail)", 0, "Threshold: Percentage < 50%"),
    ]),
    # WhatsApp & n8n Integrations
    ("3. WHATSAPP CLOUD API & n8n AUTOMATION SETTINGS", [
        ("Meta App ID", "YOUR_META_APP_ID", "Meta Developer App Identifier"),
        ("WhatsApp Phone Number ID", "YOUR_PHONE_NUMBER_ID", "Assigned phone number ID from Meta Cloud API"),
        ("WABA ID", "YOUR_WABA_ID", "WhatsApp Business Account ID"),
        ("Permanent Access Token", "YOUR_META_SYSTEM_USER_TOKEN", "System user access token for WhatsApp Cloud API"),
        ("n8n Daily Cron Webhook", "https://your-n8n-instance.com/webhook/fee-cron", "Endpoint triggered daily at 09:00 AM PKT"),
    ]),
    # Message Templates
    ("4. META APPROVED WHATSAPP MESSAGE TEMPLATES", [
        ("fee_reminder_pre_due", "template_fee_pre_due_v1", "Assalam-o-Alaikum {{parent_name}}, {{student_name}} ki {{month}} ki fee Rs. {{amount}} Due Date ({{due_date}}) tak jama karwayen. Shukriya - Apex Academy"),
        ("fee_reminder_overdue", "template_fee_overdue_v1", "Mohtaram {{parent_name}}, {{student_name}} ki {{month}} ki fee Rs. {{amount}} ki due date guzar chuki hai. Mazeed late fee se bachne ke liye fori ada karein."),
        ("exam_result_card", "template_result_card_v1", "Assalam-o-Alaikum {{parent_name}}, {{student_name}} ka {{exam_type}} ka result card tayyar hai. Total: {{obtained}}/{{total}} ({{percentage}}%, Grade {{grade}}). Attached PDF check karein."),
    ]),
]

cur_row = 4
for sec_title, items in cfg_sections:
    ws_cfg.cell(row=cur_row, column=1, value=sec_title).font = FONT_SECTION
    ws_cfg.row_dimensions[cur_row].height = 22
    cur_row += 1
    
    # Table header
    ws_cfg.cell(row=cur_row, column=1, value="Parameter / Key").font = FONT_HEADER
    ws_cfg.cell(row=cur_row, column=1).fill = FILL_HEADER
    ws_cfg.cell(row=cur_row, column=2, value="Configured Value").font = FONT_HEADER
    ws_cfg.cell(row=cur_row, column=2).fill = FILL_HEADER
    ws_cfg.cell(row=cur_row, column=3, value="Description / Notes").font = FONT_HEADER
    ws_cfg.cell(row=cur_row, column=3).fill = FILL_HEADER
    cur_row += 1
    
    for param, val, desc in items:
        ws_cfg.cell(row=cur_row, column=1, value=param).font = FONT_BOLD
        ws_cfg.cell(row=cur_row, column=1).border = BORDER_THIN
        
        v_cell = ws_cfg.cell(row=cur_row, column=2, value=val)
        v_cell.font = FONT_REGULAR
        v_cell.border = BORDER_THIN
        if isinstance(val, (int, float)):
            v_cell.alignment = Alignment(horizontal="right")
            
        ws_cfg.cell(row=cur_row, column=3, value=desc).font = FONT_MUTED
        ws_cfg.cell(row=cur_row, column=3).border = BORDER_THIN
        ws_cfg.row_dimensions[cur_row].height = 20
        cur_row += 1
    cur_row += 1

autofit(ws_cfg, start_row=4, max_col=3)
ws_cfg.column_dimensions["A"].width = 32
ws_cfg.column_dimensions["B"].width = 35
ws_cfg.column_dimensions["C"].width = 50


# ═════════════════════════════════════════════════════════════
# TAB 3: STUDENTS DIRECTORY (Master Records)
# ═════════════════════════════════════════════════════════════
ws_stu = wb.create_sheet(title="Students")
apply_banner(ws_stu, "APEX ACADEMY — ENROLLED STUDENTS DIRECTORY",
             "Master student registry with normalized WhatsApp contact numbers and standardized monthly fee rates.")

stu_headers = [
    "Student_ID", "Roll_No", "Student_Name", "Father_Name", "Gender",
    "Class", "Section", "Parent_WhatsApp", "Monthly_Fee_PKR", "Admission_Date", "Status"
]

header_row = 3
for col_idx, h in enumerate(stu_headers, start=1):
    ws_stu.cell(row=header_row, column=col_idx, value=h)
style_table_header(ws_stu, header_row, len(stu_headers))
ws_stu.freeze_panes = "C4"

students_data = [
    ('s1', 1, 'Ahmed Khan', 'Imran Khan', 'Male', 'Class 10', 'A', '923001234567', 5000, '2023-04-01', 'Active'),
    ('s2', 2, 'Fatima Noor', 'Noor Muhammad', 'Female', 'Class 10', 'A', '923012345678', 5000, '2023-04-01', 'Active'),
    ('s3', 1, 'Hassan Ali', 'Ali Raza', 'Male', 'Class 9', 'A', '923023456789', 5000, '2023-04-01', 'Active'),
    ('s4', 2, 'Aisha Bibi', 'Muhammad Azam', 'Female', 'Class 9', 'A', '923034567890', 5000, '2023-04-01', 'Active'),
    ('s5', 1, 'Usman Tariq', 'Tariq Mehmood', 'Male', 'Class 8', 'A', '923045678901', 4500, '2023-04-01', 'Active'),
    ('s6', 2, 'Zainab Akhtar', 'Akhtar Hussain', 'Female', 'Class 8', 'A', '923056789012', 4500, '2024-04-01', 'Active'),
    ('s7', 1, 'Bilal Ahmad', 'Ahmad Shah', 'Male', 'Class 7', 'A', '923067890123', 4500, '2024-04-01', 'Active'),
    ('s8', 2, 'Maryam Fatima', 'Fateh Muhammad', 'Female', 'Class 7', 'A', '923078901234', 4500, '2024-04-01', 'Active'),
    ('s9', 1, 'Hamza Iqbal', 'Iqbal Ahmed', 'Male', 'Class 6', 'A', '923089012345', 4000, '2024-04-01', 'Active'),
    ('s10', 2, 'Sana Malik', 'Malik Riaz', 'Female', 'Class 6', 'A', '923090123456', 4000, '2024-04-01', 'Active'),
    ('s11', 1, 'Owais Raza', 'Raza Hussain', 'Male', 'Class 5', 'A', '923101234567', 4000, '2024-04-01', 'Active'),
    ('s12', 2, 'Hira Nawaz', 'Nawaz Sharif', 'Female', 'Class 5', 'A', '923112345678', 4000, '2024-04-01', 'Active'),
    ('s13', 1, 'Talha Saeed', 'Saeed Anwar', 'Male', 'Class 4', 'A', '923123456789', 3500, '2025-04-01', 'Active'),
    ('s14', 2, 'Nimra Hassan', 'Hassan Raza', 'Female', 'Class 4', 'A', '923134567890', 3500, '2025-04-01', 'Active'),
    ('s15', 1, 'Daniyal Sheikh', 'Sheikh Rashid', 'Male', 'Class 3', 'A', '923145678901', 3500, '2025-04-01', 'Active'),
    ('s16', 2, 'Amna Rahim', 'Rahim Dad', 'Female', 'Class 3', 'A', '923156789012', 3500, '2025-04-01', 'Active'),
    ('s17', 1, 'Umer Farooq', 'Farooq Ahmad', 'Male', 'Class 2', 'A', '923167890123', 3000, '2025-04-01', 'Active'),
    ('s18', 2, 'Khadija Aslam', 'Aslam Pervez', 'Female', 'Class 2', 'A', '923178901234', 3000, '2025-04-01', 'Active'),
    ('s19', 1, 'Arsalan Javed', 'Javed Akhtar', 'Male', 'Class 1', 'A', '923189012345', 3000, '2026-04-01', 'Active'),
    ('s20', 2, 'Iqra Yousaf', 'Yousaf Ali', 'Female', 'Class 1', 'A', '923190123456', 3000, '2026-04-01', 'Active'),
    ('s21', 3, 'Saad Qureshi', 'Qureshi Sahab', 'Male', 'Class 10', 'B', '923201234567', 5000, '2023-04-01', 'Active'),
    ('s22', 3, 'Rabia Shahid', 'Shahid Afridi', 'Female', 'Class 9', 'B', '923212345678', 5000, '2023-04-01', 'Active'),
    ('s23', 3, 'Farhan Mustafa', 'Mustafa Kamal', 'Male', 'Class 8', 'B', '923223456789', 4500, '2024-04-01', 'Active'),
    ('s24', 3, 'Mahnoor Amir', 'Amir Sohail', 'Female', 'Class 7', 'B', '923234567890', 4500, '2024-04-01', 'Active'),
    ('s25', 3, 'Junaid Saleem', 'Saleem Baig', 'Male', 'Class 6', 'B', '923245678901', 4000, '2024-04-01', 'Active'),
    ('s26', 3, 'Ayesha Kamran', 'Kamran Akmal', 'Female', 'Class 5', 'B', '923256789012', 4000, '2024-04-01', 'Active'),
    ('s27', 3, 'Waqar Zaman', 'Zaman Khan', 'Male', 'Class 4', 'B', '923267890123', 3500, '2025-04-01', 'Active'),
    ('s28', 3, 'Nadia Parveen', 'Parvez Elahi', 'Female', 'Class 3', 'B', '923278901234', 3500, '2025-04-01', 'Active'),
    ('s29', 4, 'Kashif Mehmood', 'Mehmood Ghaznavi', 'Male', 'Class 10', 'B', '923289012345', 5000, '2023-04-01', 'Active'),
    ('s30', 4, 'Sidra Batool', 'Batool Shah', 'Female', 'Class 9', 'B', '923290123456', 5000, '2023-04-01', 'Active'),
    ('s31', 4, 'Rizwan Ahmed', 'Ahmed Butt', 'Male', 'Class 8', 'B', '923301234567', 4500, '2024-04-01', 'Active'),
    ('s32', 4, 'Bushra Khalid', 'Khalid Mahmood', 'Female', 'Class 7', 'B', '923312345678', 4500, '2024-04-01', 'Active'),
    ('s33', 4, 'Adeel Ashraf', 'Ashraf Ali', 'Male', 'Class 6', 'B', '923323456789', 4000, '2024-04-01', 'Active'),
    ('s34', 4, 'Sumera Akram', 'Akram Gill', 'Female', 'Class 5', 'B', '923334567890', 4000, '2024-04-01', 'Active'),
    ('s35', 5, 'Naveed Akhtar', 'Akhtar Rasool', 'Male', 'Class 10', 'B', '923345678901', 5000, '2023-04-01', 'Active'),
]

for r_idx, row in enumerate(students_data, start=4):
    for c_idx, val in enumerate(row, start=1):
        cell = ws_stu.cell(row=r_idx, column=c_idx, value=val)
        cell.font = FONT_REGULAR
        cell.border = BORDER_THIN
        if c_idx in [1, 2, 5, 6, 7, 10, 11]:
            cell.alignment = Alignment(horizontal="center")
        elif c_idx == 9:
            cell.number_format = "Rs #,##0"
            cell.alignment = Alignment(horizontal="right")
    ws_stu.row_dimensions[r_idx].height = 20

# Data Validation for Students
dv_class = DataValidation(type="list", formula1='"Class 1,Class 2,Class 3,Class 4,Class 5,Class 6,Class 7,Class 8,Class 9,Class 10"', allow_blank=True)
ws_stu.add_data_validation(dv_class)
dv_class.add(f"F4:F{len(students_data)+10}")

dv_status = DataValidation(type="list", formula1='"Active,Inactive,Withdrawn"', allow_blank=True)
ws_stu.add_data_validation(dv_status)
dv_status.add(f"K4:K{len(students_data)+10}")

autofit(ws_stu, start_row=3, max_col=len(stu_headers))


# ═════════════════════════════════════════════════════════════
# TAB 4: FEES LEDGER (Formulas + Dynamic Lookups)
# ═════════════════════════════════════════════════════════════
ws_fees = wb.create_sheet(title="Fees")
apply_banner(ws_fees, "APEX ACADEMY — FEES & RECOVERY AUTOMATION LEDGER",
             "Staff updates 'Status' or 'Paid_Date'. Student details & action reminders auto-calculate via dynamic formulas.")

fee_headers = [
    "Fee_ID", "Student_ID", "Student_Name", "Class", "Parent_WhatsApp",
    "Billing_Month", "Amount_PKR", "Due_Date", "Status", "Paid_Date",
    "Days_Overdue", "Action_Required", "Reminder_Count", "Last_Reminder_Sent"
]

header_row = 3
for col_idx, h in enumerate(fee_headers, start=1):
    ws_fees.cell(row=header_row, column=col_idx, value=h)
style_table_header(ws_fees, header_row, len(fee_headers))
ws_fees.freeze_panes = "C4"

# Raw fee inputs (Fee_ID, Student_ID, Month, Due_Date, Status, Paid_Date, Rem_Count, Last_Rem)
fee_raw_data = [
    ("F101", "s1", "October 2026", "2026-10-10", "paid", "2026-10-09", 1, "2026-10-08 09:30"),
    ("F102", "s2", "October 2026", "2026-10-10", "paid", "2026-10-10", 1, "2026-10-08 09:30"),
    ("F103", "s3", "October 2026", "2026-10-10", "pending", "", 1, "2026-10-08 09:31"),
    ("F104", "s4", "October 2026", "2026-10-10", "paid", "2026-10-11", 1, "2026-10-08 09:31"),
    ("F105", "s5", "October 2026", "2026-10-10", "overdue", "", 2, "2026-10-15 10:15"),
    ("F106", "s6", "October 2026", "2026-10-10", "pending", "", 1, "2026-10-08 09:32"),
    ("F107", "s7", "October 2026", "2026-10-10", "overdue", "", 2, "2026-10-15 10:15"),
    ("F108", "s8", "October 2026", "2026-10-10", "paid", "2026-10-08", 1, "2026-10-08 09:32"),
    ("F109", "s9", "October 2026", "2026-10-10", "overdue", "", 3, "2026-10-18 11:00"),
    ("F110", "s10", "October 2026", "2026-10-10", "pending", "", 1, "2026-10-08 09:33"),
    ("F111", "s21", "October 2026", "2026-10-10", "overdue", "", 3, "2026-10-18 11:00"),
    ("F112", "s29", "October 2026", "2026-10-10", "overdue", "", 3, "2026-10-18 11:05"),
    ("F113", "s35", "October 2026", "2026-10-10", "pending", "", 1, "2026-10-08 09:35"),
    ("F114", "s11", "October 2026", "2026-10-10", "paid", "2026-10-07", 1, "2026-10-08 09:30"),
    ("F115", "s12", "October 2026", "2026-10-10", "pending", "", 1, "2026-10-08 09:30"),
]

for idx, (f_id, s_id, month, due, status, paid_d, rem_cnt, last_rem) in enumerate(fee_raw_data, start=4):
    ws_fees.cell(row=idx, column=1, value=f_id).alignment = Alignment(horizontal="center")
    ws_fees.cell(row=idx, column=2, value=s_id).alignment = Alignment(horizontal="center")
    
    # Formulas for auto-filling student details from Students sheet!
    ws_fees.cell(row=idx, column=3, value=f'=IFERROR(VLOOKUP(B{idx}, Students!$A$4:$D$100, 3, FALSE), "")')
    ws_fees.cell(row=idx, column=4, value=f'=IFERROR(VLOOKUP(B{idx}, Students!$A$4:$F$100, 6, FALSE), "")')
    ws_fees.cell(row=idx, column=5, value=f'=IFERROR(VLOOKUP(B{idx}, Students!$A$4:$H$100, 8, FALSE), "")')
    
    ws_fees.cell(row=idx, column=6, value=month).alignment = Alignment(horizontal="center")
    
    # Amount lookup from Students sheet
    amt_cell = ws_fees.cell(row=idx, column=7, value=f'=IFERROR(VLOOKUP(B{idx}, Students!$A$4:$I$100, 9, FALSE), 4000)')
    amt_cell.number_format = "Rs #,##0"
    amt_cell.alignment = Alignment(horizontal="right")
    
    ws_fees.cell(row=idx, column=8, value=due).alignment = Alignment(horizontal="center")
    
    stat_cell = ws_fees.cell(row=idx, column=9, value=status)
    stat_cell.alignment = Alignment(horizontal="center")
    if status == "paid":
        stat_cell.fill = FILL_PAID
    elif status == "pending":
        stat_cell.fill = FILL_PENDING
    elif status == "overdue":
        stat_cell.fill = FILL_OVERDUE
        
    ws_fees.cell(row=idx, column=10, value=paid_d).alignment = Alignment(horizontal="center")
    
    # Formula for Days Overdue
    ws_fees.cell(row=idx, column=11, value=f'=IF(I{idx}="overdue", 14, 0)').alignment = Alignment(horizontal="center")
    
    # Dynamic Action Required Formula
    ws_fees.cell(row=idx, column=12, value=f'=IF(I{idx}="overdue", "🚨 Urgent Follow-up", IF(I{idx}="pending", "⏳ Send Due Reminder", "✅ Completed"))')
    
    ws_fees.cell(row=idx, column=13, value=rem_cnt).alignment = Alignment(horizontal="center")
    ws_fees.cell(row=idx, column=14, value=last_rem).alignment = Alignment(horizontal="center")

    for col in range(1, len(fee_headers) + 1):
        cell = ws_fees.cell(row=idx, column=col)
        cell.font = FONT_REGULAR
        cell.border = BORDER_THIN
    ws_fees.row_dimensions[idx].height = 20

# Data Validation for Fee Status
dv_fee_stat = DataValidation(type="list", formula1='"paid,pending,overdue"', allow_blank=True)
ws_fees.add_data_validation(dv_fee_stat)
dv_fee_stat.add(f"I4:I{len(fee_raw_data)+20}")

autofit(ws_fees, start_row=3, max_col=len(fee_headers))


# ═════════════════════════════════════════════════════════════
# TAB 5: MARKS & EXAM RESULTS (Formulas + Dynamic Grading)
# ═════════════════════════════════════════════════════════════
ws_marks = wb.create_sheet(title="Marks")
apply_banner(ws_marks, "APEX ACADEMY — EXAMINATION RESULTS & GRADING",
             "Teachers input subject marks. Total, Percentage, Letter Grade, and Class Position calculate automatically.")

marks_headers = [
    "Result_ID", "Student_ID", "Student_Name", "Class", "Exam_Type",
    "Urdu", "English", "Math", "Islamiat", "Science", "Total_Marks",
    "Obtained_Marks", "Percentage", "Grade", "Position", "Workflow_Status"
]

header_row = 3
for col_idx, h in enumerate(marks_headers, start=1):
    ws_marks.cell(row=header_row, column=col_idx, value=h)
style_table_header(ws_marks, header_row, len(marks_headers))
ws_marks.freeze_panes = "C4"

marks_inputs = [
    ("R001", "s1", "Final", 88, 92, 95, 90, 89, "approved"),
    ("R002", "s2", "Final", 85, 87, 88, 92, 84, "approved"),
    ("R003", "s21", "Final", 78, 80, 82, 85, 75, "approved"),
    ("R004", "s29", "Final", 70, 72, 68, 75, 65, "approved"),
    ("R005", "s35", "Final", 65, 60, 58, 70, 55, "approved"),
    ("R006", "s3", "Final", 90, 85, 92, 94, 88, "draft"),
    ("R007", "s4", "Final", 82, 80, 85, 88, 79, "draft"),
    ("R008", "s22", "Final", 75, 76, 70, 80, 72, "draft"),
    ("R009", "s30", "Final", 68, 65, 62, 70, 60, "draft"),
]

for idx, (r_id, s_id, exam, urdu, eng, math, isl, sci, stat) in enumerate(marks_inputs, start=4):
    ws_marks.cell(row=idx, column=1, value=r_id).alignment = Alignment(horizontal="center")
    ws_marks.cell(row=idx, column=2, value=s_id).alignment = Alignment(horizontal="center")
    
    # Auto-lookup student name & class
    ws_marks.cell(row=idx, column=3, value=f'=IFERROR(VLOOKUP(B{idx}, Students!$A$4:$D$100, 3, FALSE), "")')
    ws_marks.cell(row=idx, column=4, value=f'=IFERROR(VLOOKUP(B{idx}, Students!$A$4:$F$100, 6, FALSE), "")')
    
    ws_marks.cell(row=idx, column=5, value=exam).alignment = Alignment(horizontal="center")
    ws_marks.cell(row=idx, column=6, value=urdu).alignment = Alignment(horizontal="center")
    ws_marks.cell(row=idx, column=7, value=eng).alignment = Alignment(horizontal="center")
    ws_marks.cell(row=idx, column=8, value=math).alignment = Alignment(horizontal="center")
    ws_marks.cell(row=idx, column=9, value=isl).alignment = Alignment(horizontal="center")
    ws_marks.cell(row=idx, column=10, value=sci).alignment = Alignment(horizontal="center")
    
    # Total marks
    ws_marks.cell(row=idx, column=11, value=500).alignment = Alignment(horizontal="center")
    
    # Obtained Marks formula
    ws_marks.cell(row=idx, column=12, value=f'=SUM(F{idx}:J{idx})').alignment = Alignment(horizontal="center")
    
    # Percentage formula
    pct_cell = ws_marks.cell(row=idx, column=13, value=f'=ROUND((L{idx}/K{idx})*100, 1)')
    pct_cell.alignment = Alignment(horizontal="center")
    
    # Dynamic Grade formula referencing Config sheet thresholds!
    grade_formula = f'=IF(M{idx}>=Config!$B$13, "A+", IF(M{idx}>=Config!$B$14, "A", IF(M{idx}>=Config!$B$15, "B", IF(M{idx}>=Config!$B$16, "C", IF(M{idx}>=Config!$B$17, "D", "F")))))'
    ws_marks.cell(row=idx, column=14, value=grade_formula).alignment = Alignment(horizontal="center")
    
    # Class position rank formula
    rank_formula = f'=RANK(L{idx}, $L$4:$L$12)'
    ws_marks.cell(row=idx, column=15, value=rank_formula).alignment = Alignment(horizontal="center")
    
    stat_cell = ws_marks.cell(row=idx, column=16, value=stat)
    stat_cell.alignment = Alignment(horizontal="center")
    if stat == "approved":
        stat_cell.fill = FILL_PAID
    elif stat == "draft":
        stat_cell.fill = FILL_PENDING

    for col in range(1, len(marks_headers) + 1):
        cell = ws_marks.cell(row=idx, column=col)
        cell.font = FONT_REGULAR
        cell.border = BORDER_THIN
    ws_marks.row_dimensions[idx].height = 20

dv_workflow = DataValidation(type="list", formula1='"draft,approved,sent"', allow_blank=True)
ws_marks.add_data_validation(dv_workflow)
dv_workflow.add(f"P4:P{len(marks_inputs)+15}")

autofit(ws_marks, start_row=3, max_col=len(marks_headers))


# ═════════════════════════════════════════════════════════════
# TAB 6: DEFAULTER ACTION REPORT (Automated Follow-up)
# ═════════════════════════════════════════════════════════════
ws_def = wb.create_sheet(title="Defaulter_Report")
apply_banner(ws_def, "APEX ACADEMY — LATE FEE DEFAULTERS & DISPATCH QUEUE",
             "Prioritized list of overdue accounts. Used directly by n8n to send WhatsApp reminders.")

# Summary statistics banner
ws_def.cell(row=3, column=2, value="TOTAL DEFAULTERS:").font = FONT_BOLD
ws_def.cell(row=3, column=3, value='=COUNTIF(Fees!I4:I100, "overdue")').font = FONT_BOLD
ws_def.cell(row=3, column=5, value="TOTAL OVERDUE AMOUNT:").font = FONT_BOLD
tot_ov_cell = ws_def.cell(row=3, column=6, value='=SUMIF(Fees!I4:I100, "overdue", Fees!G4:G100)')
tot_ov_cell.font = FONT_BOLD
tot_ov_cell.number_format = "Rs #,##0"
ws_def.row_dimensions[3].height = 24

def_headers = [
    "Student_ID", "Student_Name", "Class", "Parent_WhatsApp",
    "Billing_Month", "Unpaid_Amount_PKR", "Days_Overdue", "Dispatch_Priority", "WhatsApp_Status"
]

header_row = 5
for col_idx, h in enumerate(def_headers, start=1):
    ws_def.cell(row=header_row, column=col_idx, value=h)
style_table_header(ws_def, header_row, len(def_headers))
ws_def.freeze_panes = "C6"

defaulters_data = [
    ("s5", "Usman Tariq", "Class 8", "923045678901", "October 2026", 4500, 14, "HIGH", "Ready to Send"),
    ("s7", "Bilal Ahmad", "Class 7", "923067890123", "October 2026", 4500, 14, "HIGH", "Ready to Send"),
    ("s9", "Hamza Iqbal", "Class 6", "923089012345", "October 2026", 4000, 14, "URGENT", "Sent - Awaiting Reply"),
    ("s21", "Saad Qureshi", "Class 10", "923201234567", "October 2026", 5000, 14, "URGENT", "Sent - Awaiting Reply"),
    ("s29", "Kashif Mehmood", "Class 10", "923289012345", "October 2026", 5000, 14, "URGENT", "Sent - Awaiting Reply"),
]

for idx, row in enumerate(defaulters_data, start=6):
    for c_idx, val in enumerate(row, start=1):
        cell = ws_def.cell(row=idx, column=c_idx, value=val)
        cell.font = FONT_REGULAR
        cell.border = BORDER_THIN
        if c_idx in [1, 3, 4, 5, 7, 8, 9]:
            cell.alignment = Alignment(horizontal="center")
        elif c_idx == 6:
            cell.number_format = "Rs #,##0"
            cell.alignment = Alignment(horizontal="right")
    ws_def.cell(row=idx, column=7).fill = FILL_OVERDUE
    ws_def.row_dimensions[idx].height = 20

autofit(ws_def, start_row=5, max_col=len(def_headers))


# ═════════════════════════════════════════════════════════════
# TAB 7: WHATSAPP AUDIT LOGS (Compliance & Meta History)
# ═════════════════════════════════════════════════════════════
ws_logs = wb.create_sheet(title="Logs")
apply_banner(ws_logs, "APEX ACADEMY — WHATSAPP MESSAGE AUDIT TRAIL",
             "Complete immutable record of all dispatched notifications, delivery receipts, and trigger sources.")

log_headers = [
    "Log_ID", "Timestamp_PKT", "Recipient_WhatsApp", "Student_Name", "Class",
    "Message_Type", "Template_Key", "Delivery_Status", "Meta_Message_ID", "Trigger_Source"
]

header_row = 3
for col_idx, h in enumerate(log_headers, start=1):
    ws_logs.cell(row=header_row, column=col_idx, value=h)
style_table_header(ws_logs, header_row, len(log_headers))
ws_logs.freeze_panes = "C4"

logs_data = [
    ("LOG-001", "2026-10-08 09:30:15", "923001234567", "Ahmed Khan", "Class 10", "Fee Reminder", "fee_reminder_pre_due", "Delivered", "wamid.HBg...101", "n8n_cron_morning"),
    ("LOG-002", "2026-10-08 09:30:42", "923012345678", "Fatima Noor", "Class 10", "Fee Reminder", "fee_reminder_pre_due", "Delivered", "wamid.HBg...102", "n8n_cron_morning"),
    ("LOG-003", "2026-10-15 10:15:20", "923045678901", "Usman Tariq", "Class 8", "Overdue Notice", "fee_reminder_overdue", "Delivered", "wamid.HBg...105", "n8n_cron_morning"),
    ("LOG-004", "2026-10-18 11:00:05", "923089012345", "Hamza Iqbal", "Class 6", "Overdue Notice", "fee_reminder_overdue", "Delivered", "wamid.HBg...109", "admin_dashboard_manual"),
    ("LOG-005", "2026-10-20 14:00:00", "923001234567", "Ahmed Khan", "Class 10", "Result Card PDF", "exam_result_card", "Delivered", "wamid.HBg...201", "admin_dashboard_manual"),
]

for idx, row in enumerate(logs_data, start=4):
    for c_idx, val in enumerate(row, start=1):
        cell = ws_logs.cell(row=idx, column=c_idx, value=val)
        cell.font = FONT_REGULAR
        cell.border = BORDER_THIN
        if c_idx in [1, 2, 3, 5, 6, 7, 8, 9, 10]:
            cell.alignment = Alignment(horizontal="center")
    ws_logs.cell(row=idx, column=8).fill = FILL_PAID
    ws_logs.row_dimensions[idx].height = 20

autofit(ws_logs, start_row=3, max_col=len(log_headers))

# Save Workbook
output_path = r"d:\school automation\School_Automation_Database.xlsx"
wb.save(output_path)
print(f"Successfully generated enhanced workbook: {output_path}")
