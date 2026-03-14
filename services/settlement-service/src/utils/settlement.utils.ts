import { v4 as uuidv4 } from 'uuid';

export const generateBatchId = (schoolId: string): string => {
  const schoolSuffix = schoolId.slice(-6).toUpperCase();
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const uuid = uuidv4().replace(/-/g, '').slice(0, 6).toUpperCase();
  return `STL-${schoolSuffix}-${date}-${uuid}`;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};
