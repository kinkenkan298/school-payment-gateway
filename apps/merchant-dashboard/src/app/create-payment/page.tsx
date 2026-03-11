'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  CreditCard,
  QrCode,
  Building2,
  Wallet,
  CheckCircle2,
  Copy,
  RefreshCw,
  ArrowLeft,
  Receipt,
  User,
  DollarSign,
  FileText,
  Clock,
} from 'lucide-react';
import { clsx } from 'clsx';
import { formatCurrency } from '@/lib/utils/format';

type PaymentMethod = 'virtual_account' | 'qris' | 'transfer_bank' | 'e_wallet';
type Step = 'form' | 'preview' | 'success';

interface PaymentCategory {
  id: string;
  label: string;
}

const paymentCategories: PaymentCategory[] = [
  { id: 'spp', label: 'SPP Bulanan' },
  { id: 'uang_pangkal', label: 'Uang Pangkal' },
  { id: 'seragam', label: 'Seragam' },
  { id: 'buku', label: 'Buku & LKS' },
  { id: 'ekskul', label: 'Ekstrakurikuler' },
  { id: 'study_tour', label: 'Study Tour' },
  { id: 'ujian', label: 'Biaya Ujian' },
  { id: 'lainnya', label: 'Lainnya' },
];

const methodConfig: Record<PaymentMethod, { label: string; icon: React.ReactNode; desc: string; fee: string }> = {
  virtual_account: { label: 'Virtual Account', icon: <Building2 className="h-5 w-5" />, desc: 'BCA, BNI, BRI, Mandiri', fee: 'Rp 4.000/transaksi' },
  qris:            { label: 'QRIS',            icon: <QrCode className="h-5 w-5" />,    desc: 'GoPay, OVO, Dana, dll', fee: '0.7% dari nominal' },
  transfer_bank:   { label: 'Transfer Bank',   icon: <CreditCard className="h-5 w-5" />, desc: 'Transfer antar bank',  fee: 'Rp 2.500/transaksi' },
  e_wallet:        { label: 'E-Wallet',        icon: <Wallet className="h-5 w-5" />,    desc: 'GoPay, OVO, Dana',    fee: '1.5% dari nominal' },
};

function generatePaymentId() {
  return 'PAY-' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

function generateVA() {
  return '88810' + Math.floor(Math.random() * 10_000_000_000).toString().padStart(10, '0');
}

export default function CreatePaymentPage() {
  const [step, setStep] = useState<Step>('form');

  // Form state
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [category, setCategory] = useState('spp');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('virtual_account');
  const [expiry, setExpiry] = useState('24');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Success state
  const [paymentId] = useState(generatePaymentId);
  const [vaNumber] = useState(generateVA);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);

  function validate() {
    const errs: Record<string, string> = {};
    if (!studentName.trim()) errs.studentName = 'Nama siswa wajib diisi';
    if (!amount || Number(amount.replace(/\D/g, '')) < 1000) errs.amount = 'Nominal minimal Rp 1.000';
    if (!description.trim() && category === 'lainnya') errs.description = 'Keterangan wajib diisi untuk kategori Lainnya';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleAmountChange(v: string) {
    const digits = v.replace(/\D/g, '');
    setAmount(digits ? Number(digits).toLocaleString('id-ID') : '');
  }

  function getAmountNumber() {
    return Number(amount.replace(/\D/g, ''));
  }

  function getFee() {
    const n = getAmountNumber();
    if (method === 'virtual_account') return 4000;
    if (method === 'qris') return Math.round(n * 0.007);
    if (method === 'transfer_bank') return 2500;
    return Math.round(n * 0.015);
  }

  async function handleCreate() {
    if (!validate()) return;
    setCreating(true);
    await new Promise((r) => setTimeout(r, 1200));
    setCreating(false);
    setStep('success');
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleReset() {
    setStudentName(''); setStudentClass(''); setCategory('spp');
    setDescription(''); setAmount(''); setMethod('virtual_account');
    setExpiry('24'); setErrors({}); setStep('form');
  }

  const categoryLabel = paymentCategories.find((c) => c.id === category)?.label ?? category;
  const descFinal = description || categoryLabel;

  return (
    <DashboardLayout title="Buat Pembayaran" subtitle="Buat tagihan pembayaran untuk siswa">
      {step === 'form' && (
        <div className="max-w-2xl mx-auto space-y-5">
          {/* Student info */}
          <Card>
            <CardHeader title="Informasi Siswa" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nama Siswa <span className="text-red-500">*</span>
                </label>
                <input
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Nama lengkap siswa"
                  className={clsx(
                    'w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
                    errors.studentName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  )}
                />
                {errors.studentName && <p className="text-xs text-red-500 mt-1">{errors.studentName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kelas / Angkatan</label>
                <input
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  placeholder="Contoh: 7A, 2024"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>
          </Card>

          {/* Payment info */}
          <Card>
            <CardHeader title="Detail Pembayaran" />
            <div className="space-y-4 mt-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori Tagihan</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {paymentCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Keterangan
                  {category === 'lainnya' && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={`Contoh: ${categoryLabel} - Maret 2026`}
                  className={clsx(
                    'w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
                    errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  )}
                />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nominal <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">Rp</span>
                  <input
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0"
                    className={clsx(
                      'w-full rounded-lg border pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-right font-mono',
                      errors.amount ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    )}
                  />
                </div>
                {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
                {/* Quick amount buttons */}
                <div className="flex gap-2 mt-2 flex-wrap">
                  {[500_000, 750_000, 1_000_000, 1_500_000, 2_000_000].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setAmount(v.toLocaleString('id-ID'))}
                      className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                    >
                      {formatCurrency(v)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Payment method */}
          <Card>
            <CardHeader title="Metode Pembayaran" />
            <div className="grid grid-cols-2 gap-3 mt-3">
              {(Object.entries(methodConfig) as [PaymentMethod, typeof methodConfig[PaymentMethod]][]).map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMethod(key)}
                  className={clsx(
                    'flex items-start gap-3 rounded-xl border-2 p-3 text-left transition-colors',
                    method === key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className={clsx('shrink-0 rounded-lg p-2', method === key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500')}>
                    {cfg.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{cfg.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{cfg.desc}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Biaya: {cfg.fee}</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Expiry */}
          <Card>
            <CardHeader title="Masa Berlaku" />
            <div className="mt-3 flex items-center gap-3">
              <select
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">1 jam</option>
                <option value="3">3 jam</option>
                <option value="24">24 jam</option>
                <option value="48">2 hari</option>
                <option value="72">3 hari</option>
                <option value="168">7 hari</option>
              </select>
              <p className="text-sm text-gray-500">setelah pembayaran dibuat</p>
            </div>
          </Card>

          {/* Summary & action */}
          {getAmountNumber() >= 1000 && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-900 mb-3">Ringkasan</p>
              <div className="space-y-2 text-sm">
                {[
                  { label: 'Nominal tagihan', value: formatCurrency(getAmountNumber()) },
                  { label: `Biaya ${methodConfig[method].label}`, value: `- ${formatCurrency(getFee())}` },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between">
                    <span className="text-blue-700">{r.label}</span>
                    <span className="font-medium text-blue-900">{r.value}</span>
                  </div>
                ))}
                <div className="border-t border-blue-200 pt-2 flex justify-between">
                  <span className="font-semibold text-blue-900">Yang diterima sekolah</span>
                  <span className="font-bold text-blue-900">{formatCurrency(getAmountNumber() - getFee())}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="primary" onClick={handleCreate} disabled={creating}>
              {creating ? (
                <><RefreshCw className="h-4 w-4 animate-spin" /> Membuat...</>
              ) : (
                <><CreditCard className="h-4 w-4" /> Buat Tagihan</>
              )}
            </Button>
          </div>
        </div>
      )}

      {step === 'success' && (
        <div className="max-w-lg mx-auto">
          <Card>
            <div className="text-center space-y-4 py-4">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Tagihan Berhasil Dibuat</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Tagihan untuk <span className="font-medium text-gray-700">{studentName}</span> sudah siap
                </p>
              </div>
            </div>

            <div className="space-y-3 mt-4 border-t border-gray-100 pt-4">
              {[
                { label: 'ID Pembayaran', value: paymentId },
                { label: 'Siswa', value: `${studentName}${studentClass ? ` (${studentClass})` : ''}` },
                { label: 'Kategori', value: categoryLabel },
                { label: 'Keterangan', value: descFinal },
                { label: 'Nominal', value: formatCurrency(getAmountNumber()) },
                { label: 'Metode', value: methodConfig[method].label },
                { label: 'Masa berlaku', value: `${expiry} jam` },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{r.label}</span>
                  <span className="font-medium text-gray-900 text-right max-w-[200px]">{r.value}</span>
                </div>
              ))}

              {method === 'virtual_account' && (
                <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4 mt-3">
                  <p className="text-xs font-medium text-blue-600 mb-1">Nomor Virtual Account</p>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-lg font-mono font-bold text-blue-900">{vaNumber}</p>
                    <button
                      onClick={() => handleCopy(vaNumber)}
                      className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                    >
                      {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? 'Tersalin!' : 'Salin'}
                    </button>
                  </div>
                  <p className="text-xs text-blue-500 mt-1">Berlaku selama {expiry} jam</p>
                </div>
              )}

              {method === 'qris' && (
                <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4 mt-3 flex flex-col items-center gap-3">
                  <p className="text-xs font-medium text-emerald-700">QR Code Pembayaran</p>
                  {/* Placeholder QR */}
                  <div className="h-32 w-32 rounded-lg bg-white border-2 border-emerald-200 flex items-center justify-center">
                    <QrCode className="h-20 w-20 text-emerald-700" />
                  </div>
                  <p className="text-xs text-emerald-600">Scan menggunakan aplikasi e-wallet</p>
                </div>
              )}
            </div>

            <div className="mt-5 flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={handleReset}>
                <ArrowLeft className="h-4 w-4" />
                Buat Tagihan Baru
              </Button>
              <Button variant="primary" className="flex-1" onClick={() => window.print()}>
                <FileText className="h-4 w-4" />
                Cetak / Simpan
              </Button>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
