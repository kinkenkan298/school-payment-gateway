import apiClient from './client';

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface TransactionFilter {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  method?: string;
  workflow?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export async function getTransactions(params: TransactionFilter = {}) {
  const { data } = await apiClient.get<PaginatedResponse<Transaction>>('/api/transactions', { params });
  return data;
}

export interface Transaction {
  id: string;
  paymentId: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  billId: string;
  type: string;
  amount: number;
  fee: number;
  netAmount: number;
  currency: string;
  status: string;
  method: string;
  workflow: string;
  description?: string;
  createdAt: string;
}
