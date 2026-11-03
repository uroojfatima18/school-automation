# School Automation Assistant — Project Rules

**Project**: School Automation Assistant (اسکول آٹومیشن اسسٹنٹ)  
**Domain**: Small private schools, academies & tuition centers in Pakistan  
**Audience**: School owners/principals, teachers, office staff  
**Deployment**: WhatsApp-first automation via Google Sheets + n8n + WhatsApp Cloud API

---

## 🎯 Core Mission

Automate repetitive administrative operations to eliminate manual overhead, accelerate fee recovery, and streamline exam result delivery for small schools (100–500 students).

**Primary Value Propositions**:
- Direct cash recovery (faster fee payments via automated reminders)
- Hours saved for staff and teachers (automated calculations & dispatch)
- Enhanced school reputation and parent satisfaction (timely WhatsApp communication)

---

## 📦 System Architecture Rules

### Data Layer (Google Sheets)
| Sheet | Purpose | Key Rules |
|-------|---------|-----------|
| `Students` | Master student registry | Never hardcode student IDs; use School ID (`school-001`) for multi-school support |
| `Fees` | Fees & recovery ledger | Status must be `paid`/`pending`/`overdue` — never other values |
| `Marks` | Examination results | All grading thresholds from `Config` sheet — never hardcode |
| `Config` | School settings & rules | **Single source of truth** — all dynamic values here |
| `Logs` | WhatsApp audit trail | Immutable record — every message logged with timestamp & status |
| `Dashboard_KPIs` | Live metrics | Formulas must reference correct sheet ranges |
| `Defaulter_Report` | n8n dispatch queue | Priority: URGENT/HIGH based on days overdue + amount |

### Architectural Layers (never bypass)
1. **Data Layer**: Google Sheets only — no direct database access from frontend
2. **Logic & Automation**: n8n engine with cron triggers
3. **Document Engine**: Google Docs templates with `{{placeholders}}`
4. **Messaging Layer**: Official WhatsApp Cloud API only
5. **Approval Workflow**: Mandatory "Preview → Approve" gatekeeper

---

## 💰 Business Rules

### Pricing Strategy
- **Monthly Retainer**: Rs. 3,000 to Rs. 10,000 / month (depending on student count)
- **Per-Student Model**: Rs. 20–30/student/month alternative
- **Pilot Strategy**: First 1–2 schools get free/subsidized 30-day pilot

### WhatsApp API Considerations
1. **Template Approvals**: Meta requires pre-approval for outbound notification templates
2. **Account Verification**: Test numbers only message registered test devices
3. **Ban Prevention**: Never use unofficial scraping/libraries (risk permanent banning)
4. **Development Fallback**: If approvals delay, continue with test numbers or email fallbacks
5. **Data Privacy**: Student records and phone numbers are sensitive; restrict sheet permissions

### Phase Gates (from README)
- **Phase 1 (MVP)**: Fee recovery + automated result cards ✅
- **Phase 2**: Attendance alerts, announcements, admission follow-up
- **Phase 3**: Teacher attendance, owner analytics, weak student alerts
- **Phase 4**: AI chatbot, subjective paper checking, multi-tenant dashboard

**Rule**: Do NOT build beyond current phase — defer features as per roadmap.

---

## 🛡 Risk Management Rules

### WhatsApp Ban Prevention (STRICT)
- ✅ **ALWAYS** use official WhatsApp Cloud API
- ✅ **NEVER** use Baileys, Puppeteer, or any unofficial libraries
- ✅ **ALWAYS** submit message templates to Meta for approval before use
- ✅ **NEVER** send messages to parents without approved templates

### Data Safety
- ✅ **Always** restrict Google Sheet permissions (service accounts only)
- ✅ **Never** expose raw student phone numbers in URLs or client-side code
- ✅ **Always** have rollback plan if automation sends incorrect messages
- ✅ **Never** hardcode sensitive values (API tokens, phone numbers) in source code

### Development Fallback
- If Meta template approvals take >1 week: Continue development via test numbers or email fallbacks
- **Progress never blocks** due to approval delays

---

## 📐 Design System Tokens (Frontend)

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#F7F3EA` | Page background (warm beige) |
| Surface | `#FFFFFF` | Cards, panels |
| Sidebar | `#EFE8D8` | Navigation sidebar |
| Primary | `#2F6B4F` | Buttons, active states, success |
| Accent | `#E8833A` | Warnings, pending, highlights |
| Danger | `#C4473A` | Overdue, errors (used sparingly) |
| Text Primary | `#1F2A24` | Main text |
| Text Muted | `#6B7266` | Secondary text, labels |
| Border | `#E8E0CF` | Card borders, dividers |

**Rule**: Use exact token values — do not approximate or create new colors.

---

## 🚫 Forbidden Patterns (Never Do These)

1. ❌ **Never** hardcode grading rules in Marks tab — always use `Config` sheet
2. ❌ **Never** send WhatsApp messages without approved Meta templates
3. ❌ **Never** skip the "Preview → Approve" gate for result card dispatch
4. ❌ **Never** use unofficial WhatsApp libraries (ban risk)
5. ❌ **Never** break VLOOKUP range structure in Excel sheets
6. ❌ **Never** expose API tokens or phone numbers in frontend code
7. ❌ **Never** build enterprise multi-tenant features (deferred to Phase 4)
8. ❌ **Never** bypass status progression: `draft → approved → sent`

---

## ✅ Required Checklists

### Before Pilot Deployment
- [ ] Meta Business Manager configured & WhatsApp Cloud API connected
- [ ] 3–4 official message templates submitted for approval
- [ ] Google Sheets schema designed (`Students`, `Fees`, `Marks`, `Config`, `Logs`)
- [ ] Pilot school data tested (1–2 schools minimum)
- [ ] School phone number verified with Meta
- [ ] Rollback plan documented
- [ ] Metrics defined: fee recovery %, time saved, parent satisfaction

### Before Each Feature Release
- [ ] TypeScript types updated in `src/lib/types/index.ts`
- [ ] Google Sheets updated (new sheet or columns if needed)
- [ ] n8n workflow created/extended
- [ ] WhatsApp templates submitted (if new message type)
- [ ] Frontend component added/updated
- [ ] Excel formulas verified (no broken VLOOKUPs)
- [ ] Pilot test with real school data

---

## 📞 Agent Interaction Rules

When user queries this agent:

1. **Always** reference project context: small Pakistani schools, WhatsApp-first, Google Sheets + n8n
2. **Follow phase roadmap** — don't build Phase 3 features when only Phase 1 is complete
3. **Enforce WhatsApp API rules** — template approval, no unofficial libraries
4. **Reference design tokens** — use exact color values, not approximations
5. **Prioritize pilot-tested** solutions — validate with 1–2 schools first
6. **Maintain audit trail** — every action logged, every change tracked
7. **Never bypass approval gates** — especially for result dispatch or fee modifications

### Example Agent Prompts
```
<agent> Help me setup fee reminders for Class 10 — follow Phase 1 rules
</agent>

<agent> What's the collection rate for October 2026, Class 8 only?
</agent>

<agent> Generate defaulter report for n8n — prioritize by overdue days + amount
</agent>

<agent> Add new student to the system — update Students sheet + recalculate fees
</agent>
```

**Agent Constraint**: Always verify current project state (which phase, what data exists) before recommending solutions.