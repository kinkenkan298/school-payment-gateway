'use client';

import { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowLeft, CheckCircle2, XCircle, Clock, AlertTriangle,
  Copy, Building2, User, CreditCard, Hash, Calendar, DollarSign,
} from 'lucide-react';
import { clsx } from 'clsx';
import { mockAdminTransactions } from '@/lib/mockData';
import type { AdminTransaction } from '@/lib/mockData';

// Extended mock list (same as in the list page)
const allTransactions: AdminTransaction[] = [
  ...mockAdminTransactions,
  { id: 'txn_a007', merchantName: 'SDN Contoh 01',  studentName: 'Gilang Ramadhan', amount: 850_000,   fee: 5_000, status: 'success', method: 'QRIS',           createdAt: '2026-02-16T07:50:00Z' },
  { id: 'txn_a008', merchantName: 'SMPN Maju Jaya', studentName: 'Hesti Wulandari', amount: 1_350_000, fee: 9_000, status: 'failed',  method: 'Virtual Account', createdAt: '2026-02-16T07:30:00Z' },
  { id: 'txn_a009', merchantName: 'MTs Al-Hikmah',  studentName: 'Irfan Setiawan',  amount: 700_000,   fee: 5_000, status: 'success', method: 'E-Wallet',        createdAt: '2026-02-16T07:10:00Z' },
  { id: 'txn_a010', merchantName: 'SDN Contoh 01',  studentName: 'Joko Susilo',     amount: 950_000,   fee: 6_500, status: 'expired', method: 'Transfer Bank',   createdAt: '2026-02-16T06:55:00Z' },
  { id: 'txn_a011', merchantName: 'SMPN Maju Jaya', studentName: 'Kartika Sari',    amount: 1_100_000, fee: 7_500, status: 'success', method: 'QRIS',             createdAt: '2026-02-16T06:30:00Z' },
  { id: 'txn_a012', merchantName: 'MTs Al-Hikmah',  studentName: 'Lina Marlina',    amount: 650_000,   fee: 5_000, status: 'pending', method: 'Virtual Account', createdAt: '2026-02-16T06:10:00Z' },
];

function formatCurrency(n: number) { return `Rp ${n.toLocaleString('id-ID')}`; }
function formatDate(iso: string) {
  return new Date(iso).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'medium' });
}

const statusConfig: Record<AdminTransaction['status'], { label: string; color: string; iconEl: React.ReactNode; bg: string }> = {
  success: { label: 'Berhasil', color: 'text-emerald-700', iconEl: <CheckCircle2 className="h-7 w-7 text-emerald-600" />, bg: 'bg-emerald-100' },
  failed:  { label: 'Gagal',    color: 'text-red-700',     iconEl: <XCircle className="h-7 w-7 text-red-500" />,         bg: 'bg-red-100' },
  pending: { label: 'Pending',  color: 'text-amber-700',   iconEl: <Clock className="h-7 w-7 text-amber-500" />,         bg: 'bg-amber-100' },
  expired: { label: 'Expired',  color: 'text-gray-600',    iconEl: <AlertTriangle className="h-7 w-7 text-gray-500" />,  bg: 'bg-gray-100' },
};

const methodFeeDesc: Record<string, string> = {
  'Virtual Account': '0.5% dari nominal (min Rp 4.000)',
  'QRIS':            '0.7% dari nominal',
  'E-Wallet':        '1.5% dari nominal',
  'Transfer Bank':   'Rp 2.500/transaksi',
};

export default function AdminTransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const tx = allTransactions.find((t) => t.id === id);
  if (!tx) notFound();

  const [copied, setCopied] = useState(false);
  const sc = statusConfig[tx.status];

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Back */}
      <Link
        href="/dashboard/transactions"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Transaksi
      </Link>

      {/* Header status */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={clsx('flex h-14 w-14 items-center justify-center rounded-2xl shrink-0', sc.bg)}>
              {sc.iconEl}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(tx.amount)}</p>
              <p className="text-sm text-gray-500 mt-0.5">{tx.method} · {tx.merchantName}</p>
            </div>
          </div>
          <span className={clsx('inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold', sc.color,
            tx.status === 'success' ? 'border-emerald-200 bg-emerald-50' :
            tx.status === 'failed' ? 'border-red-200 bg-red-50' :
            tx.status === 'pending' ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-gray-50'
          )}>
            {sc.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Transaction info */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Informasi Transaksi</h2>
            <div className="space-y-4">
              {[
                {
                  icon: <Hash className="h-4 w-4 text-gray-400" />,
                  label: 'ID Transaksi',
                  content: (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-gray-900">{tx.id}</span>
                      <button
                        onClick={() => handleCopy(tx.id)}
                        className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500 hover:bg-gray-200 transition-colors"
                      >
                        {copied ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        {copied ? 'Tersalin' : 'Salin'}
                      </button>
                    </div>
                  ),
                },
                {
                  icon: <Building2 className="h-4 w-4 text-gray-400" />,
                  label: 'Merchant',
                  content: <span className="text-sm font-medium text-gray-900">{tx.merchantName}</span>,
                },
                {
                  icon: <User className="h-4 w-4 text-gray-400" />,
                  label: 'Nama Siswa',
                  content: <span className="text-sm text-gray-900">{tx.studentName}</span>,
                },
                {
                  icon: <CreditCard className="h-4 w-4 text-gray-400" />,
                  label: 'Metode Pembayaran',
                  content: (
                    <div>
                      <span className="text-sm text-gray-900">{tx.method}</span>
                      {methodFeeDesc[tx.method] && (
                        <p className="text-xs text-gray-400 mt-0.5">{methodFeeDesc[tx.method]}</p>
                      )}
                    </div>
                  ),
                },
                {
                  icon: <Calendar className="h-4 w-4 text-gray-400" />,
                  label: 'Waktu Transaksi',
                  content: <span className="text-sm text-gray-900">{formatDate(tx.createdAt)}</span>,
                },
              ].map((r) => (
                <div key={r.label} className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">{r.icon}</div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 mb-0.5">{r.label}</p>
                    {r.content}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status notes */}
          {tx.status === 'failed' && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-700 mb-1">Transaksi Gagal</p>
              <p className="text-xs text-red-600 leading-relaxed">
                Pembayaran tidak berhasil diproses. Kemungkinan penyebab: timeout, saldo tidak cukup, atau gangguan provider.
                Tidak ada dana yang ditagihkan kepada siswa.
              </p>
            </div>
          )}
          {tx.status === 'expired' && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-700 mb-1">Transaksi Kadaluarsa</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Batas waktu pembayaran telah terlewat. Merchant perlu membuat tagihan baru jika masih diperlukan.
              </p>
            </div>
          )}
          {tx.status === 'pending' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-700 mb-1">Menunggu Pembayaran</p>
              <p className="text-xs text-amber-600 leading-relaxed">
                Tagihan sudah diterbitkan namun belum dibayar. Akan otomatis kadaluarsa jika melewati batas waktu.
              </p>
            </div>
          )}
        </div>

        {/* Right: fee & actions */}
        <div className="space-y-5">
          {/* Fee breakdown */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Rincian Biaya</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Nominal</span>
                <span className="font-medium text-gray-900">{formatCurrency(tx.amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Fee Platform</span>
                <span className="text-red-600 font-medium">− {formatCurrency(tx.fee)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Fee %</span>
                <span>{((tx.fee / tx.amount) * 100).toFixed(2)}%</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="text-sm font-semibold text-gray-900">Net ke Merchant</span>
                <span className="text-sm font-bold text-emerald-700">{formatCurrency(tx.amount - tx.fee)}</span>
              </div>
            </div>
          </div>

          {/* Admin actions */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Aksi Admin</h2>
            <div className="space-y-2">
              <Link
                href={`/dashboard/merchants`}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Building2 className="h-4 w-4" />
                Lihat Merchant
              </Link>
              <button
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <DollarSign className="h-4 w-4" />
                Tandai untuk Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
