'use client';

import { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle, Clock, AlertCircle, Copy, Receipt, User, CreditCard, ArrowLeftRight, Calendar, Hash } from 'lucide-react';
import { clsx } from 'clsx';
import { useState } from 'react';
import { mockTransactions } from '@/lib/mockData';
import { formatCurrency, formatDateTime, formatPaymentMethod, formatWorkflow } from '@/lib/utils/format';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';

const workflowDesc: Record<string, { label: string; desc: string; color: string }> = {
  provider_to_platform: { label: 'A — Via Platform', desc: 'Vendor PG → School Pay → Sekolah (markup fee)', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  platform_direct:      { label: 'B — Direct',       desc: 'Vendor PG → Sekolah (komisi per transaksi)',    color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  bank_direct:          { label: 'C — H2H Bank',     desc: 'H2H Bank Sekolah → Sekolah (gratis)',          color: 'text-gray-700 bg-gray-50 border-gray-200' },
};

export default function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const txn = mockTransactions.find((t) => t.id === id);
  if (!txn) notFound();

  const [copied, setCopied] = useState(false);

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const wf = workflowDesc[txn.workflow] ?? { label: txn.workflow, desc: '', color: 'text-gray-700 bg-gray-50 border-gray-200' };

  return (
    <DashboardLayout title="Detail Transaksi" subtitle={`ID: ${txn.id}`}>
      {/* Back */}
      <div className="mb-5">
        <Link
          href="/transactions"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Transaksi
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left: main info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Status card */}
          <Card>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={clsx('flex h-14 w-14 items-center justify-center rounded-2xl shrink-0',
                  txn.status === 'success' ? 'bg-emerald-100' :
                  txn.status === 'failed' || txn.status === 'cancelled' ? 'bg-red-100' :
                  'bg-amber-100'
                )}>
                  {txn.status === 'success' ? <CheckCircle className="h-7 w-7 text-emerald-600" /> :
                   txn.status === 'failed' || txn.status === 'cancelled' ? <XCircle className="h-7 w-7 text-red-500" /> :
                   txn.status === 'pending' ? <Clock className="h-7 w-7 text-amber-500" /> :
                   <AlertCircle className="h-7 w-7 text-gray-500" />}
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(txn.amount)}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{txn.description}</p>
                </div>
              </div>
              <StatusBadge status={txn.status as any} />
            </div>
          </Card>

          {/* Transaction details */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Informasi Transaksi</h2>
            <div className="space-y-4">
              {[
                {
                  icon: <Hash className="h-4 w-4 text-gray-400" />,
                  label: 'ID Transaksi',
                  value: (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-gray-900">{txn.id}</span>
                      <button
                        onClick={() => handleCopy(txn.id)}
                        className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500 hover:bg-gray-200 transition-colors"
                      >
                        {copied ? <CheckCircle className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        {copied ? 'Tersalin' : 'Salin'}
                      </button>
                    </div>
                  ),
                },
                { icon: <Hash className="h-4 w-4 text-gray-400" />, label: 'Payment ID', value: <span className="font-mono text-sm text-gray-700">{txn.paymentId}</span> },
                { icon: <User className="h-4 w-4 text-gray-400" />, label: 'Nama Siswa', value: <span className="text-sm font-medium text-gray-900">{txn.studentName}</span> },
                { icon: <Receipt className="h-4 w-4 text-gray-400" />, label: 'Deskripsi', value: <span className="text-sm text-gray-700">{txn.description}</span> },
                { icon: <Calendar className="h-4 w-4 text-gray-400" />, label: 'Waktu', value: <span className="text-sm text-gray-700">{formatDateTime(txn.createdAt)}</span> },
              ].map((r) => (
                <div key={r.label} className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">{r.icon}</div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 mb-0.5">{r.label}</p>
                    {r.value}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Payment method */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Metode Pembayaran</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CreditCard className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Metode</p>
                  <p className="text-sm font-medium text-gray-900">{formatPaymentMethod(txn.method)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ArrowLeftRight className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Workflow</p>
                  <span className={clsx('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', wf.color)}>
                    {wf.label}
                  </span>
                  {wf.desc && <p className="text-xs text-gray-400 mt-1">{wf.desc}</p>}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: fee breakdown */}
        <div className="space-y-5">
          <Card>
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Rincian Biaya</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Nominal tagihan</span>
                <span className="font-medium text-gray-900">{formatCurrency(txn.amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Biaya platform</span>
                <span className={txn.fee === 0 ? 'text-emerald-600 text-xs font-medium' : 'text-red-600 font-medium'}>
                  {txn.fee === 0 ? 'Gratis' : `− ${formatCurrency(txn.fee)}`}
                </span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="text-sm font-semibold text-gray-900">Yang diterima</span>
                <span className="text-sm font-bold text-emerald-700">{formatCurrency(txn.netAmount)}</span>
              </div>
            </div>

            {txn.status === 'pending' && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs text-amber-700 font-medium">Menunggu Pembayaran</p>
                <p className="text-xs text-amber-600 mt-0.5">Dana akan masuk setelah pembayaran dikonfirmasi.</p>
              </div>
            )}
            {txn.status === 'failed' && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-xs text-red-700 font-medium">Transaksi Gagal</p>
                <p className="text-xs text-red-600 mt-0.5">Dana tidak diproses. Hubungi support jika ada pertanyaan.</p>
              </div>
            )}
            {txn.status === 'success' && (
              <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-xs text-emerald-700 font-medium">Pembayaran Berhasil</p>
                <p className="text-xs text-emerald-600 mt-0.5">Dana akan masuk pada jadwal settlement berikutnya.</p>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Butuh Bantuan?</h2>
            <p className="text-xs text-gray-500 mb-3">Hubungi tim support jika ada kendala dengan transaksi ini.</p>
            <a
              href="mailto:support@schoolpay.id"
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hubungi Support
            </a>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
