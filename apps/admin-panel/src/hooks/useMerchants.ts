import { useState, useMemo, useCallback } from 'react';
import { mockMerchants } from '@/lib/mockData';
import type { Merchant } from '@/lib/mockData';

export type MerchantKycFilter = Merchant['kycStatus'] | 'all';
export type MerchantStatusFilter = Merchant['status'] | 'all';

export interface MerchantFilter {
  search: string;
  kycStatus: MerchantKycFilter;
  status: MerchantStatusFilter;
}

const DEFAULT_FILTER: MerchantFilter = {
  search: '',
  kycStatus: 'all',
  status: 'all',
};

export function useMerchants() {
  const [merchants, setMerchants] = useState<Merchant[]>(mockMerchants);
  const [filter, setFilter] = useState<MerchantFilter>(DEFAULT_FILTER);
  const [loading, setLoading] = useState(false);

  const updateFilter = useCallback(<K extends keyof MerchantFilter>(
    key: K,
    value: MerchantFilter[K]
  ) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  }, []);

  const filtered = useMemo(() => {
    return merchants.filter((m) => {
      const q = filter.search.toLowerCase();
      const matchSearch =
        !q ||
        m.schoolName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.phone.includes(q);
      const matchKyc = filter.kycStatus === 'all' || m.kycStatus === filter.kycStatus;
      const matchStatus = filter.status === 'all' || m.status === filter.status;
      return matchSearch && matchKyc && matchStatus;
    });
  }, [merchants, filter]);

  const suspendMerchant = useCallback(async (id: string) => {
    setLoading(true);
    // TODO: PATCH /api/v1/admin/merchants/:id/suspend
    await new Promise((r) => setTimeout(r, 700));
    setMerchants((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'suspended' as const } : m))
    );
    setLoading(false);
  }, []);

  const activateMerchant = useCallback(async (id: string) => {
    setLoading(true);
    // TODO: PATCH /api/v1/admin/merchants/:id/activate
    await new Promise((r) => setTimeout(r, 700));
    setMerchants((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'active' as const } : m))
    );
    setLoading(false);
  }, []);

  const stats = useMemo(() => ({
    total: merchants.length,
    active: merchants.filter((m) => m.status === 'active').length,
    suspended: merchants.filter((m) => m.status === 'suspended').length,
    pendingKyc: merchants.filter((m) => m.kycStatus === 'pending' || m.kycStatus === 'under_review').length,
  }), [merchants]);

  return {
    merchants: filtered,
    allMerchants: merchants,
    filter,
    updateFilter,
    loading,
    stats,
    suspendMerchant,
    activateMerchant,
  };
}
