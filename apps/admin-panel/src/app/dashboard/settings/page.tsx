'use client';

import { useState } from 'react';
import { Save, Globe, CreditCard, Bell, Shield, Server } from 'lucide-react';
import { clsx } from 'clsx';

type Tab = 'general' | 'payment' | 'notification' | 'security' | 'system';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'general',      label: 'Umum',          icon: <Globe className="h-4 w-4" /> },
  { id: 'payment',      label: 'Pembayaran',     icon: <CreditCard className="h-4 w-4" /> },
  { id: 'notification', label: 'Notifikasi',     icon: <Bell className="h-4 w-4" /> },
  { id: 'security',     label: 'Keamanan',       icon: <Shield className="h-4 w-4" /> },
  { id: 'system',       label: 'Sistem',         icon: <Server className="h-4 w-4" /> },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
        checked ? 'bg-blue-600' : 'bg-gray-200'
      )}
    >
      <span className={clsx('inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
        checked ? 'translate-x-6' : 'translate-x-1')} />
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [saved, setSaved] = useState(false);

  // General
  const [platformName, setPlatformName] = useState('School Pay');
  const [supportEmail, setSupportEmail] = useState('support@schoolpay.id');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Payment
  const [platformFeePercent, setPlatformFeePercent] = useState('0.5');
  const [maxTransactionAmount, setMaxTransactionAmount] = useState('50000000');
  const [settlementSchedule, setSettlementSchedule] = useState('twice_monthly');
  const [autoSettlement, setAutoSettlement] = useState(true);

  // Notification
  const [emailNewMerchant, setEmailNewMerchant] = useState(true);
  const [emailKycSubmit, setEmailKycSubmit] = useState(true);
  const [emailFraudAlert, setEmailFraudAlert] = useState(true);
  const [emailSettlement, setEmailSettlement] = useState(false);

  // Security
  const [require2fa, setRequire2fa] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [ipWhitelist, setIpWhitelist] = useState('');

  // System
  const [logLevel, setLogLevel] = useState('info');
  const [rateLimitPerMin, setRateLimitPerMin] = useState('100');

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan Sistem</h1>
          <p className="text-sm text-gray-500 mt-1">Konfigurasi global platform School Pay</p>
        </div>
        <button
          onClick={handleSave}
          className={clsx(
            'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            saved ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'
          )}
        >
          <Save className="h-4 w-4" />
          {saved ? 'Tersimpan!' : 'Simpan'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={clsx(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              activeTab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'general' && (
        <div className="space-y-4">
          <Section title="Informasi Platform">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Platform</label>
                <input value={platformName} onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Support</label>
                <input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} type="email"
                  className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </Section>
          <Section title="Mode Maintenance">
            <Field label="Aktifkan Maintenance Mode" hint="Semua request dari merchant akan diblokir sementara">
              <Toggle checked={maintenanceMode} onChange={setMaintenanceMode} />
            </Field>
            {maintenanceMode && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
                ⚠️ Maintenance mode aktif — merchant tidak dapat melakukan transaksi saat ini.
              </div>
            )}
          </Section>
        </div>
      )}

      {activeTab === 'payment' && (
        <div className="space-y-4">
          <Section title="Konfigurasi Fee">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform Fee (%)</label>
                <div className="flex items-center gap-2">
                  <input type="number" min="0" max="10" step="0.1" value={platformFeePercent}
                    onChange={(e) => setPlatformFeePercent(e.target.value)}
                    className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <span className="text-sm text-gray-500">% per transaksi</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maks. Transaksi (IDR)</label>
                <input type="number" value={maxTransactionAmount} onChange={(e) => setMaxTransactionAmount(e.target.value)}
                  className="w-48 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </Section>
          <Section title="Settlement">
            <div className="space-y-3">
              <Field label="Auto Settlement" hint="Proses settlement otomatis sesuai jadwal">
                <Toggle checked={autoSettlement} onChange={setAutoSettlement} />
              </Field>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jadwal Settlement</label>
                <select value={settlementSchedule} onChange={(e) => setSettlementSchedule(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="daily">Harian (setiap hari pukul 08.00)</option>
                  <option value="twice_monthly">2x sebulan (tgl 1 & 16)</option>
                  <option value="monthly">Bulanan (tgl 1)</option>
                </select>
              </div>
            </div>
          </Section>
        </div>
      )}

      {activeTab === 'notification' && (
        <Section title="Notifikasi Email Admin">
          <div className="space-y-4">
            {[
              { label: 'Merchant baru mendaftar', hint: 'Terima email saat ada merchant baru',         checked: emailNewMerchant, onChange: setEmailNewMerchant },
              { label: 'KYC baru disubmit',       hint: 'Terima email saat ada pengajuan KYC baru',   checked: emailKycSubmit,   onChange: setEmailKycSubmit },
              { label: 'Fraud alert kritis',       hint: 'Terima email saat ada fraud score > 80',    checked: emailFraudAlert,  onChange: setEmailFraudAlert },
              { label: 'Settlement selesai',       hint: 'Terima email konfirmasi settlement berhasil', checked: emailSettlement,  onChange: setEmailSettlement },
            ].map((item) => (
              <Field key={item.label} label={item.label} hint={item.hint}>
                <Toggle checked={item.checked} onChange={item.onChange} />
              </Field>
            ))}
          </div>
        </Section>
      )}

      {activeTab === 'security' && (
        <div className="space-y-4">
          <Section title="Autentikasi">
            <div className="space-y-4">
              <Field label="Wajib 2FA untuk semua admin" hint="Semua akun admin harus mengaktifkan 2-Factor Authentication">
                <Toggle checked={require2fa} onChange={setRequire2fa} />
              </Field>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timeout Sesi (menit)</label>
                <input type="number" min="5" max="480" value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)}
                  className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </Section>
          <Section title="IP Whitelist">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IP yang diizinkan akses Admin Panel
              </label>
              <p className="text-xs text-gray-400 mb-2">Kosongkan untuk mengizinkan semua IP. Pisahkan dengan baris baru.</p>
              <textarea rows={4} value={ipWhitelist} onChange={(e) => setIpWhitelist(e.target.value)}
                placeholder="192.168.1.1&#10;10.0.0.0/24"
                className="w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </Section>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="space-y-4">
          <Section title="Logging & Monitoring">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Log Level</label>
                <select value={logLevel} onChange={(e) => setLogLevel(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="error">error</option>
                  <option value="warn">warn</option>
                  <option value="info">info</option>
                  <option value="debug">debug</option>
                </select>
              </div>
            </div>
          </Section>
          <Section title="Rate Limiting">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maks. Request per Menit (API Gateway)</label>
              <div className="flex items-center gap-2">
                <input type="number" min="10" max="1000" value={rateLimitPerMin} onChange={(e) => setRateLimitPerMin(e.target.value)}
                  className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <span className="text-sm text-gray-500">req/menit per IP</span>
              </div>
            </div>
          </Section>
          <Section title="Informasi Build">
            <div className="space-y-2 text-sm">
              {[
                { label: 'Versi', value: '1.0.0' },
                { label: 'Next.js', value: '16.x' },
                { label: 'Node.js', value: '18.x' },
                { label: 'Environment', value: 'Development' },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                  <span className="text-gray-500">{r.label}</span>
                  <span className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{r.value}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}
