'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Download,
  Send,
  CheckCircle,
  ChevronDown,
} from 'lucide-react';

import { TopBar } from '@/components/TopBar';
import { DataTable, Column } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { useToast } from '@/components/Toast';
import { formatPKR, CLASS_OPTIONS, MONTH_OPTIONS } from '@/lib/utils';
import { getFees, markFeePaid, sendFeeReminder } from '@/lib/services/dataService';
import type { FeeRecord, FeeStatus } from '@/lib/types';

const ITEMS_PER_PAGE = 15;

export default function FeesPage() {
  const { showToast } = useToast();
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState('October 2026');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadFees = useCallback(async () => {
    setLoading(true);
    const data = await getFees({
      className: classFilter,
      status: statusFilter as FeeStatus,
      month: monthFilter,
      search,
    });
    setFees(data);
    setPage(1);
    setLoading(false);
  }, [classFilter, statusFilter, monthFilter, search]);

  useEffect(() => {
    loadFees();
  }, [loadFees]);

  const handleMarkPaid = async (feeId: string) => {
    setActionLoading(feeId);
    try {
      await markFeePaid(feeId);
      showToast('Fee marked as paid', 'success');
      await loadFees();
    } catch {
      showToast('Failed to mark fee as paid', 'error');
    }
    setActionLoading(null);
  };

  const handleSendReminder = async (feeId: string) => {
    setActionLoading(feeId);
    try {
      await sendFeeReminder(feeId);
      showToast('Reminder sent to parent via WhatsApp', 'info');
    } catch {
      showToast('Failed to send reminder', 'error');
    }
    setActionLoading(null);
  };

  const handleExportCSV = () => {
    showToast('CSV export will be available with real data', 'info');
  };

  const totalPages = Math.ceil(fees.length / ITEMS_PER_PAGE);
  const paginatedFees = fees.slice(0, page * ITEMS_PER_PAGE);
  const hasMore = page * ITEMS_PER_PAGE < fees.length;

  const columns: Column<FeeRecord>[] = [
    {
      key: 'student',
      header: 'Student',
      render: (r) => (
        <div>
          <p className="font-medium">{r.studentName}</p>
          <p className="text-xs text-muted">{r.className}</p>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Parent Phone',
      hideOnMobile: true,
      render: (r) => <span className="text-sm text-muted">{r.parentPhone}</span>,
    },
    {
      key: 'month',
      header: 'Month',
      hideOnMobile: true,
      render: (r) => <span className="text-sm">{r.month}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (r) => <span className="font-semibold">{formatPKR(r.amount)}</span>,
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      hideOnMobile: true,
      render: (r) => <span className="text-sm text-muted">{r.dueDate}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-2">
          {r.status !== 'paid' && (
            <>
              <button
                onClick={() => handleMarkPaid(r.id)}
                disabled={actionLoading === r.id}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg
                           bg-[#E3F0E8] text-[#2F6B4F] hover:bg-[#2F6B4F] hover:text-white
                           transition-all duration-200 disabled:opacity-50"
                title="Mark as Paid"
              >
                <CheckCircle className="w-3 h-3" />
                <span className="hidden sm:inline">Paid</span>
              </button>
              <button
                onClick={() => handleSendReminder(r.id)}
                disabled={actionLoading === r.id}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg
                           bg-[#FCEBDD] text-[#E8833A] hover:bg-[#E8833A] hover:text-white
                           transition-all duration-200 disabled:opacity-50"
                title="Send Reminder"
              >
                <Send className="w-3 h-3" />
                <span className="hidden sm:inline">Remind</span>
              </button>
            </>
          )}
          {r.status === 'paid' && (
            <span className="text-xs text-muted">—</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="Fee Management" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 lg:pb-8">
        {/* Filters row */}
        <div className="bg-white rounded-2xl border border-[#E8E0CF] shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Search by name or phone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-[#F7F3EA] border border-[#E8E0CF] rounded-xl
                           text-primary-text placeholder:text-muted/60
                           focus:outline-none focus:ring-2 focus:ring-[#2F6B4F]/20 focus:border-[#2F6B4F]
                           transition-all"
                aria-label="Search fees"
              />
            </div>

            {/* Class filter */}
            <div className="relative">
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2.5 text-sm bg-[#F7F3EA] border border-[#E8E0CF] rounded-xl
                           text-primary-text focus:outline-none focus:ring-2 focus:ring-[#2F6B4F]/20 focus:border-[#2F6B4F]
                           transition-all cursor-pointer"
                aria-label="Filter by class"
              >
                <option value="all">All Classes</option>
                {CLASS_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
            </div>

            {/* Status filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2.5 text-sm bg-[#F7F3EA] border border-[#E8E0CF] rounded-xl
                           text-primary-text focus:outline-none focus:ring-2 focus:ring-[#2F6B4F]/20 focus:border-[#2F6B4F]
                           transition-all cursor-pointer"
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
            </div>

            {/* Month filter */}
            <div className="relative">
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2.5 text-sm bg-[#F7F3EA] border border-[#E8E0CF] rounded-xl
                           text-primary-text focus:outline-none focus:ring-2 focus:ring-[#2F6B4F]/20 focus:border-[#2F6B4F]
                           transition-all cursor-pointer"
                aria-label="Filter by month"
              >
                <option value="all">All Months</option>
                {MONTH_OPTIONS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
            </div>

            {/* Export button */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium
                         bg-[#2F6B4F] text-white rounded-xl hover:bg-[#265741]
                         transition-all duration-200 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Stats summary */}
        <div className="flex flex-wrap gap-3 mb-4">
          <span className="text-xs font-medium text-muted bg-white px-3 py-1.5 rounded-lg border border-[#E8E0CF]">
            {fees.length} records
          </span>
          <span className="text-xs font-medium text-[#2F6B4F] bg-[#E3F0E8] px-3 py-1.5 rounded-lg">
            {fees.filter((f) => f.status === 'paid').length} Paid
          </span>
          <span className="text-xs font-medium text-[#E8833A] bg-[#FCEBDD] px-3 py-1.5 rounded-lg">
            {fees.filter((f) => f.status === 'pending').length} Pending
          </span>
          <span className="text-xs font-medium text-[#C4473A] bg-red-50 px-3 py-1.5 rounded-lg">
            {fees.filter((f) => f.status === 'overdue').length} Overdue
          </span>
        </div>

        {/* Data table */}
        <div className="bg-white rounded-2xl border border-[#E8E0CF] shadow-sm overflow-hidden">
          <DataTable
            columns={columns}
            data={paginatedFees}
            keyExtractor={(r) => r.id}
            isLoading={loading}
            emptyMessage="No fee records match your filters"
          />

          {/* Load more */}
          {hasMore && !loading && (
            <div className="p-4 flex justify-center border-t border-[#E8E0CF]/60">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium
                           bg-[#F7F3EA] text-primary-text rounded-xl hover:bg-[#EFE8D8]
                           transition-all duration-200 border border-[#E8E0CF]"
              >
                Load More ({fees.length - paginatedFees.length} remaining)
              </button>
            </div>
          )}

          {/* Page info */}
          {!loading && fees.length > 0 && (
            <div className="px-4 py-3 border-t border-[#E8E0CF]/60 text-xs text-muted text-center">
              Showing {paginatedFees.length} of {fees.length} records
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
