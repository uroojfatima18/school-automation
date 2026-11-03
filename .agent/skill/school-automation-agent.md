# School Automation Agent Skill

**Framework**: OpenAI Agent SDK (v1)  
**Purpose**: Autonomous school administration automation using WhatsApp Cloud API, Google Sheets, and n8n  
**Model**: nemotron-3.5-lightning-free (via opencode)

---

## 📋 Agent Capabilities

### Core Functions
- **Fee Recovery**: Automated defaulter tracking, payment status updates, WhatsApp reminders
- **Result Generation**: Exam result processing, grade calculation, PDF report card generation
- **Student Management**: Directory maintenance, contact info validation, fee ledger updates
- **Reporting**: KPI dashboards, defaulter reports, audit logs, collection analytics

### Integration Points
- **Google Sheets**: Data layer (`Students`, `Fees`, `Marks`, `Config`, `Logs` sheets)
- **n8n Automation Engine**: Scheduled triggers, WhatsApp message dispatch, anti-spam de-duplication
- **WhatsApp Cloud API**: Official Meta-approved templates for fee reminders & result cards
- **Excel Database**: `School_Automation_Database.xlsx` with 7-tab structure

### Agent Workflow
1. **Trigger**: Cron job or webhook request (daily morning check)
2. **Read**: Google Sheets data (fees, marks, students)
3. **Filter**: Identify overdue fees, pending results, defaulters
4. **Act**: Send WhatsApp messages (approved templates), update statuses
5. **Log**: Record all actions in `Logs` sheet with Meta message IDs
6. **Report**: Generate KPI dashboards and defaulter summaries

---

## ⚠️ Rules & Constraints

### WhatsApp API Rules
- ✅ **Only use official WhatsApp Cloud API** - never unofficial libraries (Baileys/Puppeteer)
- ✅ **Template pre-approval required** - submit utility templates to Meta before mass messaging
- ✅ **Test numbers only** for development; production requires Business Verification
- ✅ **Rate limiting**: Maximum 1 message/parent/day (anti-spam de-duplication)
- ✅ **Opt-in required**: Parents must have explicit consent for WhatsApp communications

### Data Privacy & Security
- ✅ **Restrict Google Sheet permissions** - only authorized service accounts/service accounts
- ✅ **Sensitive data**: Student records and phone numbers are confidential
- ✅ **No hardcoded grading rules** - all thresholds stored in `Config` sheet
- ✅ **Explicit parent opt-in** before any WhatsApp messaging

### Workflow Gates
- ✅ **Approval required**: "Preview → Approve" gate before mass result card dispatch
- ✅ **Status progression**: Results flow `draft → approved → sent` (never skip steps)
- ✅ **Defaulter prioritization**: HIGH/URGENT categories based on days overdue & amount
- ✅ **Formula verification**: All Excel formulas must reference correct sheet ranges

### n8n Automation Rules
- ✅ **Cron trigger**: Daily 09:00 AM PKT morning check
- ✅ **Anti-duplication**: Prevent same parent receiving multiple messages same day
- ✅ **Job routing**: Separate pipelines for fee reminders vs result card dispatch
- ✅ **Payload records**: Log every message with timestamp, recipient, status

### Excel Database Integrity
- ✅ **Never hardcode** student IDs, phone numbers, or amounts in formulas
- ✅ **VLOOKUP ranges** must match `Students!$A$4:$...` structure
- ✅ **Config sheet** is the single source of truth for grading thresholds
- ✅ **All 7 tabs** must remain synchronized (Students, Fees, Marks, Config, Logs, Dashboard_KPIs, Defaulter_Report)

### Agent Behavior
- ✅ **Human-in-the-loop**: Critical actions (result dispatch, fee write-offs) require preview
- ✅ **Error handling**: Graceful fallback if Meta template approvals delay development
- ✅ **Audit trail**: Every action logged with timestamp, user, and payload
- ✅ **No autonomous financial decisions**: Agent suggests, human approves

---

## 🛠 Development Guidelines

### Adding New Features
1. **Check phase**: Is this Phase 1 (MVP), Phase 2, Phase 3, or Phase 4?
2. **Template**: Submit new WhatsApp message templates to Meta for approval
3. **Google Sheets**: Add new sheet + update `Config` if adding new data fields
4. **n8n**: Create new workflow or extend existing cron job
5. **Frontend**: Add new page/component; update types in `src/lib/types/index.ts`
6. **Excel**: Add new tab or extend existing formulas (never break VLOOKUP ranges)
7. **Test**: Validate with pilot school data before rollout

### Code Style
- **TypeScript**: All frontend code; Python for Excel/automation
- **No hardcoded values**: Use `Config` sheet for grading rules, school settings
- **Error-first**: Always handle errors gracefully with user-friendly messages
- **Audit every action**: Log who/what/when for compliance

### Deployment Checklist
- [ ] Meta templates approved (or test numbers used during dev)
- [ ] Google Sheets permissions restricted
- [ ] School phone number verified with Meta Business Manager
- [ ] Pilot school data tested (1-2 schools minimum)
- [ ] Rollback plan documented
- [ ] Metrics defined: fee recovery %, time saved, parent satisfaction

---

## 📞 Agent Commands (Example Prompts)

```
<agent> Get Class 10 overdue fees with WhatsApp reminders ready to send
</agent>

<agent> Calculate fee collection rate for October 2026, Class 8 only
</agent>

<agent> Generate defaulter report for n8n automation, prioritize by URGENT/HIGH
</agent>

<agent> Approve Class 10 Final results and prepare WhatsApp dispatch
</agent>

<agent> Update student s5's monthly fee from 4500 to 5000 PKR
</agent>