export type SettlementStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Settlement {
  id: string;
  period: string;
  totalTransactions: number;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  status: SettlementStatus;
  bankName: string;
  accountNumber: string;
  accountName: string;
  scheduledAt: string;
  processedAt: string | null;
  createdAt: string;
}

export interface SettlementSummary {
  pending: number;
  processing: number;
  totalSettled: number;
  nextSettlement: string | null;
}
