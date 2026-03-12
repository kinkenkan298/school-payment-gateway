import { createLogger } from '@school-payment-gateway/shared-lib';
import 'dotenv/config';
import { z } from 'zod';

const logger = createLogger('webhook-service');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default(3010),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  MONGODB_URI: z.string().min(1),
  MONGODB_DB_NAME: z.string().default('webhook_db'),

  RABBITMQ_URL: z.string().default('amqp://guest:guest@localhost:5672'),

  DUITKU_MERCHANT_CODE: z.string().default(''),
  DUITKU_API_KEY: z.string().default(''),

  XENDIT_WEBHOOK_TOKEN: z.string().default(''),

  MIDTRANS_SERVER_KEY: z.string().default(''),
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
