export type QueueEvent =
  | 'payment.success'
  | 'payment.failed'
  | 'payment.expired'
  | 'payment.refunded'
  | 'settlement.completed'
  | 'school.verified'
  | 'student.imported'
  | 'bill.generated'
  | 'bill.overdue'
  | 'notification.email'
  | 'notification.sms'
  | 'webhook.received'
  | 'webhook.trigger'
  | 'transaction.created';

export interface QueueMessage<T = unknown> {
  event: QueueEvent;
  payload: T;
  timestamp: Date;
  correlationId: string;
}
