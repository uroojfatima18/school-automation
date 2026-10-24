'use client';

import { MONTH_OPTIONS } from '@/lib/utils';
import { User } from 'lucide-react';

interface TopBarProps {
  title: string;
  selectedMonth?: string;
  onMonthChange?: (month: string) => void;
}

export function TopBar({ title, selectedMonth, onMonthChange }: TopBarProps) {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-[#E8E0CF] sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
        {/* Left: Page title (with left padding on mobile for hamburger) */}
        <h2 className="text-lg font-bold text-primary-text pl-12 lg:pl-0">
          {title}
        </h2>

        <div className="flex items-center gap-3">
          {/* Month selector */}
          {onMonthChange && (
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="text-sm bg-white border border-[#E8E0CF] rounded-xl px-3 py-2 text-primary-text
                         focus:outline-none focus:ring-2 focus:ring-[#2F6B4F]/20 focus:border-[#2F6B4F]
                         transition-all cursor-pointer hover:border-[#2F6B4F]/40"
              aria-label="Select month"
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          )}

          {/* Avatar placeholder */}
          <div className="w-9 h-9 rounded-full bg-[#E3F0E8] flex items-center justify-center border border-[#2F6B4F]/10">
            <User className="w-4 h-4 text-[#2F6B4F]" />
          </div>
        </div>
      </div>
    </header>
  );
}
