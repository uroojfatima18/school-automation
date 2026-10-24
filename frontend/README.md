# School Automation Assistant — Dashboard

A professional admin dashboard for **Al-Noor Academy**, built as a frontend prototype for managing fee recovery and exam results in small private schools and academies in Pakistan.

## Tech Stack

- **Next.js 16** (App Router) with TypeScript
- **Tailwind CSS** for styling
- **Recharts** for data visualization (bar charts, donut charts)
- **Lucide React** for icons
- **Inter** font via `next/font`

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with sidebar, font, toast provider
│   ├── page.tsx            # Home / Owner overview dashboard
│   ├── fees/page.tsx       # Fee management screen
│   ├── results/page.tsx    # Exam results screen
│   └── globals.css         # Design tokens and global styles
├── components/
│   ├── Sidebar.tsx         # Responsive sidebar + mobile bottom nav
│   ├── TopBar.tsx          # Page title + month selector + avatar
│   ├── KpiCard.tsx         # KPI metric card with trend indicator
│   ├── ChartCard.tsx       # Chart wrapper card
│   ├── DataTable.tsx       # Generic typed data table
│   ├── StatusBadge.tsx     # Status pill badge (paid/pending/overdue/etc.)
│   └── Toast.tsx           # Toast notification system
├── lib/
│   ├── types/index.ts      # TypeScript entity definitions
│   ├── data/               # Dummy data files (DO NOT import from components)
│   │   ├── students.ts     # 35 students with Pakistani names
│   │   ├── fees.ts         # Fee records across 6 months
│   │   ├── results.ts      # Exam results with subjects and grades
│   │   └── activity.ts     # Recent activity feed items
│   ├── services/
│   │   └── dataService.ts  # ★ Central data access layer
│   └── utils.ts            # Currency formatting, time helpers, constants
```

## Screens

### 1. Home (Owner Overview)
- 4 KPI cards: Fees Collected, Fees Pending, Collection Rate, Messages Sent
- Bar chart: Monthly fee collections (last 6 months)
- Donut chart: Paid / Pending / Overdue split
- Top Defaulters table with "Send Reminder" action
- Recent Activity feed

### 2. Fees
- Search, filter by class/status/month, Export CSV (mock)
- Full data table with status badges
- "Mark Paid" updates local state; "Send Reminder" shows toast
- Pagination with "Load More"

### 3. Results
- Class and exam selectors
- Workflow status: Draft → Approved → Sent (with progress bars)
- Full marks table with grades, percentages, positions
- "Preview Result Card" dialog with printable layout
- "Approve" and "Send to Parents on WhatsApp" workflow buttons

## Plugging In Real Data

All components access data exclusively through `/lib/services/dataService.ts`. **To connect to a real backend:**

1. Replace the function implementations in `dataService.ts`
2. Swap mock imports with API calls (Google Sheets, REST API, database)
3. Every record includes a `schoolId` field for multi-school support
4. No other files need to change

Example:
```typescript
// Before (mock)
export async function getFees(): Promise<FeeRecord[]> {
  await delay();
  return [...feeRecords];
}

// After (real API)
export async function getFees(): Promise<FeeRecord[]> {
  const res = await fetch('/api/fees?schoolId=school-001');
  return res.json();
}
```

## Design System

| Token           | Value     | Usage                              |
|-----------------|-----------|-------------------------------------|
| Background      | `#F7F3EA` | Page background (warm beige)       |
| Surface         | `#FFFFFF` | Cards, panels                       |
| Sidebar         | `#EFE8D8` | Navigation sidebar                  |
| Primary         | `#2F6B4F` | Buttons, active states, success     |
| Accent          | `#E8833A` | Warnings, pending, highlights       |
| Danger          | `#C4473A` | Overdue, errors (used sparingly)    |
| Text Primary    | `#1F2A24` | Main text                           |
| Text Muted      | `#6B7266` | Secondary text, labels              |
| Border          | `#E8E0CF` | Card borders, dividers              |

## Notes

- **No authentication** — this is a frontend prototype
- **No API routes or database** — all data is in-memory
- **Fully responsive** — sidebar collapses to bottom nav on mobile
- **PKR currency formatting** — e.g. Rs. 4,500
- **Pakistani locale** — realistic names, Class 1-10, phone formats
