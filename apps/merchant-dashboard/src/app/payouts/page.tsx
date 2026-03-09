import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { Banknote, Building2, AlertCircle } from 'lucide-react';

const mockPayouts = [
  {
    id: 'po_001',
    amount: 24250000,
    bankName: 'Bank BCA',
    accountNumber: '1234567890',
    accountName: 'SDN Contoh 01',
    status: 'completed',
    reference: 'TRF2026021601',
    createdAt: '2026-02-16T08:00:00Z',
    completedAt: '2026-02-17T09:30:00Z',
  },
  {
    id: 'po_002',
    amount: 20725000,
    bankName: 'Bank BCA',
    accountNumber: '1234567890',
    accountName: 'SDN Contoh 01',
    status: 'completed',
    reference: 'TRF2026020101',
    createdAt: '2026-02-01T08:00:00Z',
    completedAt: '2026-02-03T10:00:00Z',
  },
  {
    id: 'po_003',
    amount: 12238000,
    bankName: 'Bank BCA',
    accountNumber: '1234567890',
    accountName: 'SDN Contoh 01',
    status: 'pending',
    reference: null,
    createdAt: '2026-03-01T08:00:00Z',
    completedAt: null,
  },
];

export default function PayoutsPage() {
  return (
    <DashboardLayout
      title="Pencairan Dana"
      subtitle="Histori transfer dana ke rekening bank sekolah"
    >
      {/* Bank account info */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-50 p-3">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Rekening Tujuan Pencairan</p>
              <p className="text-base font-semibold text-gray-900">Bank BCA</p>
              <p className="text-sm text-gray-600">1234-5678-90 · SDN Contoh 01</p>
            </div>
          </div>
          <Button variant="secondary" size="sm">
            Ubah Rekening
          </Button>
        </div>
      </div>

      {/* Available balance */}
      <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Banknote className="h-6 w-6 text-emerald-600" />
            <div>
              <p className="text-sm text-emerald-700">Saldo Tersedia untuk Dicairkan</p>
              <p className="text-2xl font-bold text-emerald-800 mt-0.5">{formatCurrency(12238000)}</p>
            </div>
          </div>
          <Button variant="primary" size="md">
            Cairkan Sekarang
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="mb-6 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700">
          Pencairan manual dapat dilakukan kapan saja untuk saldo yang sudah tersettled. Proses transfer 1–2 hari kerja.
        </p>
      </div>

      {/* Payout history */}
      <Card padding={false}>
        <div className="px-6 py-4 border-b border-gray-100">
          <CardHeader title="Riwayat Pencairan" subtitle="Semua transfer ke rekening sekolah" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">ID</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Rekening Tujuan</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Jumlah</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">No. Referensi</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tanggal Dibuat</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tanggal Selesai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockPayouts.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500 uppercase">{po.id}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{po.bankName}</p>
                    <p className="text-xs text-gray-500">{po.accountNumber} · {po.accountName}</p>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">{formatCurrency(po.amount)}</td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{po.reference ?? '—'}</td>
                  <td className="px-6 py-4">
                    {po.status === 'completed' ? (
                      <Badge variant="success">Selesai</Badge>
                    ) : (
                      <Badge variant="warning">Diproses</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{formatDateTime(po.createdAt)}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {po.completedAt ? formatDateTime(po.completedAt) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
