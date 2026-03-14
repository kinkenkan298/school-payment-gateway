import { createLogger } from '@school-payment-gateway/shared-lib';
import 'dotenv/config';
import { z } from 'zod';

const logger = createLogger('school-admin-service');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default(3011),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  MONGODB_URI: z.string().min(1),
  MONGODB_DB_NAME: z.string().default('school_admin_db'),

  JWT_SECRET: z.string().min(32),
  INTERNAL_SERVICE_SECRET: z.string().min(1).default('internal_service_secret_key_32chars'),

  RABBITMQ_URL: z.string().default('amqp://guest:guest@localhost:5672'),

  SCHOOL_SERVICE_URL: z.string().default('http://localhost:3002'),
  AUTH_SERVICE_URL: z.string().default('http://localhost:3001'),
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
