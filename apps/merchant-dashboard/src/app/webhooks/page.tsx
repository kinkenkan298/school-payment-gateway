'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDateTime } from '@/lib/utils/format';
import {
  mockWebhookConfigs,
  mockWebhookLogs,
  type WebhookConfig,
  type WebhookLog,
  type WebhookEvent,
} from '@/lib/mockData';
import {
  Globe,
  Plus,
  ChevronRight,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Trash2,
  Edit2,
  Eye,
  AlertCircle,
  Copy,
  ToggleLeft,
  ToggleRight,
  X,
  FlaskConical,
} from 'lucide-react';

// ─── Konstanta ─────────────────────────────────────────────────────────────────

const ALL_EVENTS: { value: WebhookEvent; label: string; description: string }[] = [
  { value: 'payment.success', label: 'payment.success', description: 'Pembayaran berhasil diselesaikan' },
  { value: 'payment.failed', label: 'payment.failed', description: 'Pembayaran gagal atau ditolak' },
  { value: 'payment.expired', label: 'payment.expired', description: 'Pembayaran kedaluwarsa' },
  { value: 'payment.refunded', label: 'payment.refunded', description: 'Dana dikembalikan ke pembayar' },
  { value: 'settlement.completed', label: 'settlement.completed', description: 'Settlement selesai ditransfer' },
  { value: 'invoice.created', label: 'invoice.created', description: 'Invoice baru dibuat' },
];

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function WebhooksPage() {
  const [configs, setConfigs] = useState<WebhookConfig[]>(mockWebhookConfigs);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookConfig | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string } | null>(null);

  function handleToggleStatus(id: string) {
    setConfigs((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c
      )
    );
  }

  function handleDelete(id: string) {
    if (!confirm('Hapus webhook ini? Tindakan tidak dapat dibatalkan.')) return;
    setConfigs((prev) => prev.filter((c) => c.id !== id));
    if (selectedWebhook?.id === id) setSelectedWebhook(null);
  }

  async function handleTest(webhook: WebhookConfig) {
    setTestingId(webhook.id);
    setTestResult(null);
    // Simulasi API call
    await new Promise((r) => setTimeout(r, 1500));
    const success = webhook.status === 'active';
    setTestResult({
      id: webhook.id,
      success,
      message: success
        ? `Test event berhasil dikirim ke ${webhook.url}`
        : 'Webhook nonaktif. Aktifkan dulu sebelum test.',
    });
    setTestingId(null);
  }

  function handleSave(data: { name: string; url: string; events: WebhookEvent[] }) {
    if (editingWebhook) {
      setConfigs((prev) => prev.map((c) => (c.id === editingWebhook.id ? { ...c, ...data } : c)));
    } else {
      const newWebhook: WebhookConfig = {
        id: `wh_${Date.now()}`,
        ...data,
        status: 'active',
        secret: `whsec_••••••••••••••••••••••${Math.random().toString(36).slice(2, 6)}`,
        successCount: 0,
        failCount: 0,
        lastDeliveryAt: null,
        lastDeliveryStatus: null,
        createdAt: new Date().toISOString(),
      };
      setConfigs((prev) => [newWebhook, ...prev]);
    }
    setShowForm(false);
    setEditingWebhook(null);
  }

  const logs = selectedWebhook
    ? mockWebhookLogs.filter((l) => l.webhookId === selectedWebhook.id)
    : [];

  return (
    <DashboardLayout title="Webhook" subtitle="Konfigurasi dan monitoring pengiriman event ke sistem Anda">
      <div className="flex gap-6 h-full">
        {/* ─── Panel kiri: daftar webhook ─── */}
        <div className="w-80 flex-shrink-0 space-y-4">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => { setEditingWebhook(null); setShowForm(true); }}
          >
            <Plus className="h-4 w-4" />
            Tambah Webhook
          </Button>

          {configs.map((wh) => (
            <WebhookCard
              key={wh.id}
              webhook={wh}
              isSelected={selectedWebhook?.id === wh.id}
              isTesting={testingId === wh.id}
              testResult={testResult?.id === wh.id ? testResult : null}
              onSelect={() => { setSelectedWebhook(wh); setTestResult(null); }}
              onEdit={() => { setEditingWebhook(wh); setShowForm(true); }}
              onDelete={() => handleDelete(wh.id)}
              onTest={() => handleTest(wh)}
              onToggle={() => handleToggleStatus(wh.id)}
            />
          ))}
        </div>

        {/* ─── Panel kanan: detail & logs ─── */}
        <div className="flex-1 min-w-0">
          {selectedWebhook ? (
            <WebhookDetail webhook={selectedWebhook} logs={logs} />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      {/* ─── Modal form create/edit ─── */}
      {showForm && (
        <WebhookFormModal
          webhook={editingWebhook}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingWebhook(null); }}
        />
      )}
    </DashboardLayout>
  );
}

// ─── WebhookCard ───────────────────────────────────────────────────────────────

interface WebhookCardProps {
  webhook: WebhookConfig;
  isSelected: boolean;
  isTesting: boolean;
  testResult: { success: boolean; message: string } | null;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTest: () => void;
  onToggle: () => void;
}

function WebhookCard({ webhook, isSelected, isTesting, testResult, onSelect, onEdit, onDelete, onTest, onToggle }: WebhookCardProps) {
  const successRate = webhook.successCount + webhook.failCount > 0
    ? Math.round((webhook.successCount / (webhook.successCount + webhook.failCount)) * 100)
    : null;

  return (
    <div
      className={`rounded-xl border bg-white shadow-sm transition-all cursor-pointer ${
        isSelected ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-semibold text-gray-900 truncate">{webhook.name}</p>
              <Badge variant={webhook.status === 'active' ? 'success' : 'neutral'}>
                {webhook.status === 'active' ? 'Aktif' : 'Nonaktif'}
              </Badge>
            </div>
            <p className="text-xs text-gray-400 truncate">{webhook.url}</p>
          </div>
          <ChevronRight className={`h-4 w-4 flex-shrink-0 mt-0.5 transition-transform ${isSelected ? 'text-blue-500 rotate-90' : 'text-gray-300'}`} />
        </div>

        {/* Event pills */}
        <div className="flex flex-wrap gap-1 mb-3">
          {webhook.events.slice(0, 3).map((e) => (
            <span key={e} className="rounded-md bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 font-mono">
              {e}
            </span>
          ))}
          {webhook.events.length > 3 && (
            <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-xs text-gray-400">
              +{webhook.events.length - 3}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-600">
              <CheckCircle2 className="h-3 w-3" />{webhook.successCount}
            </span>
            <span className="flex items-center gap-1 text-red-500">
              <XCircle className="h-3 w-3" />{webhook.failCount}
            </span>
            {successRate !== null && (
              <span className="text-gray-400">{successRate}% sukses</span>
            )}
          </div>
          {webhook.lastDeliveryAt && (
            <span className="text-gray-400 text-xs">{formatDateTime(webhook.lastDeliveryAt)}</span>
          )}
        </div>

        {/* Test result */}
        {testResult && (
          <div className={`mt-3 flex items-start gap-1.5 rounded-lg p-2 text-xs ${
            testResult.success ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
          }`}>
            {testResult.success ? <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" /> : <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />}
            <span>{testResult.message}</span>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div
        className="flex items-center justify-between border-t border-gray-100 px-4 py-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1">
          <ActionBtn onClick={onEdit} title="Edit" icon={<Edit2 className="h-3.5 w-3.5" />} />
          <ActionBtn onClick={onDelete} title="Hapus" icon={<Trash2 className="h-3.5 w-3.5" />} danger />
          <ActionBtn
            onClick={onTest}
            title="Test Kirim"
            icon={isTesting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <FlaskConical className="h-3.5 w-3.5" />}
            disabled={isTesting}
          />
        </div>
        <button
          onClick={onToggle}
          title={webhook.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
          className="text-gray-400 hover:text-gray-700 transition-colors"
        >
          {webhook.status === 'active'
            ? <ToggleRight className="h-5 w-5 text-blue-500" />
            : <ToggleLeft className="h-5 w-5" />
          }
        </button>
      </div>
    </div>
  );
}

function ActionBtn({ onClick, title, icon, danger = false, disabled = false }: {
  onClick: () => void; title: string; icon: React.ReactNode; danger?: boolean; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded-md p-1.5 transition-colors disabled:opacity-40 ${
        danger
          ? 'text-gray-400 hover:bg-red-50 hover:text-red-600'
          : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
      }`}
    >
      {icon}
    </button>
  );
}

// ─── WebhookDetail (logs panel) ─────────────────────────────────────────────────

function WebhookDetail({ webhook, logs }: { webhook: WebhookConfig; logs: WebhookLog[] }) {
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <div className="space-y-4">
      {/* Header info */}
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 flex-shrink-0">
              <Globe className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{webhook.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm text-gray-500 font-mono break-all">{webhook.url}</p>
                <button onClick={() => copyText(webhook.url)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
          <Badge variant={webhook.status === 'active' ? 'success' : 'neutral'}>
            {webhook.status === 'active' ? 'Aktif' : 'Nonaktif'}
          </Badge>
        </div>

        {/* Secret */}
        <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Webhook Secret</p>
            <p className="text-sm font-mono text-gray-700">{webhook.secret}</p>
          </div>
          <button onClick={() => copyText(webhook.secret)} className="text-gray-400 hover:text-gray-600">
            <Copy className="h-4 w-4" />
          </button>
        </div>

        {/* Events */}
        <div className="mt-4">
          <p className="text-xs font-medium text-gray-500 mb-2">EVENTS YANG DIPANTAU</p>
          <div className="flex flex-wrap gap-1.5">
            {webhook.events.map((e) => (
              <span key={e} className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-mono text-blue-700">
                {e}
              </span>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100 pt-4">
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-600">{webhook.successCount}</p>
            <p className="text-xs text-gray-400">Berhasil</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-red-500">{webhook.failCount}</p>
            <p className="text-xs text-gray-400">Gagal</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">
              {webhook.successCount + webhook.failCount > 0
                ? `${Math.round((webhook.successCount / (webhook.successCount + webhook.failCount)) * 100)}%`
                : '—'}
            </p>
            <p className="text-xs text-gray-400">Success Rate</p>
          </div>
        </div>
      </Card>

      {/* Logs table + detail side-by-side */}
      <div className={`grid gap-4 ${selectedLog ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {/* Logs table */}
        <Card padding={false}>
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">Delivery Logs</p>
            <span className="text-xs text-gray-400">{logs.length} pengiriman</span>
          </div>
          <div className="divide-y divide-gray-50">
            {logs.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-400">Belum ada log pengiriman</div>
            ) : (
              logs.map((log) => (
                <LogRow
                  key={log.id}
                  log={log}
                  isSelected={selectedLog?.id === log.id}
                  onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                />
              ))
            )}
          </div>
        </Card>

        {/* Log detail */}
        {selectedLog && (
          <LogDetail log={selectedLog} onClose={() => setSelectedLog(null)} />
        )}
      </div>
    </div>
  );
}

// ─── LogRow ────────────────────────────────────────────────────────────────────

function LogRow({ log, isSelected, onClick }: { log: WebhookLog; isSelected: boolean; onClick: () => void }) {
  return (
    <div
      className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      {/* Status icon */}
      <div className="flex-shrink-0">
        {log.status === 'success' ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        ) : log.status === 'failed' ? (
          <XCircle className="h-4 w-4 text-red-400" />
        ) : (
          <Clock className="h-4 w-4 text-amber-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-gray-800">{log.event}</span>
          {log.retryCount > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-amber-600">
              <RefreshCw className="h-3 w-3" />{log.retryCount}x retry
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(log.createdAt)}</p>
      </div>

      <div className="text-right flex-shrink-0">
        {log.httpStatus ? (
          <span className={`text-xs font-mono font-semibold ${
            log.httpStatus >= 200 && log.httpStatus < 300 ? 'text-emerald-600' :
            log.httpStatus >= 400 ? 'text-red-500' : 'text-gray-600'
          }`}>
            {log.httpStatus}
          </span>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
        {log.responseTimeMs && (
          <p className="text-xs text-gray-400">{log.responseTimeMs}ms</p>
        )}
      </div>

      <Eye className={`h-3.5 w-3.5 flex-shrink-0 ${isSelected ? 'text-blue-500' : 'text-gray-300'}`} />
    </div>
  );
}

// ─── LogDetail ─────────────────────────────────────────────────────────────────

function LogDetail({ log, onClose }: { log: WebhookLog; onClose: () => void }) {
  return (
    <Card padding={false}>
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {log.status === 'success'
            ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            : <XCircle className="h-4 w-4 text-red-400" />
          }
          <p className="text-sm font-semibold text-gray-900 font-mono">{log.event}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-5 space-y-4 overflow-y-auto max-h-[600px]">
        {/* Meta */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <DetailItem label="Status HTTP" value={log.httpStatus ? String(log.httpStatus) : 'Timeout'} mono />
          <DetailItem label="Response Time" value={log.responseTimeMs ? `${log.responseTimeMs}ms` : '—'} mono />
          <DetailItem label="Retry Count" value={String(log.retryCount)} mono />
          <DetailItem label="Waktu Kirim" value={formatDateTime(log.createdAt)} />
        </div>

        {/* Error message */}
        {log.errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-xs font-medium text-red-700 mb-1">Error</p>
            <p className="text-xs text-red-600">{log.errorMessage}</p>
          </div>
        )}

        {/* Request payload */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">REQUEST PAYLOAD</p>
          <pre className="rounded-lg bg-gray-900 p-3 text-xs text-green-300 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(log.requestPayload, null, 2)}
          </pre>
        </div>

        {/* Response body */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">RESPONSE BODY</p>
          <pre className="rounded-lg bg-gray-900 p-3 text-xs text-blue-300 overflow-x-auto whitespace-pre-wrap">
            {log.responseBody ?? '(tidak ada response)'}
          </pre>
        </div>

        {log.nextRetryAt && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
            <Clock className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <p className="text-amber-700 text-xs">
              Retry berikutnya: <span className="font-medium">{formatDateTime(log.nextRetryAt)}</span>
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

function DetailItem({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-sm font-medium text-gray-900 mt-0.5 ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <Card>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 mb-4">
          <Zap className="h-7 w-7 text-blue-500" />
        </div>
        <p className="text-base font-semibold text-gray-900">Pilih Webhook</p>
        <p className="text-sm text-gray-500 mt-1 max-w-xs">
          Klik salah satu webhook di sebelah kiri untuk melihat konfigurasi dan delivery logs-nya.
        </p>
      </div>
    </Card>
  );
}

// ─── Form Modal ────────────────────────────────────────────────────────────────

interface WebhookFormModalProps {
  webhook: WebhookConfig | null;
  onSave: (data: { name: string; url: string; events: WebhookEvent[] }) => void;
  onClose: () => void;
}

function WebhookFormModal({ webhook, onSave, onClose }: WebhookFormModalProps) {
  const [name, setName] = useState(webhook?.name ?? '');
  const [url, setUrl] = useState(webhook?.url ?? '');
  const [events, setEvents] = useState<WebhookEvent[]>(webhook?.events ?? ['payment.success', 'payment.failed']);
  const [errors, setErrors] = useState<{ name?: string; url?: string; events?: string }>({});

  function toggleEvent(event: WebhookEvent) {
    setEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  }

  function validate() {
    const e: typeof errors = {};
    if (!name.trim()) e.name = 'Nama wajib diisi';
    if (!url.trim()) e.url = 'URL wajib diisi';
    else if (!/^https?:\/\/.+/.test(url)) e.url = 'URL harus dimulai dengan http:// atau https://';
    if (events.length === 0) e.events = 'Pilih minimal 1 event';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onSave({ name: name.trim(), url: url.trim(), events });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            {webhook ? 'Edit Webhook' : 'Tambah Webhook Baru'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Nama Endpoint</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="contoh: Production Endpoint"
              className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                errors.name ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
          </div>

          {/* URL */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">URL Endpoint</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://sekolah.sch.id/webhook"
              type="url"
              className={`w-full rounded-lg border px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                errors.url ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.url && <p className="text-xs text-red-600">{errors.url}</p>}
            <p className="text-xs text-gray-400">Wajib HTTPS untuk production. HTTP hanya untuk development lokal.</p>
          </div>

          {/* Events */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Events yang Dipantau</label>
            <div className="space-y-2">
              {ALL_EVENTS.map((ev) => (
                <label key={ev.value} className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={events.includes(ev.value)}
                    onChange={() => toggleEvent(ev.value)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-mono font-medium text-gray-800">{ev.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{ev.description}</p>
                  </div>
                </label>
              ))}
            </div>
            {errors.events && <p className="text-xs text-red-600">{errors.events}</p>}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={onClose}>Batal</Button>
            <Button variant="primary" type="submit">
              {webhook ? 'Simpan Perubahan' : 'Buat Webhook'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
