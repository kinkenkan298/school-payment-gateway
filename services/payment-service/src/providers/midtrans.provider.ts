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

const logger = createLogger('midtrans-provider');

export class MidtransProvider extends BaseProvider {
  private get headers() {
    const token = Buffer.from(`${env.MIDTRANS_SERVER_KEY}:`).toString('base64');
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

    const { externalId, amount, description, payerName, payerEmail, payerPhone, expiredAt } =
      params;

    const expiryDate = expiredAt.toISOString().replace('T', ' ').substring(0, 19) + ' +0700';

    const payload = {
      transaction_details: {
        order_id: externalId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: payerName,
        email: payerEmail,
        phone: payerPhone,
      },
      item_details: [{ id: externalId, price: amount, quantity: 1, name: description }],
      expiry: {
        start_time: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' +0700',
        unit: 'minute',
        duration: Math.ceil((expiredAt.getTime() - Date.now()) / 60000),
      },
    };

    const response = await axios.post(
      'https://app.sandbox.midtrans.com/snap/v1/transactions',
      payload,
      { headers: this.headers },
    );

    logger.info({ externalId, provider: 'midtrans' }, 'Payment created');

    return {
      providerTransactionId: externalId,
      paymentUrl: response.data.redirect_url,
      providerResponse: response.data,
    };
  }

  async checkStatus(externalId: string): Promise<CheckStatusResult> {
    if (env.NODE_ENV === 'development' && !env.MIDTRANS_SERVER_KEY) {
      return {
        providerTransactionId: `MOCK-MIDTRANS-${externalId}`,
        status: 'success',
        amount: 0,
        providerResponse: { mock: true, externalId },
      };
    }

    const response = await axios.get(`${env.MIDTRANS_BASE_URL}/${externalId}/status`, {
      headers: this.headers,
    });

    const statusMap: Record<string, 'success' | 'pending' | 'failed' | 'expired'> = {
      capture: 'success',
      settlement: 'success',
      pending: 'pending',
      deny: 'failed',
      cancel: 'failed',
      expire: 'expired',
    };

    return {
      providerTransactionId: response.data.transaction_id,
      status: statusMap[response.data.transaction_status] || 'failed',
      amount: parseInt(response.data.gross_amount),
      providerResponse: response.data,
    };
  }

  verifyWebhook(payload: Record<string, unknown>, _signature: string): boolean {
    if (env.NODE_ENV === 'development') return true;

    const computedSignature = crypto
      .createHash('sha512')
      .update(
        `${payload.order_id}${payload.status_code}${payload.gross_amount}${env.MIDTRANS_SERVER_KEY}`,
      )
      .digest('hex');
    return computedSignature === payload.signature_key;
  }

  normalizeWebhookStatus(
    payload: Record<string, unknown>,
  ): 'success' | 'pending' | 'failed' | 'expired' {
    const statusMap: Record<string, 'success' | 'pending' | 'failed' | 'expired'> = {
      capture: 'success',
      settlement: 'success',
      pending: 'pending',
      deny: 'failed',
      cancel: 'failed',
      expire: 'expired',
    };
    return statusMap[payload.transaction_status as string] || 'failed';
  }
}
