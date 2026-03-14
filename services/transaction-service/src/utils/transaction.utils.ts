import { v4 as uuidv4 } from 'uuid';

export const generateReference = (schoolId: string, type: string): string => {
  const schoolSuffix = schoolId.slice(-6).toUpperCase();
  const timestamp = Date.now();
  const uuid = uuidv4().replace(/-/g, '').slice(0, 8).toUpperCase();
  const prefix = type === 'fee' ? 'FEE' : type === 'refund' ? 'REF' : 'TXN';
  return `${prefix}-${schoolSuffix}-${timestamp}-${uuid}`;
};
