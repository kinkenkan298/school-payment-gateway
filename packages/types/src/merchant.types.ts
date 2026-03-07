export type MerchantStatus = 'active' | 'inactive' | 'suspended' | 'pending';
export type KycStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface Merchant {
  id: string;
  name: string;
  email: string;
  businessName: string;
  businessType: string;
  status: MerchantStatus;
  kycStatus: KycStatus;
  country: string;
  currency: string;
  webhookUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMerchantDto {
  name: string;
  email: string;
  password: string;
  businessName: string;
  businessType: string;
  country: string;
  currency: string;
}
