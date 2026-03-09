import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader } from '@/components/ui/Card';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { PaymentMethodChart } from '@/components/charts/PaymentMethodChart';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDateTime, formatPaymentMethod, shortenId } from '@/lib/utils/format';
import { mockStats, mockRevenueData, mockPaymentMethodData, mockTransactions } from '@/lib/mockData';
import {
  Wallet,
  ArrowLeftRight,
  CheckCircle,
  Clock,
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Ringkasan aktivitas pembayaran sekolah Anda"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Revenue (Feb)"
          value={formatCurrency(mockStats.totalRevenue)}
          change={mockStats.revenueGrowth}
          changeLabel="vs bulan lalu"
          icon={<Wallet className="h-5 w-5 text-blue-600" />}
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Total Transaksi"
          value={mockStats.totalTransactions.toLocaleString('id-ID')}
          change={mockStats.transactionGrowth}
          changeLabel="vs bulan lalu"
          icon={<ArrowLeftRight className="h-5 w-5 text-purple-600" />}
          iconBg="bg-purple-50"
        />
        <StatCard
          title="Success Rate"
          value={`${mockStats.successRate}%`}
          icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Pending Settlement"
          value={formatCurrency(mockStats.pendingSettlement)}
          icon={<Clock className="h-5 w-5 text-amber-600" />}
          iconBg="bg-amber-50"
        />
      </div>

      {/* Charts Row */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Revenue 6 Bulan Terakhir"
            subtitle="Grafik revenue dan jumlah transaksi"
          />
          <RevenueChart data={mockRevenueData} />
        </Card>
        <Card>
          <CardHeader
            title="Metode Pembayaran"
            subtitle="Distribusi per metode (Feb)"
          />
          <PaymentMethodChart data={mockPaymentMethodData} />
        </Card>
      </div>

      {/* Payment Workflow Summary */}
      <div className="mt-6">
        <Card>
          <CardHeader title="Ringkasan Workflow Pembayaran" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <WorkflowCard
              title="Workflow A — Via Platform"
              description="Vendor PG → School Pay → Sekolah"
              detail="Markup fee per transaksi"
              amount={formatCurrency(20500000)}
              txCount={524}
              color="blue"
            />
            <WorkflowCard
              title="Workflow B — Direct"
              description="Vendor PG → Sekolah"
              detail="Komisi per transaksi"
              amount={formatCurrency(18750000)}
              txCount={486}
              color="purple"
            />
            <WorkflowCard
              title="Workflow C — H2H Bank"
              description="Bank Sekolah → Sekolah"
              detail="Free integrasi"
              amount={formatCurrency(9500000)}
              txCount={274}
              color="emerald"
            />
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <div className="mt-6">
        <Card padding={false}>
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Transaksi Terbaru</h3>
              <p className="text-sm text-gray-500 mt-0.5">5 transaksi terakhir</p>
            </div>
            <a href="/transactions" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Lihat semua →
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">ID</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Siswa</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Metode</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Jumlah</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-mono text-xs text-gray-500">{shortenId(txn.id)}</td>
                    <td className="px-6 py-3 font-medium text-gray-900">{txn.studentName}</td>
                    <td className="px-6 py-3 text-gray-600">{formatPaymentMethod(txn.method)}</td>
                    <td className="px-6 py-3 font-medium text-gray-900">{formatCurrency(txn.amount)}</td>
                    <td className="px-6 py-3">
                      <StatusBadge status={txn.status as any} />
                    </td>
                    <td className="px-6 py-3 text-gray-500 text-xs">{formatDateTime(txn.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

interface WorkflowCardProps {
  title: string;
  description: string;
  detail: string;
  amount: string;
  txCount: number;
  color: 'blue' | 'purple' | 'emerald';
}

const colorStyles = {
  blue: { border: 'border-blue-200', bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
  purple: { border: 'border-purple-200', bg: 'bg-purple-50', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700' },
  emerald: { border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
};

function WorkflowCard({ title, description, detail, amount, txCount, color }: WorkflowCardProps) {
  const styles = colorStyles[color];
  return (
    <div className={`rounded-lg border ${styles.border} ${styles.bg} p-4`}>
      <p className={`text-xs font-semibold uppercase tracking-wide ${styles.text} mb-1`}>{title}</p>
      <p className="text-xs text-gray-600 mb-0.5">{description}</p>
      <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${styles.badge} mb-3`}>{detail}</span>
      <p className="text-xl font-bold text-gray-900">{amount}</p>
      <p className="text-xs text-gray-500 mt-0.5">{txCount} transaksi</p>
    </div>
  );
}
