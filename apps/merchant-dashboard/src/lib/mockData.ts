// Mock data untuk development — diganti dengan API call setelah backend ready

export const mockStats = {
  totalRevenue: 48750000,
  totalTransactions: 1284,
  successRate: 94.2,
  pendingSettlement: 12300000,
  revenueGrowth: 12.5,
  transactionGrowth: 8.3,
};

export const mockRevenueData = [
  { month: 'Sep', revenue: 28500000, transactions: 820 },
  { month: 'Okt', revenue: 32000000, transactions: 950 },
  { month: 'Nov', revenue: 29800000, transactions: 875 },
  { month: 'Des', revenue: 38200000, transactions: 1100 },
  { month: 'Jan', revenue: 41500000, transactions: 1195 },
  { month: 'Feb', revenue: 48750000, transactions: 1284 },
];

export const mockPaymentMethodData = [
  { name: 'Virtual Account', value: 42, color: '#3b82f6' },
  { name: 'QRIS', value: 28, color: '#10b981' },
  { name: 'Transfer Bank', value: 18, color: '#f59e0b' },
  { name: 'E-Wallet', value: 12, color: '#8b5cf6' },
];

export const mockTransactions = [
  {
    id: 'txn_001abc',
    paymentId: 'pay_001',
    studentName: 'Ahmad Fauzi',
    amount: 850000,
    fee: 5000,
    netAmount: 845000,
    status: 'success',
    method: 'virtual_account',
    workflow: 'provider_to_platform',
    description: 'SPP Bulan Februari 2026',
    createdAt: '2026-02-15T09:30:00Z',
  },
  {
    id: 'txn_002def',
    paymentId: 'pay_002',
    studentName: 'Siti Rahayu',
    amount: 1200000,
    fee: 8000,
    netAmount: 1192000,
    status: 'success',
    method: 'qris',
    workflow: 'platform_direct',
    description: 'Uang Kegiatan Semester',
    createdAt: '2026-02-15T10:15:00Z',
  },
  {
    id: 'txn_003ghi',
    paymentId: 'pay_003',
    studentName: 'Budi Santoso',
    amount: 500000,
    fee: 0,
    netAmount: 500000,
    status: 'pending',
    method: 'bank_transfer',
    workflow: 'bank_direct',
    description: 'SPP Bulan Februari 2026',
    createdAt: '2026-02-15T11:00:00Z',
  },
  {
    id: 'txn_004jkl',
    paymentId: 'pay_004',
    studentName: 'Dewi Lestari',
    amount: 750000,
    fee: 5000,
    netAmount: 745000,
    status: 'failed',
    method: 'ewallet',
    workflow: 'provider_to_platform',
    description: 'Pembayaran Seragam',
    createdAt: '2026-02-14T14:30:00Z',
  },
  {
    id: 'txn_005mno',
    paymentId: 'pay_005',
    studentName: 'Rizki Pratama',
    amount: 1500000,
    fee: 10000,
    netAmount: 1490000,
    status: 'success',
    method: 'virtual_account',
    workflow: 'provider_to_platform',
    description: 'Uang Daftar Ulang',
    createdAt: '2026-02-14T16:00:00Z',
  },
];

export const mockSettlements = [
  {
    id: 'stl_001',
    period: 'Feb 1–15, 2026',
    totalAmount: 24375000,
    transactionCount: 642,
    fee: 125000,
    netAmount: 24250000,
    status: 'completed',
    settledAt: '2026-02-16T08:00:00Z',
  },
  {
    id: 'stl_002',
    period: 'Jan 16–31, 2026',
    totalAmount: 20825000,
    transactionCount: 598,
    fee: 100000,
    netAmount: 20725000,
    status: 'completed',
    settledAt: '2026-02-01T08:00:00Z',
  },
  {
    id: 'stl_003',
    period: 'Feb 16–28, 2026',
    totalAmount: 12300000,
    transactionCount: 324,
    fee: 62000,
    netAmount: 12238000,
    status: 'pending',
    settledAt: null,
  },
];

// ─── Reports Mock Data ────────────────────────────────────────────────────────

export const mockReportSummary = {
  totalRevenue: 48750000,
  totalTransactions: 1284,
  successCount: 1209,
  failedCount: 52,
  pendingCount: 23,
  refundedCount: 0,
  successRate: 94.2,
  failureRate: 4.1,
  avgTransactionValue: 37967,
  totalFees: 245000,
  netRevenue: 48505000,
  revenueGrowth: 12.5,
  transactionGrowth: 8.3,
};

// Data harian 30 hari terakhir
export const mockDailyRevenue = Array.from({ length: 30 }, (_, i) => {
  const date = new Date('2026-02-01');
  date.setDate(date.getDate() + i);
  const day = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  const base = 1200000 + Math.random() * 800000;
  const transactions = Math.floor(30 + Math.random() * 30);
  return {
    date: day,
    revenue: Math.round(base),
    transactions,
    success: Math.floor(transactions * 0.92),
    failed: Math.floor(transactions * 0.05),
  };
});

// Data mingguan
export const mockWeeklyRevenue = [
  { period: 'Mg 1 Jan', revenue: 9200000, transactions: 265, success: 249, failed: 16 },
  { period: 'Mg 2 Jan', revenue: 10500000, transactions: 298, success: 281, failed: 17 },
  { period: 'Mg 3 Jan', revenue: 9800000, transactions: 271, success: 255, failed: 16 },
  { period: 'Mg 4 Jan', revenue: 12000000, transactions: 361, success: 340, failed: 21 },
  { period: 'Mg 1 Feb', revenue: 11500000, transactions: 312, success: 294, failed: 18 },
  { period: 'Mg 2 Feb', revenue: 12875000, transactions: 342, success: 323, failed: 19 },
  { period: 'Mg 3 Feb', revenue: 13200000, transactions: 351, success: 331, failed: 20 },
  { period: 'Mg 4 Feb', revenue: 11175000, transactions: 279, success: 261, failed: 18 },
];

// Data bulanan (6 bulan)
export const mockMonthlyRevenue = [
  { period: 'Sep 2025', revenue: 28500000, transactions: 820, success: 772, failed: 48 },
  { period: 'Okt 2025', revenue: 32000000, transactions: 950, success: 895, failed: 55 },
  { period: 'Nov 2025', revenue: 29800000, transactions: 875, success: 824, failed: 51 },
  { period: 'Des 2025', revenue: 38200000, transactions: 1100, success: 1036, failed: 64 },
  { period: 'Jan 2026', revenue: 41500000, transactions: 1195, success: 1125, failed: 70 },
  { period: 'Feb 2026', revenue: 48750000, transactions: 1284, success: 1209, failed: 75 },
];

// Breakdown status transaksi
export const mockStatusBreakdown = [
  { status: 'Berhasil', count: 1209, amount: 46500000, color: '#10b981' },
  { status: 'Gagal', count: 52, amount: 0, color: '#ef4444' },
  { status: 'Menunggu', count: 23, amount: 2250000, color: '#f59e0b' },
];

// Breakdown per metode pembayaran (dengan jumlah)
export const mockMethodBreakdown = [
  { method: 'Virtual Account', count: 539, amount: 20450000, percentage: 42, color: '#3b82f6' },
  { method: 'QRIS', count: 359, amount: 13650000, percentage: 28, color: '#10b981' },
  { method: 'Transfer Bank', count: 231, amount: 8775000, percentage: 18, color: '#f59e0b' },
  { method: 'E-Wallet', count: 154, amount: 5875000, percentage: 12, color: '#8b5cf6' },
];

// Top transaksi
export const mockTopTransactions = [
  { id: 'txn_top1', studentName: 'Rizki Pratama', amount: 5000000, method: 'virtual_account', status: 'success', createdAt: '2026-02-28T09:00:00Z', description: 'Uang Gedung' },
  { id: 'txn_top2', studentName: 'Anisa Maharani', amount: 3500000, method: 'bank_transfer', status: 'success', createdAt: '2026-02-25T14:00:00Z', description: 'Uang Kegiatan Tahunan' },
  { id: 'txn_top3', studentName: 'Fajar Nugroho', amount: 2750000, method: 'virtual_account', status: 'success', createdAt: '2026-02-20T10:30:00Z', description: 'Biaya Ujian + SPP' },
  { id: 'txn_top4', studentName: 'Sari Dewanti', amount: 2500000, method: 'qris', status: 'success', createdAt: '2026-02-18T11:00:00Z', description: 'Daftar Ulang TP 2026' },
  { id: 'txn_top5', studentName: 'Hendra Wijaya', amount: 2200000, method: 'ewallet', status: 'success', createdAt: '2026-02-15T16:00:00Z', description: 'SPP + Ekstrakulikuler' },
];

// ─── Webhook Mock Data ────────────────────────────────────────────────────────

export type WebhookEvent =
  | 'payment.success'
  | 'payment.failed'
  | 'payment.expired'
  | 'payment.refunded'
  | 'settlement.completed'
  | 'invoice.created';

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  status: 'active' | 'inactive';
  secret: string;
  successCount: number;
  failCount: number;
  lastDeliveryAt: string | null;
  lastDeliveryStatus: 'success' | 'failed' | null;
  createdAt: string;
}

export interface WebhookLog {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  status: 'success' | 'failed' | 'pending';
  httpStatus: number | null;
  responseTimeMs: number | null;
  retryCount: number;
  requestPayload: Record<string, unknown>;
  responseBody: string | null;
  errorMessage: string | null;
  nextRetryAt: string | null;
  createdAt: string;
}

export const mockWebhookConfigs: WebhookConfig[] = [
  {
    id: 'wh_001',
    name: 'Production Endpoint',
    url: 'https://sdncontoh01.sch.id/webhook/schoolpay',
    events: ['payment.success', 'payment.failed', 'settlement.completed'],
    status: 'active',
    secret: 'whsec_••••••••••••••••••••••Ab3x',
    successCount: 1198,
    failCount: 11,
    lastDeliveryAt: '2026-02-15T10:31:05Z',
    lastDeliveryStatus: 'success',
    createdAt: '2025-12-01T00:00:00Z',
  },
  {
    id: 'wh_002',
    name: 'Staging Endpoint',
    url: 'https://staging.sdncontoh01.sch.id/webhook',
    events: ['payment.success', 'payment.failed', 'payment.expired', 'payment.refunded'],
    status: 'active',
    secret: 'whsec_••••••••••••••••••••••Xy9z',
    successCount: 87,
    failCount: 3,
    lastDeliveryAt: '2026-02-14T15:22:00Z',
    lastDeliveryStatus: 'failed',
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'wh_003',
    name: 'Monitoring Slack',
    url: 'https://hooks.slack.com/services/T00/B00/xxxx',
    events: ['payment.failed', 'settlement.completed'],
    status: 'inactive',
    secret: 'whsec_••••••••••••••••••••••Mn1p',
    successCount: 45,
    failCount: 0,
    lastDeliveryAt: '2026-01-31T08:00:00Z',
    lastDeliveryStatus: 'success',
    createdAt: '2026-01-15T00:00:00Z',
  },
];

const samplePayload = {
  event: 'payment.success',
  paymentId: 'pay_001abc',
  studentId: 'std_001',
  billId: 'bill_feb_001',
  amount: 850000,
  currency: 'IDR',
  status: 'success',
  method: 'virtual_account',
  workflow: 'provider_to_platform',
  timestamp: '2026-02-15T09:30:00Z',
};

export const mockWebhookLogs: WebhookLog[] = [
  {
    id: 'log_001', webhookId: 'wh_001', event: 'payment.success',
    status: 'success', httpStatus: 200, responseTimeMs: 143, retryCount: 0,
    requestPayload: { ...samplePayload, paymentId: 'pay_001abc' },
    responseBody: '{"received":true}', errorMessage: null, nextRetryAt: null,
    createdAt: '2026-02-15T10:31:05Z',
  },
  {
    id: 'log_002', webhookId: 'wh_001', event: 'payment.success',
    status: 'success', httpStatus: 200, responseTimeMs: 89, retryCount: 0,
    requestPayload: { ...samplePayload, paymentId: 'pay_002def' },
    responseBody: '{"received":true}', errorMessage: null, nextRetryAt: null,
    createdAt: '2026-02-15T10:16:30Z',
  },
  {
    id: 'log_003', webhookId: 'wh_001', event: 'payment.failed',
    status: 'failed', httpStatus: 500, responseTimeMs: 3020, retryCount: 2,
    requestPayload: { ...samplePayload, event: 'payment.failed', status: 'failed', paymentId: 'pay_003ghi' },
    responseBody: '{"error":"Internal Server Error"}',
    errorMessage: 'Server responded with 500. Max retries (3) reached.',
    nextRetryAt: null,
    createdAt: '2026-02-14T14:55:00Z',
  },
  {
    id: 'log_004', webhookId: 'wh_001', event: 'settlement.completed',
    status: 'success', httpStatus: 200, responseTimeMs: 201, retryCount: 0,
    requestPayload: { event: 'settlement.completed', settlementId: 'stl_001', amount: 24250000, timestamp: '2026-02-16T08:00:00Z' },
    responseBody: '{"received":true}', errorMessage: null, nextRetryAt: null,
    createdAt: '2026-02-16T08:00:22Z',
  },
  {
    id: 'log_005', webhookId: 'wh_001', event: 'payment.success',
    status: 'failed', httpStatus: null, responseTimeMs: null, retryCount: 1,
    requestPayload: { ...samplePayload, paymentId: 'pay_004jkl' },
    responseBody: null,
    errorMessage: 'Connection timeout after 30000ms',
    nextRetryAt: '2026-02-15T09:40:00Z',
    createdAt: '2026-02-15T09:30:22Z',
  },
  {
    id: 'log_006', webhookId: 'wh_001', event: 'payment.success',
    status: 'success', httpStatus: 201, responseTimeMs: 312, retryCount: 1,
    requestPayload: { ...samplePayload, paymentId: 'pay_004jkl' },
    responseBody: '{"status":"ok"}',
    errorMessage: null, nextRetryAt: null,
    createdAt: '2026-02-15T09:40:05Z',
  },
  {
    id: 'log_007', webhookId: 'wh_002', event: 'payment.failed',
    status: 'failed', httpStatus: 404, responseTimeMs: 98, retryCount: 3,
    requestPayload: { ...samplePayload, event: 'payment.failed', paymentId: 'pay_005mno' },
    responseBody: '{"error":"Not Found"}',
    errorMessage: 'Server responded with 404. URL mungkin sudah berubah.',
    nextRetryAt: null,
    createdAt: '2026-02-14T15:22:00Z',
  },
  {
    id: 'log_008', webhookId: 'wh_002', event: 'payment.success',
    status: 'success', httpStatus: 200, responseTimeMs: 175, retryCount: 0,
    requestPayload: { ...samplePayload, paymentId: 'pay_006pqr' },
    responseBody: '{"received":true}', errorMessage: null, nextRetryAt: null,
    createdAt: '2026-02-13T11:05:00Z',
  },
];

export const mockApiKeys = [
  {
    id: 'key_001',
    name: 'Production Key',
    prefix: 'spk_live_',
    maskedKey: 'spk_live_****************************Ab3x',
    environment: 'production',
    status: 'active',
    lastUsed: '2026-02-15T10:30:00Z',
    createdAt: '2025-12-01T00:00:00Z',
  },
  {
    id: 'key_002',
    name: 'Development Key',
    prefix: 'spk_test_',
    maskedKey: 'spk_test_****************************Xy9z',
    environment: 'sandbox',
    status: 'active',
    lastUsed: '2026-02-14T15:20:00Z',
    createdAt: '2025-12-01T00:00:00Z',
  },
];
