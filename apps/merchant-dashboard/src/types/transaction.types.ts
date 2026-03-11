export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'success'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'expired';

export type PaymentMethod =
  | 'virtual_account'
  | 'qris'
  | 'ewallet'
  | 'bank_transfer'
  | 'credit_card';

export type WorkflowType =
  | 'provider_to_platform'
  | 'provider_to_merchant'
  | 'h2h';

export interface Transaction {
  id: string;
  studentName: string;
  studentId: string;
  billId: string;
  billDescription: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  workflow: WorkflowType;
  vaNumber?: string;
  qrisCode?: string;
  expiredAt: string;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFilter {
  search?: string;
  status?: PaymentStatus | 'all';
  method?: PaymentMethod | 'all';
  workflow?: WorkflowType | 'all';
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}
