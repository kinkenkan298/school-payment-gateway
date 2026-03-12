import { createLogger } from '@school-payment-gateway/shared-lib';
import 'dotenv/config';
import { z } from 'zod';

const logger = createLogger('payment-service');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default(3004),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  MONGODB_URI: z.string().min(1),
  MONGODB_DB_NAME: z.string().default('payment_db'),

  INTERNAL_SERVICE_SECRET: z.string().min(1).default('internal_service_secret_key_32chars'),

  JWT_SECRET: z.string().min(32),

  RABBITMQ_URL: z.string().default('amqp://guest:guest@localhost:5672'),

  STUDENT_SERVICE_URL: z.string().default('http://localhost:3003'),
  SCHOOL_SERVICE_URL: z.string().default('http://localhost:3002'),

  // Duitku
  DUITKU_MERCHANT_CODE: z.string().default(''),
  DUITKU_API_KEY: z.string().default(''),
  DUITKU_BASE_URL: z.string().default('https://sandbox.duitku.com/webapi/api'),
  DUITKU_CALLBACK_URL: z.string().default('http://localhost:3004/payments/webhook/duitku'),

  // Xendit
  XENDIT_SECRET_KEY: z.string().default(''),
  XENDIT_BASE_URL: z.string().default('https://api.xendit.co'),
  XENDIT_CALLBACK_URL: z.string().default('http://localhost:3004/payments/webhook/xendit'),
  XENDIT_WEBHOOK_TOKEN: z.string().default(''),

  // Midtrans
  MIDTRANS_SERVER_KEY: z.string().default(''),
  MIDTRANS_BASE_URL: z.string().default('https://api.sandbox.midtrans.com/v2'),
  MIDTRANS_NOTIFICATION_URL: z.string().default('http://localhost:3004/payments/webhook/midtrans'),

  PAYMENT_EXPIRY_MINUTES: z.string().regex(/^\d+$/).transform(Number).default(60),
  ADMIN_FEE_PERCENTAGE: z
    .string()
    .regex(/^\d+(\.\d+)?$/)
    .transform(Number)
    .default(1),
  ADMIN_FEE_FLAT: z.string().regex(/^\d+$/).transform(Number).default(2500),
});

type Env = z.infer<typeof envSchema>;

const result = envSchema.safeParse(process.env);

if (!result.success) {
  logger.error('❌ Invalid environment configuration');
  logger.error(z.prettifyError(result.error));
  process.exit(1);
}

export const env: Readonly<Env> = Object.freeze(result.data);
export default env;
