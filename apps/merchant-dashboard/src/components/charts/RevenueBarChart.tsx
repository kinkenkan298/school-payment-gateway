'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/utils/format';

interface DataPoint {
  period?: string;
  date?: string;
  revenue: number;
  success?: number;
  failed?: number;
  transactions?: number;
}

interface RevenueBarChartProps {
  data: DataPoint[];
  showSuccessFailed?: boolean;
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg text-sm min-w-[180px]">
        <p className="font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: entry.fill }} />
              <span className="text-gray-500 text-xs">{entry.name}</span>
            </div>
            <span className="font-medium text-gray-900 text-xs">
              {entry.name === 'Revenue'
                ? formatCurrency(entry.value)
                : `${entry.value} txn`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function RevenueBarChart({ data, showSuccessFailed = false }: RevenueBarChartProps) {
  const chartData = data.map((d) => ({ ...d, label: d.date ?? d.period }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
          width={38}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
        <Legend
          iconType="square"
          iconSize={8}
          formatter={(value) => <span style={{ fontSize: '12px', color: '#6b7280' }}>{value}</span>}
        />
        <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={32} />
        {showSuccessFailed && (
          <>
            <Bar dataKey="success" name="Berhasil" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={20} />
            <Bar dataKey="failed" name="Gagal" fill="#ef4444" radius={[3, 3, 0, 0]} maxBarSize={20} />
          </>
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}
