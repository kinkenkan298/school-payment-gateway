export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'success'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'expired';

export type PaymentMethod =
  | 'credit_card'
  | 'bank_transfer'
  | 'ewallet'
  | 'qris'
  | 'virtual_account';

export type PaymentProvider = 'duitku' | 'xendit' | 'midtrans' | 'bank_direct';

// 3 workflow pembayaran
export type PaymentWorkflow =
  | 'provider_to_platform' // Workflow 1: Provider → Platform → Sekolah
  | 'platform_direct' // Workflow 2: Platform → Sekolah
  | 'bank_direct'; // Workflow 3: Bank → Sekolah

export interface Payment {
  id: string;
  schoolId: string;
  studentId: string;
  billId: string;
  externalId: string;
  amount: number;
  adminFee: number;
  totalAmount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  provider: PaymentProvider;
  workflow: PaymentWorkflow;
  description?: string;
  payerName: string;
  payerEmail?: string;
  payerPhone?: string;
  providerResponse?: Record<string, unknown>;
  providerTransactionId?: string;
  expiredAt?: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentDto {
  schoolId: string;
  studentId: string;
  billId: string;
  amount: number;
  method: PaymentMethod;
  provider: PaymentProvider;
  workflow: PaymentWorkflow;
  payerName: string;
  payerEmail?: string;
  payerPhone?: string;
}

export interface ProviderWebhookPayload {
  provider: PaymentProvider;
  externalId: string;
  status: string;
  amount: number;
  rawPayload: Record<string, unknown>;
}
