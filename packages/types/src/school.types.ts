export type SchoolStatus = 'active' | 'inactive' | 'suspended' | 'pending';
export type KycStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
export type SchoolLevel = 'sd' | 'smp' | 'sma' | 'smk';

export interface School {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  level: SchoolLevel;
  npsn: string; // Nomor Pokok Sekolah Nasional
  principalName: string;
  status: SchoolStatus;
  kycStatus: KycStatus;
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankName?: string;
  logoUrl?: string;
  webhookUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSchoolDto {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  level: SchoolLevel;
  npsn: string;
  principalName: string;
}
