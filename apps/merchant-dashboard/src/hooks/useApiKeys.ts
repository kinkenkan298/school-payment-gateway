import { useState, useCallback } from 'react';
import { mockApiKeys } from '@/lib/mockData';

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  maskedKey: string;
  environment: 'production' | 'sandbox';
  status: 'active' | 'revoked';
  lastUsed: string;
  createdAt: string;
}

export function useApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>(mockApiKeys as ApiKey[]);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleVisibility = useCallback((id: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const copyKey = useCallback(async (id: string, key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback: ignore
    }
  }, []);

  const revokeKey = useCallback(async (id: string) => {
    setLoading(true);
    // TODO: call DELETE /api/v1/api-keys/:id
    await new Promise((r) => setTimeout(r, 600));
    setKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: 'revoked' as const } : k))
    );
    setLoading(false);
  }, []);

  const createKey = useCallback(async (name: string, environment: 'production' | 'sandbox') => {
    setLoading(true);
    // TODO: call POST /api/v1/api-keys
    await new Promise((r) => setTimeout(r, 800));
    const newKey: ApiKey = {
      id: `key_${Date.now()}`,
      name,
      prefix: environment === 'production' ? 'spk_live_' : 'spk_test_',
      maskedKey: `${environment === 'production' ? 'spk_live_' : 'spk_test_'}****************************NewK`,
      environment,
      status: 'active',
      lastUsed: '-',
      createdAt: new Date().toISOString(),
    };
    setKeys((prev) => [newKey, ...prev]);
    setLoading(false);
    return newKey;
  }, []);

  return {
    keys,
    visibleKeys,
    copiedId,
    loading,
    toggleVisibility,
    copyKey,
    revokeKey,
    createKey,
  };
}
