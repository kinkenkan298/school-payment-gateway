'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDateTime } from '@/lib/utils/format';
import { mockApiKeys } from '@/lib/mockData';
import { Key, Plus, Eye, EyeOff, Copy, Trash2, AlertCircle } from 'lucide-react';

export default function ApiKeysPage() {
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  function toggleVisible(id: string) {
    setVisible((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <DashboardLayout
      title="API Keys"
      subtitle="Kelola kunci API untuk integrasi sistem sekolah"
    >
      {/* Header action */}
      <div className="flex items-center justify-between mb-6">
        <div />
        <Button variant="primary">
          <Plus className="h-4 w-4" />
          Buat API Key Baru
        </Button>
      </div>

      {/* Warning */}
      <div className="mb-6 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700">
          Jaga kerahasiaan API key Anda. Jangan bagikan atau commit ke repositori publik. Jika bocor, segera hapus dan buat yang baru.
        </p>
      </div>

      {/* API Keys list */}
      <div className="space-y-4">
        {mockApiKeys.map((key) => (
          <Card key={key.id}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="rounded-lg bg-blue-50 p-2.5 flex-shrink-0">
                  <Key className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-gray-900">{key.name}</p>
                    <Badge variant={key.environment === 'production' ? 'error' : 'info'}>
                      {key.environment === 'production' ? 'Production' : 'Sandbox'}
                    </Badge>
                    <Badge variant={key.status === 'active' ? 'success' : 'neutral'}>
                      {key.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </div>

                  {/* Key display */}
                  <div className="flex items-center gap-2 mt-2">
                    <code className="flex-1 rounded-lg bg-gray-100 px-3 py-2 font-mono text-sm text-gray-700 truncate">
                      {visible[key.id] ? key.maskedKey : key.maskedKey.replace(/[^*]/g, '*').slice(0, 12) + key.maskedKey.slice(-8)}
                    </code>
                    <button
                      onClick={() => toggleVisible(key.id)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                      title={visible[key.id] ? 'Sembunyikan' : 'Tampilkan'}
                    >
                      {visible[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(key.maskedKey)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                      title="Salin"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                    <span>Dibuat: {formatDateTime(key.createdAt)}</span>
                    <span>·</span>
                    <span>Terakhir digunakan: {formatDateTime(key.lastUsed)}</span>
                  </div>
                </div>
              </div>

              <button
                className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors flex-shrink-0"
                title="Hapus API Key"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Docs */}
      <Card className="mt-6">
        <CardHeader title="Cara Menggunakan API Key" />
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Sertakan API key di setiap request HTTP sebagai header Authorization:
          </p>
          <pre className="rounded-lg bg-gray-900 p-4 text-sm text-green-400 overflow-x-auto">
{`POST /api/payments
Authorization: Bearer spk_live_xxxxxxxxxxxxxxxxxxxx
Content-Type: application/json

{
  "studentId": "std_001",
  "billId": "bill_001",
  "amount": 850000,
  "method": "virtual_account",
  "workflow": "provider_to_platform"
}`}
          </pre>
        </div>
      </Card>
    </DashboardLayout>
  );
}
