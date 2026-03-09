// Mock data untuk admin-panel development

export const mockAdminStats = {
  totalMerchants: 48,
  activeMerchants: 42,
  pendingKyc: 7,
  totalTransactionsToday: 324,
  revenueToday: 185_600_000,
  totalRevenueMtd: 2_847_500_000,
  systemFeesMtd: 14_237_500,
  failedTransactionsToday: 12,
};

export interface Merchant {
  id: string;
  schoolName: string;
  email: string;
  phone: string;
  schoolLevel: string;
  status: 'active' | 'suspended' | 'pending';
  kycStatus: 'unverified' | 'pending' | 'under_review' | 'verified' | 'rejected';
  totalTransactions: number;
  totalRevenue: number;
  createdAt: string;
}

export const mockMerchants: Merchant[] = [
  { id: 'mc_001', schoolName: 'SDN Contoh 01', email: 'admin@sdncontoh01.sch.id', phone: '082111000001', schoolLevel: 'SD', status: 'active', kycStatus: 'verified', totalTransactions: 1284, totalRevenue: 48_750_000, createdAt: '2025-12-01T00:00:00Z' },
  { id: 'mc_002', schoolName: 'SMPN Maju Jaya', email: 'admin@smpnmajujaya.sch.id', phone: '082111000002', schoolLevel: 'SMP', status: 'active', kycStatus: 'verified', totalTransactions: 876, totalRevenue: 32_400_000, createdAt: '2025-12-05T00:00:00Z' },
  { id: 'mc_003', schoolName: 'SMAN 1 Harapan', email: 'admin@sman1harapan.sch.id', phone: '082111000003', schoolLevel: 'SMA', status: 'active', kycStatus: 'under_review', totalTransactions: 0, totalRevenue: 0, createdAt: '2026-01-10T00:00:00Z' },
  { id: 'mc_004', schoolName: 'SMK Teknik Mandiri', email: 'admin@smkteknikmandiri.sch.id', phone: '082111000004', schoolLevel: 'SMK', status: 'pending', kycStatus: 'pending', totalTransactions: 0, totalRevenue: 0, createdAt: '2026-02-01T00:00:00Z' },
  { id: 'mc_005', schoolName: 'MTs Al-Hikmah', email: 'admin@mtsalhikmah.sch.id', phone: '082111000005', schoolLevel: 'SMP', status: 'active', kycStatus: 'verified', totalTransactions: 512, totalRevenue: 19_200_000, createdAt: '2025-12-20T00:00:00Z' },
  { id: 'mc_006', schoolName: 'SD Islam Terpadu', email: 'admin@sdit-nur.sch.id', phone: '082111000006', schoolLevel: 'SD', status: 'suspended', kycStatus: 'rejected', totalTransactions: 88, totalRevenue: 3_200_000, createdAt: '2025-11-15T00:00:00Z' },
  { id: 'mc_007', schoolName: 'MA Darul Ulum', email: 'admin@madarululum.sch.id', phone: '082111000007', schoolLevel: 'SMA', status: 'pending', kycStatus: 'pending', totalTransactions: 0, totalRevenue: 0, createdAt: '2026-02-10T00:00:00Z' },
];

export interface KycReviewItem {
  id: string;
  merchantId: string;
  schoolName: string;
  email: string;
  submittedAt: string;
  documents: { type: string; label: string; url: string }[];
}

export const mockKycQueue: KycReviewItem[] = [
  {
    id: 'kyc_001', merchantId: 'mc_003', schoolName: 'SMAN 1 Harapan', email: 'admin@sman1harapan.sch.id',
    submittedAt: '2026-02-14T09:00:00Z',
    documents: [
      { type: 'ktp_kepala_sekolah', label: 'KTP Kepala Sekolah', url: '#' },
      { type: 'npwp_sekolah', label: 'NPWP Sekolah', url: '#' },
      { type: 'akta_pendirian', label: 'Akta Pendirian', url: '#' },
      { type: 'sk_kemendikbud', label: 'SK Kemendikbud', url: '#' },
    ],
  },
  {
    id: 'kyc_002', merchantId: 'mc_004', schoolName: 'SMK Teknik Mandiri', email: 'admin@smkteknikmandiri.sch.id',
    submittedAt: '2026-02-15T14:30:00Z',
    documents: [
      { type: 'ktp_kepala_sekolah', label: 'KTP Kepala Sekolah', url: '#' },
      { type: 'npwp_sekolah', label: 'NPWP Sekolah', url: '#' },
      { type: 'akta_pendirian', label: 'Akta Pendirian', url: '#' },
      { type: 'sk_kemendikbud', label: 'SK Kemendikbud', url: '#' },
    ],
  },
  {
    id: 'kyc_003', merchantId: 'mc_007', schoolName: 'MA Darul Ulum', email: 'admin@madarululum.sch.id',
    submittedAt: '2026-02-16T08:00:00Z',
    documents: [
      { type: 'ktp_kepala_sekolah', label: 'KTP Kepala Sekolah', url: '#' },
      { type: 'npwp_sekolah', label: 'NPWP Sekolah', url: '#' },
      { type: 'akta_pendirian', label: 'Akta Pendirian', url: '#' },
      { type: 'sk_kemendikbud', label: 'SK Kemendikbud', url: '#' },
    ],
  },
];

export const mockRevenueChartData = [
  { month: 'Sep', revenue: 820_000_000, merchants: 31 },
  { month: 'Okt', revenue: 1_120_000_000, merchants: 35 },
  { month: 'Nov', revenue: 980_000_000, merchants: 38 },
  { month: 'Des', revenue: 1_540_000_000, merchants: 41 },
  { month: 'Jan', revenue: 2_100_000_000, merchants: 44 },
  { month: 'Feb', revenue: 2_847_500_000, merchants: 48 },
];

export interface AdminTransaction {
  id: string;
  merchantName: string;
  studentName: string;
  amount: number;
  fee: number;
  status: 'success' | 'failed' | 'pending' | 'expired';
  method: string;
  createdAt: string;
}

export const mockAdminTransactions: AdminTransaction[] = [
  { id: 'txn_a001', merchantName: 'SDN Contoh 01', studentName: 'Ahmad Fauzi', amount: 850_000, fee: 5_000, status: 'success', method: 'Virtual Account', createdAt: '2026-02-16T09:30:00Z' },
  { id: 'txn_a002', merchantName: 'SMPN Maju Jaya', studentName: 'Siti Rahayu', amount: 1_200_000, fee: 8_000, status: 'success', method: 'QRIS', createdAt: '2026-02-16T09:15:00Z' },
  { id: 'txn_a003', merchantName: 'MTs Al-Hikmah', studentName: 'Budi Santoso', amount: 650_000, fee: 5_000, status: 'pending', method: 'Transfer Bank', createdAt: '2026-02-16T09:00:00Z' },
  { id: 'txn_a004', merchantName: 'SDN Contoh 01', studentName: 'Dewi Putri', amount: 950_000, fee: 6_500, status: 'success', method: 'E-Wallet', createdAt: '2026-02-16T08:45:00Z' },
  { id: 'txn_a005', merchantName: 'SMPN Maju Jaya', studentName: 'Eko Prasetyo', amount: 750_000, fee: 5_000, status: 'failed', method: 'Virtual Account', createdAt: '2026-02-16T08:30:00Z' },
  { id: 'txn_a006', merchantName: 'MTs Al-Hikmah', studentName: 'Fitri Handayani', amount: 1_100_000, fee: 7_500, status: 'success', method: 'QRIS', createdAt: '2026-02-16T08:15:00Z' },
];
