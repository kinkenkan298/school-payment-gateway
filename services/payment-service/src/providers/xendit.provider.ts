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

const logger = createLogger('xendit-provider');

export class XenditProvider extends BaseProvider {
  private get headers() {
    const token = Buffer.from(`${env.XENDIT_SECRET_KEY}:`).toString('base64');
    return {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult> {
    if (env.NODE_ENV === 'development' && !env.DUITKU_MERCHANT_CODE) {
      return {
        providerTransactionId: `MOCK-DUITKU-${Date.now()}`,
        paymentUrl: `https://sandbox.duitku.com/mock/${params.externalId}`,
        providerResponse: { mock: true, externalId: params.externalId },
      };
    }

    const { externalId, amount, description, payerName, payerEmail, expiredAt } = params;

    const payload = {
      external_id: externalId,
      amount,
      description,
      customer: { given_names: payerName, email: payerEmail },
      success_redirect_url: env.XENDIT_CALLBACK_URL,
      failure_redirect_url: env.XENDIT_CALLBACK_URL,
      invoice_duration: Math.ceil((expiredAt.getTime() - Date.now()) / 1000),
      currency: 'IDR',
    };

    const response = await axios.post(`${env.XENDIT_BASE_URL}/v2/invoices`, payload, {
      headers: this.headers,
    });

    logger.info({ externalId, provider: 'xendit' }, 'Payment created');

    return {
      providerTransactionId: response.data.id,
      paymentUrl: response.data.invoice_url,
      providerResponse: response.data,
    };
  }

  async checkStatus(externalId: string): Promise<CheckStatusResult> {
    if (env.NODE_ENV === 'development' && !env.DUITKU_MERCHANT_CODE) {
      return {
        providerTransactionId: `MOCK-XENDIT-${externalId}`,
        status: 'success',
        amount: 0,
        providerResponse: { mock: true, externalId },
      };
    }

    const response = await axios.get(
      `${env.XENDIT_BASE_URL}/v2/invoices?external_id=${externalId}`,
      { headers: this.headers },
    );

    const invoice = response.data[0];
    const statusMap: Record<string, 'success' | 'pending' | 'failed' | 'expired'> = {
      PAID: 'success',
      PENDING: 'pending',
      EXPIRED: 'expired',
    };

    return {
      providerTransactionId: invoice.id,
      status: statusMap[invoice.status] || 'failed',
      amount: invoice.amount,
      providerResponse: invoice,
    };
  }

  verifyWebhook(_payload: Record<string, unknown>, signature: string): boolean {
    if (env.NODE_ENV === 'development') return true;
    const computedToken = crypto.createHmac('sha256', env.XENDIT_WEBHOOK_TOKEN).digest('hex');
    return computedToken === signature;
  }

  normalizeWebhookStatus(
    payload: Record<string, unknown>,
  ): 'success' | 'pending' | 'failed' | 'expired' {
    const statusMap: Record<string, 'success' | 'pending' | 'failed' | 'expired'> = {
      PAID: 'success',
      PENDING: 'pending',
      EXPIRED: 'expired',
    };
    return statusMap[payload.status as string] || 'failed';
  }
}
