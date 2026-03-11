'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Ban, Plus, Trash2, Search, AlertTriangle, ShieldOff } from 'lucide-react';
import { clsx } from 'clsx';

type BlacklistType = 'phone' | 'email' | 'ip' | 'device';

interface BlacklistEntry {
  id: string;
  type: BlacklistType;
  value: string;
  reason: string;
  addedBy: string;
  addedAt: string;
  merchantName?: string;
}

const mockBlacklist: BlacklistEntry[] = [
  { id: 'bl_001', type: 'phone',  value: '08123456789',         reason: 'Percobaan penipuan berulang (5x)',           addedBy: 'Budi Santoso',  addedAt: '2026-02-10T10:00:00Z', merchantName: 'SDN Contoh 01' },
  { id: 'bl_002', type: 'email',  value: 'fraud@evil.com',      reason: 'Email digunakan untuk chargeback fraud',     addedBy: 'Siti Rahayu',   addedAt: '2026-02-12T14:30:00Z' },
  { id: 'bl_003', type: 'ip',     value: '192.168.99.1',        reason: 'IP dari negara berisiko tinggi + anomaly',   addedBy: 'Sistem (Auto)', addedAt: '2026-02-14T09:15:00Z' },
  { id: 'bl_004', type: 'phone',  value: '08987654321',         reason: 'Nomor terkait dengan akun suspek',           addedBy: 'Eko Prasetyo',  addedAt: '2026-02-15T11:00:00Z', merchantName: 'SMPN Maju Jaya' },
  { id: 'bl_005', type: 'device', value: 'IMEI:356938035643809', reason: 'Perangkat digunakan untuk multi-account',   addedBy: 'Sistem (Auto)', addedAt: '2026-02-15T16:45:00Z' },
  { id: 'bl_006', type: 'email',  value: 'test_fraud@temp.id',  reason: 'Email sementara digunakan untuk bypass KYC', addedBy: 'Budi Santoso',  addedAt: '2026-02-16T08:00:00Z' },
];

const typeConfig: Record<BlacklistType, { label: string; color: string }> = {
  phone:  { label: 'No. Telepon', color: 'text-purple-700 bg-purple-50 border-purple-200' },
  email:  { label: 'Email',       color: 'text-blue-700 bg-blue-50 border-blue-200' },
  ip:     { label: 'IP Address',  color: 'text-orange-700 bg-orange-50 border-orange-200' },
  device: { label: 'Device ID',   color: 'text-gray-700 bg-gray-50 border-gray-200' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function BlacklistPage() {
  const [entries, setEntries] = useState<BlacklistEntry[]>(mockBlacklist);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<BlacklistType | 'all'>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ type: 'phone' as BlacklistType, value: '', reason: '' });
  const [removeId, setRemoveId] = useState<string | null>(null);

  const filtered = entries.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.value.toLowerCase().includes(q) || e.reason.toLowerCase().includes(q);
    const matchType = typeFilter === 'all' || e.type === typeFilter;
    return matchSearch && matchType;
  });

  function handleAdd(ev: React.FormEvent) {
    ev.preventDefault();
    if (!form.value.trim() || !form.reason.trim()) return;
    const newEntry: BlacklistEntry = {
      id: `bl_${Date.now()}`,
      type: form.type,
      value: form.value.trim(),
      reason: form.reason.trim(),
      addedBy: 'Admin (Anda)',
      addedAt: new Date().toISOString(),
    };
    setEntries((prev) => [newEntry, ...prev]);
    setForm({ type: 'phone', value: '', reason: '' });
    setShowAdd(false);
  }

  function handleRemove(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setRemoveId(null);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link
            href="/dashboard/fraud"
            className="mt-1 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Fraud Detection
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Blacklist Management</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola daftar hitam nomor telepon, email, IP, dan perangkat</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> Tambah Blacklist
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(['phone', 'email', 'ip', 'device'] as BlacklistType[]).map((t) => {
          const count = entries.filter((e) => e.type === t).length;
          const cfg = typeConfig[t];
          return (
            <div key={t} className="rounded-xl border border-gray-200 bg-white p-4 text-center">
              <p className={clsx('text-2xl font-bold', cfg.color.split(' ')[0])}>{count}</p>
              <p className="text-xs text-gray-500 mt-1">{cfg.label} diblokir</p>
            </div>
          );
        })}
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Tambah ke Daftar Hitam</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tipe</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as BlacklistType }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="phone">No. Telepon</option>
                <option value="email">Email</option>
                <option value="ip">IP Address</option>
                <option value="device">Device ID</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nilai</label>
              <input
                required
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                placeholder={
                  form.type === 'phone' ? '08xxxxxxxxxx' :
                  form.type === 'email' ? 'fraud@example.com' :
                  form.type === 'ip' ? '192.168.1.1' : 'IMEI:...'
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Alasan</label>
              <input
                required
                value={form.reason}
                onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                placeholder="Jelaskan alasan pemblokiran..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-4 flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
              >
                <Ban className="h-4 w-4" /> Tambah ke Blacklist
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nilai atau alasan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'phone', 'email', 'ip', 'device'] as (BlacklistType | 'all')[]).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={clsx('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                typeFilter === t ? 'bg-slate-800 text-white' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50')}
            >
              {t === 'all' ? 'Semua' : typeConfig[t].label}
            </button>
          ))}
        </div>
      </div>

      {/* Confirm remove */}
      {removeId && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
            <p className="text-sm text-red-800">
              Hapus <span className="font-mono font-semibold">{entries.find((e) => e.id === removeId)?.value}</span> dari daftar hitam?
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => handleRemove(removeId)} className="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors">
              Ya, Hapus
            </button>
            <button onClick={() => setRemoveId(null)} className="rounded-lg border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-white transition-colors">
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Tipe</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Nilai</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Alasan</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Ditambahkan oleh</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Tanggal</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((entry) => {
              const cfg = typeConfig[entry.type];
              return (
                <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className={clsx('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium', cfg.color)}>
                      <ShieldOff className="h-3 w-3" /> {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-gray-900">{entry.value}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs">
                    <p className="text-xs leading-relaxed">{entry.reason}</p>
                    {entry.merchantName && (
                      <p className="text-xs text-blue-600 mt-0.5">Terkait: {entry.merchantName}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{entry.addedBy}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{formatDate(entry.addedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setRemoveId(entry.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Hapus
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <ShieldOff className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Tidak ada entri yang sesuai filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
