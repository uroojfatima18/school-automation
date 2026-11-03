# School Automation Assistant - Agent Skills

## Framework: OpenAI Agent SDK (via opencode)
**Model**: nemotron-3.5-lightning-free

### Core Skills

#### 1. Fee Recovery Automation
- **Trigger**: n8n cron job (daily 09:00 AM PKT)
- **Action**: Read Fees sheet, filter overdue/pending, generate defaulter report
- **Output**: Prioritized list (URGENT/HIGH) for WhatsApp reminders
- **Constraints**: Max 1 message/parent/day, approved Meta templates only

#### 2. Exam Result Processing
- **Input**: Marks sheet data, Config sheet grading thresholds
- **Process**: Calculate total, percentage, grade (from Config), class position
- **Workflow**: draft → approved → sent (never skip steps)
- **Output**: PDF result cards via WhatsApp Cloud API

#### 3. Student Directory Management
- **Operations**: Add/update students, validate WhatsApp numbers
- **Lookup**: VLOOKUP across Sheets (Students → Fees → Marks)
- **Validation**: Class options (1-10), Status (Active/Inactive/Withdrawn)

#### 4. KPI Dashboard Generation
- **Data**: Live Google Sheets metrics
- **Output**: Fees collected/pending, collection rate, defaulter count
- **Trend**: Month-over-month comparison, fee distribution charts

#### 5. n8n Workflow Integration
- **Cron Triggers**: Daily morning checks
- **Job Routing**: Fee reminders vs result card dispatch
- **Anti-spam**: De-duplication (1 message/parent/day)
- **Logging**: Immutable audit trail in Logs sheet

#### 6. Excel Database Generation
- **Tool**: `create_excel.py` generates `School_Automation_Database.xlsx`
- **7 Tabs**: Dashboard_KPIs, Config, Students, Fees, Marks, Defaulter_Report, Logs
- **Formulas**: Live VLOOKUPs, dynamic grading, auto-formatting
- **Rule**: Never hardcode grading rules — always reference Config sheet

### Agent Interaction Patterns

```
<agent> Get Class 10 overdue fees ready for WhatsApp reminders
</agent>
→ Reads Fees sheet, filters overdue, outputs Defaulter_Report prioritization

<agent> Calculate fee collection rate for October 2026, Class 8 only
</agent>
→ Reads Fees sheet, filters Class 8, October 2026, computes collection rate

<agent> Approve Class 10 Final results and prepare WhatsApp dispatch
</agent>
→ Approves results (draft→approved), triggers WhatsApp send via approved template

<agent> Update student s5's monthly fee from 4500 to 5000 PKR
</agent>
→ Updates Students sheet, recalculates all dependent fees
```

### Development Guidelines
- **TypeScript**: All frontend code; Python for Excel/automation
- **No hardcoded values**: Use Config sheet for grading rules, school settings
- **Error handling**: Graceful fallback if Meta template approvals delay development
- **Audit every action**: Log who/what/when for compliance
- **Phase roadmap**: Follow Phase 1 (MVP) → Phase 2 → Phase 3 → Phase 4 sequence