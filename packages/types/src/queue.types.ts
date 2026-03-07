export type QueueEvent =
  | 'payment.success'
  | 'payment.failed'
  | 'payment.expired'
  | 'payment.refunded'
  | 'settlement.completed'
  | 'merchant.verified'
  | 'notification.email'
  | 'notification.sms'
  | 'webhook.trigger';

export interface QueueMessage<T = unknown> {
  event: QueueEvent;
  payload: T;
  timestamp: Date;
  correlationId: string;
}
