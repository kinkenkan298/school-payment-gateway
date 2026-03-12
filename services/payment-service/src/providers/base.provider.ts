import { PaymentMethod } from '@school-payment-gateway/types';

export interface CreatePaymentParams {
  externalId: string;
  amount: number;
  method: PaymentMethod;
  description: string;
  payerName: string;
  payerEmail?: string;
  payerPhone?: string;
  expiredAt: Date;
}

export interface CreatePaymentResult {
  providerTransactionId: string;
  paymentUrl: string;
  providerResponse: Record<string, unknown>;
}

export interface CheckStatusResult {
  providerTransactionId: string;
  status: 'success' | 'pending' | 'failed' | 'expired';
  amount: number;
  providerResponse: Record<string, unknown>;
}

export abstract class BaseProvider {
  abstract createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult>;
  abstract checkStatus(externalId: string): Promise<CheckStatusResult>;
  abstract verifyWebhook(payload: Record<string, unknown>, signature: string): boolean;
  abstract normalizeWebhookStatus(
    payload: Record<string, unknown>,
  ): 'success' | 'pending' | 'failed' | 'expired';
}
