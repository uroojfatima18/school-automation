'use client';

import { FeeStatus, ResultStatus } from '@/lib/types';

const statusConfig: Record<string, { label: string; className: string }> = {
  paid: {
    label: 'Paid',
    className: 'bg-[#E3F0E8] text-[#2F6B4F] border-[#2F6B4F]/20',
  },
  pending: {
    label: 'Pending',
    className: 'bg-[#FCEBDD] text-[#E8833A] border-[#E8833A]/20',
  },
  overdue: {
    label: 'Overdue',
    className: 'bg-red-50 text-[#C4473A] border-[#C4473A]/20',
  },
  draft: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-600 border-gray-300/40',
  },
  approved: {
    label: 'Approved',
    className: 'bg-[#E3F0E8] text-[#2F6B4F] border-[#2F6B4F]/20',
  },
  sent: {
    label: 'Sent',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
};

interface StatusBadgeProps {
  status: FeeStatus | ResultStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className} transition-colors`}
    >
      {config.label}
    </span>
  );
}
