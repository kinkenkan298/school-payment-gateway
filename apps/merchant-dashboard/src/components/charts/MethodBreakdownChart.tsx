'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils/format';

interface MethodData {
  method: string;
  count: number;
  amount: number;
  percentage: number;
  color: string;
}

interface MethodBreakdownChartProps {
  data: MethodData[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const d = payload[0]?.payload as MethodData;
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg text-sm">
        <p className="font-medium text-gray-900 mb-1">{label}</p>
        <p className="text-gray-600">{d.count} transaksi ({d.percentage}%)</p>
        <p className="text-blue-600 font-medium">{formatCurrency(d.amount)}</p>
      </div>
    );
  }
  return null;
}

export function MethodBreakdownChart({ data }: MethodBreakdownChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
          domain={[0, 50]}
        />
        <YAxis
          dataKey="method"
          type="category"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
          width={100}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
        <Bar dataKey="percentage" radius={[0, 4, 4, 0]} maxBarSize={24}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
