import { v4 as uuidv4 } from 'uuid';
import { env } from '@/config';

export const generateExternalId = (schoolId: string): string => {
  const timestamp = Date.now();
  const unique = uuidv4().split('-')[0].toUpperCase();
  return `SPG-${schoolId.slice(-6).toUpperCase()}-${timestamp}-${unique}`;
};

export const calculateAdminFee = (amount: number): number => {
  const percentageFee = Math.ceil(amount * (env.ADMIN_FEE_PERCENTAGE / 100));
  return percentageFee + env.ADMIN_FEE_FLAT;
};

export const calculateExpiredAt = (): Date => {
  return new Date(Date.now() + env.PAYMENT_EXPIRY_MINUTES * 60 * 1000);
};
