import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { mockSettlements, mockStats } from '@/lib/mockData';
import { Landmark, Clock, CheckCircle, TrendingUp } from 'lucide-react';

export default function SettlementsPage() {
  return (
    <DashboardLayout
      title="Settlement"
      subtitle="Riwayat dan status settlement dana sekolah"
    >
      {/* Summary stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2.5">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Tersettled</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(45200000)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2.5">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Menunggu Settlement</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(mockStats.pendingSettlement)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Periode</p>
              <p className="text-lg font-bold text-gray-900">{mockSettlements.length} periode</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settlement list */}
      <Card padding={false}>
        <div className="px-6 py-4 border-b border-gray-100">
          <CardHeader title="Riwayat Settlement" subtitle="Semua periode settlement dana" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">ID</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Periode</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Jml Transaksi</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Total</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Biaya Admin</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Net Diterima</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tanggal Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockSettlements.map((stl) => (
                <tr key={stl.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500 uppercase">{stl.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{stl.period}</td>
                  <td className="px-6 py-4 text-right text-gray-600">{stl.transactionCount.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">{formatCurrency(stl.totalAmount)}</td>
                  <td className="px-6 py-4 text-right text-red-600">{formatCurrency(stl.fee)}</td>
                  <td className="px-6 py-4 text-right font-semibold text-emerald-700">{formatCurrency(stl.netAmount)}</td>
                  <td className="px-6 py-4">
                    {stl.status === 'completed' ? (
                      <Badge variant="success">Selesai</Badge>
                    ) : (
                      <Badge variant="warning">Menunggu</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {stl.settledAt ? formatDateTime(stl.settledAt) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Settlement info */}
      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Landmark className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">Jadwal Settlement Otomatis</p>
            <p className="text-sm text-blue-700 mt-0.5">
              Settlement dilakukan setiap 2 minggu sekali secara otomatis ke rekening bank sekolah yang terdaftar.
              Proses transfer membutuhkan 1–2 hari kerja setelah periode settlement berakhir.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
