import axios from 'axios';
import crypto from 'crypto';
import { createLogger } from '@school-payment-gateway/shared-lib';
import {
  BaseProvider,
  CreatePaymentParams,
  CreatePaymentResult,
  CheckStatusResult,
} from './base.provider';
import { env } from '@/config';

const logger = createLogger('duitku-provider');

const DUITKU_PAYMENT_METHODS: Record<string, string> = {
  bank_transfer: 'T1', // Bank Transfer
  virtual_account: 'VA', // Virtual Account
  ewallet: 'OV', // OVO
  qris: 'QR', // QRIS
  credit_card: 'VC', // Virtual Credit Card
};

export class DuitkuProvider extends BaseProvider {
  async createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult> {
    if (env.NODE_ENV === 'development' && !env.DUITKU_MERCHANT_CODE) {
      return {
        providerTransactionId: `MOCK-DUITKU-${Date.now()}`,
        paymentUrl: `https://sandbox.duitku.com/mock/${params.externalId}`,
        providerResponse: { mock: true, externalId: params.externalId },
      };
    }

    const { externalId, amount, method, description, payerName, payerEmail, expiredAt } = params;
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const signature = crypto
      .createHash('md5')
      .update(`${env.DUITKU_MERCHANT_CODE}${amount}${externalId}${env.DUITKU_API_KEY}`)
      .digest('hex');

    const expiryMinutes = Math.ceil((expiredAt.getTime() - Date.now()) / 60000);

    const payload = {
      merchantCode: env.DUITKU_MERCHANT_CODE,
      paymentAmount: amount,
      merchantOrderId: externalId,
      productDetails: description,
      email: payerEmail || 'noreply@payment.com',
      customerVaName: payerName,
      paymentMethod: DUITKU_PAYMENT_METHODS[method] || 'T1',
      returnUrl: env.DUITKU_CALLBACK_URL,
      callbackUrl: env.DUITKU_CALLBACK_URL,
      signature,
      expiryPeriod: expiryMinutes,
    };

    const response = await axios.post(`${env.DUITKU_BASE_URL}/merchant/createInvoice`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    logger.info({ externalId, provider: 'duitku' }, 'Payment created');

    return {
      providerTransactionId: response.data.reference,
      paymentUrl: response.data.paymentUrl,
      providerResponse: response.data,
    };
  }

  async checkStatus(externalId: string): Promise<CheckStatusResult> {
    const signature = crypto
      .createHash('md5')
      .update(`${env.DUITKU_MERCHANT_CODE}${externalId}${env.DUITKU_API_KEY}`)
      .digest('hex');

    const response = await axios.post(`${env.DUITKU_BASE_URL}/merchant/transactionStatus`, {
      merchantCode: env.DUITKU_MERCHANT_CODE,
      merchantOrderId: externalId,
      signature,
    });

    const statusMap: Record<string, 'success' | 'pending' | 'failed' | 'expired'> = {
      '00': 'success',
      '01': 'pending',
      '02': 'failed',
    };

    return {
      providerTransactionId: response.data.reference,
      status: statusMap[response.data.statusCode] || 'failed',
      amount: response.data.amount,
      providerResponse: response.data,
    };
  }

  verifyWebhook(payload: Record<string, unknown>, _signature: string): boolean {
    if (env.NODE_ENV === 'development') return true;

    const calculatedSignature = crypto
      .createHash('md5')
      .update(
        `${payload.merchantCode}${payload.amount}${payload.merchantOrderId}${env.DUITKU_API_KEY}`,
      )
      .digest('hex');

    return calculatedSignature === payload.signature;
  }

  normalizeWebhookStatus(
    payload: Record<string, unknown>,
  ): 'success' | 'pending' | 'failed' | 'expired' {
    const statusMap: Record<string, 'success' | 'pending' | 'failed' | 'expired'> = {
      '00': 'success',
      '01': 'pending',
      '02': 'failed',
    };
    return statusMap[payload.resultCode as string] || 'failed';
  }
}
