export const EXCHANGES = {
  PAYMENT: 'payment.exchange',
  NOTIFICATION: 'notification.exchange',
  SETTLEMENT: 'settlement.exchange',
  STUDENT: 'student.exchange',
} as const;

export const QUEUES = {
  // Payment
  TRANSACTION_PAYMENT: 'transaction.payment.queue',
  NOTIFICATION_PAYMENT: 'notification.payment.queue',
  WEBHOOK_PAYMENT: 'webhook.payment.queue',
  FRAUD_CHECK: 'fraud.check.queue',
  // Settlement
  NOTIFICATION_SETTLEMENT: 'notification.settlement.queue',
  // Student
  STUDENT_IMPORT: 'student.import.queue',
  BILL_GENERATED: 'bill.generated.queue',
  BILL_OVERDUE: 'bill.overdue.queue',

  PAYMENT_SUCCESS: 'payment.success.student',
  PAYMENT_FAILED: 'payment.failed.student',
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
  PARENT: 'parent', // Orang tua
  SCHOOL_ADMIN: 'school_admin', // Admin sekolah
  SCHOOL_STAFF: 'school_staff', // Staff sekolah
  PLATFORM_ADMIN: 'platform_admin', // Admin platform kita
  SUPER_ADMIN: 'super_admin',
} as const;

export const PAYMENT_WORKFLOW = {
  PROVIDER_TO_PLATFORM: 'provider_to_platform',
  PLATFORM_DIRECT: 'platform_direct',
  BANK_DIRECT: 'bank_direct',
} as const;

export const SUPPORTED_PROVIDERS = {
  DUITKU: 'duitku',
  XENDIT: 'xendit',
  MIDTRANS: 'midtrans',
  BANK_DIRECT: 'bank_direct',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
