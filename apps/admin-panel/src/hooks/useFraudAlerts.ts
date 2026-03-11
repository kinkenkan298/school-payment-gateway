import { useState, useCallback, useEffect } from 'react';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed';

export interface FraudAlert {
  id: string;
  transactionId: string;
  merchantName: string;
  amount: number;
  riskScore: number;
  riskLevel: RiskLevel;
  reasons: string[];
  status: AlertStatus;
  createdAt: string;
}

// Mock fraud alerts data
const MOCK_ALERTS: FraudAlert[] = [
  {
    id: 'alert_001',
    transactionId: 'txn_x001',
    merchantName: 'SDN Contoh 01',
    amount: 15_000_000,
    riskScore: 87,
    riskLevel: 'critical',
    reasons: ['Jumlah transaksi melebihi rata-rata 10x', 'Kartu dari negara berisiko tinggi', 'Velocity check gagal'],
    status: 'open',
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 'alert_002',
    transactionId: 'txn_x002',
    merchantName: 'SMPN Maju Jaya',
    amount: 4_500_000,
    riskScore: 65,
    riskLevel: 'high',
    reasons: ['3 transaksi dalam 2 menit dari IP yang sama', 'Pola transaksi tidak normal'],
    status: 'reviewing',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 'alert_003',
    transactionId: 'txn_x003',
    merchantName: 'MTs Al-Hikmah',
    amount: 2_100_000,
    riskScore: 45,
    riskLevel: 'medium',
    reasons: ['Device fingerprint baru', 'Lokasi berbeda dari biasanya'],
    status: 'open',
    createdAt: new Date(Date.now() - 32 * 60000).toISOString(),
  },
  {
    id: 'alert_004',
    transactionId: 'txn_x004',
    merchantName: 'SDN Contoh 01',
    amount: 750_000,
    riskScore: 20,
    riskLevel: 'low',
    reasons: ['IP masuk daftar pantau'],
    status: 'resolved',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
];

const AUTO_REFRESH_MS = 30_000; // SOP: auto-refresh 30 detik

export function useFraudAlerts(autoRefresh = true) {
  const [alerts, setAlerts] = useState<FraudAlert[]>(MOCK_ALERTS);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const refresh = useCallback(async () => {
    setLoading(true);
    // TODO: GET /api/v1/admin/fraud/alerts
    await new Promise((r) => setTimeout(r, 500));
    setLastRefreshed(new Date());
    setLoading(false);
  }, []);

  // Auto-refresh setiap 30 detik per SOP
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(refresh, AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, [autoRefresh, refresh]);

  const resolveAlert = useCallback(async (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'resolved' as const } : a))
    );
  }, []);

  const dismissAlert = useCallback(async (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'dismissed' as const } : a))
    );
  }, []);

  const markReviewing = useCallback(async (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'reviewing' as const } : a))
    );
  }, []);

  const openAlerts = alerts.filter((a) => a.status === 'open');
  const criticalCount = openAlerts.filter((a) => a.riskLevel === 'critical').length;

  return {
    alerts,
    openAlerts,
    criticalCount,
    loading,
    lastRefreshed,
    refresh,
    resolveAlert,
    dismissAlert,
    markReviewing,
  };
}
