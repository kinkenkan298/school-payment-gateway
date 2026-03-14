import { createLogger } from '@school-payment-gateway/shared-lib';
import 'dotenv/config';
import { z } from 'zod';

const logger = createLogger('api-gateway');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().regex(/^\d+$/, 'PORT must be a number').transform(Number),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),

  CORS_ORIGINS: z.string().default('http://localhost:4000,http://localhost:5000'),

  RATE_LIMIT_WINDOW_MS: z.string().regex(/^\d+$/).transform(Number).default(900000),
  RATE_LIMIT_MAX: z.string().regex(/^\d+$/).transform(Number).default(100),

  AUTH_SERVICE_URL: z.url().default('http://localhost:3001'),
  MERCHANT_SERVICE_URL: z.url().default('http://localhost:3002'),
  PAYMENT_SERVICE_URL: z.url().default('http://localhost:3003'),
  TRANSACTION_SERVICE_URL: z.url().default('http://localhost:3006'),
  NOTIFICATION_SERVICE_URL: z.url().default('http://localhost:3005'),
  SETTLEMENT_SERVICE_URL: z.url().default('http://localhost:3007'),
  FRAUD_DETECTION_URL: z.url().default('http://localhost:3008'),
  REPORTING_SERVICE_URL: z.url().default('http://localhost:3008'),
  WEBHOOK_SERVICE_URL: z.url().default('http://localhost:3009'),
  ADMIN_SERVICE_URL: z.url().default('http://localhost:3010'),
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
