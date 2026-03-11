'use client';

import { useState, useMemo } from 'react';
import { Search, CheckCircle2, XCircle, Clock, AlertTriangle, Download } from 'lucide-react';
import { clsx } from 'clsx';
import { mockAdminTransactions } from '@/lib/mockData';
import type { AdminTransaction } from '@/lib/mockData';

const PAGE_SIZE = 10;
type StatusFilter = 'all' | AdminTransaction['status'];

const statusConfig: Record<AdminTransaction['status'], { label: string; color: string; icon: React.ReactNode }> = {
  success: { label: 'Sukses',  color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: <CheckCircle2 className="h-3 w-3" /> },
  failed:  { label: 'Gagal',   color: 'text-red-700 bg-red-50 border-red-200',             icon: <XCircle className="h-3 w-3" /> },
  pending: { label: 'Pending', color: 'text-amber-700 bg-amber-50 border-amber-200',       icon: <Clock className="h-3 w-3" /> },
  expired: { label: 'Expired', color: 'text-gray-600 bg-gray-50 border-gray-200',          icon: <AlertTriangle className="h-3 w-3" /> },
};

function formatCurrency(n: number) { return `Rp ${n.toLocaleString('id-ID')}`; }
function formatDate(iso: string) {
  return new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

const allTransactions: AdminTransaction[] = [
  ...mockAdminTransactions,
  { id: 'txn_a007', merchantName: 'SDN Contoh 01',  studentName: 'Gilang Ramadhan', amount: 850_000,   fee: 5_000, status: 'success', method: 'QRIS',           createdAt: '2026-02-16T07:50:00Z' },
  { id: 'txn_a008', merchantName: 'SMPN Maju Jaya', studentName: 'Hesti Wulandari', amount: 1_350_000, fee: 9_000, status: 'failed',  method: 'Virtual Account', createdAt: '2026-02-16T07:30:00Z' },
  { id: 'txn_a009', merchantName: 'MTs Al-Hikmah',  studentName: 'Irfan Setiawan',  amount: 700_000,   fee: 5_000, status: 'success', method: 'E-Wallet',        createdAt: '2026-02-16T07:10:00Z' },
  { id: 'txn_a010', merchantName: 'SDN Contoh 01',  studentName: 'Joko Susilo',     amount: 950_000,   fee: 6_500, status: 'expired', method: 'Transfer Bank',   createdAt: '2026-02-16T06:55:00Z' },
  { id: 'txn_a011', merchantName: 'SMPN Maju Jaya', studentName: 'Kartika Sari',    amount: 1_100_000, fee: 7_500, status: 'success', method: 'QRIS',             createdAt: '2026-02-16T06:30:00Z' },
  { id: 'txn_a012', merchantName: 'MTs Al-Hikmah',  studentName: 'Lina Marlina',    amount: 650_000,   fee: 5_000, status: 'pending', method: 'Virtual Account', createdAt: '2026-02-16T06:10:00Z' },
];

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allTransactions.filter((tx) => {
      const matchSearch = !q || tx.studentName.toLowerCase().includes(q) || tx.merchantName.toLowerCase().includes(q) || tx.id.includes(q);
      const matchStatus = statusFilter === 'all' || tx.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const summary = useMemo(() => ({
    total: allTransactions.length,
    success: allTransactions.filter((t) => t.status === 'success').length,
    failed: allTransactions.filter((t) => t.status === 'failed').length,
    revenue: allTransactions.filter((t) => t.status === 'success').reduce((s, t) => s + t.amount, 0),
  }), []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaksi</h1>
          <p className="text-sm text-gray-500 mt-1">Semua transaksi lintas merchant</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Transaksi', value: summary.total,                   color: 'text-gray-900' },
          { label: 'Berhasil',        value: summary.success,                 color: 'text-emerald-600' },
          { label: 'Gagal',           value: summary.failed,                  color: 'text-red-600' },
          { label: 'Total Revenue',   value: formatCurrency(summary.revenue), color: 'text-blue-600' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <p className={clsx('text-xl font-bold', s.color)}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama siswa, merchant, atau ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'success', 'pending', 'failed', 'expired'] as StatusFilter[]).map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={clsx('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                statusFilter === s ? 'bg-blue-600 text-white' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50')}>
              {s === 'all' ? 'Semua' : statusConfig[s as AdminTransaction['status']].label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['ID', 'Merchant', 'Siswa', 'Metode', 'Jumlah', 'Fee', 'Status', 'Waktu'].map((h, i) => (
                <th key={h} className={clsx('px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide',
                  i >= 4 && i <= 5 ? 'text-right' : 'text-left')}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.length === 0 ? (
              <tr><td colSpan={8} className="py-10 text-center text-sm text-gray-400">Tidak ada transaksi yang sesuai filter.</td></tr>
            ) : paginated.map((tx) => {
              const sc = statusConfig[tx.status];
              return (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">...{tx.id.slice(-8)}</td>
                  <td className="px-4 py-3 text-gray-700 font-medium">{tx.merchantName}</td>
                  <td className="px-4 py-3 text-gray-700">{tx.studentName}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{tx.method}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(tx.amount)}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{formatCurrency(tx.fee)}</td>
                  <td className="px-4 py-3">
                    <span className={clsx('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium', sc.color)}>
                      {sc.icon}{sc.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDate(tx.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Menampilkan {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filtered.length)} dari {filtered.length}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p-1))} disabled={page===1}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs disabled:opacity-40 hover:bg-gray-50">← Sebelumnya</button>
            {Array.from({ length: totalPages }, (_, i) => i+1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={clsx('rounded-lg px-3 py-1.5 text-xs', p===page ? 'bg-blue-600 text-white' : 'border border-gray-200 hover:bg-gray-50')}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p+1))} disabled={page===totalPages}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs disabled:opacity-40 hover:bg-gray-50">Berikutnya →</button>
          </div>
        </div>
      )}
    </div>
  );
}
