import { createLogger } from '@school-payment-gateway/shared-lib';
import 'dotenv/config';
import { z } from 'zod';

const logger = createLogger('reporting-service');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default(3009),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  MONGODB_URI: z.string().min(1),

  JWT_SECRET: z.string().min(32),
  INTERNAL_SERVICE_SECRET: z.string().min(1).default('internal_service_secret_key_32chars'),

  // DB names dari service lain — reporting baca langsung dari masing-masing DB
  PAYMENT_DB_NAME: z.string().default('payment_db'),
  STUDENT_DB_NAME: z.string().default('student_db'),
  TRANSACTION_DB_NAME: z.string().default('transaction_db'),
  SETTLEMENT_DB_NAME: z.string().default('settlement_db'),
  SCHOOL_DB_NAME: z.string().default('school_db'),
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
