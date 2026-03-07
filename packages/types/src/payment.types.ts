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

export type PaymentProvider = 'midtrans' | 'xendit' | 'stripe';

export interface Payment {
  id: string;
  merchantId: string;
  externalId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  provider: PaymentProvider;
  description?: string;
  customerEmail?: string;
  customerName?: string;
  metadata?: Record<string, unknown>;
  providerResponse?: Record<string, unknown>;
  expiredAt?: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentDto {
  merchantId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  provider: PaymentProvider;
  description?: string;
  customerEmail?: string;
  customerName?: string;
  metadata?: Record<string, unknown>;
}
