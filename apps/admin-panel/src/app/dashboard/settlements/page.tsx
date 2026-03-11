'use client';

import { useState } from 'react';
import { CheckCircle2, Clock, XCircle, Loader2, ChevronRight, Landmark } from 'lucide-react';
import { clsx } from 'clsx';

type SettlementStatus = 'completed' | 'processing' | 'pending' | 'failed';

interface Settlement {
  id: string;
  merchantName: string;
  period: string;
  totalTx: number;
  grossAmount: number;
  fee: number;
  netAmount: number;
  bankName: string;
  accountNumber: string;
  status: SettlementStatus;
  scheduledAt: string;
  processedAt: string | null;
}

const mockSettlements: Settlement[] = [
  { id: 'stl_001', merchantName: 'SDN Contoh 01',  period: '1–15 Feb 2026', totalTx: 624, grossAmount: 24_250_000, fee: 1_212_500, netAmount: 23_037_500, bankName: 'BRI',  accountNumber: '****3421', status: 'completed',  scheduledAt: '2026-02-16T08:00:00Z', processedAt: '2026-02-16T08:02:14Z' },
  { id: 'stl_002', merchantName: 'SMPN Maju Jaya', period: '1–15 Feb 2026', totalTx: 412, grossAmount: 15_880_000, fee: 794_000,   netAmount: 15_086_000, bankName: 'BCA',  accountNumber: '****8812', status: 'completed',  scheduledAt: '2026-02-16T08:00:00Z', processedAt: '2026-02-16T08:03:45Z' },
  { id: 'stl_003', merchantName: 'MTs Al-Hikmah',  period: '1–15 Feb 2026', totalTx: 198, grossAmount: 7_430_000,  fee: 371_500,   netAmount: 7_058_500,  bankName: 'Mandiri', accountNumber: '****5590', status: 'processing', scheduledAt: '2026-02-16T08:00:00Z', processedAt: null },
  { id: 'stl_004', merchantName: 'SDN Contoh 01',  period: '16–28 Jan 2026', totalTx: 580, grossAmount: 22_100_000, fee: 1_105_000, netAmount: 20_995_000, bankName: 'BRI',  accountNumber: '****3421', status: 'completed',  scheduledAt: '2026-02-01T08:00:00Z', processedAt: '2026-02-01T08:01:55Z' },
  { id: 'stl_005', merchantName: 'SMPN Maju Jaya', period: '16–28 Jan 2026', totalTx: 390, grossAmount: 14_520_000, fee: 726_000,   netAmount: 13_794_000, bankName: 'BCA',  accountNumber: '****8812', status: 'completed',  scheduledAt: '2026-02-01T08:00:00Z', processedAt: '2026-02-01T08:04:11Z' },
  { id: 'stl_006', merchantName: 'SD Islam Terpadu', period: '1–15 Feb 2026', totalTx: 44, grossAmount: 1_650_000, fee: 82_500,    netAmount: 1_567_500,  bankName: 'BSI',  accountNumber: '****1122', status: 'failed',     scheduledAt: '2026-02-16T08:00:00Z', processedAt: null },
  { id: 'stl_007', merchantName: 'MTs Al-Hikmah',  period: '16–28 Jan 2026', totalTx: 155, grossAmount: 5_820_000,  fee: 291_000,   netAmount: 5_529_000,  bankName: 'Mandiri', accountNumber: '****5590', status: 'pending',   scheduledAt: '2026-02-16T10:00:00Z', processedAt: null },
];

const statusConfig: Record<SettlementStatus, { label: string; color: string; icon: React.ReactNode }> = {
  completed:  { label: 'Selesai',    color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: <CheckCircle2 className="h-3 w-3" /> },
  processing: { label: 'Diproses',   color: 'text-blue-700 bg-blue-50 border-blue-200',         icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  pending:    { label: 'Terjadwal',  color: 'text-amber-700 bg-amber-50 border-amber-200',      icon: <Clock className="h-3 w-3" /> },
  failed:     { label: 'Gagal',      color: 'text-red-700 bg-red-50 border-red-200',            icon: <XCircle className="h-3 w-3" /> },
};

function formatCurrency(n: number) { return `Rp ${n.toLocaleString('id-ID')}`; }
function formatDate(iso: string) {
  return new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function SettlementsPage() {
  const [statusFilter, setStatusFilter] = useState<SettlementStatus | 'all'>('all');

  const filtered = mockSettlements.filter((s) => statusFilter === 'all' || s.status === statusFilter);

  const summary = {
    totalSettled: mockSettlements.filter((s) => s.status === 'completed').reduce((a, s) => a + s.netAmount, 0),
    processing: mockSettlements.filter((s) => s.status === 'processing').length,
    pending: mockSettlements.filter((s) => s.status === 'pending').length,
    failed: mockSettlements.filter((s) => s.status === 'failed').length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settlement</h1>
        <p className="text-sm text-gray-500 mt-1">Jadwal dan riwayat pencairan dana merchant</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Dicairkan',  value: formatCurrency(summary.totalSettled), color: 'text-emerald-600' },
          { label: 'Sedang Diproses', value: summary.processing, color: 'text-blue-600' },
          { label: 'Terjadwal',       value: summary.pending,    color: 'text-amber-600' },
          { label: 'Gagal',           value: summary.failed,     color: 'text-red-600' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <p className={clsx('text-xl font-bold', s.color)}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'completed', 'processing', 'pending', 'failed'] as (SettlementStatus | 'all')[]).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={clsx('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              statusFilter === s ? 'bg-blue-600 text-white' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50')}>
            {s === 'all' ? 'Semua' : statusConfig[s].label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Merchant</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Periode</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Tx</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Gross</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Fee</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Net</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Rekening</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Waktu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((s) => {
              const sc = statusConfig[s.status];
              return (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.merchantName}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{s.period}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{s.totalTx.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(s.grossAmount)}</td>
                  <td className="px-4 py-3 text-right text-red-600 text-xs">-{formatCurrency(s.fee)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(s.netAmount)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Landmark className="h-3 w-3 text-gray-400" />
                      {s.bankName} {s.accountNumber}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium', sc.color)}>
                      {sc.icon}{sc.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {s.processedAt ? formatDate(s.processedAt) : formatDate(s.scheduledAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
