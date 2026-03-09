'use client';

import { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  ArrowLeftRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
} from 'lucide-react';
import { clsx } from 'clsx';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  mockAdminStats,
  mockRevenueChartData,
  mockKycQueue,
  mockAdminTransactions,
} from '@/lib/mockData';

function formatCurrency(n: number) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  return `Rp ${n.toLocaleString('id-ID')}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

const statCards = [
  {
    label: 'Total Merchant',
    value: mockAdminStats.totalMerchants,
    sub: `${mockAdminStats.activeMerchants} aktif`,
    icon: Building2,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    label: 'Pending KYC',
    value: mockAdminStats.pendingKyc,
    sub: 'perlu direview',
    icon: ShieldCheck,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    label: 'Transaksi Hari Ini',
    value: mockAdminStats.totalTransactionsToday,
    sub: `${mockAdminStats.failedTransactionsToday} gagal`,
    icon: ArrowLeftRight,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    label: 'Revenue Hari Ini',
    value: formatCurrency(mockAdminStats.revenueToday),
    sub: `MTD: ${formatCurrency(mockAdminStats.totalRevenueMtd)}`,
    icon: TrendingUp,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
];

const txStatusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  success: { label: 'Sukses', color: 'text-emerald-700 bg-emerald-50', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  failed: { label: 'Gagal', color: 'text-red-700 bg-red-50', icon: <XCircle className="h-3.5 w-3.5" /> },
  pending: { label: 'Pending', color: 'text-amber-700 bg-amber-50', icon: <Clock className="h-3.5 w-3.5" /> },
  expired: { label: 'Expired', color: 'text-gray-600 bg-gray-100', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
};

export default function AdminDashboardPage() {
  const [kycQueue, setKycQueue] = useState(mockKycQueue);

  function approveKyc(id: string) {
    setKycQueue((prev) => prev.filter((k) => k.id !== id));
  }

  function rejectKyc(id: string) {
    setKycQueue((prev) => prev.filter((k) => k.id !== id));
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">{s.label}</p>
                <p className="mt-1.5 text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
              </div>
              <div className={clsx('flex h-10 w-10 items-center justify-center rounded-xl', s.bg)}>
                <s.icon className={clsx('h-5 w-5', s.color)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Revenue Bulanan (All Merchants)</h2>
          <span className="text-xs text-gray-400">6 bulan terakhir</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={mockRevenueChartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevAdmin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#475569" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#475569" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatCurrency(v)}
              width={70}
            />
            <Tooltip
              formatter={(v: number) => [formatCurrency(v), 'Revenue']}
              labelStyle={{ fontWeight: 600, fontSize: 12 }}
              contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#475569"
              strokeWidth={2}
              fill="url(#colorRevAdmin)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* KYC Queue */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Antrian KYC
              {kycQueue.length > 0 && (
                <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-100 px-1.5 text-xs font-bold text-amber-700">
                  {kycQueue.length}
                </span>
              )}
            </h2>
            <a href="/kyc-review" className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
              Lihat semua <ChevronRight className="h-3 w-3" />
            </a>
          </div>

          {kycQueue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mb-2" />
              <p className="text-sm font-medium text-gray-600">Semua KYC sudah direview</p>
              <p className="text-xs text-gray-400">Tidak ada antrian saat ini</p>
            </div>
          ) : (
            <div className="space-y-3">
              {kycQueue.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.schoolName}</p>
                    <p className="text-xs text-gray-500 truncate">{item.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(item.submittedAt)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => approveKyc(item.id)}
                      className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
                    >
                      Setujui
                    </button>
                    <button
                      onClick={() => rejectKyc(item.id)}
                      className="rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Tolak
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Transaksi Terbaru</h2>
            <a href="/transactions" className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
              Lihat semua <ChevronRight className="h-3 w-3" />
            </a>
          </div>

          <div className="space-y-2">
            {mockAdminTransactions.map((tx) => {
              const statusCfg = txStatusConfig[tx.status];
              return (
                <div key={tx.id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-900 truncate">{tx.studentName}</p>
                    <p className="text-xs text-gray-400 truncate">{tx.merchantName} · {tx.method}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <p className="text-xs font-semibold text-gray-900">
                      Rp {tx.amount.toLocaleString('id-ID')}
                    </p>
                    <span className={clsx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', statusCfg.color)}>
                      {statusCfg.icon}
                      {statusCfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Ringkasan Sistem</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Fee Platform (MTD)', value: formatCurrency(mockAdminStats.systemFeesMtd), color: 'text-blue-600' },
            { label: 'Merchant Aktif', value: `${mockAdminStats.activeMerchants}/${mockAdminStats.totalMerchants}`, color: 'text-emerald-600' },
            { label: 'Transaksi Gagal (Hari Ini)', value: mockAdminStats.failedTransactionsToday, color: 'text-red-600' },
            { label: 'Pending KYC', value: mockAdminStats.pendingKyc, color: 'text-amber-600' },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-gray-50 p-3 text-center">
              <p className={clsx('text-xl font-bold', item.color)}>{item.value}</p>
              <p className="text-xs text-gray-500 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
