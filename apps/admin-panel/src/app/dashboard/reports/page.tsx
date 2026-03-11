'use client';

import { useState } from 'react';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { mockRevenueChartData, mockAdminStats } from '@/lib/mockData';

type Period = 'monthly' | 'weekly';

const weeklyData = [
  { label: 'W1 Jan', revenue: 480_000_000, transactions: 520 },
  { label: 'W2 Jan', revenue: 560_000_000, transactions: 610 },
  { label: 'W3 Jan', revenue: 495_000_000, transactions: 540 },
  { label: 'W4 Jan', revenue: 565_000_000, transactions: 630 },
  { label: 'W1 Feb', revenue: 610_000_000, transactions: 680 },
  { label: 'W2 Feb', revenue: 715_000_000, transactions: 790 },
];

const methodBreakdown = [
  { method: 'Virtual Account', amount: 1_190_000_000, pct: 42, color: '#3b82f6' },
  { method: 'QRIS',            amount: 794_500_000,   pct: 28, color: '#10b981' },
  { method: 'Transfer Bank',   amount: 511_000_000,   pct: 18, color: '#f59e0b' },
  { method: 'E-Wallet',        amount: 341_000_000,   pct: 12, color: '#8b5cf6' },
];

const merchantRevenue = [
  { name: 'SDN Contoh 01',    revenue: 48_750_000 },
  { name: 'SMPN Maju Jaya',   revenue: 32_400_000 },
  { name: 'MTs Al-Hikmah',    revenue: 19_200_000 },
  { name: 'SD Islam Terpadu', revenue: 3_200_000 },
  { name: 'Lainnya',          revenue: 7_950_000 },
];

function formatCurrency(n: number) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(0)}jt`;
  return `Rp ${n.toLocaleString('id-ID')}`;
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('monthly');
  const chartData = period === 'monthly'
    ? mockRevenueChartData.map((d) => ({ label: d.month, revenue: d.revenue, transactions: d.merchants * 50 }))
    : weeklyData;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan</h1>
          <p className="text-sm text-gray-500 mt-1">Revenue dan analitik sistem</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Revenue MTD',     value: formatCurrency(mockAdminStats.totalRevenueMtd), change: '+18%', up: true },
          { label: 'Fee Platform MTD', value: formatCurrency(mockAdminStats.systemFeesMtd), change: '+18%', up: true },
          { label: 'Tx Hari Ini',     value: mockAdminStats.totalTransactionsToday,          change: '+12%', up: true },
          { label: 'Tx Gagal Hari Ini', value: mockAdminStats.failedTransactionsToday,        change: '-3%',  up: false },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">{k.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{k.value}</p>
            <p className={clsx('text-xs font-medium mt-1 flex items-center gap-0.5', k.up ? 'text-emerald-600' : 'text-red-500')}>
              {k.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {k.change} vs bulan lalu
            </p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Tren Revenue</h2>
          <div className="flex gap-1.5">
            {(['monthly', 'weekly'] as Period[]).map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={clsx('rounded-lg px-3 py-1 text-xs font-medium transition-colors',
                  period === p ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50')}>
                {p === 'monthly' ? 'Bulanan' : 'Mingguan'}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
              tickFormatter={(v) => formatCurrency(v)} width={72} />
            <Tooltip formatter={(v: number) => [formatCurrency(v), 'Revenue']}
              contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Metode Pembayaran */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Breakdown Metode Pembayaran</h2>
          <div className="space-y-3">
            {methodBreakdown.map((m) => (
              <div key={m.method}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">{m.method}</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(m.amount)}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${m.pct}%`, backgroundColor: m.color }} />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{m.pct}% dari total</p>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue per Merchant */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Revenue per Merchant</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={merchantRevenue} layout="vertical" margin={{ left: 8, right: 16 }}>
              <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => formatCurrency(v)} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} width={120} />
              <Tooltip formatter={(v: number) => [formatCurrency(v), 'Revenue']}
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                {merchantRevenue.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? '#3b82f6' : i === 1 ? '#10b981' : i === 2 ? '#f59e0b' : '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
