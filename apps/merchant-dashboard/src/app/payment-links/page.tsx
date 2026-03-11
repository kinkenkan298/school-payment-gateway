'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Input } from '@/components/ui/Input';
import {
  Copy, CheckCircle2, Search, PlusCircle, Clock, Trash2, QrCode, Link2,
} from 'lucide-react';
import { clsx } from 'clsx';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';

type LinkStatus = 'active' | 'paid' | 'expired' | 'cancelled';

interface PaymentLink {
  id: string;
  studentName: string;
  studentClass: string;
  category: string;
  description: string;
  amount: number;
  method: string;
  status: LinkStatus;
  expiresAt: string;
  createdAt: string;
  paidAt?: string;
  vaNumber?: string;
}

const mockPaymentLinks: PaymentLink[] = [
  { id: 'PAY-A1B2C3D4', studentName: 'Ahmad Fauzi',   studentClass: '7A', category: 'SPP Bulanan',    description: 'SPP Maret 2026',      amount: 850_000,   method: 'virtual_account', status: 'active',    vaNumber: '8881023456789012', expiresAt: '2026-03-11T09:00:00Z', createdAt: '2026-03-10T09:00:00Z' },
  { id: 'PAY-E5F6G7H8', studentName: 'Siti Rahayu',   studentClass: '8B', category: 'Seragam',         description: 'Pembelian Seragam',   amount: 350_000,   method: 'qris',            status: 'paid',      expiresAt: '2026-03-09T14:00:00Z', createdAt: '2026-03-08T14:00:00Z', paidAt: '2026-03-08T15:30:00Z' },
  { id: 'PAY-I9J0K1L2', studentName: 'Budi Santoso',  studentClass: '9C', category: 'Buku & LKS',      description: 'Buku Semester 2',     amount: 180_000,   method: 'virtual_account', status: 'expired',   vaNumber: '8881034567890123', expiresAt: '2026-03-05T08:00:00Z', createdAt: '2026-03-04T08:00:00Z' },
  { id: 'PAY-M3N4O5P6', studentName: 'Dewi Lestari',  studentClass: '7A', category: 'Ekstrakurikuler', description: 'Biaya Ekskul Futsal', amount: 120_000,   method: 'e_wallet',        status: 'active',    expiresAt: '2026-03-12T10:00:00Z', createdAt: '2026-03-10T10:00:00Z' },
  { id: 'PAY-Q7R8S9T0', studentName: 'Eko Prasetyo',  studentClass: '8A', category: 'SPP Bulanan',    description: 'SPP Maret 2026',      amount: 850_000,   method: 'qris',            status: 'cancelled', expiresAt: '2026-03-09T11:00:00Z', createdAt: '2026-03-09T11:00:00Z' },
  { id: 'PAY-U1V2W3X4', studentName: 'Fitri Handayani', studentClass: '9B', category: 'Ujian',         description: 'Biaya Ujian Akhir',  amount: 200_000,   method: 'virtual_account', status: 'paid',      vaNumber: '8881056789012345', expiresAt: '2026-03-08T09:00:00Z', createdAt: '2026-03-07T09:00:00Z', paidAt: '2026-03-07T11:45:00Z' },
];

const statusConfig: Record<LinkStatus, { label: string; color: string }> = {
  active:    { label: 'Aktif',     color: 'text-blue-700 bg-blue-50' },
  paid:      { label: 'Lunas',     color: 'text-emerald-700 bg-emerald-50' },
  expired:   { label: 'Kadaluarsa', color: 'text-gray-500 bg-gray-100' },
  cancelled: { label: 'Dibatalkan', color: 'text-red-600 bg-red-50' },
};

const methodLabel: Record<string, string> = {
  virtual_account: 'Virtual Account',
  qris:            'QRIS',
  e_wallet:        'E-Wallet',
  transfer_bank:   'Transfer Bank',
};

function timeRemaining(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 'Kadaluarsa';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h >= 24) return `${Math.floor(h / 24)} hari lagi`;
  if (h > 0) return `${h}j ${m}m lagi`;
  return `${m} menit lagi`;
}

export default function PaymentLinksPage() {
  const [links, setLinks] = useState<PaymentLink[]>(mockPaymentLinks);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LinkStatus | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);

  const filtered = links.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.studentName.toLowerCase().includes(q) || l.id.toLowerCase().includes(q) || l.description.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    active: links.filter((l) => l.status === 'active').length,
    paid:   links.filter((l) => l.status === 'paid').length,
    total:  formatCurrency(links.filter((l) => l.status === 'paid').reduce((s, l) => s + l.amount, 0)),
  };

  function handleCopy(id: string, value: string) {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleCancel(id: string) {
    setLinks((prev) => prev.map((l) => l.id === id ? { ...l, status: 'cancelled' } : l));
    setCancelId(null);
  }

  return (
    <DashboardLayout title="Payment Links" subtitle="Kelola tagihan yang sudah dibuat">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Tagihan Aktif',  value: stats.active, color: 'text-blue-600' },
          { label: 'Sudah Dibayar', value: stats.paid,   color: 'text-emerald-600' },
          { label: 'Total Terkumpul', value: stats.total,  color: 'text-gray-900' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <p className={clsx('text-xl font-bold', s.color)}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-5">
        <div className="flex-1">
          <Input
            placeholder="Cari nama siswa, ID, atau deskripsi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'active', 'paid', 'expired', 'cancelled'] as (LinkStatus | 'all')[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={clsx('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                statusFilter === s ? 'bg-blue-600 text-white' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50')}
            >
              {s === 'all' ? 'Semua' : statusConfig[s].label}
            </button>
          ))}
          <Link href="/create-payment">
            <Button variant="primary" size="sm">
              <PlusCircle className="h-4 w-4" /> Buat Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* Cancel confirm */}
      {cancelId && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 flex items-center justify-between gap-4">
          <p className="text-sm text-red-800">
            Batalkan tagihan <span className="font-mono font-semibold">{cancelId}</span>? Siswa tidak dapat membayar setelah dibatalkan.
          </p>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => handleCancel(cancelId)} className="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-700">
              Ya, Batalkan
            </button>
            <button onClick={() => setCancelId(null)} className="rounded-lg border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-white">
              Batal
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Link2 className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-500">Belum ada payment link</p>
            <p className="text-xs text-gray-400 mt-1">Buat tagihan baru untuk mulai menerima pembayaran</p>
            <Link href="/create-payment" className="mt-4">
              <Button variant="primary" size="sm">
                <PlusCircle className="h-4 w-4" /> Buat Tagihan
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((link) => {
            const sc = statusConfig[link.status];
            const isActive = link.status === 'active';
            return (
              <Card key={link.id} className={clsx(!isActive && 'opacity-70')}>
                <div className="flex items-start justify-between gap-4">
                  {/* Left info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={clsx('shrink-0 flex h-10 w-10 items-center justify-center rounded-xl',
                      link.method === 'qris' ? 'bg-emerald-100' : 'bg-blue-100'
                    )}>
                      {link.method === 'qris'
                        ? <QrCode className="h-5 w-5 text-emerald-600" />
                        : <Link2 className="h-5 w-5 text-blue-600" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900">{link.studentName}</p>
                        {link.studentClass && (
                          <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{link.studentClass}</span>
                        )}
                        <span className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', sc.color)}>
                          {sc.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{link.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                        <span className="font-mono">{link.id}</span>
                        <span>·</span>
                        <span>{methodLabel[link.method] ?? link.method}</span>
                        <span>·</span>
                        {link.status === 'active' && (
                          <span className="flex items-center gap-1 text-amber-600">
                            <Clock className="h-3 w-3" />
                            {timeRemaining(link.expiresAt)}
                          </span>
                        )}
                        {link.status === 'paid' && link.paidAt && (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <CheckCircle2 className="h-3 w-3" />
                            Dibayar {formatDateTime(link.paidAt)}
                          </span>
                        )}
                        {(link.status === 'expired' || link.status === 'cancelled') && (
                          <span>{formatDateTime(link.expiresAt)}</span>
                        )}
                      </div>
                      {/* VA number */}
                      {link.vaNumber && link.status === 'active' && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-gray-500">VA:</span>
                          <span className="font-mono text-xs text-gray-700">{link.vaNumber}</span>
                          <button
                            onClick={() => handleCopy(link.id + '_va', link.vaNumber!)}
                            className="flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 hover:bg-gray-200"
                          >
                            {copiedId === link.id + '_va' ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                            {copiedId === link.id + '_va' ? 'Tersalin' : 'Salin'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: amount + actions */}
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(link.amount)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Dibuat {formatDateTime(link.createdAt)}</p>
                    {isActive && (
                      <div className="flex items-center gap-2 mt-2 justify-end">
                        <button
                          onClick={() => handleCopy(link.id, link.id)}
                          className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          {copiedId === link.id ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                          {copiedId === link.id ? 'Tersalin' : 'Salin ID'}
                        </button>
                        <button
                          onClick={() => setCancelId(link.id)}
                          className="flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Batalkan
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
