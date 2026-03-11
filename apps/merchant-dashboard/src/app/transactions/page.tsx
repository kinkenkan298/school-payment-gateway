'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDateTime, formatPaymentMethod, shortenId } from '@/lib/utils/format';
import { mockTransactions } from '@/lib/mockData';
import { Search, Download, ChevronRight } from 'lucide-react';

const statusOptions = [
  { value: '', label: 'Semua Status' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'processing', label: 'Diproses' },
  { value: 'success', label: 'Berhasil' },
  { value: 'failed', label: 'Gagal' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

const methodOptions = [
  { value: '', label: 'Semua Metode' },
  { value: 'virtual_account', label: 'Virtual Account' },
  { value: 'qris', label: 'QRIS' },
  { value: 'bank_transfer', label: 'Transfer Bank' },
  { value: 'ewallet', label: 'E-Wallet' },
  { value: 'credit_card', label: 'Kartu Kredit' },
];

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');

  const filtered = mockTransactions.filter((txn) => {
    const matchSearch =
      !search ||
      txn.studentName.toLowerCase().includes(search.toLowerCase()) ||
      txn.id.toLowerCase().includes(search.toLowerCase()) ||
      txn.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || txn.status === statusFilter;
    const matchMethod = !methodFilter || txn.method === methodFilter;
    return matchSearch && matchStatus && matchMethod;
  });

  return (
    <DashboardLayout title="Transaksi" subtitle="Daftar semua transaksi pembayaran">
      {/* Filter Bar */}
      <Card className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              placeholder="Cari nama siswa, ID, atau deskripsi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="min-w-[140px]"
            />
            <Select
              options={methodOptions}
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="min-w-[150px]"
            />
            <Button variant="secondary" size="md">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Count */}
      <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <span>Menampilkan</span>
        <span className="font-medium text-gray-900">{filtered.length}</span>
        <span>dari {mockTransactions.length} transaksi</span>
      </div>

      {/* Table */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left border-b border-gray-200">
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">ID / Waktu</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Siswa</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Deskripsi</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Metode</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Jumlah</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    Tidak ada transaksi yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filtered.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs text-gray-500">{shortenId(txn.id)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(txn.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{txn.studentName}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate text-xs">{txn.description}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{formatPaymentMethod(txn.method)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(txn.amount)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={txn.status as any} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/transactions/${txn.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        Detail <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">Halaman 1 dari 1</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled>Sebelumnya</Button>
            <Button variant="secondary" size="sm" disabled>Selanjutnya</Button>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
}
