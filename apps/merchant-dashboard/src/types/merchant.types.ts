export type KycStatus = 'unverified' | 'pending' | 'under_review' | 'verified' | 'rejected';
export type MerchantStatus = 'active' | 'suspended' | 'pending';
export type SchoolLevel = 'TK' | 'SD' | 'SMP' | 'SMA' | 'SMK' | 'MA' | 'MTs' | 'Perguruan Tinggi';

export interface Merchant {
  id: string;
  name: string;
  email: string;
  phone: string;
  schoolName: string;
  schoolLevel: SchoolLevel;
  status: MerchantStatus;
  kycStatus: KycStatus;
  logoUrl?: string;
  website?: string;
  address?: string;
  createdAt: string;
}

export interface BankAccount {
  id: string;
  merchantId: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isVerified: boolean;
  createdAt: string;
}
