'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Wallet,
  Clock,
  Percent,
  MessageCircle,
  Send,
  Bell,
  CreditCard,
  FileText,
} from 'lucide-react';

import { TopBar } from '@/components/TopBar';
import { KpiCard, KpiCardSkeleton } from '@/components/KpiCard';
import { ChartCard, ChartCardSkeleton } from '@/components/ChartCard';
import { DataTable, Column } from '@/components/DataTable';
import { useToast } from '@/components/Toast';
import { formatPKR, timeAgo } from '@/lib/utils';
import {
  getKpiData,
  getMonthlyCollections,
  getFeeDistribution,
  getTopDefaulters,
  getRecentActivity,
  sendFeeReminder,
} from '@/lib/services/dataService';
import type {
  KpiData,
  MonthlyCollection,
  FeeDistribution,
  FeeRecord,
  ActivityItem,
} from '@/lib/types';

const DONUT_COLORS = ['#2F6B4F', '#E8833A', '#C4473A'];

export default function HomePage() {
  const { showToast } = useToast();
  const [kpi, setKpi] = useState<KpiData | null>(null);
  const [collections, setCollections] = useState<MonthlyCollection[]>([]);
  const [distribution, setDistribution] = useState<FeeDistribution | null>(null);
  const [defaulters, setDefaulters] = useState<FeeRecord[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [k, c, d, def, act] = await Promise.all([
      getKpiData(),
      getMonthlyCollections(),
      getFeeDistribution(),
      getTopDefaulters(5),
      getRecentActivity(8),
    ]);
    setKpi(k);
    setCollections(c);
    setDistribution(d);
    setDefaulters(def);
    setActivity(act);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSendReminder = async (feeId: string) => {
    setSendingReminder(feeId);
    try {
      await sendFeeReminder(feeId);
      showToast('Reminder sent successfully!', 'success');
      const act = await getRecentActivity(8);
      setActivity(act);
    } catch {
      showToast('Failed to send reminder', 'error');
    }
    setSendingReminder(null);
  };

  const activityIcons: Record<string, React.ReactNode> = {
    reminder_sent: <Bell className="w-4 h-4 text-[#E8833A]" />,
    fee_paid: <CreditCard className="w-4 h-4 text-[#2F6B4F]" />,
    result_generated: <FileText className="w-4 h-4 text-[#2F6B4F]" />,
    result_sent: <Send className="w-4 h-4 text-blue-600" />,
    result_approved: <FileText className="w-4 h-4 text-[#2F6B4F]" />,
  };

  const defaulterColumns: Column<FeeRecord>[] = [
    {
      key: 'name',
      header: 'Student',
      render: (r) => (
        <div>
          <p className="font-medium">{r.studentName}</p>
          <p className="text-xs text-muted">{r.className}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount Due',
      render: (r) => <span className="font-semibold">{formatPKR(r.amount)}</span>,
    },
    {
      key: 'days',
      header: 'Overdue',
      hideOnMobile: true,
      render: (r) => (
        <span className="text-[#C4473A] font-medium text-xs">
          {r.daysOverdue} days
        </span>
      ),
    },
    {
      key: 'action',
      header: '',
      render: (r) => (
        <button
          onClick={() => handleSendReminder(r.id)}
          disabled={sendingReminder === r.id}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                     bg-[#FCEBDD] text-[#E8833A] hover:bg-[#E8833A] hover:text-white
                     transition-all duration-200 disabled:opacity-50"
        >
          <Send className="w-3 h-3" />
          {sendingReminder === r.id ? 'Sending…' : 'Remind'}
        </button>
      ),
    },
  ];

  const donutData = distribution
    ? [
        { name: 'Paid', value: distribution.paid },
        { name: 'Pending', value: distribution.pending },
        { name: 'Overdue', value: distribution.overdue },
      ]
    : [];

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="Dashboard" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 lg:pb-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)
          ) : kpi ? (
            <>
              <KpiCard
                title="Fees Collected"
                value={formatPKR(kpi.feesCollected)}
                trend={kpi.feesCollectedTrend}
                icon={<Wallet className="w-5 h-5 text-[#2F6B4F]" />}
              />
              <KpiCard
                title="Fees Pending"
                value={formatPKR(kpi.feesPending)}
                trend={kpi.feesPendingTrend}
                icon={<Clock className="w-5 h-5 text-[#E8833A]" />}
                iconBg="bg-[#FCEBDD]"
              />
              <KpiCard
                title="Collection Rate"
                value={`${kpi.collectionRate}%`}
                trend={kpi.collectionRateTrend}
                icon={<Percent className="w-5 h-5 text-[#2F6B4F]" />}
              />
              <KpiCard
                title="Messages Today"
                value={String(kpi.messagesSentToday)}
                trend={kpi.messagesTrend}
                icon={<MessageCircle className="w-5 h-5 text-[#2F6B4F]" />}
              />
            </>
          ) : null}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2">
            {loading ? (
              <ChartCardSkeleton />
            ) : (
              <ChartCard
                title="Monthly Fee Collection"
                subtitle="Collected vs Pending — Last 6 months"
              >
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={collections} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8E0CF" vertical={false} />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7266', fontSize: 12 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7266', fontSize: 11 }}
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#fff',
                          border: '1px solid #E8E0CF',
                          borderRadius: 12,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                          fontSize: 13,
                        }}
                        formatter={(value: number) => [formatPKR(value), '']}
                      />
                      <Bar dataKey="collected" name="Collected" fill="#2F6B4F" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="pending" name="Pending" fill="#E8833A" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            )}
          </div>

          <div>
            {loading ? (
              <ChartCardSkeleton />
            ) : (
              <ChartCard title="Fee Status Split" subtitle="October 2026">
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {donutData.map((_, idx) => (
                          <Cell key={idx} fill={DONUT_COLORS[idx]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: '#fff',
                          border: '1px solid #E8E0CF',
                          borderRadius: 12,
                          fontSize: 13,
                        }}
                        formatter={(value: number, name: string) => [
                          `${value} students`,
                          name,
                        ]}
                      />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 12, color: '#6B7266' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            )}
          </div>
        </div>

        {/* Bottom row: Defaulters + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 bg-white rounded-2xl border border-[#E8E0CF] shadow-sm p-5">
            <h3 className="text-sm font-semibold text-primary-text mb-4">
              Top Defaulters
            </h3>
            <DataTable
              columns={defaulterColumns}
              data={defaulters}
              keyExtractor={(r) => r.id}
              isLoading={loading}
              emptyMessage="No overdue fees — great job! 🎉"
            />
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8E0CF] shadow-sm p-5">
            <h3 className="text-sm font-semibold text-primary-text mb-4">
              Recent Activity
            </h3>
            {loading ? (
              <div className="space-y-3 animate-pulse">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-200 rounded w-full" />
                      <div className="h-2.5 bg-gray-100 rounded w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activity.length === 0 ? (
              <p className="text-sm text-muted text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {activity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F7F3EA]/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#F7F3EA] flex items-center justify-center flex-shrink-0">
                      {activityIcons[item.type] || <Bell className="w-4 h-4 text-muted" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-primary-text leading-snug">
                        {item.message}
                      </p>
                      <p className="text-[11px] text-muted mt-0.5">
                        {timeAgo(item.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
