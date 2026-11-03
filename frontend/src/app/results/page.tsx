'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronDown,
  FileCheck,
  Send,
  Eye,
  X,
  CheckCircle2,
  Clock,
  MessageSquare,
  GraduationCap,
} from 'lucide-react';

import { TopBar } from '@/components/TopBar';
import { DataTable, Column } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { useToast } from '@/components/Toast';
import { CLASS_OPTIONS } from '@/lib/utils';
import {
  getResults,
  getClassSummaries,
  approveResults,
  sendResultsToParents,
} from '@/lib/services/dataService';
import type { StudentResult, ClassResultSummary, ResultStatus } from '@/lib/types';

const EXAM_OPTIONS = ['Midterm', 'Final'];

export default function ResultsPage() {
  const { showToast } = useToast();
  const [results, setResults] = useState<StudentResult[]>([]);
  const [summaries, setSummaries] = useState<ClassResultSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState('Class 10');
  const [examFilter, setExamFilter] = useState('Final');
  const [actionLoading, setActionLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState<StudentResult | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [res, sums] = await Promise.all([
      getResults({ className: classFilter, examType: examFilter }),
      getClassSummaries(),
    ]);
    setResults(res);
    setSummaries(sums);
    setLoading(false);
  }, [classFilter, examFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Get current class+exam status
  const currentSummary = summaries.find(
    (s) => s.className === classFilter && s.examType === examFilter
  );
  const currentStatus: ResultStatus = currentSummary?.status || 'draft';

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await approveResults(classFilter, examFilter);
      showToast(`${classFilter} ${examFilter} results approved!`, 'success');
      await loadData();
    } catch {
      showToast('Failed to approve results', 'error');
    }
    setActionLoading(false);
  };

  const handleSendToParents = async () => {
    setActionLoading(true);
    try {
      await sendResultsToParents(classFilter, examFilter);
      showToast('Results sent to parents via WhatsApp!', 'success');
      await loadData();
    } catch {
      showToast('Failed to send results', 'error');
    }
    setActionLoading(false);
  };

  const openPreview = (result: StudentResult) => {
    setPreviewResult(result);
    dialogRef.current?.showModal();
  };

  const closePreview = () => {
    dialogRef.current?.close();
    setPreviewResult(null);
  };

  // Workflow step indicators
  const steps = [
    { label: 'Draft', status: 'draft' as ResultStatus, icon: Clock },
    { label: 'Approved', status: 'approved' as ResultStatus, icon: CheckCircle2 },
    { label: 'Sent', status: 'sent' as ResultStatus, icon: Send },
  ];

  const getStepState = (stepStatus: ResultStatus) => {
    const order = { draft: 0, approved: 1, sent: 2 };
    const currentOrder = order[currentStatus];
    const stepOrder = order[stepStatus];
    if (stepOrder < currentOrder) return 'completed';
    if (stepOrder === currentOrder) return 'current';
    return 'upcoming';
  };

  const columns: Column<StudentResult>[] = [
    {
      key: 'roll',
      header: 'Roll #',
      render: (r) => <span className="font-medium">{r.rollNo}</span>,
    },
    {
      key: 'name',
      header: 'Student',
      render: (r) => (
        <div>
          <p className="font-medium">{r.studentName}</p>
          <p className="text-xs text-muted">s/o {r.fatherName}</p>
        </div>
      ),
    },
    ...results[0]?.subjects.map((sub) => ({
      key: sub.name,
      header: sub.name,
      hideOnMobile: true,
      render: (r: StudentResult) => {
        const mark = r.subjects.find((s) => s.name === sub.name);
        return (
          <span className={mark && mark.obtainedMarks < 50 ? 'text-[#C4473A] font-medium' : ''}>
            {mark?.obtainedMarks ?? '—'}
          </span>
        );
      },
    })) || [],
    {
      key: 'total',
      header: 'Total',
      render: (r) => (
        <span className="font-bold">
          {r.obtainedMarks}/{r.totalMarks}
        </span>
      ),
    },
    {
      key: 'pct',
      header: '%',
      render: (r) => <span className="font-semibold">{r.percentage}%</span>,
    },
    {
      key: 'grade',
      header: 'Grade',
      render: (r) => (
        <span
          className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold ${
            r.grade === 'A+' || r.grade === 'A'
              ? 'bg-[#E3F0E8] text-[#2F6B4F]'
              : r.grade === 'F'
              ? 'bg-red-50 text-[#C4473A]'
              : 'bg-[#FCEBDD] text-[#E8833A]'
          }`}
        >
          {r.grade}
        </span>
      ),
    },
    {
      key: 'pos',
      header: 'Pos',
      render: (r) => (
        <span className="font-medium">
          {r.position === 1 ? '🥇' : r.position === 2 ? '🥈' : r.position === 3 ? '🥉' : `#${r.position}`}
        </span>
      ),
    },
    {
      key: 'preview',
      header: '',
      render: (r) => (
        <button
          onClick={() => openPreview(r)}
          className="p-1.5 rounded-lg hover:bg-[#F7F3EA] text-muted hover:text-[#2F6B4F] transition-colors"
          title="Preview Result Card"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="Exam Results" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 lg:pb-8">
        {/* Selectors */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 text-sm bg-white border border-[#E8E0CF] rounded-xl
                         text-primary-text focus:outline-none focus:ring-2 focus:ring-[#2F6B4F]/20 focus:border-[#2F6B4F]
                         transition-all cursor-pointer shadow-sm"
              aria-label="Select class"
            >
              {CLASS_OPTIONS.filter((c) => ['Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'].includes(c)).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={examFilter}
              onChange={(e) => setExamFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 text-sm bg-white border border-[#E8E0CF] rounded-xl
                         text-primary-text focus:outline-none focus:ring-2 focus:ring-[#2F6B4F]/20 focus:border-[#2F6B4F]
                         transition-all cursor-pointer shadow-sm"
              aria-label="Select exam type"
            >
              {EXAM_OPTIONS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
          </div>
        </div>

        {/* Workflow status */}
        <div className="bg-white rounded-2xl border border-[#E8E0CF] shadow-sm p-5 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Step indicators */}
            <div className="flex items-center gap-2">
              {steps.map((step, idx) => {
                const state = getStepState(step.status);
                const Icon = step.icon;
                return (
                  <div key={step.label} className="flex items-center gap-2">
                    <div
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        state === 'completed'
                          ? 'bg-[#E3F0E8] text-[#2F6B4F]'
                          : state === 'current'
                          ? 'bg-[#2F6B4F] text-white shadow-sm'
                          : 'bg-gray-100 text-muted'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {step.label}
                    </div>
                    {idx < steps.length - 1 && (
                      <div
                        className={`w-8 h-0.5 rounded ${
                          state === 'completed' ? 'bg-[#2F6B4F]' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {currentStatus === 'draft' && (
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                             bg-[#2F6B4F] text-white rounded-xl hover:bg-[#265741]
                             transition-all duration-200 shadow-sm disabled:opacity-50"
                >
                  <FileCheck className="w-4 h-4" />
                  Approve Results
                </button>
              )}
              <button
                onClick={handleSendToParents}
                disabled={currentStatus !== 'approved' || actionLoading}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl
                           transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed
                           ${currentStatus === 'approved'
                    ? 'bg-[#25D366] text-white hover:bg-[#1da851]'
                    : 'bg-gray-100 text-muted border border-[#E8E0CF]'
                  }`}
                title={currentStatus !== 'approved' ? 'Approve results first' : 'Send via WhatsApp'}
              >
                <MessageSquare className="w-4 h-4" />
                Send to Parents on WhatsApp
              </button>
            </div>
          </div>

          {/* Progress indicators */}
          {currentSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#E8E0CF]/60">
              <ProgressItem
                label="Marks Entered"
                value={currentSummary.marksEntered}
                total={currentSummary.totalStudents}
                color="bg-[#2F6B4F]"
              />
              <ProgressItem
                label="Results Generated"
                value={currentSummary.resultsGenerated ? currentSummary.totalStudents : 0}
                total={currentSummary.totalStudents}
                color="bg-[#E8833A]"
              />
              <ProgressItem
                label="Sent to Parents"
                value={currentSummary.sentToParents ? currentSummary.totalStudents : 0}
                total={currentSummary.totalStudents}
                color="bg-blue-500"
              />
            </div>
          )}
        </div>

        {/* Results table */}
        <div className="bg-white rounded-2xl border border-[#E8E0CF] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#E8E0CF]/60">
            <h3 className="text-sm font-semibold text-primary-text">
              {classFilter} — {examFilter} Exam Results
            </h3>
            <p className="text-xs text-muted mt-0.5">
              {results.length} students • <StatusBadge status={currentStatus} />
            </p>
          </div>
          <DataTable
            columns={columns}
            data={results}
            keyExtractor={(r) => r.id}
            isLoading={loading}
            emptyMessage="No results found for this class/exam combination"
          />
        </div>
      </main>

      {/* Result Card Preview Dialog */}
      <dialog
        ref={dialogRef}
        className="backdrop:bg-black/40 backdrop:backdrop-blur-sm bg-transparent p-0 rounded-2xl max-w-lg w-full"
        onClick={(e) => { if (e.target === dialogRef.current) closePreview(); }}
      >
        {previewResult && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Dialog header */}
            <div className="bg-[#2F6B4F] text-white p-5 relative">
              <button
                onClick={closePreview}
                className="absolute top-3 right-3 p-1 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 mb-3">
                <GraduationCap className="w-7 h-7" />
                <div>
                  <h2 className="text-lg font-bold">Apex Academy</h2>
                  <p className="text-xs opacity-80">Result Card — {previewResult.examType} Examination</p>
                </div>
              </div>
            </div>

            {/* Student info */}
            <div className="p-5 border-b border-[#E8E0CF]">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted">Student Name</p>
                  <p className="font-semibold text-primary-text">{previewResult.studentName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Father&apos;s Name</p>
                  <p className="font-semibold text-primary-text">{previewResult.fatherName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Class</p>
                  <p className="font-semibold text-primary-text">{previewResult.className}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Roll Number</p>
                  <p className="font-semibold text-primary-text">{previewResult.rollNo}</p>
                </div>
              </div>
            </div>

            {/* Marks table */}
            <div className="p-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E8E0CF]">
                    <th className="text-left py-2 text-xs font-semibold text-muted uppercase">Subject</th>
                    <th className="text-center py-2 text-xs font-semibold text-muted uppercase">Total</th>
                    <th className="text-center py-2 text-xs font-semibold text-muted uppercase">Obtained</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E0CF]/60">
                  {previewResult.subjects.map((sub) => (
                    <tr key={sub.name}>
                      <td className="py-2 font-medium">{sub.name}</td>
                      <td className="py-2 text-center text-muted">{sub.totalMarks}</td>
                      <td className={`py-2 text-center font-semibold ${sub.obtainedMarks < 50 ? 'text-[#C4473A]' : 'text-primary-text'}`}>
                        {sub.obtainedMarks}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[#2F6B4F]/20">
                    <td className="py-2 font-bold">Total</td>
                    <td className="py-2 text-center font-bold text-muted">{previewResult.totalMarks}</td>
                    <td className="py-2 text-center font-bold text-[#2F6B4F]">{previewResult.obtainedMarks}</td>
                  </tr>
                </tfoot>
              </table>

              {/* Summary row */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-xl bg-[#E3F0E8]">
                  <p className="text-xs text-muted mb-0.5">Percentage</p>
                  <p className="text-lg font-bold text-[#2F6B4F]">{previewResult.percentage}%</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-[#FCEBDD]">
                  <p className="text-xs text-muted mb-0.5">Grade</p>
                  <p className="text-lg font-bold text-[#E8833A]">{previewResult.grade}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-[#F7F3EA]">
                  <p className="text-xs text-muted mb-0.5">Position</p>
                  <p className="text-lg font-bold text-primary-text">
                    {previewResult.position === 1 ? '🥇' : previewResult.position === 2 ? '🥈' : previewResult.position === 3 ? '🥉' : `#${previewResult.position}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-[#F7F3EA] text-center">
              <p className="text-[10px] text-muted">
                This is a computer-generated result card from Apex Academy School Automation System
              </p>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}

// Progress bar sub-component
function ProgressItem({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-muted">{label}</span>
        <span className="text-xs font-semibold text-primary-text">
          {value}/{total}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
