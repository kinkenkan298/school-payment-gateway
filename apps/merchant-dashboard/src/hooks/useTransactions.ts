import { useState, useCallback, useMemo } from 'react';
import { mockTransactions } from '@/lib/mockData';

export type TransactionStatus = 'all' | 'success' | 'pending' | 'failed' | 'expired' | 'refunded';
export type PaymentMethod = 'all' | 'virtual_account' | 'qris' | 'ewallet' | 'bank_transfer';
export type WorkflowType = 'all' | 'provider_to_platform' | 'provider_to_merchant' | 'h2h';

export interface TransactionFilter {
  search: string;
  status: TransactionStatus;
  method: PaymentMethod;
  workflow: WorkflowType;
  dateFrom: string;
  dateTo: string;
}

const DEFAULT_FILTER: TransactionFilter = {
  search: '',
  status: 'all',
  method: 'all',
  workflow: 'all',
  dateFrom: '',
  dateTo: '',
};

const PAGE_SIZE = 10;

export function useTransactions() {
  const [filter, setFilter] = useState<TransactionFilter>(DEFAULT_FILTER);
  const [page, setPage] = useState(1);
  const [loading] = useState(false); // replace with real API state

  const updateFilter = useCallback(<K extends keyof TransactionFilter>(
    key: K,
    value: TransactionFilter[K]
  ) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
    setPage(1); // reset to first page on filter change
  }, []);

  const resetFilter = useCallback(() => {
    setFilter(DEFAULT_FILTER);
    setPage(1);
  }, []);

  const filtered = useMemo(() => {
    return mockTransactions.filter((tx) => {
      const q = filter.search.toLowerCase();
      const matchSearch =
        !q ||
        tx.id.toLowerCase().includes(q) ||
        tx.studentName.toLowerCase().includes(q) ||
        (tx.description ?? '').toLowerCase().includes(q);
      const matchStatus = filter.status === 'all' || tx.status === filter.status;
      const matchMethod = filter.method === 'all' || tx.method === filter.method;
      const matchWorkflow = filter.workflow === 'all' || tx.workflow === filter.workflow;
      const matchDateFrom = !filter.dateFrom || new Date(tx.createdAt) >= new Date(filter.dateFrom);
      const matchDateTo = !filter.dateTo || new Date(tx.createdAt) <= new Date(filter.dateTo + 'T23:59:59');
      return matchSearch && matchStatus && matchMethod && matchWorkflow && matchDateFrom && matchDateTo;
    });
  }, [filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return {
    transactions: paginated,
    allFiltered: filtered,
    filter,
    updateFilter,
    resetFilter,
    page,
    setPage,
    totalPages,
    totalCount: filtered.length,
    loading,
  };
}
