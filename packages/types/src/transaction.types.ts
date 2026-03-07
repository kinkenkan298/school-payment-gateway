export type TransactionType = 'payment' | 'refund' | 'settlement' | 'fee';

export interface Transaction {
  id: string;
  paymentId: string;
  schoolId: string;
  studentId: string;
  billId: string;
  type: TransactionType;
  amount: number;
  fee: number;
  netAmount: number;
  currency: string;
  workflow: string;
  description?: string;
  createdAt: Date;
}
