/**
 * Data Service Layer
 *
 * All components access data through this service.
 * To swap to a real backend (Google Sheets, API, database),
 * replace the implementations here without touching any components.
 */

import { students } from '@/lib/data/students';
import { fees } from '@/lib/data/fees';
import { results, getClassResultSummaries } from '@/lib/data/results';
import { activities } from '@/lib/data/activity';
import type {
  Student,
  FeeRecord,
  StudentResult,
  ClassResultSummary,
  ActivityItem,
  KpiData,
  MonthlyCollection,
  FeeDistribution,
  FeeStatus,
  ResultStatus,
} from '@/lib/types';

// Simulate async delay (makes it easy to add loading states)
const delay = (ms: number = 300) => new Promise((res) => setTimeout(res, ms));

// In-memory mutable copies for state changes
let feeRecords = [...fees];
let resultRecords = [...results];
let activityRecords = [...activities];

// ──────────────────── Students ────────────────────

export async function getStudents(): Promise<Student[]> {
  await delay();
  return students;
}

export async function getStudentById(id: string): Promise<Student | undefined> {
  await delay(100);
  return students.find((s) => s.id === id);
}

// ──────────────────── Fees ────────────────────

export async function getFees(filters?: {
  className?: string;
  status?: FeeStatus;
  month?: string;
  search?: string;
}): Promise<FeeRecord[]> {
  await delay();
  let filtered = [...feeRecords];

  if (filters?.className && filters.className !== 'all') {
    filtered = filtered.filter((f) => f.className === filters.className);
  }
  if (filters?.status && filters.status !== ('all' as FeeStatus)) {
    filtered = filtered.filter((f) => f.status === filters.status);
  }
  if (filters?.month && filters.month !== 'all') {
    filtered = filtered.filter((f) => f.month === filters.month);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(
      (f) =>
        f.studentName.toLowerCase().includes(q) ||
        f.parentPhone.includes(q)
    );
  }

  return filtered;
}

export async function markFeePaid(feeId: string): Promise<FeeRecord> {
  await delay(200);
  const idx = feeRecords.findIndex((f) => f.id === feeId);
  if (idx === -1) throw new Error('Fee record not found');

  feeRecords[idx] = {
    ...feeRecords[idx],
    status: 'paid',
    paidDate: new Date().toISOString().split('T')[0],
    daysOverdue: undefined,
  };

  // Add activity
  activityRecords.unshift({
    id: `act-${Date.now()}`,
    schoolId: 'school-001',
    type: 'fee_paid',
    message: `${feeRecords[idx].studentName} (${feeRecords[idx].className}) — ${feeRecords[idx].month} fee marked as paid`,
    timestamp: new Date().toISOString(),
    relatedStudentId: feeRecords[idx].studentId,
  });

  return feeRecords[idx];
}

export async function sendFeeReminder(feeId: string): Promise<void> {
  await delay(500);
  const fee = feeRecords.find((f) => f.id === feeId);
  if (!fee) throw new Error('Fee record not found');

  activityRecords.unshift({
    id: `act-${Date.now()}`,
    schoolId: 'school-001',
    type: 'reminder_sent',
    message: `Fee reminder sent to ${fee.studentName}'s parent (${fee.className})`,
    timestamp: new Date().toISOString(),
    relatedStudentId: fee.studentId,
  });
}

// ──────────────────── Results ────────────────────

export async function getResults(filters?: {
  className?: string;
  examType?: string;
}): Promise<StudentResult[]> {
  await delay();
  let filtered = [...resultRecords];

  if (filters?.className && filters.className !== 'all') {
    filtered = filtered.filter((r) => r.className === filters.className);
  }
  if (filters?.examType && filters.examType !== 'all') {
    filtered = filtered.filter((r) => r.examType === filters.examType);
  }

  return filtered;
}

export async function getClassSummaries(): Promise<ClassResultSummary[]> {
  await delay();
  return getClassResultSummaries();
}

export async function approveResults(
  className: string,
  examType: string
): Promise<void> {
  await delay(300);
  resultRecords = resultRecords.map((r) => {
    if (r.className === className && r.examType === examType && r.status === 'draft') {
      return { ...r, status: 'approved' as ResultStatus };
    }
    return r;
  });

  activityRecords.unshift({
    id: `act-${Date.now()}`,
    schoolId: 'school-001',
    type: 'result_approved',
    message: `${className} ${examType} results approved by admin`,
    timestamp: new Date().toISOString(),
  });
}

export async function sendResultsToParents(
  className: string,
  examType: string
): Promise<void> {
  await delay(500);
  resultRecords = resultRecords.map((r) => {
    if (r.className === className && r.examType === examType && r.status === 'approved') {
      return { ...r, status: 'sent' as ResultStatus };
    }
    return r;
  });

  activityRecords.unshift({
    id: `act-${Date.now()}`,
    schoolId: 'school-001',
    type: 'result_sent',
    message: `${className} ${examType} results sent to parents via WhatsApp`,
    timestamp: new Date().toISOString(),
  });
}

// ──────────────────── Activity ────────────────────

export async function getRecentActivity(limit: number = 10): Promise<ActivityItem[]> {
  await delay(100);
  return activityRecords.slice(0, limit);
}

// ──────────────────── KPIs & Charts ────────────────────

export async function getKpiData(): Promise<KpiData> {
  await delay();
  const currentMonth = 'October 2026';
  const currentFees = feeRecords.filter((f) => f.month === currentMonth);

  const collected = currentFees
    .filter((f) => f.status === 'paid')
    .reduce((sum, f) => sum + f.amount, 0);
  const pending = currentFees
    .filter((f) => f.status !== 'paid')
    .reduce((sum, f) => sum + f.amount, 0);
  const total = collected + pending;
  const rate = total > 0 ? Math.round((collected / total) * 100) : 0;

  return {
    feesCollected: collected,
    feesPending: pending,
    collectionRate: rate,
    messagesSentToday: 12,
    feesCollectedTrend: 8,
    feesPendingTrend: -5,
    collectionRateTrend: 3,
    messagesTrend: 15,
  };
}

export async function getMonthlyCollections(): Promise<MonthlyCollection[]> {
  await delay();
  const months = [
    'May 2026', 'June 2026', 'July 2026',
    'August 2026', 'September 2026', 'October 2026',
  ];

  return months.map((month) => {
    const monthFees = feeRecords.filter((f) => f.month === month);
    return {
      month: month.split(' ')[0], // Just "May", "June", etc.
      collected: monthFees
        .filter((f) => f.status === 'paid')
        .reduce((sum, f) => sum + f.amount, 0),
      pending: monthFees
        .filter((f) => f.status !== 'paid')
        .reduce((sum, f) => sum + f.amount, 0),
    };
  });
}

export async function getFeeDistribution(): Promise<FeeDistribution> {
  await delay();
  const currentMonth = 'October 2026';
  const currentFees = feeRecords.filter((f) => f.month === currentMonth);

  return {
    paid: currentFees.filter((f) => f.status === 'paid').length,
    pending: currentFees.filter((f) => f.status === 'pending').length,
    overdue: currentFees.filter((f) => f.status === 'overdue').length,
  };
}

export async function getTopDefaulters(limit: number = 5): Promise<FeeRecord[]> {
  await delay();
  return feeRecords
    .filter((f) => f.status === 'overdue')
    .sort((a, b) => (b.daysOverdue || 0) - (a.daysOverdue || 0))
    .slice(0, limit);
}
