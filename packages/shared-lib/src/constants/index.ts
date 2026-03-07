export const EXCHANGES = {
  PAYMENT: 'payment.exchange',
  NOTIFICATION: 'notification.exchange',
  SETTLEMENT: 'settlement.exchange',
} as const;

export const QUEUES = {
  TRANSACTION_PAYMENT: 'transaction.payment.queue',
  NOTIFICATION_PAYMENT: 'notification.payment.queue',
  WEBHOOK_PAYMENT: 'webhook.payment.queue',
  NOTIFICATION_SETTLEMENT: 'notification.settlement.queue',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
} as const;

export const ROLES = {
  MERCHANT: 'merchant',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
