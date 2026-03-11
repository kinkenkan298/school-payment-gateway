import { useState, useCallback } from 'react';
import { mockWebhookConfigs, mockWebhookLogs } from '@/lib/mockData';
import type { WebhookConfig, WebhookLog } from '@/lib/mockData';

export function useWebhooks() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>(mockWebhookConfigs);
  const [logs] = useState<WebhookLog[]>(mockWebhookLogs);
  const [selectedId, setSelectedId] = useState<string | null>(webhooks[0]?.id ?? null);
  const [loading, setLoading] = useState(false);

  const selected = webhooks.find((w) => w.id === selectedId) ?? null;
  const selectedLogs = logs.filter((l) => l.webhookId === selectedId);

  const createWebhook = useCallback(async (data: Omit<WebhookConfig, 'id' | 'successCount' | 'failCount' | 'lastDeliveryAt' | 'lastDeliveryStatus' | 'createdAt'>) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const newWebhook: WebhookConfig = {
      ...data,
      id: `wh_${Date.now()}`,
      successCount: 0,
      failCount: 0,
      lastDeliveryAt: null,
      lastDeliveryStatus: null,
      createdAt: new Date().toISOString(),
    };
    setWebhooks((prev) => [newWebhook, ...prev]);
    setSelectedId(newWebhook.id);
    setLoading(false);
    return newWebhook;
  }, []);

  const updateWebhook = useCallback(async (id: string, data: Partial<WebhookConfig>) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setWebhooks((prev) => prev.map((w) => (w.id === id ? { ...w, ...data } : w)));
    setLoading(false);
  }, []);

  const deleteWebhook = useCallback(async (id: string) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
    setSelectedId((prev) => (prev === id ? (webhooks.find((w) => w.id !== id)?.id ?? null) : prev));
    setLoading(false);
  }, [webhooks]);

  const testWebhook = useCallback(async (id: string) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    return { success: true, httpStatus: 200, responseTimeMs: 143 };
  }, []);

  return {
    webhooks,
    logs,
    selectedId,
    setSelectedId,
    selected,
    selectedLogs,
    loading,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook,
  };
}
