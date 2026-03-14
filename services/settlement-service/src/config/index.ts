import { createLogger } from '@school-payment-gateway/shared-lib';
import 'dotenv/config';
import { z } from 'zod';

const logger = createLogger('settlement-service');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default(3007),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  MONGODB_URI: z.string().min(1),
  MONGODB_DB_NAME: z.string().default('settlement_db'),

  JWT_SECRET: z.string().min(32),
  INTERNAL_SERVICE_SECRET: z.string().min(1).default('internal_service_secret_key_32chars'),

  RABBITMQ_URL: z.string().default('amqp://guest:guest@localhost:5672'),

  TRANSACTION_SERVICE_URL: z.string().default('http://localhost:3006'),
  SCHOOL_SERVICE_URL: z.string().default('http://localhost:3002'),

  // Jadwal settlement otomatis (cron-style string, default jam 2 pagi setiap hari)
  SETTLEMENT_SCHEDULE_HOUR: z.string().regex(/^\d+$/).transform(Number).default(2),

  // Minimum saldo untuk trigger settlement (IDR)
  SETTLEMENT_MINIMUM_AMOUNT: z.string().regex(/^\d+$/).transform(Number).default(10000),
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
