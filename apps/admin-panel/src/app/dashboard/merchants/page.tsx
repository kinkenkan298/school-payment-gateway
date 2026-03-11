'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Search,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { clsx } from 'clsx';
import { mockMerchants } from '@/lib/mockData';
import type { Merchant } from '@/lib/mockData';

function formatCurrency(n: number) {
  if (n === 0) return 'Rp 0';
  return `Rp ${n.toLocaleString('id-ID')}`;
}

const kycBadge: Record<Merchant['kycStatus'], { label: string; color: string }> = {
  verified:     { label: 'Terverifikasi', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  pending:      { label: 'Menunggu',      color: 'text-amber-700 bg-amber-50 border-amber-200' },
  under_review: { label: 'Direview',      color: 'text-blue-700 bg-blue-50 border-blue-200' },
  rejected:     { label: 'Ditolak',       color: 'text-red-700 bg-red-50 border-red-200' },
  unverified:   { label: 'Belum KYC',     color: 'text-gray-600 bg-gray-50 border-gray-200' },
};

const statusBadge: Record<Merchant['status'], { label: string; color: string }> = {
  active:    { label: 'Aktif',     color: 'text-emerald-700 bg-emerald-50' },
  suspended: { label: 'Suspended', color: 'text-red-700 bg-red-50' },
  pending:   { label: 'Pending',   color: 'text-amber-700 bg-amber-50' },
};

export default function MerchantsPage() {
  const [search, setSearch] = useState('');
  const [kycFilter, setKycFilter] = useState<Merchant['kycStatus'] | 'all'>('all');

  const filtered = mockMerchants.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.schoolName.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
    const matchKyc = kycFilter === 'all' || m.kycStatus === kycFilter;
    return matchSearch && matchKyc;
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Merchant</h1>
        <p className="text-sm text-gray-500 mt-1">{mockMerchants.length} sekolah terdaftar</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama sekolah atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={kycFilter}
          onChange={(e) => setKycFilter(e.target.value as Merchant['kycStatus'] | 'all')}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Semua Status KYC</option>
          <option value="verified">Terverifikasi</option>
          <option value="pending">Pending</option>
          <option value="under_review">Sedang Direview</option>
          <option value="rejected">Ditolak</option>
          <option value="unverified">Belum KYC</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Sekolah</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Jenjang</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status KYC</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status Akun</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Transaksi</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Revenue</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((m) => {
              const kyc = kycBadge[m.kycStatus];
              const stat = statusBadge[m.status];
              return (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                        <Building2 className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{m.schoolName}</p>
                        <p className="text-xs text-gray-400">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{m.schoolLevel}</td>
                  <td className="px-4 py-3">
                    <span className={clsx('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium', kyc.color)}>
                      <ShieldCheck className="h-3 w-3" />
                      {kyc.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', stat.color)}>
                      {stat.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 font-medium">{m.totalTransactions.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3 text-right text-gray-700 font-medium">{formatCurrency(m.totalRevenue)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/merchants/${m.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      Detail <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">
            Tidak ada merchant yang sesuai filter.
          </div>
        )}
      </div>
    </div>
  );
}
