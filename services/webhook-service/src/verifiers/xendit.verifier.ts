import crypto from 'crypto';
import { env } from '@/config';

export const verifyXendit = (_payload: Record<string, unknown>, signature: string): boolean => {
  if (env.NODE_ENV === 'development') return true;

  const computedToken = crypto.createHmac('sha256', env.XENDIT_WEBHOOK_TOKEN).digest('hex');
  return computedToken === signature;
};

export const extractXenditExternalId = (payload: Record<string, unknown>): string => {
  return payload.external_id as string;
};

export const normalizeXenditStatus = (
  payload: Record<string, unknown>,
): 'success' | 'pending' | 'failed' | 'expired' => {
  const statusMap: Record<string, 'success' | 'pending' | 'failed' | 'expired'> = {
    PAID: 'success',
    PENDING: 'pending',
    EXPIRED: 'expired',
  };
  return statusMap[payload.status as string] || 'failed';
};
