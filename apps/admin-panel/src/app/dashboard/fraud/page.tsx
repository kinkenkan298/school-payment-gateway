'use client';

import { clsx } from 'clsx';
import { AlertTriangle, CheckCircle2, RefreshCw, Eye, XCircle, Clock } from 'lucide-react';
import { useFraudAlerts } from '@/hooks/useFraudAlerts';
import type { FraudAlert, RiskLevel, AlertStatus } from '@/hooks/useFraudAlerts';

function formatCurrency(n: number) { return `Rp ${n.toLocaleString('id-ID')}`; }
function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Baru saja';
  if (m < 60) return `${m} menit lalu`;
  return `${Math.floor(m / 60)} jam lalu`;
}

const riskConfig: Record<RiskLevel, { label: string; color: string; bg: string }> = {
  critical: { label: 'Kritis',  color: 'text-red-700',    bg: 'bg-red-100' },
  high:     { label: 'Tinggi',  color: 'text-orange-700', bg: 'bg-orange-100' },
  medium:   { label: 'Sedang',  color: 'text-amber-700',  bg: 'bg-amber-100' },
  low:      { label: 'Rendah',  color: 'text-blue-700',   bg: 'bg-blue-100' },
};

const statusConfig: Record<AlertStatus, { label: string; color: string }> = {
  open:       { label: 'Terbuka',   color: 'text-red-600 bg-red-50 border-red-200' },
  reviewing:  { label: 'Direview',  color: 'text-blue-600 bg-blue-50 border-blue-200' },
  resolved:   { label: 'Resolved',  color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  dismissed:  { label: 'Dismissed', color: 'text-gray-500 bg-gray-50 border-gray-200' },
};

export default function FraudPage() {
  const {
    alerts, openAlerts, criticalCount, loading, lastRefreshed,
    refresh, resolveAlert, dismissAlert, markReviewing,
  } = useFraudAlerts(true);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fraud Detection</h1>
          <p className="text-sm text-gray-500 mt-1">
            Auto-refresh setiap 30 detik · Terakhir diperbarui:{' '}
            {lastRefreshed.toLocaleTimeString('id-ID', { timeStyle: 'short' })}
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={clsx('h-4 w-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Alert Terbuka',  value: openAlerts.length,                               color: 'text-red-600' },
          { label: 'Alert Kritis',   value: criticalCount,                                   color: 'text-red-700' },
          { label: 'Total Alert',    value: alerts.length,                                   color: 'text-gray-900' },
          { label: 'Sudah Resolved', value: alerts.filter((a) => a.status === 'resolved').length, color: 'text-emerald-600' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <p className={clsx('text-2xl font-bold', s.color)}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Critical banner */}
      {criticalCount > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">{criticalCount} alert kritis memerlukan perhatian segera</p>
            <p className="text-xs text-red-600 mt-0.5">Tinjau dan tangani alert dengan risk level kritis sebelum transaksi diproses.</p>
          </div>
        </div>
      )}

      {/* Alert list */}
      <div className="space-y-3">
        {alerts.map((alert) => {
          const risk = riskConfig[alert.riskLevel];
          const st = statusConfig[alert.status];
          const isOpen = alert.status === 'open' || alert.status === 'reviewing';
          return (
            <div key={alert.id} className={clsx('rounded-xl border bg-white p-5 transition-opacity', !isOpen && 'opacity-60')}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Risk score badge */}
                  <div className={clsx('shrink-0 flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold', risk.bg, risk.color)}>
                    {alert.riskScore}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900">{alert.merchantName}</p>
                      <span className={clsx('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium', st.color)}>
                        {alert.status === 'open' ? <AlertTriangle className="h-3 w-3" /> :
                         alert.status === 'reviewing' ? <Eye className="h-3 w-3" /> :
                         alert.status === 'resolved' ? <CheckCircle2 className="h-3 w-3" /> :
                         <XCircle className="h-3 w-3" />}
                        {st.label}
                      </span>
                      <span className={clsx('rounded-full px-2 py-0.5 text-xs font-semibold', risk.bg, risk.color)}>
                        {risk.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>ID: {alert.transactionId}</span>
                      <span>·</span>
                      <span className="font-medium text-gray-700">{formatCurrency(alert.amount)}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatRelative(alert.createdAt)}</span>
                    </div>
                    {/* Reasons */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {alert.reasons.map((r) => (
                        <span key={r} className="rounded-lg bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{r}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {isOpen && (
                  <div className="flex items-center gap-2 shrink-0">
                    {alert.status === 'open' && (
                      <button onClick={() => markReviewing(alert.id)}
                        className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors">
                        Review
                      </button>
                    )}
                    <button onClick={() => resolveAlert(alert.id)}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors">
                      Resolve
                    </button>
                    <button onClick={() => dismissAlert(alert.id)}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                      Abaikan
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
