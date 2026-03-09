'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDateTime, formatPaymentMethod, formatWorkflow, shortenId } from '@/lib/utils/format';
import { mockTransactions } from '@/lib/mockData';
import { Search, Download, Filter } from 'lucide-react';

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

const workflowOptions = [
  { value: '', label: 'Semua Workflow' },
  { value: 'provider_to_platform', label: 'Via Platform (A)' },
  { value: 'platform_direct', label: 'Direct (B)' },
  { value: 'bank_direct', label: 'H2H Bank (C)' },
];

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [workflowFilter, setWorkflowFilter] = useState('');

  const filtered = mockTransactions.filter((txn) => {
    const matchSearch =
      !search ||
      txn.studentName.toLowerCase().includes(search.toLowerCase()) ||
      txn.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || txn.status === statusFilter;
    const matchMethod = !methodFilter || txn.method === methodFilter;
    const matchWorkflow = !workflowFilter || txn.workflow === workflowFilter;
    return matchSearch && matchStatus && matchMethod && matchWorkflow;
  });

  return (
    <DashboardLayout
      title="Transaksi"
      subtitle="Daftar semua transaksi pembayaran"
    >
      {/* Filter Bar */}
      <Card className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              placeholder="Cari nama siswa atau ID transaksi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="min-w-[150px]"
            />
            <Select
              options={methodOptions}
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="min-w-[160px]"
            />
            <Select
              options={workflowOptions}
              value={workflowFilter}
              onChange={(e) => setWorkflowFilter(e.target.value)}
              className="min-w-[160px]"
            />
            <Button variant="secondary" size="md">
              <Filter className="h-4 w-4" />
              Filter Tanggal
            </Button>
            <Button variant="secondary" size="md">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary chips */}
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
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">ID Transaksi</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Siswa</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Deskripsi</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Metode</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Workflow</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Jumlah</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Fee</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Net</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center text-gray-400">
                    Tidak ada transaksi yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filtered.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-gray-500">{shortenId(txn.id)}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">{txn.studentName}</td>
                    <td className="px-5 py-3 text-gray-500 max-w-[200px] truncate">{txn.description}</td>
                    <td className="px-5 py-3 text-gray-600">{formatPaymentMethod(txn.method)}</td>
                    <td className="px-5 py-3">
                      <WorkflowBadge workflow={txn.workflow} />
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-gray-900">{formatCurrency(txn.amount)}</td>
                    <td className="px-5 py-3 text-right text-gray-500">
                      {txn.fee > 0 ? formatCurrency(txn.fee) : <span className="text-emerald-500 text-xs">Gratis</span>}
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-gray-900">{formatCurrency(txn.netAmount)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={txn.status as any} />
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDateTime(txn.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
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

function WorkflowBadge({ workflow }: { workflow: string }) {
  const map: Record<string, { label: string; variant: 'info' | 'success' | 'neutral' }> = {
    provider_to_platform: { label: 'A - Platform', variant: 'info' },
    platform_direct: { label: 'B - Direct', variant: 'success' },
    bank_direct: { label: 'C - H2H', variant: 'neutral' },
  };
  const cfg = map[workflow] ?? { label: workflow, variant: 'neutral' as const };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
