import crypto from 'crypto';
import { env } from '@/config';

export const verifyDuitku = (payload: Record<string, unknown>): boolean => {
  if (env.NODE_ENV === 'development') return true;

  const calculatedSignature = crypto
    .createHash('md5')
    .update(
      `${payload.merchantCode}${payload.amount}${payload.merchantOrderId}${env.DUITKU_API_KEY}`,
    )
    .digest('hex');

  return calculatedSignature === payload.signature;
};

export const extractDuitkuExternalId = (payload: Record<string, unknown>): string => {
  return payload.merchantOrderId as string;
};

export const normalizeDuitkuStatus = (
  payload: Record<string, unknown>,
): 'success' | 'pending' | 'failed' | 'expired' => {
  const statusMap: Record<string, 'success' | 'pending' | 'failed' | 'expired'> = {
    '00': 'success',
    '01': 'pending',
    '02': 'failed',
  };
  return statusMap[payload.resultCode as string] || 'failed';
};
