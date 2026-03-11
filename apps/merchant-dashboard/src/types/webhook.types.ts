export type WebhookEvent =
  | 'payment.success'
  | 'payment.failed'
  | 'payment.expired'
  | 'payment.refunded'
  | 'settlement.completed'
  | 'payout.success'
  | 'payout.failed';

export type WebhookStatus = 'active' | 'inactive';
export type DeliveryStatus = 'success' | 'failed' | 'pending';

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  status: WebhookStatus;
  secret: string;
  successCount: number;
  failCount: number;
  lastDeliveryAt: string | null;
  lastDeliveryStatus: DeliveryStatus | null;
  createdAt: string;
}

export interface WebhookLog {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  status: DeliveryStatus;
  httpStatus: number | null;
  responseTimeMs: number | null;
  retryCount: number;
  requestPayload: Record<string, unknown>;
  responseBody: string | null;
  errorMessage: string | null;
  nextRetryAt: string | null;
  createdAt: string;
}
