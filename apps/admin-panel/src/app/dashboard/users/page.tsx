'use client';

import { useState } from 'react';
import { Plus, Shield, User, Headphones, MoreHorizontal, CheckCircle2, XCircle } from 'lucide-react';
import { clsx } from 'clsx';

type AdminRole = 'superadmin' | 'admin' | 'support';
type AdminStatus = 'active' | 'inactive';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  lastLogin: string | null;
  createdAt: string;
}

const mockAdminUsers: AdminUser[] = [
  { id: 'adm_001', name: 'Budi Santoso',    email: 'budi@schoolpay.id',    role: 'superadmin', status: 'active',   lastLogin: '2026-02-16T09:30:00Z', createdAt: '2025-10-01T00:00:00Z' },
  { id: 'adm_002', name: 'Siti Rahayu',     email: 'siti@schoolpay.id',    role: 'admin',      status: 'active',   lastLogin: '2026-02-16T08:15:00Z', createdAt: '2025-11-01T00:00:00Z' },
  { id: 'adm_003', name: 'Eko Prasetyo',    email: 'eko@schoolpay.id',     role: 'admin',      status: 'active',   lastLogin: '2026-02-15T17:00:00Z', createdAt: '2025-11-15T00:00:00Z' },
  { id: 'adm_004', name: 'Dewi Lestari',    email: 'dewi@schoolpay.id',    role: 'support',    status: 'active',   lastLogin: '2026-02-16T07:45:00Z', createdAt: '2026-01-05T00:00:00Z' },
  { id: 'adm_005', name: 'Fajar Nugroho',   email: 'fajar@schoolpay.id',   role: 'support',    status: 'active',   lastLogin: '2026-02-14T11:30:00Z', createdAt: '2026-01-10T00:00:00Z' },
  { id: 'adm_006', name: 'Hendra Wijaya',   email: 'hendra@schoolpay.id',  role: 'support',    status: 'inactive', lastLogin: '2026-01-20T09:00:00Z', createdAt: '2025-12-01T00:00:00Z' },
];

const roleConfig: Record<AdminRole, { label: string; color: string; icon: React.ReactNode }> = {
  superadmin: { label: 'Super Admin', color: 'text-purple-700 bg-purple-50 border-purple-200', icon: <Shield className="h-3 w-3" /> },
  admin:      { label: 'Admin',       color: 'text-blue-700 bg-blue-50 border-blue-200',       icon: <User className="h-3 w-3" /> },
  support:    { label: 'Support',     color: 'text-gray-600 bg-gray-50 border-gray-200',       icon: <Headphones className="h-3 w-3" /> },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(mockAdminUsers);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'support' as AdminRole });

  function toggleStatus(id: string) {
    setUsers((prev) => prev.map((u) =>
      u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
    ));
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const newUser: AdminUser = {
      id: `adm_${Date.now()}`,
      name: form.name,
      email: form.email,
      role: form.role,
      status: 'active',
      lastLogin: null,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [newUser, ...prev]);
    setShowAdd(false);
    setForm({ name: '', email: '', role: 'support' });
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Users</h1>
          <p className="text-sm text-gray-500 mt-1">{users.filter((u) => u.status === 'active').length} akun aktif</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> Tambah Admin
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Tambah Admin Baru</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nama</label>
              <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nama lengkap" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="email@schoolpay.id" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
              <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as AdminRole }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="admin">Admin</option>
                <option value="support">Support</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>
            <div className="sm:col-span-3 flex items-center gap-2 justify-end">
              <button type="button" onClick={() => setShowAdd(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Batal
              </button>
              <button type="submit"
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors">
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Pengguna</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Login Terakhir</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Bergabung</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => {
              const rc = roleConfig[u.role];
              return (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 shrink-0">
                        {u.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium', rc.color)}>
                      {rc.icon}{rc.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx('inline-flex items-center gap-1 rounded-full text-xs font-medium px-2 py-0.5',
                      u.status === 'active' ? 'text-emerald-700 bg-emerald-50' : 'text-gray-500 bg-gray-100')}>
                      {u.status === 'active' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {u.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{u.lastLogin ? formatDate(u.lastLogin) : '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    {u.role !== 'superadmin' && (
                      <button
                        onClick={() => toggleStatus(u.id)}
                        className={clsx('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                          u.status === 'active'
                            ? 'border border-red-200 text-red-600 hover:bg-red-50'
                            : 'border border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        )}
                      >
                        {u.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
