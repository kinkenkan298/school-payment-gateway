import apiClient from './client';
import type { WebhookEvent } from '@/lib/mockData';

export interface CreateWebhookDto {
  name: string;
  url: string;
  events: WebhookEvent[];
}

export interface UpdateWebhookDto extends Partial<CreateWebhookDto> {
  status?: 'active' | 'inactive';
}

export async function getWebhooks() {
  const { data } = await apiClient.get('/api/v1/webhooks');
  return data;
}

export async function createWebhook(dto: CreateWebhookDto) {
  const { data } = await apiClient.post('/api/v1/webhooks', dto);
  return data;
}

export async function updateWebhook(id: string, dto: UpdateWebhookDto) {
  const { data } = await apiClient.put(`/api/v1/webhooks/${id}`, dto);
  return data;
}

export async function deleteWebhook(id: string) {
  const { data } = await apiClient.delete(`/api/v1/webhooks/${id}`);
  return data;
}

export async function getWebhookLogs(id: string, params?: { page?: number; limit?: number }) {
  const { data } = await apiClient.get(`/api/v1/webhooks/${id}/logs`, { params });
  return data;
}

export async function testWebhook(id: string) {
  const { data } = await apiClient.post(`/api/v1/webhooks/${id}/test`);
  return data;
}
