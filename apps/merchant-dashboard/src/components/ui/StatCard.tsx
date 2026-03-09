import { clsx } from 'clsx';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconBg?: string;
}

export function StatCard({ title, value, change, changeLabel, icon, iconBg = 'bg-blue-50' }: StatCardProps) {
  const isPositive = (change ?? 0) >= 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 truncate">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 truncate">{value}</p>
          {change !== undefined && (
            <div className="mt-1.5 flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              )}
              <span
                className={clsx(
                  'text-xs font-medium',
                  isPositive ? 'text-emerald-600' : 'text-red-600'
                )}
              >
                {isPositive ? '+' : ''}{change}%
              </span>
              {changeLabel && (
                <span className="text-xs text-gray-400">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        <div className={clsx('rounded-lg p-2.5', iconBg)}>{icon}</div>
      </div>
    </div>
  );
}
