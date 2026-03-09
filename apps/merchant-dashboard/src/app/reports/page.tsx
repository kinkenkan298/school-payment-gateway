'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RevenueBarChart } from '@/components/charts/RevenueBarChart';
import { MethodBreakdownChart } from '@/components/charts/MethodBreakdownChart';
import {
  mockReportSummary,
  mockDailyRevenue,
  mockWeeklyRevenue,
  mockMonthlyRevenue,
  mockStatusBreakdown,
  mockMethodBreakdown,
  mockTopTransactions,
} from '@/lib/mockData';
import { formatCurrency, formatDateTime, formatPaymentMethod, shortenId } from '@/lib/utils/format';
import { exportToCsv } from '@/lib/utils/exportCsv';
import {
  TrendingUp,
  ArrowLeftRight,
  CheckCircle,
  XCircle,
  Download,
  FileText,
  BarChart3,
  Calendar,
} from 'lucide-react';

type Period = 'daily' | 'weekly' | 'monthly';

const periodLabels: Record<Period, string> = {
  daily: 'Harian (30 hari)',
  weekly: 'Mingguan (8 minggu)',
  monthly: 'Bulanan (6 bulan)',
};

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('monthly');
  const [dateFrom, setDateFrom] = useState('2026-02-01');
  const [dateTo, setDateTo] = useState('2026-02-28');

  const chartData = useMemo(() => {
    if (period === 'daily') return mockDailyRevenue;
    if (period === 'weekly') return mockWeeklyRevenue;
    return mockMonthlyRevenue;
  }, [period]);

  function handleExportRevenueCsv() {
    exportToCsv(
      chartData.map((d) => ({
        periode: (d as any).date ?? (d as any).period,
        revenue: (d as any).revenue,
        transactions: (d as any).transactions ?? ((d as any).success ?? 0) + ((d as any).failed ?? 0),
        berhasil: (d as any).success ?? '-',
        gagal: (d as any).failed ?? '-',
      })),
      `laporan_revenue_${period}`,
      [
        { key: 'periode', header: 'Periode' },
        { key: 'revenue', header: 'Revenue (IDR)' },
        { key: 'transactions', header: 'Total Transaksi' },
        { key: 'berhasil', header: 'Berhasil' },
        { key: 'gagal', header: 'Gagal' },
      ]
    );
  }

  function handleExportTransactionCsv() {
    exportToCsv(
      mockTopTransactions.map((t) => ({
        id: t.id,
        nama_siswa: t.studentName,
        deskripsi: t.description,
        metode: formatPaymentMethod(t.method),
        jumlah: t.amount,
        status: t.status,
        waktu: formatDateTime(t.createdAt),
      })),
      'laporan_transaksi',
      [
        { key: 'id', header: 'ID Transaksi' },
        { key: 'nama_siswa', header: 'Nama Siswa' },
        { key: 'deskripsi', header: 'Deskripsi' },
        { key: 'metode', header: 'Metode' },
        { key: 'jumlah', header: 'Jumlah (IDR)' },
        { key: 'status', header: 'Status' },
        { key: 'waktu', header: 'Waktu' },
      ]
    );
  }

  return (
    <DashboardLayout
      title="Laporan & Analitik"
      subtitle="Ringkasan keuangan dan analitik bisnis sekolah"
    >
      {/* Date range filter */}
      <Card className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Rentang Tanggal:</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-400 text-sm">s/d</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button variant="primary" size="sm">Terapkan</Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleExportRevenueCsv}>
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
            <Button variant="secondary" size="sm">
              <FileText className="h-3.5 w-3.5" />
              Export PDF
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(mockReportSummary.totalRevenue)}
          change={mockReportSummary.revenueGrowth}
          changeLabel="vs bulan lalu"
          icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Total Transaksi"
          value={mockReportSummary.totalTransactions.toLocaleString('id-ID')}
          change={mockReportSummary.transactionGrowth}
          changeLabel="vs bulan lalu"
          icon={<ArrowLeftRight className="h-5 w-5 text-purple-600" />}
          iconBg="bg-purple-50"
        />
        <StatCard
          title="Transaksi Berhasil"
          value={mockReportSummary.successCount.toLocaleString('id-ID')}
          change={mockReportSummary.successRate}
          changeLabel="success rate"
          icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Transaksi Gagal"
          value={mockReportSummary.failedCount.toLocaleString('id-ID')}
          change={-mockReportSummary.failureRate}
          changeLabel="failure rate"
          icon={<XCircle className="h-5 w-5 text-red-500" />}
          iconBg="bg-red-50"
        />
      </div>

      {/* Revenue Chart */}
      <Card className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Grafik Revenue</h3>
            <p className="text-sm text-gray-500 mt-0.5">Revenue dan status transaksi per periode</p>
          </div>
          {/* Period selector */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(Object.keys(periodLabels) as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  period === p
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p === 'daily' ? 'Harian' : p === 'weekly' ? 'Mingguan' : 'Bulanan'}
              </button>
            ))}
          </div>
        </div>
        <RevenueBarChart data={chartData} showSuccessFailed={period !== 'daily'} />

        {/* Summary row di bawah chart */}
        <div className="mt-4 grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100 pt-4">
          <div className="px-4 text-center">
            <p className="text-xs text-gray-500">Total Revenue</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">
              {formatCurrency(chartData.reduce((s, d) => s + d.revenue, 0))}
            </p>
          </div>
          <div className="px-4 text-center">
            <p className="text-xs text-gray-500">Total Transaksi</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">
              {chartData
                .reduce((s, d: any) => s + (d.transactions ?? (d.success ?? 0) + (d.failed ?? 0)), 0)
                .toLocaleString('id-ID')}
            </p>
          </div>
          <div className="px-4 text-center">
            <p className="text-xs text-gray-500">Rata-rata / Periode</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">
              {formatCurrency(Math.round(chartData.reduce((s, d) => s + d.revenue, 0) / chartData.length))}
            </p>
          </div>
        </div>
      </Card>

      {/* Bottom charts row */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 mb-6">
        {/* Metode pembayaran */}
        <Card>
          <CardHeader
            title="Breakdown Metode Pembayaran"
            subtitle="Persentase volume per metode"
          />
          <MethodBreakdownChart data={mockMethodBreakdown} />
          <div className="mt-3 space-y-2">
            {mockMethodBreakdown.map((m) => (
              <div key={m.method} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="text-gray-700">{m.method}</span>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <span className="text-gray-500 text-xs">{m.count} txn</span>
                  <span className="font-medium text-gray-900 w-28 text-right">{formatCurrency(m.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Status breakdown */}
        <Card>
          <CardHeader
            title="Breakdown Status Transaksi"
            subtitle="Distribusi berhasil, gagal, dan menunggu"
          />
          <div className="space-y-4 mt-2">
            {mockStatusBreakdown.map((s) => {
              const total = mockStatusBreakdown.reduce((sum, x) => sum + x.count, 0);
              const pct = ((s.count / total) * 100).toFixed(1);
              return (
                <div key={s.status}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-sm text-gray-700">{s.status}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-500">{s.count} transaksi</span>
                      <span className="font-semibold text-gray-900 w-10 text-right">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: s.color }}
                    />
                  </div>
                  {s.amount > 0 && (
                    <p className="text-xs text-gray-400 mt-1">{formatCurrency(s.amount)}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Conversion rate */}
          <div className="mt-6 rounded-lg bg-emerald-50 border border-emerald-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-600 font-medium">Conversion Rate</p>
                <p className="text-2xl font-bold text-emerald-700 mt-0.5">{mockReportSummary.successRate}%</p>
                <p className="text-xs text-emerald-500 mt-0.5">dari total transaksi</p>
              </div>
              <BarChart3 className="h-10 w-10 text-emerald-300" />
            </div>
          </div>
        </Card>
      </div>

      {/* Fee Summary */}
      <Card className="mb-6">
        <CardHeader title="Ringkasan Biaya & Pendapatan Bersih" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Gross Revenue</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(mockReportSummary.totalRevenue)}</p>
          </div>
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-xs text-red-500">Total Fee Terpotong</p>
            <p className="text-xl font-bold text-red-700 mt-1">− {formatCurrency(mockReportSummary.totalFees)}</p>
            <p className="text-xs text-red-400 mt-0.5">biaya platform & provider</p>
          </div>
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
            <p className="text-xs text-emerald-600">Net Revenue (Diterima)</p>
            <p className="text-xl font-bold text-emerald-700 mt-1">{formatCurrency(mockReportSummary.netRevenue)}</p>
            <p className="text-xs text-emerald-400 mt-0.5">setelah semua potongan</p>
          </div>
        </div>
      </Card>

      {/* Top Transactions */}
      <Card padding={false}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Transaksi Terbesar</h3>
            <p className="text-sm text-gray-500 mt-0.5">5 transaksi dengan nilai tertinggi pada periode ini</p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleExportTransactionCsv}>
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">ID</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Siswa</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Deskripsi</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Metode</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Jumlah</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockTopTransactions.map((txn, idx) => (
                <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                        {idx + 1}
                      </span>
                      <span className="font-mono text-xs text-gray-500">{shortenId(txn.id)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 font-medium text-gray-900">{txn.studentName}</td>
                  <td className="px-6 py-3 text-gray-500 max-w-[200px] truncate">{txn.description}</td>
                  <td className="px-6 py-3 text-gray-600">{formatPaymentMethod(txn.method)}</td>
                  <td className="px-6 py-3 text-right font-semibold text-gray-900">{formatCurrency(txn.amount)}</td>
                  <td className="px-6 py-3">
                    <StatusBadge status={txn.status as any} />
                  </td>
                  <td className="px-6 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDateTime(txn.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
