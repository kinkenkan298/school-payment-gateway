export type NotificationChannel = 'email' | 'sms' | 'whatsapp' | 'push';
export type NotificationType =
  | 'payment_success'
  | 'payment_failed'
  | 'payment_reminder'
  | 'bill_generated'
  | 'bill_overdue'
  | 'settlement_completed';

export interface NotificationPayload {
  channel: NotificationChannel;
  type: NotificationType;
  recipient: {
    name: string;
    email?: string;
    phone?: string;
  };
  data: Record<string, unknown>;
}
