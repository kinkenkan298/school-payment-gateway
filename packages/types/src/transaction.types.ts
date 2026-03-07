export type TransactionType = 'payment' | 'refund' | 'settlement' | 'fee';

export interface Transaction {
  id: string;
  paymentId: string;
  merchantId: string;
  type: TransactionType;
  amount: number;
  fee: number;
  netAmount: number;
  currency: string;
  description?: string;
  createdAt: Date;
}
