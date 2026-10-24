// Core entity types for School Automation Assistant

export type FeeStatus = 'paid' | 'pending' | 'overdue';
export type ResultStatus = 'draft' | 'approved' | 'sent';
export type ActivityType = 'reminder_sent' | 'fee_paid' | 'result_generated' | 'result_sent' | 'result_approved';

export interface Student {
  id: string;
  schoolId: string;
  name: string;
  fatherName: string;
  className: string;
  rollNo: number;
  phone: string; // parent's phone
  admissionDate: string;
}

export interface FeeRecord {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  className: string;
  parentPhone: string;
  month: string; // e.g. "October 2026"
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: FeeStatus;
  daysOverdue?: number;
}

export interface Subject {
  name: string;
  totalMarks: number;
  obtainedMarks: number;
}

export interface StudentResult {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  fatherName: string;
  className: string;
  rollNo: number;
  examType: string; // e.g. "Midterm", "Final"
  subjects: Subject[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  position: number;
  status: ResultStatus;
}

export interface ClassResultSummary {
  className: string;
  examType: string;
  totalStudents: number;
  marksEntered: number;
  resultsGenerated: boolean;
  sentToParents: boolean;
  status: ResultStatus;
}

export interface ActivityItem {
  id: string;
  schoolId: string;
  type: ActivityType;
  message: string;
  timestamp: string;
  relatedStudentId?: string;
}

export interface KpiData {
  feesCollected: number;
  feesPending: number;
  collectionRate: number;
  messagesSentToday: number;
  // Trend: positive means up, negative means down
  feesCollectedTrend: number;
  feesPendingTrend: number;
  collectionRateTrend: number;
  messagesTrend: number;
}

export interface MonthlyCollection {
  month: string;
  collected: number;
  pending: number;
}

export interface FeeDistribution {
  paid: number;
  pending: number;
  overdue: number;
}
