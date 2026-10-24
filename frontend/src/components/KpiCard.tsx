'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  trend: number;
  trendLabel?: string;
  icon: React.ReactNode;
  iconBg?: string;
}

export function KpiCard({ title, value, trend, trendLabel, icon, iconBg }: KpiCardProps) {
  const isPositive = trend >= 0;

  return (
    <div className="bg-white rounded-2xl border border-[#E8E0CF] shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted truncate">{title}</p>
          <p className="mt-2 text-2xl font-bold text-primary-text tracking-tight">
            {value}
          </p>
        </div>
        <div
          className={`flex-shrink-0 ml-3 flex items-center justify-center w-11 h-11 rounded-xl ${iconBg || 'bg-[#E3F0E8]'}`}
        >
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        {isPositive ? (
          <TrendingUp className="w-3.5 h-3.5 text-[#2F6B4F]" />
        ) : (
          <TrendingDown className="w-3.5 h-3.5 text-[#C4473A]" />
        )}
        <span
          className={`text-xs font-medium ${isPositive ? 'text-[#2F6B4F]' : 'text-[#C4473A]'}`}
        >
          {isPositive ? '+' : ''}
          {trend}%
        </span>
        <span className="text-xs text-muted">
          {trendLabel || 'vs last month'}
        </span>
      </div>
    </div>
  );
}

/** Skeleton loader for KPI cards */
export function KpiCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E0CF] shadow-sm p-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="mt-3 h-7 bg-gray-200 rounded w-32" />
        </div>
        <div className="w-11 h-11 bg-gray-200 rounded-xl" />
      </div>
      <div className="mt-3 h-3 bg-gray-100 rounded w-20" />
    </div>
  );
}
