'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Building2, CreditCard, Bell, Globe, Shield } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <DashboardLayout title="Pengaturan" subtitle="Konfigurasi akun dan preferensi sekolah">
      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <div className="w-56 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-4 w-4 flex-shrink-0" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'bank' && <BankSettings />}
          {activeTab === 'webhook' && <WebhookSettings />}
          {activeTab === 'notification' && <NotificationSettings />}
          {activeTab === 'security' && <SecuritySettings />}
        </div>
      </div>
    </DashboardLayout>
  );
}

const tabs = [
  { id: 'profile', label: 'Profil Sekolah', icon: Building2 },
  { id: 'bank', label: 'Rekening Bank', icon: CreditCard },
  { id: 'webhook', label: 'Webhook', icon: Globe },
  { id: 'notification', label: 'Notifikasi', icon: Bell },
  { id: 'security', label: 'Keamanan', icon: Shield },
];

function ProfileSettings() {
  return (
    <Card>
      <CardHeader title="Profil Sekolah" subtitle="Informasi dasar tentang sekolah Anda" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Nama Sekolah" defaultValue="SDN Contoh 01" />
        <Input label="NPSN" defaultValue="12345678" />
        <Input label="Email" type="email" defaultValue="admin@sdncontoh01.sch.id" />
        <Input label="No. Telepon" defaultValue="021-12345678" />
        <Select
          label="Jenjang"
          options={[
            { value: 'sd', label: 'SD / MI' },
            { value: 'smp', label: 'SMP / MTs' },
            { value: 'sma', label: 'SMA / MA' },
            { value: 'smk', label: 'SMK' },
          ]}
          defaultValue="sd"
        />
        <Input label="Nama Kepala Sekolah" defaultValue="Bapak Contoh, S.Pd" />
        <div className="sm:col-span-2">
          <Input label="Alamat" defaultValue="Jl. Pendidikan No. 1, Jakarta Pusat" />
        </div>
        <Input label="Kota" defaultValue="Jakarta Pusat" />
        <Input label="Provinsi" defaultValue="DKI Jakarta" />
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="primary">Simpan Perubahan</Button>
      </div>
    </Card>
  );
}

function BankSettings() {
  return (
    <Card>
      <CardHeader title="Rekening Bank" subtitle="Rekening tujuan pencairan dana settlement" />
      <div className="mb-4 flex items-center gap-2">
        <Badge variant="success">Terverifikasi</Badge>
        <span className="text-sm text-gray-500">Rekening sudah diverifikasi oleh tim School Pay</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Bank"
          options={[
            { value: 'bca', label: 'Bank BCA' },
            { value: 'mandiri', label: 'Bank Mandiri' },
            { value: 'bni', label: 'Bank BNI' },
            { value: 'bri', label: 'Bank BRI' },
          ]}
          defaultValue="bca"
        />
        <Input label="No. Rekening" defaultValue="1234567890" />
        <div className="sm:col-span-2">
          <Input label="Nama Pemilik Rekening" defaultValue="SDN Contoh 01" />
        </div>
      </div>
      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
        Perubahan rekening bank memerlukan verifikasi ulang oleh tim School Pay (1–3 hari kerja).
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="primary">Ajukan Perubahan</Button>
      </div>
    </Card>
  );
}

function WebhookSettings() {
  return (
    <Card>
      <CardHeader title="Webhook" subtitle="URL callback untuk notifikasi status pembayaran" />
      <div className="space-y-4">
        <Input
          label="Webhook URL"
          type="url"
          placeholder="https://sekolah.sch.id/webhook/payment"
          defaultValue="https://sdncontoh01.sch.id/webhook/schoolpay"
        />
        <div className="rounded-lg bg-gray-900 p-4 text-xs text-gray-300 font-mono overflow-x-auto">
          <p className="text-gray-400 mb-2">// Contoh payload webhook yang akan dikirim:</p>
          <pre>{`{
  "event": "payment.success",
  "paymentId": "pay_001",
  "studentId": "std_001",
  "amount": 850000,
  "status": "success",
  "timestamp": "2026-02-15T09:30:00Z"
}`}</pre>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary">Test Webhook</Button>
          <Button variant="primary">Simpan URL</Button>
        </div>
      </div>
    </Card>
  );
}

function NotificationSettings() {
  return (
    <Card>
      <CardHeader title="Notifikasi" subtitle="Atur kapan Anda ingin diberitahu" />
      <div className="space-y-4">
        {[
          { label: 'Transaksi berhasil', desc: 'Notifikasi setiap ada pembayaran berhasil' },
          { label: 'Transaksi gagal', desc: 'Notifikasi jika ada pembayaran yang gagal' },
          { label: 'Settlement selesai', desc: 'Notifikasi saat dana sudah ditransfer' },
          { label: 'Laporan mingguan', desc: 'Ringkasan aktivitas setiap Senin pagi' },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <div>
              <p className="text-sm font-medium text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
            </label>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="primary">Simpan Preferensi</Button>
      </div>
    </Card>
  );
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Ubah Password" subtitle="Gunakan password yang kuat dan unik" />
        <div className="space-y-4">
          <Input label="Password Saat Ini" type="password" />
          <Input label="Password Baru" type="password" />
          <Input label="Konfirmasi Password Baru" type="password" />
          <div className="flex justify-end">
            <Button variant="primary">Ubah Password</Button>
          </div>
        </div>
      </Card>
      <Card>
        <CardHeader title="Two-Factor Authentication" subtitle="Tambahkan lapisan keamanan ekstra" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">2FA saat ini <span className="text-red-600 font-medium">nonaktif</span></p>
            <p className="text-xs text-gray-400 mt-0.5">Aktifkan untuk keamanan akun yang lebih baik</p>
          </div>
          <Button variant="secondary">Aktifkan 2FA</Button>
        </div>
      </Card>
    </div>
  );
}
