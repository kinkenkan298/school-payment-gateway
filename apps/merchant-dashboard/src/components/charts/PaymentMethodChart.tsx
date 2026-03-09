'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PaymentMethodChartProps {
  data: { name: string; value: number; color: string }[];
}

export function PaymentMethodChart({ data }: PaymentMethodChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [`${value}%`, 'Porsi']}
          contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span style={{ fontSize: '12px', color: '#6b7280' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
