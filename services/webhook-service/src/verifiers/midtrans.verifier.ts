import crypto from 'crypto';
import { env } from '@/config';

export const verifyMidtrans = (payload: Record<string, unknown>): boolean => {
  if (env.NODE_ENV === 'development') return true;

  const computedSignature = crypto
    .createHash('sha512')
    .update(
      `${payload.order_id}${payload.status_code}${payload.gross_amount}${env.MIDTRANS_SERVER_KEY}`,
    )
    .digest('hex');
  return computedSignature === payload.signature_key;
};

export const extractMidtransExternalId = (payload: Record<string, unknown>): string => {
  return payload.order_id as string;
};

export const normalizeMidtransStatus = (
  payload: Record<string, unknown>,
): 'success' | 'pending' | 'failed' | 'expired' => {
  const statusMap: Record<string, 'success' | 'pending' | 'failed' | 'expired'> = {
    capture: 'success',
    settlement: 'success',
    pending: 'pending',
    deny: 'failed',
    cancel: 'failed',
    expire: 'expired',
  };
  return statusMap[payload.transaction_status as string] || 'failed';
};
